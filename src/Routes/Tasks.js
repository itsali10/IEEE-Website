import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import '../css/joinUsStyles.css';
import '../css/tasksCustom.css';

const priorityOptions = ['Low', 'Medium', 'High'];

const Tasks = () => {
    const { user, profile, isAdmin } = useAuth() || {};
    const hasFetchedMembers = useRef(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        task_attachment: '',
        priority: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [submitErrorMessage, setSubmitErrorMessage] = useState('');

    // Committee members state
    const [adminCommittee, setAdminCommittee] = useState('');
    const [members, setMembers] = useState([]); // { id, name, studentId }
    const [membersLoading, setMembersLoading] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]); // uuids of student rows
    const [membersError, setMembersError] = useState('');
	const [memberSearch, setMemberSearch] = useState('');

    // Reset fetch flag when user changes (logout/login)
    useEffect(() => {
        if (!user) {
            console.log('[Tasks] User cleared, resetting fetch flag');
            hasFetchedMembers.current = false;
        }
    }, [user]);

    // Determine logged-in user's committee from profile (only once when profile loads)
    useEffect(() => {
        console.log('[Tasks] Profile changed:', profile);
        if (!profile) {
            console.log('[Tasks] No profile, clearing committee and resetting fetch flag');
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
            console.log('[Tasks] Extracted committee:', committee);
            
            // Only update if different to prevent infinite loops
            if (committee !== adminCommittee) {
                setAdminCommittee(committee);
            }
        } catch (err) {
            console.error('[Tasks] Error reading committee:', err);
            setAdminCommittee('');
        }
    }, [profile, adminCommittee]);

    // Fetch assignable users based on logged-in user's role
    useEffect(() => {
        let cancelled = false;
        
        const fetchMembers = async () => {
            const userRole = (profile?.role || '').toString().trim().toLowerCase();
            console.log('[Tasks] Fetch trigger - user:', !!user, 'isAdmin:', isAdmin, 'role:', userRole, 'committee:', adminCommittee);
            
            if (!user || !isAdmin) {
                console.log('[Tasks] Skipping fetch - not authenticated or not admin');
                if (!cancelled) {
                    setMembers([]);
                    setMembersLoading(false);
                    hasFetchedMembers.current = false;
                }
                return;
            }
            
            // Don't re-fetch if we already have members loaded
            if (hasFetchedMembers.current && members.length > 0) {
                console.log('[Tasks] ✅ Members already loaded, skipping fetch');
                return;
            }
            
            if (!cancelled) {
                setMembersLoading(true);
                setMembersError('');
                console.log('[Tasks] ⏳ Started loading members...');
            }
            
            try {
                let data, error;

                if (userRole === 'officer') {
                    // Officer: fetch all board members (global)
                    console.log('[Tasks] 📡 Fetching all BOARD members (officer view)');
                    const result = await supabase
                        .from('student')
                        .select('id, full_name, student_id, committee, role, email')
                        .ilike('role', 'board')
                        .order('full_name', { ascending: true });
                    data = result.data;
                    error = result.error;
                } else if (userRole === 'board' && adminCommittee) {
                    // Board: fetch members from same committee
                    console.log('[Tasks] 📡 Fetching MEMBERS from committee:', adminCommittee);
                    const result = await supabase
                        .from('student')
                        .select('id, full_name, student_id, committee, role, email')
                        .eq('committee', adminCommittee)
                        .ilike('role', 'member')
                        .order('full_name', { ascending: true });
                    data = result.data;
                    error = result.error;
                } else {
                    console.log('[Tasks] ⚠️ Unknown role or missing committee, skipping fetch');
                    if (!cancelled) {
                        setMembers([]);
                        setMembersLoading(false);
                    }
                    return;
                }
                
                if (cancelled) {
                    console.log('[Tasks] ❌ Fetch cancelled - component unmounted');
                    return;
                }
                
                if (error) {
                    console.error('[Tasks] ❌ Supabase query error:', error);
                    throw error;
                }

                console.log('[Tasks] ✅ Found', data ? data.length : 0, 'assignable users');

                const normalized = (data || []).map((row) => ({
                    id: row.id,
                    name: row.full_name || 'Unknown',
                    studentId: row.student_id || '',
                    email: row.email || '',
                }));
                
                console.log('[Tasks] 💾 Setting members state with', normalized.length, 'members');
                setMembers(normalized);
                hasFetchedMembers.current = true; // Mark as fetched
                console.log('[Tasks] ✅ Members state updated');
            } catch (err) {
                if (!cancelled) {
                    console.error('[Tasks] ❌ Error fetching members:', err);
                    setMembersError(`Failed to load assignable users. Error: ${err.message}`);
                    setMembers([]);
                    hasFetchedMembers.current = false;
                }
            } finally {
                if (!cancelled) {
                    console.log('[Tasks] 🏁 Setting membersLoading to FALSE');
                    setMembersLoading(false);
                    console.log('[Tasks] ✅ Loading complete');
                }
            }
        };
        
        fetchMembers();
        
        // Cleanup function to prevent state updates on unmounted component
        return () => {
            cancelled = true;
        };
    }, [user, isAdmin, profile?.role, adminCommittee, members.length]);

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

    // Validation functions
    const validateTitle = (value) => {
        if (!value.trim()) return 'Task title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        if (value.trim().length > 100) return 'Title must be less than 100 characters';
        return '';
    };

    const validateDescription = (value) => {
        if (!value.trim()) return 'Task description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 1000) return 'Description must be less than 1000 characters';
        return '';
    };

    const validateDueDate = (value) => {
        if (!value) return 'Due date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            return 'Due date cannot be in the past';
        }
        return '';
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'title':
                return validateTitle(value);
            case 'description':
                return validateDescription(value);
            case 'due_date':
                return validateDueDate(value);
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = ['title', 'description', 'due_date', 'priority'];

        // Validate required fields
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

    const submitTask = async (data) => {
        try {
            // Prepare task data for Supabase
            const taskData = {
                title: data.title,
                description: data.description,
                due_date: data.due_date,
                priority: data.priority,
                task_attachment: data.task_attachment || null,
                created_by: user?.id || null,
            };

            // Insert task into Supabase
            const { data: insertedData, error } = await supabase
                .from('task')
                .insert([taskData])
                .select();

            if (error) throw error;

            const createdTask = insertedData?.[0];
            if (!createdTask) throw new Error('Task creation returned no rows');

            // Build assignee rows: only selected members (do not auto-assign creator)
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

            // After DB inserts, send notification emails via Google Apps Script (if configured)
            try {
                const GAS_WEBHOOK_URL = process.env.REACT_APP_GAS_EMAIL_WEBHOOK_URL || '';
                if (GAS_WEBHOOK_URL) {
                    // Collect recipient emails from selected members
					const idToEmail = new Map(
						members
							.filter((m) => !!m.email)
							.map((m) => [m.id, m.email])
					);
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

                        // Fire-and-forget; don't block UI on email delivery
                        fetch(GAS_WEBHOOK_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload),
                            mode: 'no-cors'
                        }).catch(() => {/* ignore */});
                    }
                }
            } catch (_) {/* ignore email errors */}

            return { success: true, data: createdTask };
        } catch (error) {
            console.error('Error submitting task:', error);
            return { success: false, error: error.message };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitErrorMessage('');

        if (validateForm()) {
            try {
                // Submit to Supabase
                const result = await submitTask(formData);
                
                if (result.success) {
                    // Success - show success message and reset form
                    setSubmitStatus('success');
                    
                    // Reset form data
                    setFormData({
                        title: '',
                        description: '',
                        due_date: '',
                        task_attachment: '',
                        priority: '',
                    });
                    setSelectedMemberIds([]);
                    
                    // Clear errors
                    setErrors({});
                    
                    // Auto-hide success message after 5 seconds
                    setTimeout(() => setSubmitStatus(null), 5000);
                    
                } else {
                    // Error - show error message
                    setSubmitStatus('error');
                    setSubmitErrorMessage(result.error || 'An error occurred while creating the task.');
                    setTimeout(() => setSubmitStatus(null), 5000);
                }
            } catch (error) {
                console.error('Submission error:', error);
                setSubmitStatus('error');
                setSubmitErrorMessage(error?.message || String(error));
                setTimeout(() => setSubmitStatus(null), 5000);
            }
        } else {
            // Form has errors, scroll to first error
            const firstError = document.querySelector('.form-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        setIsSubmitting(false);
    };

    return (
        <div className="joinus-container">
            <div className="joinus-content-wrapper">
                <form className="joinus-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: '1 1 100%' }}>
                            <label htmlFor="title">Task Title</label>
                            <input 
                                type="text" 
                                id="title" 
                                name="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                required 
                                placeholder="Enter task title"
                                className={errors.title ? 'error' : ''}
                                maxLength="100"
                            />
                            {errors.title && <span className="form-error">{errors.title}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: '1 1 100%' }}>
                            <label htmlFor="description">Task Description</label>
                            <textarea 
                                id="description" 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                required 
                                placeholder="Describe the task in detail..."
                                rows="5"
                                maxLength="1000"
                                className={errors.description ? 'error' : ''}
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                {formData.description.length}/1000 characters
                            </div>
                            {errors.description && <span className="form-error">{errors.description}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="due_date">Due Date</label>
                            <input 
                                type="date" 
                                id="due_date" 
                                name="due_date" 
                                value={formData.due_date} 
                                onChange={handleChange} 
                                required 
                                min={new Date().toISOString().split('T')[0]}
                                className={errors.due_date ? 'error' : ''}
                            />
                            {errors.due_date && <span className="form-error">{errors.due_date}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="priority">Priority</label>
                            <select 
                                id="priority" 
                                name="priority" 
                                value={formData.priority} 
                                onChange={handleChange} 
                                required
                                className={errors.priority ? 'error' : ''}
                            >
                                <option value="">Select priority</option>
                                {priorityOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.priority && <span className="form-error">{errors.priority}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: '1 1 100%' }}>
                            <label htmlFor="task_attachment">
                                Task Attachment URL (Optional)
                                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'normal', marginLeft: '8px' }}>
                                    (Link to files, documents, or resources)
                                </span>
                            </label>
                            <input 
                                type="url" 
                                id="task_attachment" 
                                name="task_attachment" 
                                value={formData.task_attachment} 
                                onChange={handleChange} 
                                placeholder="https://example.com/file.pdf"
                                className={errors.task_attachment ? 'error' : ''}
                            />
                            {errors.task_attachment && <span className="form-error">{errors.task_attachment}</span>}
                        </div>
                    </div>

                    {/* Member selection (same committee) */}
                    <div className="form-row" style={{ flexDirection: 'column' }}>
                        <div className="form-group" style={{ flex: '1 1 100%' }}>
                            <label>
                                {(profile?.role || '').toString().trim().toLowerCase() === 'officer' 
                                    ? 'Assign To Board Members' 
                                    : 'Assign To Members (Same Committee)'}
                            </label>
									<div className="form-row" style={{ margin: '8px 0 12px', display: 'flex', gap: 8 }}>
										<input
											id="member_search"
											type="text"
											value={memberSearch}
											onChange={(e) => setMemberSearch(e.target.value)}
											placeholder="Search members by name, ID, or email..."
											style={{ flex: 1 }}
										/>
									</div>
                            {membersLoading ? (
                                <div style={{ color: '#00629b' }}>Loading members...</div>
                            ) : membersError ? (
                                <div className="form-error">{membersError}</div>
									) : filteredMembers.length === 0 ? (
                                <div style={{ color: '#666' }}>
                                    {(profile?.role || '').toString().trim().toLowerCase() === 'officer' 
                                        ? 'No board members found.' 
                                        : 'No members found in your committee.'}
                                </div>
                            ) : (
                                <div style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
										padding: 8,
                                    maxHeight: 280,
                                    overflowY: 'auto',
                                    background: '#fff'
                                }}>
                                    <div style={{
                                        display: 'grid',
											gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
											gap: '4px 6px'
                                    }}>
												{filteredMembers.map((m) => (
                                            <label key={m.id} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
													gap: 4, 
                                                cursor: 'pointer',
													padding: '2px 4px'
                                            }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMemberIds.includes(m.id)}
                                                    onChange={() => toggleMember(m.id)}
                                                    style={{ 
															width: '12px', 
															height: '12px', 
                                                        cursor: 'pointer',
                                                        flexShrink: 0,
                                                        accentColor: '#00629b'
                                                    }}
                                                />
													<div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
														<span style={{ fontWeight: 500, fontSize: '0.9rem', color: '#263238', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {m.name}
                                                    </span>
                                                    {m.studentId && (
															<span style={{ color: '#888', fontSize: '0.8rem', flexShrink: 0 }}>
                                                            ({m.studentId})
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="joinus-submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="loading-spinner"></span>
                                Creating Task...
                            </>
                        ) : (
                            'Create Task'
                        )}
                    </button>
                    
                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                        <div className="submit-status success">
                            <div className="status-icon">✅</div>
                            <div className="status-content">
                                <h4>Task Created Successfully!</h4>
                                <p>The task has been added to the system. You can now manage it from the task list.</p>
                            </div>
                        </div>
                    )}
                    
                    {submitStatus === 'error' && (
                        <div className="submit-status error">
                            <div className="status-icon">❌</div>
                            <div className="status-content">
                                <h4>Task Creation Failed</h4>
                                <p>There was an issue creating the task. Please try again or contact support.</p>
                                {submitErrorMessage && (
                                    <p style={{ marginTop: 8, color: '#7f1d1d' }}>
                                        Error: {submitErrorMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </form>
                <section className="joinus-contact">
                    <h4>Task Management Tips</h4>
                    <p>
                        • Set realistic due dates<br />
                        • Use clear, descriptive titles<br />
                        • Add attachment links for supporting documents<br />
                        • Choose appropriate priority levels
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Tasks;
