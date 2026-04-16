import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/DashboardNew/Sidebar';
import DashboardHeader from '../components/DashboardNew/DashboardHeader';
import ProfileView from '../components/DashboardNew/ProfileView';
import SeasonCalendar from '../components/DashboardNew/SeasonCalendar';
import MeetingCreation from '../components/DashboardNew/MeetingCreation';
import TaskAssignment from '../components/DashboardNew/TaskAssignment';
import ViewAssignedTasks from '../components/DashboardNew/ViewAssignedTasks';
import MyAssignedTasks from '../components/DashboardNew/MyAssignedTasks';
import ViewProfiles from '../components/DashboardNew/ViewProfiles';
import EventCreation from '../components/DashboardNew/EventCreation';
import HRReviews from '../components/DashboardNew/HRReviews';
import EventsList from '../components/DashboardNew/EventsList';
import '../css/dashboardStyles.css';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const pageParam = searchParams.get('page');
  const [currentPage, setCurrentPage] = useState(pageParam || 'profile');
  const { user, profile, isAdmin, signOut } = useAuth();
  const roleString = (profile?.role || '').toString().trim().toLowerCase();
  const committeeString = (profile?.committee || '').toString().trim().toLowerCase();
  console.log('[Dashboard] roleString:', roleString, 'committeeString:', committeeString, 'isAdmin:', isAdmin);
  const isBoa = roleString === 'advisor';
  // Officers, Board, and Vice roles can access task system and profiles
  // Coordinators can view profiles and HR reviews but cannot assign tasks
  const canAccessTaskSystem = Boolean(
    isBoa || isAdmin || roleString === 'officer' || roleString === 'board' || roleString === 'vice'
  );
  const canViewProfiles = Boolean(
    isBoa || isAdmin || roleString === 'officer' || roleString === 'board' || roleString === 'vice' || roleString === 'coordinator'
  );
  // Officers can create events, and CS board/vice (committee COMPUTER_SOCIETY) can also create events
  const isCsBoard =
    (roleString === 'board' || roleString === 'vice') &&
    committeeString === 'computer_society';
  const canCreateEvents = Boolean(isBoa || roleString === 'officer' || isCsBoard);
  // All board members should be able to create meetings (plus officers/advisors)
  const canCreateMeetings = Boolean(
    isBoa || roleString === 'officer' || roleString === 'board' || roleString === 'vice'
  );
  console.log('[Dashboard] canCreateEvents:', canCreateEvents);

  const isHrCommitteeMember = committeeString === 'human_resources';
  const isLeadershipRole = roleString === 'officer' || roleString === 'board' || roleString === 'vice';
  const isCoordinator = roleString === 'coordinator';
  const canSeeHrReviews = Boolean(isBoa || isHrCommitteeMember || isLeadershipRole || isCoordinator);

  // Auto-select Profile when user logs in, or use page from URL
  useEffect(() => {
    if (pageParam) {
      setCurrentPage(pageParam);
    } else if (user && !currentPage) {
      setCurrentPage('profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pageParam]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = '/';
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Mobile Header - Shows on mobile, hidden on desktop */}
      <div className="dashboard-mobile-header">
        <DashboardHeader
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onLogout={handleLogout}
          canAccessTaskSystem={canAccessTaskSystem}
          canViewProfiles={canViewProfiles}
          canCreateEvents={canCreateEvents}
          canCreateMeetings={canCreateMeetings}
          profile={profile}
          canSeeHrReviews={canSeeHrReviews}
          isBoa={isBoa}
        />
      </div>

      <div className="dashboard-container">
        {/* Desktop Sidebar - Hidden on mobile, shows on desktop */}
        <div className="dashboard-sidebar-desktop">
          <Sidebar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
            canAccessTaskSystem={canAccessTaskSystem}
            canViewProfiles={canViewProfiles}
            canCreateEvents={canCreateEvents}
            canCreateMeetings={canCreateMeetings}
          profile={profile}
          canSeeHrReviews={canSeeHrReviews}
          isBoa={isBoa}
          />
        </div>

        <main className="dashboard-main-content">
          {currentPage === 'season-calendar' && user && <SeasonCalendar />}
          {currentPage === 'profile' && user && <ProfileView />}
          {currentPage === 'assign-task' && canAccessTaskSystem && <TaskAssignment isBoa={isBoa} />}
          {currentPage === 'view-assigned' && user && <ViewAssignedTasks isBoa={isBoa} />}
          {currentPage === 'my-assigned' && canAccessTaskSystem && <MyAssignedTasks isBoa={isBoa} />}
          {currentPage === 'view-profiles' && canViewProfiles && <ViewProfiles />}
          {currentPage === 'create-event' && canCreateEvents && <EventCreation isBoa={isBoa} />}
          {currentPage === 'create-meeting' && canCreateMeetings && <MeetingCreation isBoa={isBoa} />}
          {currentPage === 'hr-reviews' && canSeeHrReviews && <HRReviews />}
          {currentPage === 'events' && user && <EventsList />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;