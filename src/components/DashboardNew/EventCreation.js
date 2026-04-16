import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';
import './eventCreationStyles.css';

const EventCreation = ({ isBoa = false }) => {
  const { user } = useAuth() || {};
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return 'End date must be after start date';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Event title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        return '';
      case 'description':
        if (!value.trim()) return 'Event description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        return '';
      case 'start_date':
        if (!value) return 'Start date is required';
        return '';
      case 'end_date':
        if (!value) return 'End date is required';
        return validateDateRange(formData.start_date, value);
      case 'location':
        if (!value.trim()) return 'Location is required';
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
    const requiredFields = ['title', 'description', 'start_date', 'end_date', 'location'];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBoa) {
      return;
    }
    setIsSubmitting(true);
    setSubmitErrorMessage('');

    if (validateForm()) {
      try {
        const eventData = {
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          location: formData.location,
          created_by: user?.id || null,
        };

        const { error } = await supabase
          .from('events')
          .insert([eventData])
          .select();

        if (error) throw error;

        setSubmitStatus('success');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          start_date: '',
          end_date: '',
          location: '',
        });
        setErrors({});
        
        setTimeout(() => setSubmitStatus(null), 5000);
      } catch (error) {
        console.error('Error creating event:', error);
        setSubmitStatus('error');
        setSubmitErrorMessage(error?.message || 'An error occurred while creating the event.');
        setTimeout(() => setSubmitStatus(null), 5000);
      }
    }

    setIsSubmitting(false);
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
    form: {
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
      minHeight: '100px',
      resize: 'vertical',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.9375rem',
      outline: 'none',
      backgroundColor: '#ffffff',
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
  };

  return (
    <div className="event-creation-container" style={styles.container}>
      <h1 style={styles.title}>Create Event</h1>
      
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>Event Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{ ...styles.input, ...(errors.title && { borderColor: '#dc2626' }) }}
            disabled={isBoa}
            required
            placeholder="Enter event title"
            maxLength="100"
          />
          {errors.title && <div style={styles.error}>{errors.title}</div>}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>Event Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...styles.textarea, ...(errors.description && { borderColor: '#dc2626' }) }}
            disabled={isBoa}
            required
            placeholder="Describe the event..."
            rows="5"
            maxLength="1000"
          />
          {errors.description && <div style={styles.error}>{errors.description}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', ...styles.formGroup }}>
          <div>
            <label htmlFor="start_date" style={styles.label}>Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.start_date && { borderColor: '#dc2626' }) }}
              disabled={isBoa}
              required
            />
            {errors.start_date && <div style={styles.error}>{errors.start_date}</div>}
          </div>

          <div>
            <label htmlFor="end_date" style={styles.label}>End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date || undefined}
              style={{ ...styles.input, ...(errors.end_date && { borderColor: '#dc2626' }) }}
              disabled={isBoa}
              required
            />
            {errors.end_date && <div style={styles.error}>{errors.end_date}</div>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="location" style={styles.label}>Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={{ ...styles.input, ...(errors.location && { borderColor: '#dc2626' }) }}
            disabled={isBoa}
            required
            placeholder="Enter event location"
          />
          {errors.location && <div style={styles.error}>{errors.location}</div>}
        </div>

        <button
          type="submit"
          style={isSubmitting || isBoa ? { ...styles.submitButton, ...styles.disabledButton } : styles.submitButton}
          disabled={isSubmitting || isBoa}
        >
          {isSubmitting ? 'Creating Event...' : 'Create Event'}
        </button>

        {submitStatus === 'success' && (
          <div style={styles.successMessage}>
            <strong>Success!</strong> Event created successfully.
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

export default EventCreation;
