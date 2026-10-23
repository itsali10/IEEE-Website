import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../config/supabaseClient';
import SearchIcon from '@mui/icons-material/Search';
import TaskCard from './TaskCard';
import './myAssignedTasksStyles.css';

const MyAssignedTasks = ({ isBoa = false }) => {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [assigneesMap, setAssigneesMap] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const creatorId = useMemo(() => user?.id || null, [user]);

  useEffect(() => {
    let cancelled = false;

    const fetchCreatedTasks = async () => {
      if (!user || !creatorId || !isSupabaseConfigured) {
        setTasks([]);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('task')
          .select('*')
          .eq('created_by', creatorId)
          .order('due_date', { ascending: true });
        if (error) throw error;
        if (!cancelled) setTasks(data || []);

        // Fetch assignees for these tasks
        try {
          const taskIds = (data || []).map(t => t.id).filter(Boolean);
          if (taskIds.length > 0) {
            const { data: links, error: linksErr } = await supabase
              .from('task_assignees')
              .select('task_id, student_id')
              .in('task_id', taskIds);
            if (linksErr) throw linksErr;

            const studentIds = Array.from(new Set((links || []).map(r => r.student_id).filter(Boolean)));
            let idToName = new Map();
            if (studentIds.length > 0) {
              const { data: students, error: stuErr } = await supabase
                .from('student')
                .select('id, full_name')
                .in('id', studentIds);
              if (stuErr) throw stuErr;
              idToName = new Map((students || []).map(s => [s.id, s.full_name || 'Unknown']));
            }

            const map = new Map();
            (links || []).forEach(link => {
              const list = map.get(link.task_id) || [];
              list.push({ id: link.student_id, name: idToName.get(link.student_id) || 'Unknown' });
              map.set(link.task_id, list);
            });
            if (!cancelled) setAssigneesMap(map);
          } else if (!cancelled) {
            setAssigneesMap(new Map());
          }
        } catch (_) {
          if (!cancelled) setAssigneesMap(new Map());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load tasks');
          setTasks([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchCreatedTasks();
    return () => { cancelled = true; };
  }, [user, creatorId]);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !searchTerm.trim() ||
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || 
      (t.priority || '').toLowerCase() === filterPriority.toLowerCase();
    return matchesSearch && matchesPriority;
  });

  // Enrich tasks with assignee names for display
  const enrichedTasks = filteredTasks.map(task => ({
    ...task,
    assigned_to_names: (assigneesMap.get(task.id) || []).map(a => a.name).join(', '),
  }));

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
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    searchRow: {
      display: 'flex',
      gap: '1rem',
    },
    searchInputContainer: {
      flex: 1,
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '0.75rem',
      color: '#4b5563',
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
    select: {
      padding: '0.5rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      background: '#ffffff',
      color: '#0f172a',
      fontSize: '0.9375rem',
      outline: 'none',
      cursor: 'pointer',
    },
    tasksGrid: {
      display: 'grid',
      gap: '1rem',
    },
    noTasks: {
      textAlign: 'center',
      paddingTop: '3rem',
      paddingBottom: '3rem',
    },
    noTasksText: {
      color: '#4b5563',
      fontSize: '1.125rem',
    },
    loadingText: {
      color: '#00629b',
      marginBottom: '1rem',
    },
    errorText: {
      color: '#dc2626',
      marginBottom: '1rem',
    },
  };

  return (
    <div className="my-assigned-tasks-container" style={styles.container}>
      <h1 style={styles.title}>Tasks I Assigned</h1>

      {/* Search and Filter */}
      <div style={styles.searchSection}>
        <div style={styles.searchRow}>
          <div style={styles.searchInputContainer}>
            <SearchIcon style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#00629b'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={styles.select}
            onFocus={(e) => e.target.style.borderColor = '#00629b'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading || isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '3rem 0', color: '#4b5563' }}>
          <div style={{ width: '20px', height: '20px', border: '3px solid #e5e7eb', borderTopColor: '#00629b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          <span>Loading tasks…</span>
        </div>
      ) : error ? (
        <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '8px', padding: '1.25rem', color: '#b91c1c', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚠️</span>
          <div>
            <strong>Failed to load tasks</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
      ) : enrichedTasks.length > 0 ? (
        <div style={styles.tasksGrid}>
          {enrichedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
            isCompleted={!!task.completed}
              onToggleCompletion={null}
              showAssignedTo
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>No tasks assigned yet</p>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>Tasks you create will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default MyAssignedTasks;

