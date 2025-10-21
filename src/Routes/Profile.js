import React from 'react';
import { useAuth } from '../context/AuthContext';

const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eef2f7' };
const keyStyle = { color: '#6b7280', fontWeight: 600 };
const valStyle = { color: '#0a2540', fontWeight: 700 };

const Profile = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return null;
  }

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
  const displayRole = roleKey === 'board' && societyCommittees.has(committeeKey)
    ? 'Chairman'
    : (profile?.role ? String(profile.role) : 'Member');

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
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '720px', background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', borderRadius: '12px', padding: '28px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, color: '#0a2540' }}>Profile</h2>
          <p style={{ margin: '8px 0 0 0', color: '#4f5b66' }}>Your account details</p>
        </div>

        <div>
          <div style={rowStyle}><span style={keyStyle}>Full Name</span><span style={valStyle}>{profile?.full_name || '—'}</span></div>
          <div style={rowStyle}><span style={keyStyle}>Email</span><span style={valStyle}>{profile?.email || user?.email || '—'}</span></div>
          <div style={rowStyle}><span style={keyStyle}>Student ID</span><span style={valStyle}>{profile?.student_id || '—'}</span></div>
          <div style={rowStyle}><span style={keyStyle}>Committee</span><span style={valStyle}>{displayCommittee}</span></div>
          <div style={rowStyle}><span style={keyStyle}>Role</span><span style={valStyle}>{displayRole}</span></div>
          <div style={rowStyle}><span style={keyStyle}>Age</span><span style={valStyle}>{age != null ? `${age} years` : '—'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


