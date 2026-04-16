import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../config/supabaseClient';
import SearchIcon from '@mui/icons-material/Search';
import TaskCard from './TaskCard';
import './viewAssignedTasksStyles.css';

const ViewAssignedTasks = ({ isBoa = false }) => {
  const { user, profile, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  // Removed unused assignees map to fix linter warning
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [completingTasks, setCompletingTasks] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const profileId = useMemo(() => profile?.id || null, [profile]);

  useEffect(() => {
    let cancelled = false;

    const fetchTasksForUser = async () => {
      if (!user || !profileId || !isSupabaseConfigured) {
        setTasks([]);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        // Fetch task ids and per-student completion status for this student
        const { data: assignees, error: assigneesError } = await supabase
          .from('task_assignees')
          .select('task_id, is_completed')
          .eq('student_id', profileId);

        if (assigneesError) throw assigneesError;

        const taskIds = (assignees || []).map(r => r.task_id).filter(Boolean);
        if (taskIds.length === 0) {
          if (!cancelled) setTasks([]);
          return;
        }

        // Fetch tasks by ids
        const { data: tasksRows, error: tasksError } = await supabase
          .from('task')
          .select('*')
          .in('id', taskIds)
          .order('due_date', { ascending: true });

        if (tasksError) throw tasksError;

        // Fetch creator names
        const creatorIds = Array.from(new Set((tasksRows || []).map(t => t.created_by).filter(Boolean)));
        let creatorMap = new Map();
        if (creatorIds.length > 0) {
          const { data: creators, error: creatorsErr } = await supabase
            .from('student')
            .select('id, full_name')
            .in('id', creatorIds);
          if (!creatorsErr) {
            creatorMap = new Map((creators || []).map(c => [c.id, c.full_name || 'Unknown']));
          }
        }

        // Map task_id -> per-student completed flag
        const completionMap = new Map(
          (assignees || []).map(a => [a.task_id, Boolean(a.is_completed)])
        );

        // Enrich tasks with creator name and per-student completion
        const enrichedTasks = (tasksRows || []).map(t => ({
          ...t,
          assigned_by_name: creatorMap.get(t.created_by) || 'Unknown',
          student_completed: completionMap.get(t.id) || false,
        }));

        if (!cancelled) {
          setTasks(enrichedTasks);
          // Set initial completed state from task_assignees.completed for this student
          const completed = new Set(
            (assignees || [])
              .filter(a => a.is_completed)
              .map(a => a.task_id)
          );
          setCompletedTasks(completed);
        }

        // Removed assignee names prefetch as it was unused in UI
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load tasks');
          setTasks([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTasksForUser();
    return () => { cancelled = true; };
  }, [user, profileId]);

  const toggleTaskCompletion = async (taskId) => {
    if (completingTasks.has(taskId)) return;

    const currentCompleted = completedTasks.has(taskId);
    const newCompleted = !currentCompleted;

    setCompletingTasks(prev => new Set([...prev, taskId]));
    try {
      // Update per-student completion status in task_assignees
      const { error } = await supabase
        .from('task_assignees')
        .update({ is_completed: newCompleted })
        .eq('task_id', taskId)
        .eq('student_id', profileId);
      if (error) throw error;

      // Update local state
      setCompletedTasks(prev => {
        const next = new Set(prev);
        if (newCompleted) {
          next.add(taskId);
        } else {
          next.delete(taskId);
        }
        return next;
      });
    } catch (err) {
      console.error('Error updating task completion:', err);
      alert('Failed to update task completion. Please try again.');
    } finally {
      setCompletingTasks(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = !searchTerm.trim() ||
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || 
      (t.priority || '').toLowerCase() === filterPriority.toLowerCase();
    return matchesSearch && matchesPriority;
  });

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
      color: '#6b7280',
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
    <div className="view-assigned-tasks-container" style={styles.container}>
      <h1 style={styles.title}>View Assigned Tasks</h1>

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
        <div style={styles.loadingText}>Loading tasks...</div>
      ) : error ? (
        <div style={styles.errorText}>{error}</div>
      ) : filteredTasks.length > 0 ? (
        <div style={styles.tasksGrid}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isCompleted={completedTasks.has(task.id)}
              onToggleCompletion={isBoa ? null : () => toggleTaskCompletion(task.id)}
              showAssignedBy
            />
          ))}
        </div>
      ) : (
        <div style={styles.noTasks}>
          <p style={styles.noTasksText}>No tasks found</p>
        </div>
      )}
    </div>
  );
};

export default ViewAssignedTasks;

