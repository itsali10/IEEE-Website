import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const buttonStyle = {
  position: 'fixed',
  top: '80px', // below sticky header (~64px)
  left: '20px',
  zIndex: 100,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 18px',
  borderRadius: '9999px',
  border: '1px solid transparent',
  background: 'linear-gradient(135deg, #0a84ff 0%, #0066cc 100%)',
  color: '#ffffff',
  boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
  cursor: 'pointer',
  fontWeight: 700,
  letterSpacing: '0.2px'
};

const BackToDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isOnDashboard = location.pathname === '/dashboard';

  // Show only for authenticated users and when not already on dashboard
  if (!user || isOnDashboard) return null;

  return (
    <button
      type="button"
      aria-label="Back to Dashboard"
      onClick={() => navigate('/dashboard')}
      style={buttonStyle}
    >
      ← Back to Dashboard
    </button>
  );
};

export default BackToDashboard;


