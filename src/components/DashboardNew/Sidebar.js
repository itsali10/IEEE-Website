import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VideoCallIcon from '@mui/icons-material/VideoCall';

const Sidebar = ({ currentPage, onPageChange, onLogout, canAccessTaskSystem, canViewProfiles, canCreateEvents, canCreateMeetings, profile, canSeeHrReviews, isBoa }) => {
  const navItems = [
    { id: "profile", label: "Member Profile", icon: PersonIcon, show: true },
    { id: "season-calendar", label: "Calendar", icon: CalendarTodayIcon, show: true },
    { id: "assign-task", label: "New Task", icon: AddCircleIcon, show: canAccessTaskSystem },
    { id: "view-assigned", label: "My Tasks", icon: CheckCircleIcon, show: true },
    { id: "my-assigned", label: "Tasks Created", icon: ListAltIcon, show: canAccessTaskSystem },
    { id: "hr-reviews", label: "Performance Reviews", icon: RateReviewIcon, show: canSeeHrReviews },
    { id: "create-event", label: "New Event", icon: EventIcon, show: canCreateEvents },
    { id: "create-meeting", label: "New Meeting", icon: VideoCallIcon, show: canCreateMeetings },
    { id: "view-profiles", label: "Member Directory", icon: PeopleIcon, show: canViewProfiles },
  ];

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

  // Format committee name
  const formatCommitteeLabel = (raw) => {
    const text = (raw || '').toString().trim();
    if (!text) return 'IEEE Member';
    return text
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''))
      .join(' ');
  };

  // Get display role
  const normalized = (value) => (value || '').toString().trim().toLowerCase();
  const societyCommittees = new Set([
    'computer_society',
    'industrial_electronics_society',
    'power_energy_society',
    'robotics_automation_society'
  ]);
  const committeeKey = normalized(profile?.committee).replace(/\s+/g, '_');
  const roleKey = normalized(profile?.role);
  
  // Format role with proper capitalization
  const formatRole = (role) => {
    if (!role) return 'Member';
    const roleStr = String(role).trim();
    return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
  };
  
  const displayRole = societyCommittees.has(committeeKey) && (roleKey === 'board' || roleKey === 'vice')
    ? (roleKey === 'board' ? 'Chairman' : 'Vice Chairman')
    : formatRole(profile?.role);

  const displayCommittee = formatCommitteeLabel(profile?.committee);
  const firstName = capitalizeText((profile?.full_name || '').split(' ')[0] || 'Member');

  const styles = {
    sidebar: {
      width: '256px',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e5e7eb',
      height: '100vh',
      position: 'sticky',
      top: 0,
    },
    header: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
    },
    greeting: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#0f172a',
      margin: 0,
      marginBottom: '0.5rem',
    },
    committee: {
      fontSize: '0.9rem',
      color: '#00629b',
      fontWeight: '600',
      margin: 0,
    },
    role: {
      fontSize: '0.85rem',
      color: '#4b5563',
      marginTop: '0.25rem',
    },
    nav: {
      flex: 1,
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    navButton: (isActive) => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s',
      background: isActive ? '#00629b' : 'transparent',
      color: isActive ? '#ffffff' : '#374151',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9375rem',
      fontWeight: '500',
      textAlign: 'left',
    }),
    logoutSection: {
      padding: '1rem',
      borderTop: '1px solid #e5e7eb',
    },
    logoutButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      transition: 'all 0.2s',
      background: 'transparent',
      color: '#374151',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9375rem',
      fontWeight: '500',
    },
  };

  const handleMouseEnter = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.background = 'rgba(0, 98, 155, 0.08)';
      e.currentTarget.style.color = '#00629b';
    }
  };

  const handleMouseLeave = (e, isActive) => {
    if (!isActive) {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#374151';
    }
  };

  return (
    <aside style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.greeting}>Hello {firstName}!</h1>
        <p style={styles.committee}>{displayCommittee}</p>
        <p style={styles.role}>{displayRole}</p>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              style={styles.navButton(isActive)}
              onMouseEnter={(e) => handleMouseEnter(e, isActive)}
              onMouseLeave={(e) => handleMouseLeave(e, isActive)}
            >
              <Icon style={{ fontSize: '20px' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div style={styles.logoutSection}>
        <button
          onClick={onLogout}
          style={styles.logoutButton}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogoutIcon style={{ fontSize: '20px' }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

