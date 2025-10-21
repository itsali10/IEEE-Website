import React, { useEffect, useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';
import Tasks from './Tasks';
import ViewTasks from './ViewTasks';
import MyAssignedTasks from './MyAssignedTasks';

const Dashboard = () => {
  const [activeView, setActiveView] = useState(null); // 'profile' | 'tasks' | 'view-tasks' | 'my-assigned-tasks'
  const { user, profile, isAdmin, signOut } = useAuth();
  const roleString = (profile?.role || '').toString().trim().toLowerCase();
  const canAccessTaskSystem = Boolean(isAdmin || roleString === 'officer' || roleString === 'board');

  // Auto-select Profile when user logs in (but don't override once a view is chosen)
  useEffect(() => {
    if (user && !activeView) {
      setActiveView('profile');
    }
  }, [user, activeView]);

  const navButtonStyle = (key) => ({
    textAlign: 'left',
    background: activeView === key ? 'rgba(0, 98, 155, 0.10)' : 'transparent',
    color: '#00629b',
    borderRadius: 8,
    padding: '10px 12px',
    fontWeight: activeView === key ? 800 : 700,
    cursor: 'pointer',
    border: activeView === key ? '1px solid #00629b' : '1px solid transparent',
    textDecoration: 'none',
    outline: 'none',
    boxShadow: 'none'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        borderRight: 'none',
        background: '#fff',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)'
      }}>
        <div style={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: 600, marginBottom: 12 }}>Dashboard</div>
        <nav style={{ display: 'grid', gap: 8 }}>
          {user && (
            <button
              onClick={() => setActiveView('profile')}
              style={navButtonStyle('profile')}
            >
              View Profile
            </button>
          )}

          {canAccessTaskSystem && (
            <button
              onClick={() => setActiveView('tasks')}
              style={navButtonStyle('tasks')}
            >
              Assign Task
            </button>
          )}

          {user && (
            <button
              onClick={() => setActiveView('view-tasks')}
              style={navButtonStyle('view-tasks')}
            >
              View Assigned Tasks
            </button>
          )}

          {canAccessTaskSystem && (
            <button
              onClick={() => setActiveView('my-assigned-tasks')}
              style={navButtonStyle('my-assigned-tasks')}
            >
              Tasks I Assigned
            </button>
          )}
        </nav>
        {user && (
          <button
            onClick={async () => { const { error } = await signOut(); if (!error) window.location.href = '/'; }}
            className="logout-button"
            style={{
              marginTop: 'auto',
              width: '100%',
              boxShadow: 'none'
            }}
          >
            <LogoutIcon sx={{ fontSize: 18 }} />
            Logout
          </button>
        )}
      </aside>

      {/* Content area */}
      <main style={{ flex: 1, padding: '24px 16px', height: 'calc(100vh - 64px)', overflowY: 'auto' }}>
        {!activeView && null}

        {activeView === 'profile' && user && (
          <Profile />
        )}

        {activeView === 'tasks' && canAccessTaskSystem && (
          <Tasks />
        )}

        {activeView === 'view-tasks' && user && (
          <ViewTasks />
        )}

        {activeView === 'my-assigned-tasks' && canAccessTaskSystem && (
          <MyAssignedTasks />
        )}
      </main>
    </div>
  );
};

export default Dashboard;