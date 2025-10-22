import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/DashboardNew/Sidebar';
import ProfileView from '../components/DashboardNew/ProfileView';
import TaskAssignment from '../components/DashboardNew/TaskAssignment';
import ViewAssignedTasks from '../components/DashboardNew/ViewAssignedTasks';
import MyAssignedTasks from '../components/DashboardNew/MyAssignedTasks';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('profile');
  const { user, profile, isAdmin, signOut } = useAuth();
  const roleString = (profile?.role || '').toString().trim().toLowerCase();
  const canAccessTaskSystem = Boolean(isAdmin || roleString === 'officer' || roleString === 'board');

  // Auto-select Profile when user logs in
  useEffect(() => {
    if (user && !currentPage) {
      setCurrentPage('profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = '/';
    }
  };

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      background: '#f9fafb',
    },
    mainContent: {
      flex: 1,
      overflowY: 'auto',
      background: '#f9fafb',
      height: '100vh',
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        canAccessTaskSystem={canAccessTaskSystem}
        profile={profile}
      />

      <main style={styles.mainContent}>
        {currentPage === 'profile' && user && <ProfileView />}
        {currentPage === 'assign-task' && canAccessTaskSystem && <TaskAssignment />}
        {currentPage === 'view-assigned' && user && <ViewAssignedTasks />}
        {currentPage === 'my-assigned' && canAccessTaskSystem && <MyAssignedTasks />}
      </main>
    </div>
  );
};

export default Dashboard;