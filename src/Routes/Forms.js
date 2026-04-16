import React, { useState } from 'react';
import HeroWithSlope from "../components/HeroWithSlope/HeroWithSlope";
import '../css/formsStyles.css';

const affiliationOptions = [
    'Student Branch',
    'Student Branch Chapter',
    'SIGHT Group',
    'Other'
];

const positionOptions = [
    'Chair',
    'Vice-Chair',
    'Secretary',
    'Treasurer',
    'Other'
];

const Forms = () => {
    const [formData, setFormData] = useState({
        name: '',
        nationalId: '',
        phone: '',
        email: '',
        preferredContactMethod: [],
        affiliation: '',
        affiliationFullName: '',
        position: '',
        hasSIGHTMembership: '',
        membershipNumber: '',
        attendanceConfirmation: '',
        comments: '',
        nationalIdPhoto: '',
        nationalIdPhotoName: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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

    const validateNationalId = (value) => {
        const idRegex = /^\d{14}$/;
        if (!value.trim()) return 'National ID is required';
        if (!idRegex.test(value)) return 'National ID must be exactly 14 digits';
        return '';
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                return validateName(value);
            case 'affiliationFullName':
                // Allow alphanumeric characters for affiliation full name
                if (!value.trim()) return 'This field is required';
                if (value.trim().length < 2) return 'Must be at least 2 characters';
                return '';
            case 'email':
                return validateEmail(value);
            case 'phone':
                return validatePhone(value);
            case 'nationalId':
                return validateNationalId(value);
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => {
                const currentMethods = prev.preferredContactMethod || [];
                let updatedMethods;
                if (checked) {
                    updatedMethods = [...currentMethods, value];
                } else {
                    updatedMethods = currentMethods.filter(method => method !== value);
                }
                
                // Clear error if at least one option is selected
                if (updatedMethods.length > 0) {
                    setErrors(prev => ({
                        ...prev,
                        preferredContactMethod: ''
                    }));
                }
                
                return {
                    ...prev,
                    preferredContactMethod: updatedMethods
                };
            });
        } else {
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
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setFormData(prev => ({ ...prev, nationalIdPhoto: '', nationalIdPhotoName: '' }));
            setErrors(prev => ({ ...prev, nationalIdPhoto: '' }));
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, nationalIdPhoto: 'Please upload a valid image (JPG, PNG, or HEIC)' }));
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setErrors(prev => ({ ...prev, nationalIdPhoto: 'File size must be less than 5MB' }));
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                nationalIdPhoto: reader.result,
                nationalIdPhotoName: file.name
            }));
            setErrors(prev => ({ ...prev, nationalIdPhoto: '' }));
        };
        reader.onerror = () => {
            setErrors(prev => ({ ...prev, nationalIdPhoto: 'Failed to read file' }));
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'name', 'nationalId', 'phone', 'email',
            'affiliation', 'affiliationFullName', 'position',
            'hasSIGHTMembership', 'attendanceConfirmation'
        ];

        console.log('Validating form with data:', formData);

        // Validate required fields
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                newErrors[field] = 'This field is required';
            } else {
                const error = validateField(field, formData[field]);
                if (error) newErrors[field] = error;
            }
        });

        // Validate photo upload
        if (!formData.nationalIdPhoto) {
            newErrors.nationalIdPhoto = 'Please upload a photo of your National ID';
        }

        // Validate preferred contact method
        if (!formData.preferredContactMethod || formData.preferredContactMethod.length === 0) {
            newErrors.preferredContactMethod = 'Please select at least one contact method';
        }

        // Validate membership number if SIGHT membership is Yes
        if (formData.hasSIGHTMembership === 'yes' && (!formData.membershipNumber || formData.membershipNumber.trim() === '')) {
            newErrors.membershipNumber = 'Membership number is required when you have SIGHT membership';
        }

        console.log('Validation errors:', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitToGoogleSheets = async (data) => {
        try {
            console.log('submitToGoogleSheets called with data:', data);
            
            // 🔗 GOOGLE SHEETS SETUP REQUIRED:
            // 1. Follow the instructions in GOOGLE_SHEETS_SETUP.md
            // 2. Create your Google Sheet and deploy the Apps Script
            // 3. Replace the URL below with your web app URL
            const GOOGLE_SHEETS_URL = process.env.REACT_APP_GOOGLE_SHEETS_FORMS_URL;
            console.log('Google Sheets URL:', GOOGLE_SHEETS_URL);
            
            if (!GOOGLE_SHEETS_URL) {
                throw new Error('Missing REACT_APP_GOOGLE_SHEETS_FORMS_URL. Add it to your .env file with your Apps Script web app URL.');
            }
            
            // Send as JSON to handle large base64 image strings properly
            const payload = {
                timestamp: new Date().toISOString(),
                name: data.name || '',
                nationalId: data.nationalId || '',
                phone: data.phone || '',
                email: data.email || '',
                preferredContactMethod: Array.isArray(data.preferredContactMethod) 
                    ? data.preferredContactMethod 
                    : (data.preferredContactMethod ? [data.preferredContactMethod] : []),
                affiliation: data.affiliation || '',
                affiliationFullName: data.affiliationFullName || '',
                position: data.position || '',
                hasSIGHTMembership: data.hasSIGHTMembership || '',
                membershipNumber: data.membershipNumber || '',
                attendanceConfirmation: data.attendanceConfirmation || '',
                comments: data.comments || ''
            };
            
            // Add photo if uploaded (as base64 string)
            if (data.nationalIdPhoto) {
                payload.nationalIdPhoto = data.nationalIdPhoto;
                payload.nationalIdPhotoName = data.nationalIdPhotoName || 'national_id.jpg';
            }

            console.log('Sending payload to Google Sheets (photo truncated for console):', {
                ...payload,
                nationalIdPhoto: payload.nationalIdPhoto ? '[BASE64 DATA - ' + payload.nationalIdPhoto.substring(0, 50) + '...]' : undefined
            });

            const response = await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('Response received:', response);

            // In no-cors mode, response is opaque but request still goes through
            console.log('Submission sent successfully (no-cors mode)');
            return { success: true, data: null };
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            return { success: false, error: error.message };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setHasAttemptedSubmit(true);

        console.log('Form submitted, validating...');
        
        if (validateForm()) {
            console.log('Validation passed, submitting to Google Sheets...');
            console.log('Form data:', formData);
            
            try {
                const result = await submitToGoogleSheets(formData);
                
                console.log('Submission result:', result);
                
                if (result.success) {
                    setSubmitStatus('success');
                    setHasAttemptedSubmit(false);
                    
                    // Reset form data
                    setFormData({
                        name: '',
                        nationalId: '',
                        phone: '',
                        email: '',
                        preferredContactMethod: [],
                        affiliation: '',
                        affiliationFullName: '',
                        position: '',
                        hasSIGHTMembership: '',
                        membershipNumber: '',
                        attendanceConfirmation: '',
                        comments: '',
                        nationalIdPhoto: '',
                        nationalIdPhotoName: ''
                    });
                    
                    // Reset file input
                    const fileInput = document.getElementById('nationalIdPhoto');
                    if (fileInput) fileInput.value = '';
                    
                    setErrors({});
                    
                    setTimeout(() => setSubmitStatus(null), 5000);
                } else {
                    console.error('Submission failed:', result.error);
                    setSubmitStatus('error');
                    setTimeout(() => setSubmitStatus(null), 5000);
                }
            } catch (error) {
                console.error('Submission error:', error);
                setSubmitStatus('error');
                setTimeout(() => setSubmitStatus(null), 5000);
            }
        } else {
            console.log('Validation failed, errors:', errors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="forms-container">
            <HeroWithSlope 
                pName="IEEE Egypt SIGHT Annual Meeting (ESAM)" 
            />
            
            <div className="forms-content-wrapper">
                <div className="hero-forms-spacer"></div>
                
                <div className="forms-info">
                    <h3>Event Information</h3>
                    <p>
                        ESAM is an opportunity for the current 5 SIGHT Student Branch Groups (AASTMT Cairo, Cairo University
                        , EUI, E JUST, Pharos) to meet and share their plans and get guidance from the
                        IEEE Egypt Section SIGHT Group through talks and workshops.
                    </p>
                    <p>
                        Also, the student branches and student branch chapters are invited to participate, so they
                        could find it a comfort ground to generate ideas for SIGHT projects.
                    </p>
                    <p>
                        Besides, this would be a great chance for the SBs which would like to establish SIGHT
                        Groups to meet with the current SIGHT chairs and the SIGHT volunteers and network.
                    </p>
                    
                    <div className="event-details">
                        <h4>Event's detail:</h4>
                        <p><strong>Date:</strong> Saturday 20th, December 2024</p>
                        <p><strong>Time:</strong> 10:00 AM till 04:00 PM</p>
                        <p><strong>Venue:</strong> Arab Academy for Science and Technology and Maritime Transport, Cairo Campus</p>
                    </div>

                    <div className="event-agenda">
                        <h4>Event's preliminary program:</h4>
                        <ul>
                            <li>10:00 – 11:00 Registration</li>
                            <li>11:00 - 11:30 Opening Ceremony</li>
                            <li>11:30 - 12:00 Coffee Break</li>
                            <li>12:00 - 12:30 SIGHT & How to Establish a Group & How to Get Funding</li>
                            <li>12:30 - 13:15 Tech Talk </li>
                            <li>13:15 - 13:45 Lunch Break</li>
                            <li>13:45 - 14:00 Talks by the SB SIGHT Groups </li>
                            <li>14:00 - 14:30 Talk by ISV about Project Funding Application and Requirements</li>
                            <li>14:30 - 15:30 Workshop on SIGHT Group Action Plan & Project Creation (60 mins)</li>
                            <li>15:30 - 16:00 Closing Ceremony & Group Photo + Special Photo with E-JUST (SIGHT Award winners)</li>
                        </ul>
                    </div>

                    <div className="contact-info">
                        <h4>For any inquiry, please contact us:</h4>
                        <p><strong>Eng. Mohamed Naeem</strong></p>
                        <p>IEEE AAST Cairo SIGHT Chair</p>
                        <p>Email: <a href="mailto:mohamed.hamdy@aast.edu">mohamed.hamdy@aast.edu</a></p>
                        <br />
                        <p><strong>Eng. Mohamed Sief</strong></p>
                        <p>IEEE Egypt Sight Vice Chair</p>
                        <p>Email: <a href="mailto:mohamed.sief@ieee.org">mohamed.sief@ieee.org</a></p>
                    </div>
                </div>

                <form className="forms-form" onSubmit={handleSubmit}>
                    <p className="required-note">* Indicates required question</p>

                    <div className="form-fields-container">
                    {/* Name */}
                    <div className="form-group">
                        <label htmlFor="name">
                            Your name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your answer"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    {/* National ID */}
                    <div className="form-group">
                        <label htmlFor="nationalId">
                            Your National ID number <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="nationalId"
                            name="nationalId"
                            value={formData.nationalId}
                            onChange={handleChange}
                            placeholder="Your answer"
                            className={errors.nationalId ? 'error' : ''}
                        />
                        {errors.nationalId && <span className="error-message">{errors.nationalId}</span>}
                    </div>

                    {/* National ID Photo */}
                    <div className="form-group">
                        <label htmlFor="nationalIdPhoto">
                            Upload a photo of your National ID <span className="required">*</span>
                        </label>
                        <p className="field-hint">Accepted formats: JPG, PNG, HEIC. Max size: 5MB</p>
                        <input
                            type="file"
                            id="nationalIdPhoto"
                            name="nationalIdPhoto"
                            accept="image/jpeg,image/jpg,image/png,image/heic"
                            onChange={handleFileChange}
                            className={errors.nationalIdPhoto ? 'error' : ''}
                        />
                        {formData.nationalIdPhotoName && (
                            <span className="file-selected">Selected: {formData.nationalIdPhotoName}</span>
                        )}
                        {errors.nationalIdPhoto && <span className="error-message">{errors.nationalIdPhoto}</span>}
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="phone">
                            Phone number <span className="required">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Your answer"
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">
                            E-mail <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Your answer"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    {/* Preferred Contact Method */}
                    <div className="form-group">
                        <label>
                            Preferred contact method <span className="required">*</span>
                        </label>
                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="preferredContactMethod"
                                    value="Phone"
                                    checked={formData.preferredContactMethod.includes('Phone')}
                                    onChange={handleChange}
                                />
                                <span>Phone</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="preferredContactMethod"
                                    value="Email"
                                    checked={formData.preferredContactMethod.includes('Email')}
                                    onChange={handleChange}
                                />
                                <span>Email</span>
                            </label>
                        </div>
                        {errors.preferredContactMethod && <span className="error-message">{errors.preferredContactMethod}</span>}
                    </div>

                    {/* Affiliation */}
                    <div className="form-group">
                        <label htmlFor="affiliation">
                            What is your affiliation? <span className="required">*</span>
                        </label>
                        <div className="radio-group">
                            {affiliationOptions.map(option => (
                                <label key={option} className="radio-label">
                                    <input
                                        type="radio"
                                        name="affiliation"
                                        value={option}
                                        checked={formData.affiliation === option}
                                        onChange={handleChange}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                        {errors.affiliation && <span className="error-message">{errors.affiliation}</span>}
                    </div>

                    {/* Affiliation Full Name */}
                    <div className="form-group">
                        <label htmlFor="affiliationFullName">
                            Your Affiliation full name <span className="required">*</span>
                        </label>
                        <p className="field-hint">(Example: SIGHT093 - Egypt Section SIGHT)</p>
                        <p className="field-hint">This code can be obtained from vTools: officers reporting, search for the name of your SBC or chapter and you'll find it.</p>
                        <input
                            type="text"
                            id="affiliationFullName"
                            name="affiliationFullName"
                            value={formData.affiliationFullName}
                            onChange={handleChange}
                            placeholder="Your answer"
                            className={errors.affiliationFullName ? 'error' : ''}
                        />
                        {errors.affiliationFullName && <span className="error-message">{errors.affiliationFullName}</span>}
                    </div>

                    {/* Volunteering Position */}
                    <div className="form-group">
                        <label htmlFor="position">
                            Your volunteering position <span className="required">*</span>
                        </label>
                        <div className="radio-group">
                            {positionOptions.map(option => (
                                <label key={option} className="radio-label">
                                    <input
                                        type="radio"
                                        name="position"
                                        value={option}
                                        checked={formData.position === option}
                                        onChange={handleChange}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                        {errors.position && <span className="error-message">{errors.position}</span>}
                    </div>

                    {/* SIGHT Membership */}
                    <div className="form-group">
                        <label>
                            Do you have a SIGHT membership? <span className="required">*</span>
                        </label>
                        <p className="field-hint">
                            If like to add to your basic IEEE membership:{' '}
                            <a 
                                href="https://www.ieee.org/membership/join/emember-digital-library.html?utm_source=dhtml_template&utm_medium=pdf&utm_campaign=le-membership" 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                Click here
                            </a>
                        </p>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="hasSIGHTMembership"
                                    value="yes"
                                    checked={formData.hasSIGHTMembership === 'yes'}
                                    onChange={handleChange}
                                />
                                <span>Yes</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="hasSIGHTMembership"
                                    value="no"
                                    checked={formData.hasSIGHTMembership === 'no'}
                                    onChange={handleChange}
                                />
                                <span>No</span>
                            </label>
                        </div>
                        {errors.hasSIGHTMembership && <span className="error-message">{errors.hasSIGHTMembership}</span>}
                    </div>

                    {/* Membership Number (conditional) */}
                    {formData.hasSIGHTMembership === 'yes' && (
                        <div className="form-group conditional-field">
                            <label htmlFor="membershipNumber">
                                If you have IEEE membership, please write your membership number
                                {formData.hasSIGHTMembership === 'yes' && <span className="required">*</span>}
                            </label>
                            <input
                                type="text"
                                id="membershipNumber"
                                name="membershipNumber"
                                value={formData.membershipNumber}
                                onChange={handleChange}
                                placeholder="Your answer"
                                className={errors.membershipNumber ? 'error' : ''}
                            />
                            {errors.membershipNumber && <span className="error-message">{errors.membershipNumber}</span>}
                        </div>
                    )}

                    {/* Attendance Confirmation */}
                    <div className="form-group">
                        <label>
                            Please confirm that you will be attending the event on 20th December 2025 <span className="required">*</span>
                        </label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="attendanceConfirmation"
                                    value="confirm"
                                    checked={formData.attendanceConfirmation === 'confirm'}
                                    onChange={handleChange}
                                />
                                <span>I confirm</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="attendanceConfirmation"
                                    value="not-sure"
                                    checked={formData.attendanceConfirmation === 'not-sure'}
                                    onChange={handleChange}
                                />
                                <span>Not sure</span>
                            </label>
                        </div>
                        {errors.attendanceConfirmation && <span className="error-message">{errors.attendanceConfirmation}</span>}
                    </div>

                    {/* Comments */}
                    <div className="form-group">
                        <label htmlFor="comments">
                            Questions and comments
                        </label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleChange}
                            placeholder="Your answer"
                            rows="4"
                        />
                    </div>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                        <button 
                            type="button" 
                            className="clear-btn"
                            onClick={() => {
                                setFormData({
                                    name: '',
                                    nationalId: '',
                                    phone: '',
                                    email: '',
                                    preferredContactMethod: [],
                                    affiliation: '',
                                    affiliationFullName: '',
                                    position: '',
                                    hasSIGHTMembership: '',
                                    membershipNumber: '',
                                    attendanceConfirmation: '',
                                    comments: '',
                                    nationalIdPhoto: '',
                                    nationalIdPhotoName: ''
                                });
                                setErrors({});
                                // Reset file input
                                const fileInput = document.getElementById('nationalIdPhoto');
                                if (fileInput) fileInput.value = '';
                            }}
                        >
                            Clear form
                        </button>
                    </div>

                    {/* Error Summary - only show when form submitted with errors */}
                    {hasAttemptedSubmit && Object.keys(errors).length > 0 && (
                        <div className="error-summary">
                            Please fix the errors above before submitting.
                        </div>
                    )}
                </form>

                {submitStatus === 'success' && (
                    <div className="submit-message success-message">
                        ✓ Your registration has been submitted successfully! We look forward to seeing you at the event.
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="submit-message error-message">
                        ✗ There was an error submitting your registration. Please try again or contact us directly.
                    </div>
                )}

                <div className="powered-by">
                    <p>This form was powered by IEEE AAST Student Branch</p>
                </div>
            </div>
        </div>
    );
};

export default Forms;
