import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
import ieeeLogo from "../../assets/IEEE AAST blue.png";
import './dashboardHeaderStyles.css';

const DashboardHeader = ({ currentPage, onPageChange, onLogout, canAccessTaskSystem, canViewProfiles, canCreateEvents, canCreateMeetings, profile, canSeeHrReviews, isBoa }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "profile", label: "Member Profile", icon: PersonIcon, show: true },
    { id: "season-calendar", label: "Calendar", icon: CalendarTodayIcon, show: true },
    { id: "assign-task", label: "New Task", icon: AddCircleIcon, show: canAccessTaskSystem },
    { id: "view-assigned", label: "My Tasks", icon: CheckCircleIcon, show: true },
    { id: "my-assigned", label: "Tasks Created", icon: ListAltIcon, show: canAccessTaskSystem },
    { id: "hr-reviews", label: "Performance Reviews", icon: RateReviewIcon, show: canSeeHrReviews },
    { id: "view-profiles", label: "Member Directory", icon: PeopleIcon, show: canViewProfiles },
    { id: "create-event", label: "New Event", icon: EventIcon, show: canCreateEvents },
    { id: "create-meeting", label: "New Meeting", icon: VideoCallIcon, show: canCreateMeetings },
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

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    closeMenu();
  };

  const handleLogoutClick = () => {
    closeMenu();
    onLogout();
  };

  return (
    <nav className="dashboard-header">
      <div className="dashboard-header-container">
        <div className="dashboard-header-content">
          <motion.div
            className="dashboard-header-user-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="dashboard-header-logo">
              <img src={ieeeLogo} alt="IEEE AAST" />
            </div>
            <div className="dashboard-header-user-info">
              <span className="dashboard-header-name">Hello, {firstName}!</span>
              <div className="dashboard-header-details">
                <span className="dashboard-header-committee">{displayCommittee}</span>
                <span className="dashboard-header-bullet">•</span>
                <span className="dashboard-header-role">{displayRole}</span>
              </div>
            </div>
          </motion.div>

          {/* Hamburger Menu Button */}
          <button 
            className="dashboard-mobile-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          className="dashboard-mobile-menu"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="dashboard-mobile-menu-content">
            {/* Navigation Items */}
            <div className="dashboard-mobile-nav">
              {navItems.filter(item => item.show).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`dashboard-mobile-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon style={{ fontSize: '20px' }} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="dashboard-mobile-logout">
              <button onClick={handleLogoutClick} className="dashboard-mobile-logout-btn">
                <LogoutIcon style={{ fontSize: '20px' }} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default DashboardHeader;

