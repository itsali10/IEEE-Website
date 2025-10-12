import React, { useState } from 'react';
import HeroWithSlope from "../components/HeroWithSlope/HeroWithSlope";
import '../css/joinUsStyles.css';

const taskTypeOptions = [
    'Web Development',
    'Mobile Development',
    'Data Analysis',
    'UI/UX Design',
    'Content Creation',
    'Event Management',
    'Marketing',
    'Research',
    'Other'
];

const Tasks = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        taskType: '',
        description: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

    // Validation functions
    const validateName = (value) => {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!value.trim()) return 'This field is required';
        if (!nameRegex.test(value)) return 'Only alphabetical characters and spaces are allowed';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        return '';
    };

    const validateEmail = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
    };

    const validatePhone = (value) => {
        const phoneRegex = /^\d{11}$/;
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value)) return 'Phone number must be exactly 11 digits';
        return '';
    };

    const validateDescription = (value) => {
        if (!value.trim()) return 'Task description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return '';
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                return validateName(value);
            case 'email':
                return validateEmail(value);
            case 'phone':
                return validatePhone(value);
            case 'description':
                return validateDescription(value);
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
        const requiredFields = ['name', 'email', 'phone', 'taskType', 'description'];

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

    const submitToGoogleSheets = async (data) => {
        try {
            // For now, we'll simulate a successful submission
            // In a real implementation, you would integrate with Google Sheets API
            console.log('Task submission data:', data);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return { success: true, data: null };
        } catch (error) {
            console.error('Error submitting task:', error);
            return { success: false, error: error.message };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (validateForm()) {
            try {
                // Submit to Google Sheets
                const result = await submitToGoogleSheets(formData);
                
                if (result.success) {
                    // Success - show success message and reset form
                    setSubmitStatus('success');
                    
                    // Reset form data
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        taskType: '',
                        description: '',
                    });
                    
                    // Clear errors
                    setErrors({});
                    
                    // Auto-hide success message after 5 seconds
                    setTimeout(() => setSubmitStatus(null), 5000);
                    
                } else {
                    // Error - show error message
                    setSubmitStatus('error');
                    setTimeout(() => setSubmitStatus(null), 5000);
                }
            } catch (error) {
                console.error('Submission error:', error);
                setSubmitStatus('error');
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
            <HeroWithSlope pName="Tasks" canvasId="tasks-gradient-canvas" />
            <div className="joinus-content-wrapper">
                <div className="hero-joinus-spacer"></div>
                <section className="joinus-hero">
                    <h2>Submit Your Task Request</h2>
                    <p>Need help with a project or task? Submit your request and our team will get back to you with assistance!</p>
                </section>
                <form className="joinus-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                autoComplete="name"
                                placeholder="Full Name"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                autoComplete="email"
                                placeholder="example@email.com"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                required 
                                autoComplete="tel"
                                maxLength="11"
                                placeholder="01234567890"
                                className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="form-error">{errors.phone}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="taskType">Task Type</label>
                            <select 
                                id="taskType" 
                                name="taskType" 
                                value={formData.taskType} 
                                onChange={handleChange} 
                                required
                                className={errors.taskType ? 'error' : ''}
                            >
                                <option value="">Select task type</option>
                                {taskTypeOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.taskType && <span className="form-error">{errors.taskType}</span>}
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
                                placeholder="Please describe your task or project requirements in detail..."
                                rows="4"
                                maxLength="500"
                                className={errors.description ? 'error' : ''}
                            />
                            {errors.description && <span className="form-error">{errors.description}</span>}
                        </div>
                    </div>
                    <button type="submit" className="joinus-submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="loading-spinner"></span>
                                Submitting...
                            </>
                        ) : (
                            'Submit Task Request'
                        )}
                    </button>
                    
                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                        <div className="submit-status success">
                            <div className="status-icon">✅</div>
                            <div className="status-content">
                                <h4>Task Request Submitted Successfully!</h4>
                                <p>Thank you for submitting your task request. Our team will review it and get back to you soon.</p>
                            </div>
                        </div>
                    )}
                    
                    {submitStatus === 'error' && (
                        <div className="submit-status error">
                            <div className="status-icon">❌</div>
                            <div className="status-content">
                                <h4>Submission Failed</h4>
                                <p>There was an issue submitting your task request. Please try again or contact us at <a href="mailto:info@ieeeaastcairo.org">info@ieeeaastcairo.org</a></p>
                            </div>
                        </div>
                    )}
                </form>
                <section className="joinus-contact">
                    <h4>Need help?</h4>
                    <p>Email us at <a href="mailto:info@ieeeaastcairo.org">info@ieeeaastcairo.org</a></p>
                </section>
            </div>
        </div>
    );
};

export default Tasks;
