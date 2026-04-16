import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import './taskAssignmentStyles.css';

const TaskAssignment = ({ isBoa = false }) => {
  const { user, profile, isAdmin } = useAuth() || {};
  const hasFetchedMembers = useRef(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    attachmentUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  const [adminCommittee, setAdminCommittee] = useState('');
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [membersError, setMembersError] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    if (!user) {
      hasFetchedMembers.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (!profile) {
      setAdminCommittee('');
      hasFetchedMembers.current = false;
      return;
    }
    try {
      const committee = 
        profile.committee || 
        profile.firstCommittee || 
        profile.first_committee || 
        profile.primaryCommittee || 
        profile.primary_committee || '';
      
      if (committee !== adminCommittee) {
        setAdminCommittee(committee);
      }
    } catch (err) {
      console.error('[TaskAssignment] Error reading committee:', err);
      setAdminCommittee('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    
    const fetchMembers = async () => {
      const userRole = (profile?.role || '').toString().trim().toLowerCase();
      
      if (!user || !isAdmin) {
        if (!cancelled) {
          setMembers([]);
          setMembersLoading(false);
          hasFetchedMembers.current = false;
        }
        return;
      }
      
      // Don't re-fetch if we already have members loaded
      if (hasFetchedMembers.current) {
        return;
      }
      
      if (!cancelled) {
        setMembersLoading(true);
        setMembersError('');
      }
      
      try {
        let data, error;

        if (userRole === 'officer') {
          // Officers can assign to board members, other officers, vice, and coordinators
          const result = await supabase
            .from('student')
            .select('id, full_name, student_id, committee, role, email')
            .or('role.ilike.board,role.ilike.officer,role.ilike.vice,role.ilike.coordinator')
            .order('full_name', { ascending: true });
          data = result.data;
          error = result.error;
        } else if ((userRole === 'board' || userRole === 'vice') && adminCommittee) {
          // Board and Vice roles can assign to members of their own committee
          const result = await supabase
            .from('student')
            .select('id, full_name, student_id, committee, role, email')
            .eq('committee', adminCommittee)
            .ilike('role', 'member')
            .order('full_name', { ascending: true });
          data = result.data;
          error = result.error;
        } else {
          if (!cancelled) {
            setMembers([]);
            setMembersLoading(false);
          }
          return;
        }
        
        if (cancelled) return;
        
        if (error) throw error;

        const normalized = (data || []).map((row) => ({
          id: row.id,
          name: row.full_name || 'Unknown',
          studentId: row.student_id || '',
          email: row.email || '',
        }));
        
        setMembers(normalized);
        hasFetchedMembers.current = true;
      } catch (err) {
        if (!cancelled) {
          setMembersError(`Failed to load assignable users. Error: ${err.message}`);
          setMembers([]);
          hasFetchedMembers.current = false;
        }
      } finally {
        if (!cancelled) {
          setMembersLoading(false);
        }
      }
    };
    
    fetchMembers();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, profile?.role, adminCommittee]);

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) => (
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    ));
  };

  const filteredMembers = members.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.trim().toLowerCase();
    return (
      (m.name || '').toString().toLowerCase().includes(q) ||
      (m.studentId || '').toString().toLowerCase().includes(q) ||
      (m.email || '').toString().toLowerCase().includes(q)
    );
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Task title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        return '';
      case 'description':
        if (!value.trim()) return 'Task description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 1000) return 'Description must be less than 1000 characters';
        return '';
      case 'dueDate':
        if (!value) return 'Due date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Due date cannot be in the past';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['title', 'description', 'dueDate', 'priority'];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      } else {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitErrorMessage('');

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        due_date: formData.dueDate,
        priority: formData.priority,
        task_attachment: formData.attachmentUrl || null,
        created_by: user?.id || null,
      };

      const { data: insertedData, error } = await supabase
        .from('task')
        .insert([taskData])
        .select();

      if (error) throw error;

      const createdTask = insertedData?.[0];
      if (!createdTask) throw new Error('Task creation returned no rows');

      const uniqueSelectedIds = Array.from(new Set(selectedMemberIds));

      if (uniqueSelectedIds.length > 0) {
        const rows = uniqueSelectedIds.map((studentId) => ({
          task_id: createdTask.id,
          student_id: studentId,
        }));
        const { error: relError } = await supabase
          .from('task_assignees')
          .insert(rows);
        if (relError) throw relError;
      }

      // Send notification emails if configured
      try {
        const GAS_WEBHOOK_URL = process.env.REACT_APP_GAS_EMAIL_WEBHOOK_URL || '';
        if (GAS_WEBHOOK_URL) {
          const idToEmail = new Map();

          // Map emails for assignees
          (members || []).forEach((m) => {
            if (m.id && m.email && typeof m.email === 'string') {
              idToEmail.set(m.id, m.email);
            }
          });

          const recipientEmails = uniqueSelectedIds
            .map(id => idToEmail.get(id))
            .filter(email => typeof email === 'string' && email.includes('@'));

          if (recipientEmails.length > 0) {
            const payload = {
              type: 'task_created',
              title: createdTask.title,
              description: createdTask.description,
              due_date: createdTask.due_date,
              priority: createdTask.priority,
              task_attachment: createdTask.task_attachment || null,
              created_by_email: user?.email || '',
              recipients: recipientEmails,
            };

            fetch(GAS_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              mode: 'no-cors'
            }).catch(() => {});
          }
        }
      } catch (_) {}

      setSubmitStatus('success');
      
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        attachmentUrl: '',
      });
      setSelectedMemberIds([]);
      setErrors({});
      
      setTimeout(() => setSubmitStatus(null), 5000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitErrorMessage(error?.message || String(error));
      setTimeout(() => setSubmitStatus(null), 5000);
    }

    setIsSubmitting(false);
  };

  // Helper to display names in proper Title Case even if stored in uppercase
  const capitalizeText = (text) => {
    if (!text) return '';
    const str = String(text).trim();
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      alignItems: 'start',
    },
    card: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    form: {
      background: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    fieldContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#0f172a',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.5rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      background: '#ffffff',
      color: '#0f172a',
      fontSize: '0.9375rem',
      outline: 'none',
    },
    textarea: {
      width: '100%',
      padding: '0.5rem 1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      background: '#ffffff',
      color: '#0f172a',
      fontSize: '0.9375rem',
      outline: 'none',
      resize: 'vertical',
    },
    gridTwo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    submitButton: {
      width: '100%',
      padding: '0.75rem 1.5rem',
      background: '#00629b',
      color: '#ffffff',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9375rem',
      fontWeight: '600',
      transition: 'opacity 0.2s',
    },
    error: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
    },
    successMessage: {
      marginTop: '1rem',
      padding: '1rem',
      background: '#d1fae5',
      color: '#065f46',
      borderRadius: '0.5rem',
      display: 'flex',
      gap: '0.5rem',
    },
    errorMessage: {
      marginTop: '1rem',
      padding: '1rem',
      background: '#fee2e2',
      color: '#991b1b',
      borderRadius: '0.5rem',
      display: 'flex',
      gap: '0.5rem',
    },
    memberGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '0.5rem',
      padding: '0.5rem',
      maxHeight: '400px',
      overflowY: 'auto',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      background: '#ffffff',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      transition: 'background-color 0.2s',
    },
    characterCount: {
      textAlign: 'right',
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.25rem',
    },
  };

  return (
    <div style={styles.container} className="task-assignment-container">
      <h1 style={styles.title}>Assign Task</h1>

      <div style={styles.cardsContainer}>
        {/* Left Card - Task Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldContainer}>
            <div style={styles.field}>
              <label style={styles.label}>Task Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                style={styles.input}
                disabled={isBoa}
                onFocus={(e) => e.target.style.borderColor = '#00629b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                required
                maxLength="100"
              />
              {errors.title && <span style={styles.error}>{errors.title}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter task description"
                rows={4}
                style={styles.textarea}
                disabled={isBoa}
                onFocus={(e) => e.target.style.borderColor = '#00629b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                required
                maxLength="1000"
              />
              <div style={styles.characterCount}>
                {formData.description.length}/1000 characters
              </div>
              {errors.description && <span style={styles.error}>{errors.description}</span>}
            </div>

            <div style={styles.gridTwo}>
              <div style={styles.field}>
                <label style={styles.label}>Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={isBoa}
                  onFocus={(e) => e.target.style.borderColor = '#00629b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.dueDate && <span style={styles.error}>{errors.dueDate}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={styles.input}
                  disabled={isBoa}
                  onFocus={(e) => e.target.style.borderColor = '#00629b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority && <span style={styles.error}>{errors.priority}</span>}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Attachment URL (Optional)</label>
              <input
                type="url"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleChange}
                placeholder="https://example.com/attachment"
                style={styles.input}
                disabled={isBoa}
                onFocus={(e) => e.target.style.borderColor = '#00629b'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting || isBoa}
              onMouseEnter={(e) => !isSubmitting && !isBoa && (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {isSubmitting ? 'Assigning Task...' : 'Assign Task'}
            </button>

            {submitStatus === 'success' && (
              <div style={styles.successMessage}>
                <span>✅</span>
                <div>
                  <strong>Task Created Successfully!</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>The task has been added to the system.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div style={styles.errorMessage}>
                <span>❌</span>
                <div>
                  <strong>Task Creation Failed</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>
                    {submitErrorMessage || 'There was an issue creating the task. Please try again.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Right Column - Assignees Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Right Card - Member Selection (Assign To) */}
          <div style={styles.card}>
            <div style={styles.fieldContainer}>
              <div style={styles.field}>
                <label style={styles.label}>
                  {(profile?.role || '').toString().trim().toLowerCase() === 'officer' 
                    ? 'Assign To Officers & Board Members' 
                    : 'Assign To Members (Same Committee)'}
                </label>
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search members by name, ID, or email..."
                  style={{ ...styles.input, marginBottom: '0.5rem' }}
                  disabled={isBoa}
                  onFocus={(e) => e.target.style.borderColor = '#00629b'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                {membersLoading ? (
                  <div style={{ color: '#00629b' }}>Loading members...</div>
                ) : membersError ? (
                  <div style={styles.error}>{membersError}</div>
                ) : filteredMembers.length === 0 ? (
                  <div style={{ color: '#6b7280' }}>
                    {(profile?.role || '').toString().trim().toLowerCase() === 'officer' 
                      ? 'No officers or board members found.' 
                      : 'No members found in your committee.'}
                  </div>
                ) : (
                  <div style={styles.memberGrid}>
                    {filteredMembers.map((m) => (
                      <label 
                        key={m.id} 
                        style={styles.checkboxLabel}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(m.id)}
                          onChange={() => toggleMember(m.id)}
                          disabled={isBoa}
                          style={{ cursor: 'pointer', accentColor: '#00629b', marginTop: '2px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {capitalizeText(m.name)}
                          </span>
                          {m.studentId && (
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              ID: {m.studentId}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignment;

