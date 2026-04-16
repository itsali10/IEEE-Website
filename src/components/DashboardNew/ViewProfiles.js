import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import SearchIcon from '@mui/icons-material/Search';
import './viewProfilesStyles.css';

const ViewProfiles = () => {
  const { user, profile, isAdmin } = useAuth() || {};
  const hasFetchedProfiles = useRef(false);
  
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [taskCompletionData, setTaskCompletionData] = useState({});
  const [expandedCommittees, setExpandedCommittees] = useState(new Set());

  const [adminCommittee, setAdminCommittee] = useState('');

  useEffect(() => {
    if (!profile) {
      setAdminCommittee('');
      hasFetchedProfiles.current = false;
      return;
    }
    try {
      const committee = 
        profile.committee || 
        profile.firstCommittee || 
        profile.first_committee || 
        profile.primaryCommittee || 
        profile.primary_committee || '';
      
      if (committee !== adminCommittee) {
        setAdminCommittee(committee);
      }
    } catch (err) {
      console.error('[ViewProfiles] Error reading committee:', err);
      setAdminCommittee('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    
    const fetchProfiles = async () => {
      const userRole = (profile?.role || '').toString().trim().toLowerCase();
      
      if (!user) {
        if (!cancelled) {
          setProfiles([]);
          setProfilesLoading(false);
          hasFetchedProfiles.current = false;
        }
        return;
      }
      
      if (!cancelled) {
        setProfilesLoading(true);
        setProfilesError('');
      }
      
      try {
        let data, error;

        if (userRole === 'officer' || userRole === 'advisor' || userRole === 'coordinator' || isAdmin) {
          // Officers, Advisors, Coordinators, and admins can view all profiles
          const result = await supabase
            .from('student')
            .select('*')
            .order('full_name', { ascending: true });
          data = result.data;
          error = result.error;
        } else if ((userRole === 'board' || userRole === 'vice') && adminCommittee) {
          // Board and Vice members can view profiles of their committee members
          const result = await supabase
            .from('student')
            .select('*')
            .eq('committee', adminCommittee)
            .order('full_name', { ascending: true });
          data = result.data;
          error = result.error;
        } else {
          if (!cancelled) {
            setProfiles([]);
            setProfilesLoading(false);
          }
          return;
        }
        
        if (cancelled) return;
        
        if (error) throw error;

        setProfiles(data || []);
        
        // Fetch task completion data for all profiles
        if ((data || []).length > 0) {
          // Removed unused profileIds to fix linter warning
          
          // Fetch task assignments and completion status
          const { data: tasksData, error: tasksError } = await supabase
            .from('task')
            .select('id, created_by');
            
          const { data: taskAssignees, error: assigneesError } = await supabase
            .from('task_assignees')
            .select('task_id, student_id, is_completed');
            
          if (!tasksError && !assigneesError) {
            const tasksMap = new Map((tasksData || []).map(t => [t.id, t]));
            const completionMap = {};
            
            // Count completed and total tasks for each student (per-assignment completion)
            taskAssignees.forEach(assignment => {
              const task = tasksMap.get(assignment.task_id);
              if (!task) return;

              if (!completionMap[assignment.student_id]) {
                completionMap[assignment.student_id] = { total: 0, completed: 0 };
              }
              
              completionMap[assignment.student_id].total++;
              if (assignment.is_completed) {
                completionMap[assignment.student_id].completed++;
              }
            });
            
            setTaskCompletionData(completionMap);
          }
        }
        
        hasFetchedProfiles.current = true;
      } catch (err) {
        if (!cancelled) {
          setProfilesError(`Failed to load profiles. Error: ${err.message}`);
          setProfiles([]);
          hasFetchedProfiles.current = false;
        }
      } finally {
        if (!cancelled) {
          setProfilesLoading(false);
        }
      }
    };
    
    fetchProfiles();
    
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, profile?.role, adminCommittee]);

  // Determine visibility rules based on user role
  const userRole = (profile?.role || '').toString().trim().toLowerCase();
  const userCommittee = (
    profile?.committee ||
    profile?.firstCommittee ||
    profile?.first_committee ||
    profile?.primaryCommittee ||
    profile?.primary_committee ||
    ''
  ).toString().trim().toLowerCase();
  
  const isAdvisor = userRole === 'advisor';
  const isOfficer = userRole === 'officer';
  const isCoordinator = userRole === 'coordinator';
  const isComputerSocietyBoard = (userRole === 'board' || userRole === 'vice') && userCommittee === 'computer_society';
  
  // Visibility rules:
  // - Advisors: See everyone
  // - Officers: See everyone
  // - Coordinators: See everyone (like officers)
  // - CS Board: See everyone
  // - Other Board/Vice: See everyone except advisors
  const canSeeAdvisors = isAdvisor || isOfficer || isCoordinator || isComputerSocietyBoard;

  const filteredProfiles = profiles.filter(p => {
    // Filter by search term
    const matchesSearch = !searchTerm.trim() ||
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const profileRole = (p.role || '').toString().trim().toLowerCase();
    const profileCommittee = (p.committee || '').toString().trim().toLowerCase();
    
    // Hide advisors from board members (except CS board)
    if (!canSeeAdvisors) {
      if (profileRole === 'advisor' || profileCommittee === 'board_of_advisors' || profileCommittee === 'board of advisors') {
        return false;
      }
    }
    
    return true;
  });

  // Separate officers from other profiles
  const officers = filteredProfiles.filter(p => {
    const profileRole = (p.role || '').toString().trim().toLowerCase();
    return profileRole === 'officer';
  });

  // Group non-officer profiles by committee
  const nonOfficerProfiles = filteredProfiles.filter(p => {
    const profileRole = (p.role || '').toString().trim().toLowerCase();
    return profileRole !== 'officer';
  });

  const profilesByCommittee = nonOfficerProfiles.reduce((acc, profile) => {
    const committee = profile.committee || 'Unassigned';
    if (!acc[committee]) {
      acc[committee] = [];
    }
    acc[committee].push(profile);
    return acc;
  }, {});

  // Build sorted list: Officers first (if any), then committees
  const sortedCommittees = [];
  if (officers.length > 0) {
    sortedCommittees.push('Officers');
  }
  
  // Sort committees alphabetically, but put "Unassigned" at the end
  const regularCommittees = Object.keys(profilesByCommittee).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });
  
  sortedCommittees.push(...regularCommittees);

  // Helper function to capitalize text properly (Title Case)
  const capitalizeText = (text) => {
    if (!text) return '';
    const str = String(text).trim();
    if (!str) return '';
    // Split by spaces and capitalize each word
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCommitteeLabel = (raw) => {
    const text = (raw || '').toString().trim();
    if (!text) return '—';
    return text
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''))
      .join(' ');
  };

  const normalized = (value) => (value || '').toString().trim().toLowerCase();
  
  const societyCommittees = new Set([
    'computer_society',
    'industrial_electronics_society',
    'power_energy_society',
    'robotics_automation_society'
  ]);

  const toggleCommittee = (committee) => {
    setExpandedCommittees(prev => {
      const next = new Set(prev);
      if (next.has(committee)) {
        next.delete(committee);
      } else {
        next.add(committee);
      }
      return next;
    });
  };

  const calculateAge = (dob) => {
    try {
      const d = new Date(dob);
      if (Number.isNaN(d.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const monthDiff = today.getMonth() - d.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch {
      return null;
    }
  };

  const getDisplayRole = (profileData) => {
    const committeeKey = normalized(profileData?.committee).replace(/\s+/g, '_');
    const roleKey = normalized(profileData?.role);
    if (societyCommittees.has(committeeKey) && (roleKey === 'board' || roleKey === 'vice')) {
      return roleKey === 'board' ? 'Chairman' : 'Vice Chairman';
    }
    return profileData?.role ? String(profileData.role).charAt(0).toUpperCase() + String(profileData.role).slice(1).toLowerCase() : 'Member';
  };

  const styles = {
    container: {
      padding: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      color: '#0f172a',
    },
    searchSection: {
      marginBottom: '2rem',
    },
    searchInputContainer: {
      position: 'relative',
      maxWidth: '400px',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '0.75rem',
      color: '#6b7280',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      background: '#ffffff',
      color: '#0f172a',
      fontSize: '0.9375rem',
      outline: 'none',
    },
    committeesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    committeeCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '120px',
    },
    committeeCardExpanded: {
      borderColor: '#00629b',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    committeeName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '0.5rem',
      textAlign: 'center',
    },
    committeeCount: {
      fontSize: '0.875rem',
      color: '#6b7280',
      fontWeight: '500',
    },
    profilesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem',
    },
    profileCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    profileName: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '0.5rem',
    },
    profileInfo: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem',
    },
    profileLabel: {
      fontWeight: '600',
      color: '#374151',
    },
    modal: {
      display: selectedProfile ? 'block' : 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      padding: '2rem',
      overflow: 'auto',
    },
    modalContent: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0f172a',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0',
      lineHeight: '1',
    },
    field: {
      marginBottom: '1.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#6b7280',
      marginBottom: '0.5rem',
    },
    value: {
      fontSize: '1.125rem',
      color: '#0f172a',
    },
  };

  return (
    <div className="view-profiles-container" style={styles.container}>
      <h1 style={styles.title}>Search for Member</h1>

      {/* Search */}
      <div style={styles.searchSection}>
        <div style={styles.searchInputContainer}>
          <SearchIcon style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => e.target.style.borderColor = '#00629b'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Committee Cards */}
      {profilesLoading ? (
        <div>Loading profiles...</div>
      ) : profilesError ? (
        <div style={{ color: '#dc2626' }}>{profilesError}</div>
      ) : sortedCommittees.length > 0 ? (
        <>
          <div style={styles.committeesGrid}>
            {sortedCommittees.map((committee) => {
              // Handle Officers separately
              const isOfficersCard = committee === 'Officers';
              const committeeProfiles = isOfficersCard ? officers : (profilesByCommittee[committee] || []);
              const memberCount = committeeProfiles.length;
              const isExpanded = expandedCommittees.has(committee);
              
              if (memberCount === 0) return null;
              
              return (
                <div
                  key={committee}
                  style={{
                    ...styles.committeeCard,
                    ...(isExpanded && styles.committeeCardExpanded),
                  }}
                  onClick={() => toggleCommittee(committee)}
                  onMouseEnter={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.borderColor = '#00629b';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isExpanded) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }
                  }}
                >
                  <div style={styles.committeeName}>
                    {isOfficersCard ? 'Officers' : formatCommitteeLabel(committee)}
                  </div>
                  <div style={styles.committeeCount}>
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                  </div>
                  {isExpanded && (
                    <div style={{
                      marginTop: '0.75rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontStyle: 'italic',
                    }}>
                      Click to collapse
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expanded Committee Members */}
          {sortedCommittees.map((committee) => {
            const isOfficersCard = committee === 'Officers';
            const committeeProfiles = isOfficersCard ? officers : (profilesByCommittee[committee] || []);
            const isExpanded = expandedCommittees.has(committee);
            
            if (!isExpanded || committeeProfiles.length === 0) return null;
            
            return (
              <div key={`members-${committee}`} style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem',
                  borderBottom: '2px solid #e5e7eb',
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: 0,
                  }}>
                    {isOfficersCard ? 'Officers' : formatCommitteeLabel(committee)} Members
                  </h2>
                  <span style={{
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    fontWeight: '500',
                    padding: '0.25rem 0.75rem',
                    background: '#f3f4f6',
                    borderRadius: '9999px',
                  }}>
                    {committeeProfiles.length} {committeeProfiles.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <div style={styles.profilesGrid}>
                  {committeeProfiles.map((profileData) => (
                    <div
                      key={profileData.id}
                      style={styles.profileCard}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProfile(profileData);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00629b';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      <div style={styles.profileName}>{capitalizeText(profileData.full_name) || 'Unknown'}</div>
                      <div style={styles.profileInfo}>
                        <span style={styles.profileLabel}>Student ID:</span> {profileData.student_id || '—'}
                      </div>
                      <div style={styles.profileInfo}>
                        <span style={styles.profileLabel}>Phone:</span> {profileData.phone_number || '—'}
                      </div>
                      <div style={styles.profileInfo}>
                        <span style={styles.profileLabel}>Email:</span> {profileData.email || '—'}
                      </div>
                      {!isOfficersCard && (
                        <div style={styles.profileInfo}>
                          <span style={styles.profileLabel}>Role:</span> {getDisplayRole(profileData)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem', color: '#6b7280' }}>
          No profiles found
        </div>
      )}

      {/* Modal for detailed view */}
      {selectedProfile && (
        <div
          className="modal"
          style={styles.modal}
          onClick={() => setSelectedProfile(null)}
        >
          <div className="modal-content" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{capitalizeText(selectedProfile.full_name) || 'Unknown'}</h2>
              <button style={styles.closeButton} onClick={() => setSelectedProfile(null)}>×</button>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.value}>{capitalizeText(selectedProfile.full_name) || '—'}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div className="modal-value" style={styles.value}>{selectedProfile.email || '—'}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.value}>{selectedProfile.phone_number || '—'}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Student ID</label>
              <div style={styles.value}>{selectedProfile.student_id || '—'}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Committee</label>
              <div style={styles.value}>{formatCommitteeLabel(selectedProfile.committee)}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <div style={styles.value}>{getDisplayRole(selectedProfile)}</div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Age</label>
              <div style={styles.value}>
                {selectedProfile.date_of_birth
                  ? (calculateAge(selectedProfile.date_of_birth) != null
                      ? `${calculateAge(selectedProfile.date_of_birth)} years`
                      : '—')
                  : '—'}
              </div>
            </div>

            {selectedProfile.faculty && (
              <div style={styles.field}>
                <label style={styles.label}>Faculty</label>
                <div style={styles.value}>{capitalizeText(selectedProfile.faculty)}</div>
              </div>
            )}

            {selectedProfile.department && (
              <div style={styles.field}>
                <label style={styles.label}>Department</label>
                <div style={styles.value}>{capitalizeText(selectedProfile.department)}</div>
              </div>
            )}

            {selectedProfile.graduation_year && (
              <div style={styles.field}>
                <label style={styles.label}>Graduation Year</label>
                <div style={styles.value}>{selectedProfile.graduation_year}</div>
              </div>
            )}

            {taskCompletionData[selectedProfile.id] && (
              <div style={styles.field}>
                <label style={styles.label}>Task Completion</label>
                <div style={styles.value}>
                  {taskCompletionData[selectedProfile.id].completed} out of {taskCompletionData[selectedProfile.id].total} tasks completed
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfiles;
