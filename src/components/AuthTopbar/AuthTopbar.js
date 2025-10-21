import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ieeeLogo from '../../assets/IEEE AAST blue.png';
import '../Header/headerStyles.css';
import './authTopbarStyles.css';

// Reuse Header styles; structure mirrors Header but with personalized text

const AuthTopbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  // Logout handled in sidebar within the dashboard

  const displayName = profile?.name || profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
  const normalized = (value) => (value || '').toString().trim().toLowerCase();
  const formatCommitteeLabel = (raw) => {
    const text = (raw || '').toString().trim();
    if (!text) return '';
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
  const roleLabelRaw = profile?.role ? String(profile.role) : 'Member';
  const displayRole = roleKey === 'board' && societyCommittees.has(committeeKey) ? 'Chairman' : roleLabelRaw;
  const committeeLabel = formatCommitteeLabel(profile?.committee);
  const metaLabel = committeeLabel && displayRole ? `${committeeLabel} • ${displayRole}` : (committeeLabel || displayRole);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={ieeeLogo} alt="IEEE AAST" className="w-full h-full object-contain"/>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">{`Hello, ${displayName}!`}</span>
                  {metaLabel && (
                    <span className="text-xs text-gray-600">{metaLabel}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {location.pathname !== '/dashboard' && (
              <button className="nav-link" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
            )}
          </div>
        </div>
      </div>
      {/* Profile modal removed; navigate to /profile instead */}
    </nav>
  );
};

export default AuthTopbar;


