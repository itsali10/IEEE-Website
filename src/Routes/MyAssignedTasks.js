import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import '../css/joinUsStyles.css';

const MyAssignedTasks = () => {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [assigneesMap, setAssigneesMap] = useState(new Map()); // taskId -> [{id, name}]
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAssignee, setSearchAssignee] = useState('');
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

        // Fetch assignees for these tasks to enable assignee filtering
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
    const titleOk = !searchTitle.trim() || (t.title || '').toString().toLowerCase().includes(searchTitle.trim().toLowerCase());
    if (!titleOk) return false;
    const assignees = assigneesMap.get(t.id) || [];
    const names = assignees.map(a => (a.name || '').toString().toLowerCase());
    const assigneeOk = !searchAssignee.trim() || names.some(n => n.includes(searchAssignee.trim().toLowerCase()));
    return assigneeOk;
  });

  return (
    <div className="joinus-container">
      <div className="joinus-content-wrapper" style={{ paddingBottom: 60 }}>
        

        {/* Search Controls */}
        <div className="form-row" style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="search_title">Search by Task Name</label>
            <input
              id="search_title"
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Type part of the task title..."
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="search_assignee">Search by Assignee</label>
            <input
              id="search_assignee"
              type="text"
              value={searchAssignee}
              onChange={(e) => setSearchAssignee(e.target.value)}
              placeholder="Type part of an assignee name..."
            />
          </div>
        </div>

        {loading || isLoading ? (
          <div style={{ color: '#00629b', marginBottom: 16 }}>Loading tasks...</div>
        ) : error ? (
          <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ color: '#666', marginBottom: 16 }}>No tasks found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {filteredTasks.map((t) => (
              <div key={t.id} style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0, color: '#0a2540', fontSize: '1.1rem' }}>{t.title}</h3>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: t.priority === 'High' ? '#fee2e2' : t.priority === 'Medium' ? '#fffbeb' : '#ecfdf5',
                    color: t.priority === 'High' ? '#991b1b' : t.priority === 'Medium' ? '#92400e' : '#065f46',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}>{t.priority || 'Low'}</span>
                </div>
                <p style={{ margin: '8px 0', color: '#4f5b66', whiteSpace: 'pre-wrap' }}>{t.description}</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#374151', fontSize: '0.9rem' }}>
                  {t.due_date && (
                    <span>Due: {new Date(t.due_date).toLocaleDateString()}</span>
                  )}
                  {t.task_attachment && (
                    <a href={t.task_attachment} target="_blank" rel="noopener noreferrer" style={{ color: '#0a84ff', textDecoration: 'underline' }}>
                      Attachment
                    </a>
                  )}
                </div>
                {/* Display assignees if available */}
                <div style={{ marginTop: 8, color: '#6b7280', fontSize: '0.9rem' }}>
                  {(assigneesMap.get(t.id) || []).length > 0 && (
                    <span>
                      Assignees: {(assigneesMap.get(t.id) || []).map(a => a.name).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssignedTasks;


