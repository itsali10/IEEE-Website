import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileView = () => {
  const { user, profile } = useAuth();

  const styles = {
    container: {
      padding: '2rem',
    },
    content: {
      maxWidth: '42rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      color: '#0f172a',
    },
    card: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    fieldContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#4b5563',
      marginBottom: '0.5rem',
    },
    value: {
      fontSize: '1.25rem',
      color: '#0f172a',
    },
    loadingText: {
      fontSize: '1.125rem',
      color: '#4b5563',
    },
  };

  if (!user || !profile) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>Loading profile...</div>
      </div>
    );
  }

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

  const normalized = (value) => (value || '').toString().trim().toLowerCase();
  
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

  const societyCommittees = new Set([
    'computer_society',
    'industrial_electronics_society',
    'power_energy_society',
    'robotics_automation_society'
  ]);

  const committeeKey = normalized(profile?.committee).replace(/\s+/g, '_');
  const roleKey = normalized(profile?.role);
  
  // Format role with proper capitalization (same as Sidebar and DashboardHeader)
  const formatRole = (role) => {
    if (!role) return 'Member';
    const roleStr = String(role).trim();
    return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
  };
  
  const displayRole = societyCommittees.has(committeeKey) && (roleKey === 'board' || roleKey === 'vice')
    ? (roleKey === 'board' ? 'Chairman' : 'Vice Chairman')
    : formatRole(profile?.role);

  const dobValue = profile?.date_of_birth || profile?.dob || profile?.birthdate || profile?.birth_date;
  
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

  const age = dobValue ? calculateAge(dobValue) : null;
  const displayCommittee = formatCommitteeLabel(profile?.committee);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Profile</h1>

        <div style={styles.card}>
          <div style={styles.fieldContainer}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <p style={styles.value}>{capitalizeText(profile?.full_name) || '—'}</p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <p style={styles.value}>{profile?.email || user?.email || '—'}</p>
            </div>

          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <p style={styles.value}>{profile?.phone_number || '—'}</p>
          </div>

            <div style={styles.field}>
              <label style={styles.label}>Student ID</label>
              <p style={styles.value}>{profile?.student_id || '—'}</p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Committee</label>
              <p style={styles.value}>{displayCommittee}</p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Role</label>
              <p style={styles.value}>{displayRole}</p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Age</label>
              <p style={styles.value}>{age != null ? `${age} years` : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

