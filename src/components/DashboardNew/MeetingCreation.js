import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';

const MeetingCreation = ({ isBoa = false }) => {
  const { profile } = useAuth() || {};

  const [formData, setFormData] = useState({
    meeting_date: '',
    meeting_time: '',
    meeting_mode: 'offline',
    meeting_link: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'meeting_date':
        if (!value) return 'Meeting date is required';
        return '';
      case 'meeting_time':
        if (!value) return 'Meeting time is required';
        return '';
      case 'meeting_mode':
        if (!value) return 'Meeting mode is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['meeting_date', 'meeting_time', 'meeting_mode', 'description'];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Meeting link/location required based on mode
    if (formData.meeting_mode === 'online' && (!formData.meeting_link || !formData.meeting_link.trim())) {
      newErrors.meeting_link = 'Meeting link is required for online meetings';
    }
    
    if (formData.meeting_mode === 'offline' && (!formData.meeting_link || !formData.meeting_link.trim())) {
      newErrors.meeting_link = 'Meeting location is required for offline meetings';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBoa) {
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitErrorMessage('');

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const committeeFromProfile =
        profile?.committee ||
        profile?.firstCommittee ||
        profile?.first_committee ||
        profile?.primaryCommittee ||
        profile?.primary_committee ||
        '';

      const payload = {
        committee: committeeFromProfile || '',
        meeting_date: formData.meeting_date,
        meeting_time: formData.meeting_time,
        meeting_mode: formData.meeting_mode,
        meeting_link: formData.meeting_link || null,
        description: formData.description,
      };

      const { error } = await supabase
        .from('meetings')
        .insert([payload])
        .select();

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        meeting_date: '',
        meeting_time: '',
        meeting_mode: 'offline',
        meeting_link: '',
        description: '',
      });
      setErrors({});

      setTimeout(() => setSubmitStatus(null), 4000);
    } catch (err) {
      console.error('[MeetingCreation] Error creating meeting:', err);
      setSubmitStatus('error');
      setSubmitErrorMessage(err?.message || 'An error occurred while creating the meeting.');
      setTimeout(() => setSubmitStatus(null), 4000);
    } finally {
      setIsSubmitting(false);
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
    card: {
      maxWidth: '800px',
      background: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.9375rem',
      outline: 'none',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.9375rem',
      outline: 'none',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box',
    },
    error: {
      color: '#dc2626',
      fontSize: '0.875rem',
      marginTop: '0.25rem',
    },
    submitButton: {
      width: '100%',
      padding: '0.75rem 1.5rem',
      background: '#00629b',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    successMessage: {
      background: '#d1fae5',
      border: '1px solid #6ee7b7',
      borderRadius: '0.375rem',
      padding: '1rem',
      marginTop: '1rem',
      color: '#065f46',
    },
    errorMessage: {
      background: '#fee2e2',
      border: '1px solid #fca5a5',
      borderRadius: '0.375rem',
      padding: '1rem',
      marginTop: '1rem',
      color: '#991b1b',
    },
    gridRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
  };

  return (
    <div className="meeting-creation-container" style={styles.container}>
      <h1 style={styles.title}>Create Meeting</h1>

      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...styles.textarea, ...(errors.description && { borderColor: '#dc2626' }) }}
            disabled={isBoa}
            placeholder="Briefly describe the meeting agenda..."
            rows="4"
            maxLength="500"
          />
          {errors.description && <div style={styles.error}>{errors.description}</div>}
        </div>

        <div style={{ ...styles.formGroup, ...styles.gridRow }}>
          <div>
            <label htmlFor="meeting_date" style={styles.label}>Meeting Date</label>
            <input
              type="date"
              id="meeting_date"
              name="meeting_date"
              value={formData.meeting_date}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.meeting_date && { borderColor: '#dc2626' }) }}
              disabled={isBoa}
            />
            {errors.meeting_date && <div style={styles.error}>{errors.meeting_date}</div>}
          </div>

          <div>
            <label htmlFor="meeting_time" style={styles.label}>Meeting Time</label>
            <input
              type="time"
              id="meeting_time"
              name="meeting_time"
              value={formData.meeting_time}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.meeting_time && { borderColor: '#dc2626' }) }}
              disabled={isBoa}
            />
            {errors.meeting_time && <div style={styles.error}>{errors.meeting_time}</div>}
          </div>
        </div>

        <div style={{ ...styles.formGroup, ...styles.gridRow }}>
          <div>
            <label htmlFor="meeting_mode" style={styles.label}>Meeting Mode</label>
            <select
              id="meeting_mode"
              name="meeting_mode"
              value={formData.meeting_mode}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.meeting_mode && { borderColor: '#dc2626' }) }}
              disabled={isBoa}
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
            {errors.meeting_mode && <div style={styles.error}>{errors.meeting_mode}</div>}
          </div>

          <div>
            <label htmlFor="meeting_link" style={styles.label}>
              {formData.meeting_mode === 'online' ? 'Meeting Link' : 'Meeting Location'}
            </label>
            <input
              type={formData.meeting_mode === 'online' ? 'url' : 'text'}
              id="meeting_link"
              name="meeting_link"
              value={formData.meeting_link}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.meeting_link && { borderColor: '#dc2626' }) }}
              disabled={isBoa}
              placeholder={formData.meeting_mode === 'online' ? 'https://example.com/meeting' : 'Enter meeting location'}
            />
            {errors.meeting_link && <div style={styles.error}>{errors.meeting_link}</div>}
          </div>
        </div>

        <button
          type="submit"
          style={isSubmitting || isBoa ? { ...styles.submitButton, ...styles.disabledButton } : styles.submitButton}
          disabled={isSubmitting || isBoa}
        >
          {isSubmitting ? 'Saving Meeting...' : 'Save Meeting'}
        </button>

        {submitStatus === 'success' && (
          <div style={styles.successMessage}>
            <strong>Meeting created successfully!</strong>
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={styles.errorMessage}>
            <strong>Error:</strong> {submitErrorMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default MeetingCreation;


