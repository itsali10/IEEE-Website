import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import { useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import './eventsListStyles.css';

const EventsList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date');
  const [events, setEvents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setEvents([]);
        setMeetings([]);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        // Fetch events
        let eventsQuery = supabase
          .from('events')
          .select('*')
          .order('start_date', { ascending: true });

        // Filter by date if provided
        if (selectedDate) {
          // Check if event spans the selected date
          eventsQuery = eventsQuery
            .lte('start_date', selectedDate)
            .gte('end_date', selectedDate);
        }

        const { data: eventsData, error: eventsError } = await eventsQuery;

        if (eventsError) throw eventsError;

        // Fetch meetings
        let meetingsQuery = supabase
          .from('meetings')
          .select('*')
          .order('meeting_date', { ascending: true });

        // Filter by date if provided
        if (selectedDate) {
          meetingsQuery = meetingsQuery.eq('meeting_date', selectedDate);
        }

        const { data: meetingsData, error: meetingsError } = await meetingsQuery;

        if (meetingsError) throw meetingsError;

        setEvents(eventsData || []);
        setMeetings(meetingsData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data. Error: ${err.message}`);
        setEvents([]);
        setMeetings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, selectedDate]);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
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

  const allItems = [
    ...events.map(ev => ({ ...ev, type: 'event' })),
    ...meetings.map(m => ({ ...m, type: 'meeting' }))
  ];

  const filteredItems = allItems.filter(item => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    if (item.type === 'event') {
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q)
      );
    } else {
      return (
        (item.description || '').toLowerCase().includes(q) ||
        (item.committee || '').toLowerCase().includes(q)
      );
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const styles = {
    container: {
      padding: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      color: '#0f172a',
    },
    searchSection: {
      marginBottom: '2rem',
    },
    searchInputContainer: {
      position: 'relative',
      maxWidth: '400px',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '0.75rem',
      color: '#6b7280',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      background: '#ffffff',
      color: '#0f172a',
      fontSize: '0.9375rem',
      outline: 'none',
    },
    eventsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '2rem',
    },
    eventCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '2rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s',
    },
    eventTitle: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '1rem',
    },
    eventDescription: {
      fontSize: '1rem',
      color: '#6b7280',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
    },
    eventInfo: {
      fontSize: '1rem',
      color: '#6b7280',
      marginBottom: '0.75rem',
    },
    eventLabel: {
      fontWeight: '600',
      color: '#374151',
      marginRight: '0.5rem',
    },
  };

  return (
    <div className="events-list-container" style={styles.container}>
      <h1 style={styles.title}>
        {selectedDate ? `Events for ${formatDate(selectedDate)}` : 'Events & Meetings'}
      </h1>

      {/* Search */}
      <div style={styles.searchSection}>
        <div style={styles.searchInputContainer}>
          <SearchIcon style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search events and meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => e.target.style.borderColor = '#00629b'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: '#dc2626' }}>{error}</div>
      ) : filteredItems.length > 0 ? (
        <div style={styles.eventsGrid}>
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              style={styles.eventCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00629b';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <h3 style={styles.eventTitle}>
                {item.type === 'meeting' 
                  ? `${getCommitteeAbbreviation(item.committee)} Meeting`
                  : (item.title || 'Untitled Event')}
              </h3>
              <p style={styles.eventDescription}>
                {item.type === 'meeting' 
                  ? (item.description || 'No description available.')
                  : (item.description || 'No description available.')}
              </p>
              {item.type === 'meeting' ? (
                <>
                  <div style={styles.eventInfo}>
                    <span style={styles.eventLabel}>Date:</span> {formatDate(item.meeting_date)}
                  </div>
                  {item.meeting_time && (
                    <div style={styles.eventInfo}>
                      <span style={styles.eventLabel}>Time:</span> {formatTime(item.meeting_time)}
                    </div>
                  )}
                  <div style={styles.eventInfo}>
                    <span style={styles.eventLabel}>Mode:</span> {item.meeting_mode || '—'}
                  </div>
                  {item.meeting_link && (
                    <div style={styles.eventInfo}>
                      <span style={styles.eventLabel}>
                        {item.meeting_mode === 'online' ? 'Link:' : 'Location:'}
                      </span>{' '}
                      {item.meeting_mode === 'online' ? (
                        <a href={item.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: '#00629b' }}>
                          {item.meeting_link}
                        </a>
                      ) : (
                        item.meeting_link
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={styles.eventInfo}>
                    <span style={styles.eventLabel}>Location:</span> {item.location || '—'}
                  </div>
                  <div style={styles.eventInfo}>
                    <span style={styles.eventLabel}>Start:</span> {formatDate(item.start_date)}
                  </div>
                  <div style={styles.eventInfo}>
                    <span style={styles.eventLabel}>End:</span> {formatDate(item.end_date)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem', color: '#6b7280' }}>
          {selectedDate ? `No events or meetings found for ${formatDate(selectedDate)}` : 'No events or meetings found'}
        </div>
      )}
    </div>
  );
};

export default EventsList;
