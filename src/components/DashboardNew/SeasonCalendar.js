import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import './seasonCalendarStyles.css';

const SeasonCalendar = () => {
  const { user, profile } = useAuth() || {};
  const [items, setItems] = useState([]); // unified events + meetings
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger
  const [selectedDate, setSelectedDate] = useState(null); // Selected date for modal

  // Season: from start of current academic year (Sept 1) until end of the year
  const { seasonStart, seasonEnd, calendarMonths } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Start from September of current academic year
    // If we're before September, use previous year's September
    let startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    let start = new Date(startYear, 8, 1, 0, 0, 0, 0); // September 1st

    // End of season: December 31st of the current year
    const end = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    // Build list of months between start and end (inclusive)
    const months = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      months.push({ year, month });
      // Move to next month
      cursor.setMonth(cursor.getMonth() + 1, 1);
    }

    return { seasonStart: start, seasonEnd: end, calendarMonths: months };
  }, []);

  // Track which month is currently visible in the full-screen calendar
  // Start at the current month instead of the first month in the season
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Find the index of the current month in calendarMonths
    const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    const startMonth = 8; // September
    
    // Calculate months from season start to current month
    const monthsFromStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    return Math.max(0, monthsFromStart);
  });

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Parse date string without timezone issues
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    // Parse YYYY-MM-DD as local date to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Get committee abbreviation
  const getCommitteeAbbreviation = (committee) => {
    if (!committee) return '';
    const normalized = committee.toString().trim().toUpperCase();
    
    const abbreviations = {
      'COMPUTER_SOCIETY': 'CS',
      'IES': 'IES',
      'PES': 'PES',
      'RAS': 'RAS',
      'BR': 'BR',
      'HR': 'HR',
      'EVENTS': 'EV',
    };
    
    return abbreviations[normalized] || normalized.substring(0, 3);
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // timeString is in HH:mm format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const min = minutes || '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${min} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseLocalDate(dateString);
      if (!date) return dateString;
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };


  useEffect(() => {
    const fetchSeasonItems = async () => {
      if (!user) {
        setItems([]);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const roleString = (profile?.role || '').toString().trim().toLowerCase();
        const committeeString =
          (profile?.committee ||
            profile?.firstCommittee ||
            profile?.first_committee ||
            profile?.primaryCommittee ||
            profile?.primary_committee ||
            '')
            .toString()
            .trim();

        const isAdvisor = roleString === 'advisor';
        const isOfficer = roleString === 'officer';
        const isBoard = roleString === 'board' || roleString === 'vice';
        const isComputerSociety = committeeString.toUpperCase() === 'COMPUTER_SOCIETY';
        
        // Allow full access to:
        // 1. Advisors and Officers (can see all meetings)
        // 2. Board/Vice members from COMPUTER_SOCIETY committee
        const canSeeAllMeetings = isAdvisor || isOfficer || (isBoard && isComputerSociety);
        const shouldRestrictByCommittee = !canSeeAllMeetings;

        const startIso = seasonStart.toISOString().split('T')[0];
        const endIso = seasonEnd.toISOString().split('T')[0];

        // Events query
        const eventsQuery = supabase
          .from('events')
          .select('*')
          .gte('start_date', startIso)
          .lte('start_date', endIso)
          .order('start_date', { ascending: true });
        // NOTE: events are visible to everyone regardless of committee

        // Meetings query
        let meetingsQuery = supabase
          .from('meetings')
          .select('*')
          .gte('meeting_date', startIso)
          .lte('meeting_date', endIso)
          .order('meeting_date', { ascending: true });

        if (shouldRestrictByCommittee && committeeString) {
          meetingsQuery = meetingsQuery.eq('committee', committeeString);
        }

        const [{ data: eventsData, error: eventsError }, { data: meetingsData, error: meetingsError }] =
          await Promise.all([eventsQuery, meetingsQuery]);

        if (eventsError) throw eventsError;
        if (meetingsError) throw meetingsError;

        const unified = [];

        // Process events - create entries for each day in the date range
        (eventsData || []).forEach((ev) => {
          if (!ev.start_date) return;
          
          const startDate = parseLocalDate(ev.start_date);
          const endDate = ev.end_date ? parseLocalDate(ev.end_date) : startDate;
          
          if (!startDate) return;
          
          // Create an entry for each day the event spans
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            
            unified.push({
              id: `event-${ev.id}-${dateKey}`,
              type: 'event',
              title: ev.title || 'Untitled Event',
              date: dateKey,
              startDate: ev.start_date,
              endDate: ev.end_date,
              rawData: ev, // Store full event data
            });
            currentDate.setDate(currentDate.getDate() + 1);
          }
        });

        // Process meetings - include time and committee abbreviation
        (meetingsData || []).forEach((m) => {
          if (!m.meeting_date) return;
          const timeStr = m.meeting_time ? ` at ${formatTime(m.meeting_time)}` : '';
          const committeeAbbr = getCommitteeAbbreviation(m.committee);
          unified.push({
            id: `meeting-${m.id}`,
            type: 'meeting',
            title: m.description || 'Committee Meeting',
            committee: m.committee,
            committeeAbbr: committeeAbbr,
            date: m.meeting_date,
            time: m.meeting_time,
            timeDisplay: timeStr,
            rawData: m, // Store full meeting data
          });
        });

        setItems(unified);
      } catch (err) {
        console.error('[SeasonCalendar] Error fetching calendar data:', err);
        setError(err.message || 'Failed to load calendar data.');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasonItems();
  }, [user, profile, seasonStart, seasonEnd, refreshTrigger]);

  // Set up real-time subscriptions for meetings and events
  useEffect(() => {
    if (!user) return;

    const meetingsSubscription = supabase
      .channel('meetings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meetings' },
        () => {
          handleRefresh();
        }
      )
      .subscribe();

    const eventsSubscription = supabase
      .channel('events_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          handleRefresh();
        }
      )
      .subscribe();

    return () => {
      meetingsSubscription.unsubscribe();
      eventsSubscription.unsubscribe();
    };
  }, [user]);

  // Map items by date (YYYY-MM-DD) so we can highlight days with events/meetings
  const eventsByDate = useMemo(() => {
    const map = new Map();
    (items || []).forEach((item) => {
      if (!item.date) return;
      // item.date is already in YYYY-MM-DD format, use it directly
      const key = item.date;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });
    return map;
  }, [items]);

  return (
    <div className="season-calendar-container">
      <div className="season-calendar-header-wrapper">
        <div className="season-calendar-title-wrapper">
          <h1 className="season-calendar-title">Upcoming Season Calendar</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="season-calendar-status">Loading calendar...</div>
      ) : error ? (
        <div className="season-calendar-status season-calendar-error">
          {error}
        </div>
      ) : (
        <div className="season-calendar-fullscreen">
          {calendarMonths.length > 0 && currentMonthIndex >= 0 && currentMonthIndex < calendarMonths.length && (
            (() => {
              const { year, month } = calendarMonths[currentMonthIndex];
              const monthStart = new Date(year, month, 1);
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const firstWeekday = monthStart.getDay(); // 0 = Sunday

              const days = [];
              // Leading blanks
              for (let i = 0; i < firstWeekday; i += 1) {
                days.push({ type: 'blank', key: `b-${year}-${month}-${i}` });
              }
              // Actual days
              for (let d = 1; d <= daysInMonth; d += 1) {
                // Format date as YYYY-MM-DD without timezone issues
                const paddedMonth = String(month + 1).padStart(2, '0');
                const paddedDay = String(d).padStart(2, '0');
                const key = `${year}-${paddedMonth}-${paddedDay}`;
                const hasEvents = eventsByDate.has(key);
                days.push({
                  type: 'day',
                  key,
                  dayNumber: d,
                  hasEvents,
                });
              }

              const monthLabel = monthStart.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              });

              const canGoPrev = currentMonthIndex > 0;
              const canGoNext = currentMonthIndex < calendarMonths.length - 1;

              const handlePrev = () => {
                if (canGoPrev) {
                  setCurrentMonthIndex((idx) => Math.max(0, idx - 1));
                }
              };

              const handleNext = () => {
                if (canGoNext) {
                  setCurrentMonthIndex((idx) =>
                    Math.min(calendarMonths.length - 1, idx + 1)
                  );
                }
              };

              return (
                <div className="season-calendar-month season-calendar-month-fullscreen">
                  <div className="season-calendar-month-header-row">
                    <button
                      type="button"
                      className="season-calendar-nav-button"
                      onClick={handlePrev}
                      disabled={!canGoPrev}
                    >
                      ‹
                    </button>
                    <div className="season-calendar-month-header">
                      {monthLabel}
                    </div>
                    <button
                      type="button"
                      className="season-calendar-nav-button"
                      onClick={handleNext}
                      disabled={!canGoNext}
                    >
                      ›
                    </button>
                  </div>
                  <div className="season-calendar-weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd) => (
                      <div key={wd} className="season-calendar-weekday">
                        {wd}
                      </div>
                    ))}
                  </div>
                  <div className="season-calendar-days-grid">
                    {days.map((cell) =>
                      cell.type === 'blank' ? (
                        <div
                          key={cell.key}
                          className="season-calendar-day season-calendar-day-blank"
                        />
                      ) : (
                        <div
                          key={cell.key}
                          className={
                            cell.hasEvents
                              ? 'season-calendar-day season-calendar-day-has-event season-calendar-day-clickable'
                              : 'season-calendar-day'
                          }
                          onClick={() => {
                            if (cell.hasEvents) {
                              setSelectedDate(cell.key);
                            }
                          }}
                        >
                          <span className="season-calendar-day-number">
                            {cell.dayNumber}
                          </span>
                          {cell.hasEvents && (
                            <>
                              {/* Mobile: Show indicator badge only */}
                              <div className="season-calendar-day-indicator season-calendar-mobile-only">
                                <span className="season-calendar-event-badge">
                                  {(eventsByDate.get(cell.key) || []).length}
                                </span>
                              </div>
                              {/* Desktop: Show event cards */}
                              <div className="season-calendar-day-events season-calendar-desktop-only">
                                {(eventsByDate.get(cell.key) || []).map((ev) => (
                                  <div
                                    key={ev.id}
                                    className={`season-calendar-day-event ${ev.type === 'meeting' ? 'season-calendar-day-meeting' : 'season-calendar-day-event-item'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDate(cell.key);
                                    }}
                                  >
                                    {ev.type === 'meeting' ? (
                                      <>
                                        <strong>{ev.committeeAbbr ? `${ev.committeeAbbr} Meeting` : 'Meeting'}</strong>
                                        <div className="season-calendar-event-title">{ev.title}</div>
                                        {ev.timeDisplay && <div className="season-calendar-event-time">{ev.timeDisplay}</div>}
                                      </>
                                    ) : (
                                      <>
                                        <strong>Event</strong>
                                        <div className="season-calendar-event-title">{ev.title}</div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Events Modal for Selected Date */}
      {selectedDate && eventsByDate.has(selectedDate) && (
        <div
          className="season-calendar-modal-overlay"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="season-calendar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="season-calendar-modal-header">
              <h2>
                Events for {formatDateDisplay(selectedDate)}
              </h2>
              <button
                className="season-calendar-modal-close"
                onClick={() => setSelectedDate(null)}
              >
                ×
              </button>
            </div>
            
            <div className="season-calendar-modal-body">
              {(eventsByDate.get(selectedDate) || []).map((item) => (
                <div key={item.id} className="season-calendar-modal-event-item">
                  {item.type === 'meeting' ? (
                    <>
                      <div className="season-calendar-modal-field">
                        <strong>{item.committeeAbbr ? `${item.committeeAbbr} Meeting` : 'Meeting'}</strong>
                        <div>{item.title || 'No description'}</div>
                      </div>
                      
                      {item.rawData && (
                        <>
                          {item.rawData.committee && (
                            <div className="season-calendar-modal-field">
                              <strong>Committee:</strong>
                              <div>{item.rawData.committee}</div>
                            </div>
                          )}
                          
                          {item.rawData.meeting_time && (
                            <div className="season-calendar-modal-field">
                              <strong>Time:</strong>
                              <div>{formatTime(item.rawData.meeting_time)}</div>
                            </div>
                          )}
                          
                          {item.rawData.meeting_mode && (
                            <div className="season-calendar-modal-field">
                              <strong>Mode:</strong>
                              <div style={{ textTransform: 'capitalize' }}>
                                {item.rawData.meeting_mode}
                              </div>
                            </div>
                          )}
                          
                          {item.rawData.meeting_link && (
                            <div className="season-calendar-modal-field">
                              <strong>
                                {item.rawData.meeting_mode === 'online' ? 'Meeting Link:' : 'Location:'}
                              </strong>
                              <div>
                                {item.rawData.meeting_mode === 'online' ? (
                                  <a
                                    href={item.rawData.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#00629b', textDecoration: 'underline' }}
                                  >
                                    {item.rawData.meeting_link}
                                  </a>
                                ) : (
                                  item.rawData.meeting_link
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="season-calendar-modal-field">
                        <strong>Event</strong>
                        <div>{item.title || 'Untitled Event'}</div>
                      </div>
                      
                      {item.rawData && (
                        <>
                          {item.rawData.description && (
                            <div className="season-calendar-modal-field">
                              <strong>Description:</strong>
                              <div>{item.rawData.description}</div>
                            </div>
                          )}
                          
                          {item.rawData.start_date && (
                            <div className="season-calendar-modal-field">
                              <strong>Start Date:</strong>
                              <div>{formatDateDisplay(item.rawData.start_date)}</div>
                            </div>
                          )}
                          
                          {item.rawData.end_date && item.rawData.end_date !== item.rawData.start_date && (
                            <div className="season-calendar-modal-field">
                              <strong>End Date:</strong>
                              <div>{formatDateDisplay(item.rawData.end_date)}</div>
                            </div>
                          )}
                          
                          {item.rawData.location && (
                            <div className="season-calendar-modal-field">
                              <strong>Location:</strong>
                              <div>{item.rawData.location}</div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {(eventsByDate.get(selectedDate) || []).indexOf(item) < (eventsByDate.get(selectedDate) || []).length - 1 && (
                    <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonCalendar;


