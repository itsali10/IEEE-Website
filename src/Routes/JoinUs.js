import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroWithSlope from "../components/HeroWithSlope/HeroWithSlope";
import '../css/joinUsStyles.css';

const committeeOptions = [
    'Events',
    'Human Resources',
    'Branding',
    'Robotics and Automation Society (RAS)',
    'Computer Society (CS)',
    'Industrial Elecrtonics Society (IES)',
    'Power & Energy Society (PES)',
];

const facultyOptions = [
    'Engineering',
    'Applied Arts',
    'Business',
    'Computer Science',
    'Other'
];

const departmentOptions = {
    'Engineering': [
        'Computer',
        'Mechatronics',
        'Electrical',
        'Architecture',
        'Civil',
        'Communication',
        'Mechanical',
        'Other'
    ],
    'Applied Arts': [
        'Industrial',
        'Interior Design',
        'Graphic Design',
        'Film Making',
        'Fashion',
        'Other'
    ],
    'Business': [
        'BIS',
        'Marketing',
        'Accounting',
        'Finance',
        'Logistics',
        'Other'
    ],
    'Computer Science': [
        'Computer Science',
        'Information Technology',
        'Software Engineering',
        'Data Science',
        'Cybersecurity',
        'Other'
    ],
    'Other': [
        'Other'
    ]
};

const interviewDateOptions = [
    'Tuesday 30/09/2025',
    'Wednesday 01/10/2025',
    'Thursday 02/10/2025',
];

const interviewTimeOptions = [
    '6:00 PM - 6:30 PM',
    '6:30 PM - 7:00 PM',
    '7:00 PM - 7:30 PM',
    '7:30 PM - 8:00 PM',
];

const JoinUs = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        faculty: '',
        department: '',
        studentId: '',
        graduationYear: '',
        recruiterName: '',
        gender: '',
        hasIEEEMembership: '',
        ieeeMembershipId: '',
        firstCommittee: '',
        secondCommittee: '',
        interviewDate: '',
        interviewTime: '',
        previousWork: '',
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

    const validateDateOfBirth = (value) => {
        if (!value) return 'Date of birth is required';
        
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Calculate exact age considering month and day
        const exactAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
            ? age - 1 
            : age;
        
        if (exactAge < 16) {
            return 'You must be at least 16 years old to join';
        }
        
        if (birthDate > today) {
            return 'Date of birth cannot be in the future';
        }
        
        return '';
    };

    // Check if branding is selected as first or second committee
    const isBrandingSelected = () => {
        return formData.firstCommittee === 'Branding' || formData.secondCommittee === 'Branding';
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
            case 'faculty':
            case 'department':
            case 'recruiterName':
                return validateName(value);
            case 'email':
                return validateEmail(value);
            case 'phone':
                return validatePhone(value);
            case 'dob':
                return validateDateOfBirth(value);
            default:
                return '';
        }
    };

    // Handle pre-selection of team from Technical Teams section
    useEffect(() => {
        if (location.state?.fromTechnicalTeams && location.state?.selectedTeam) {
            const selectedTeam = location.state.selectedTeam;
            
            // Map team titles to committee options
            const teamToCommitteeMap = {
                'Robotics & Automation Society': 'Robotics and Automation Society (RAS)',
                'Computer Society': 'Computer Society (CS)',
                'Industrial Electronics Society': 'Industrial Elecrtonics Society (IES)',
                'Power & Energy Society': 'Power & Energy Society (PES)',
                'Women in Engineering': 'Women in Engineering (WIE)'
            };
            
            const committeeOption = teamToCommitteeMap[selectedTeam];
            if (committeeOption) {
                setFormData(prev => ({
                    ...prev,
                    firstCommittee: committeeOption
                }));
            }
        }
        
        // Handle pre-selection from Teams page
        if (location.state?.selectedCommittee) {
            setFormData(prev => ({
                ...prev,
                firstCommittee: location.state.selectedCommittee
            }));
        }
        
        // Handle pre-selection from Questionnaire page
        const urlParams = new URLSearchParams(location.search);
        const firstTeam = urlParams.get('firstTeam');
        const secondTeam = urlParams.get('secondTeam');
        
        if (firstTeam && secondTeam) {
            // Map questionnaire team keys to committee options
            const questionnaireTeamMap = {
                'Events': 'Events',
                'Branding': 'Branding',
                'RAS': 'Robotics and Automation Society (RAS)',
                'CS': 'Computer Society (CS)',
                'IES': 'Industrial Elecrtonics Society (IES)',
                'PES': 'Power & Energy Society (PES)'
            };
            
            const firstCommittee = questionnaireTeamMap[firstTeam] || firstTeam;
            const secondCommittee = questionnaireTeamMap[secondTeam] || secondTeam;
            
            setFormData(prev => ({
                ...prev,
                firstCommittee: firstCommittee,
                secondCommittee: secondCommittee
            }));
        }
    }, [location.state, location.search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Update form data
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };
            
            // If first committee is changed and second committee is the same, clear second committee
            if (name === 'firstCommittee' && prev.secondCommittee === value) {
                newData.secondCommittee = '';
            }
            
            // If faculty changes, reset department
            if (name === 'faculty') {
                newData.department = '';
            }
            
            return newData;
        });

        // Real-time validation
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'name', 'email', 'phone', 'dob', 
            'faculty', 'department', 'studentId', 'graduationYear', 'recruiterName', 
            'gender', 'hasIEEEMembership', 'firstCommittee', 'secondCommittee',
            'interviewDate', 'interviewTime'
        ];

        // Add previousWork to required fields if branding is selected
        if (isBrandingSelected()) {
            requiredFields.push('previousWork');
        }

        // Validate required fields
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                newErrors[field] = 'This field is required';
            } else {
                const error = validateField(field, formData[field]);
                if (error) newErrors[field] = error;
            }
        });

        // Special validation for IEEE membership ID
        if (formData.hasIEEEMembership === 'yes' && (!formData.ieeeMembershipId || formData.ieeeMembershipId.trim() === '')) {
            newErrors.ieeeMembershipId = 'IEEE Membership ID is required when you have membership';
        }


        // Check if committees are different
        if (formData.firstCommittee === formData.secondCommittee && formData.firstCommittee) {
            newErrors.secondCommittee = 'Second committee must be different from first committee';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitToGoogleSheets = async (data) => {
        try {
            // 🔗 GOOGLE SHEETS SETUP REQUIRED:
            // 1. Follow the instructions in GOOGLE_SHEETS_SETUP.md
            // 2. Create your Google Sheet and deploy the Apps Script
            // 3. Replace the URL below with your web app URL
            const GOOGLE_SHEETS_URL = process.env.REACT_APP_GOOGLE_SHEETS_URL;
            if (!GOOGLE_SHEETS_URL) {
                throw new Error('Missing REACT_APP_GOOGLE_SHEETS_URL. Add it to your .env file with your Apps Script web app URL.');
            }
            
            const response = await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                // Use no-cors so the browser does not block the request due to CORS.
                // Response will be opaque; we treat that as success.
                mode: 'no-cors',
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    dob: data.dob,
                    gender: data.gender,
                    faculty: data.faculty,
                    department: data.department,
                    studentId: data.studentId,
                    graduationYear: data.graduationYear,
                    recruiterName: data.recruiterName,
                    hasIEEEMembership: data.hasIEEEMembership,
                    ieeeMembershipId: data.ieeeMembershipId || '',
                    firstCommittee: data.firstCommittee,
                    secondCommittee: data.secondCommittee,
                    interviewDate: data.interviewDate,
                    interviewTime: data.interviewTime,
                    previousWork: data.previousWork || ''
                })
            });

            // If the Apps Script does not set CORS/JSON correctly, browsers will mark this as opaque under no-cors.
            if (response.type === 'opaque') {
                return { success: true, data: null };
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const result = await response.json();
                return { success: true, data: result };
            }
            const text = await response.text();
            return { success: true, data: text };
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
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
                        dob: '',
                        faculty: '',
                        department: '',
                        studentId: '',
                        graduationYear: '',
                        recruiterName: '',
                        gender: '',
                        hasIEEEMembership: '',
                        ieeeMembershipId: '',
                        firstCommittee: '',
                        secondCommittee: '',
                        interviewDate: '',
                        interviewTime: '',
                        previousWork: '',
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
            <HeroWithSlope pName="Join Us" canvasId="joinus-gradient-canvas" />
            <div className="joinus-content-wrapper">
                <div className="hero-joinus-spacer"></div>
                <section className="joinus-hero">
                    <h2>Become a Volunteer of IEEE AAST Cairo SB</h2>
                    <p>Join a vibrant community of innovators, engineers, and leaders. Expand your network, develop new skills, and make lifelong friends!</p>
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
                        <label htmlFor="dob">Date of Birth</label>
                        <input 
                            type="date" 
                            id="dob" 
                            name="dob" 
                            value={formData.dob} 
                            onChange={handleChange} 
                            required 
                            max={new Date().toISOString().split('T')[0]}
                            className={errors.dob ? 'error' : ''}
                        />
                        {errors.dob && <span className="form-error">{errors.dob}</span>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group gender-group">
                        <label>Gender</label>
                        <div className="radio-buttons">
                            <button 
                                type="button" 
                                className={`radio-btn ${formData.gender === 'male' ? 'active' : ''}`}
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, gender: 'male' }));
                                    setErrors(prev => ({ ...prev, gender: '' }));
                                }}
                            >
                                Male
                            </button>
                            <button 
                                type="button" 
                                className={`radio-btn ${formData.gender === 'female' ? 'active' : ''}`}
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, gender: 'female' }));
                                    setErrors(prev => ({ ...prev, gender: '' }));
                                }}
                            >
                                Female
                            </button>
                        </div>
                        {errors.gender && <span className="form-error">{errors.gender}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="studentId">Student ID</label>
                        <input type="text" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} required />
                        {errors.studentId && <span className="form-error">{errors.studentId}</span>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="faculty">Faculty</label>
                        <select 
                            id="faculty" 
                            name="faculty" 
                            value={formData.faculty} 
                            onChange={handleChange} 
                            required
                            className={errors.faculty ? 'error' : ''}
                        >
                            <option value="">Select faculty</option>
                            {facultyOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {errors.faculty && <span className="form-error">{errors.faculty}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="department">Department</label>
                        <select 
                            id="department" 
                            name="department" 
                            value={formData.department} 
                            onChange={handleChange} 
                            required
                            disabled={!formData.faculty}
                            className={errors.department ? 'error' : ''}
                        >
                            <option value="">Select department</option>
                            {formData.faculty && departmentOptions[formData.faculty]?.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {errors.department && <span className="form-error">{errors.department}</span>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="graduationYear">Graduation Year</label>
                        <input 
                            type="number" 
                            id="graduationYear" 
                            name="graduationYear" 
                            min={new Date().getFullYear()+1}
                            max={new Date().getFullYear() + 10}
                            value={formData.graduationYear} 
                            onChange={handleChange} 
                            required 
                        />
                        {errors.graduationYear && <span className="form-error">{errors.graduationYear}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="recruiterName">Recruiter's Name</label>
                        <input 
                            type="text" 
                            id="recruiterName" 
                            name="recruiterName" 
                            value={formData.recruiterName} 
                            onChange={handleChange} 
                            required 
                            placeholder="Events Member who recruited you"
                        />
                        {errors.recruiterName && <span className="form-error">{errors.recruiterName}</span>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group ieee-membership-group">
                        <label>Do you have an active IEEE membership ID?</label>
                        <div className="radio-buttons">
                            <button 
                                type="button" 
                                className={`radio-btn ${formData.hasIEEEMembership === 'yes' ? 'active' : ''}`}
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, hasIEEEMembership: 'yes' }));
                                    setErrors(prev => ({ ...prev, hasIEEEMembership: '' }));
                                }}
                            >
                                Yes
                            </button>
                            <button 
                                type="button" 
                                className={`radio-btn ${formData.hasIEEEMembership === 'no' ? 'active' : ''}`}
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, hasIEEEMembership: 'no' }));
                                    setErrors(prev => ({ ...prev, hasIEEEMembership: '' }));
                                }}
                            >
                                No
                            </button>
                        </div>
                        {errors.hasIEEEMembership && <span className="form-error">{errors.hasIEEEMembership}</span>}
                    </div>
                    <div className="form-group">
                        {formData.hasIEEEMembership === 'yes' ? (
                            <>
                                <label htmlFor="ieeeMembershipId">IEEE Membership ID</label>
                                <input 
                                    type="text" 
                                    id="ieeeMembershipId" 
                                    name="ieeeMembershipId" 
                                    value={formData.ieeeMembershipId} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="Enter your IEEE Membership ID"
                                    className={errors.ieeeMembershipId ? 'error' : ''}
                                />
                                {errors.ieeeMembershipId && <span className="form-error">{errors.ieeeMembershipId}</span>}
                            </>
                        ) : (
                            <div style={{ visibility: 'hidden' }}>
                                <label>IEEE Membership ID</label>
                                <input type="text" disabled />
                            </div>
                        )}
                    </div>
                </div>
                <div className="form-row">
                    {/* Show questionnaire recommendation message if teams are pre-selected */}
                    {(() => {
                        const urlParams = new URLSearchParams(location.search);
                        const firstTeam = urlParams.get('firstTeam');
                        const secondTeam = urlParams.get('secondTeam');
                        
                        if (firstTeam && secondTeam) {
                            return (
                                <div className="questionnaire-recommendation-message">
                                    <div className="recommendation-icon">🎯</div>
                                    <div className="recommendation-text">
                                        <strong>Great news!</strong> Based on your questionnaire answers, we've pre-selected your top 2 committee matches below. You can still change them if you prefer different options.
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                    
                    <div className="form-group">
                        <label htmlFor="firstCommittee">1st Desired Committee</label>
                        <select id="firstCommittee" name="firstCommittee" value={formData.firstCommittee} onChange={handleChange} required>
                            <option value="">Select a committee</option>
                            {committeeOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        {errors.firstCommittee && <span className="form-error">{errors.firstCommittee}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="secondCommittee">2nd Desired Committee</label>
                        <select id="secondCommittee" name="secondCommittee" value={formData.secondCommittee} onChange={handleChange} required>
                            <option value="">Select a committee</option>
                            {committeeOptions
                                .filter(opt => opt !== formData.firstCommittee)
                                .map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                        </select>
                        {errors.secondCommittee && <span className="form-error">{errors.secondCommittee}</span>}
                    </div>
                    
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="interviewDate">Interview Date</label>
                        <select 
                            id="interviewDate" 
                            name="interviewDate" 
                            value={formData.interviewDate} 
                            onChange={handleChange} 
                            required
                            className={errors.interviewDate ? 'error' : ''}
                        >
                            <option value="">Select interview date</option>
                            {interviewDateOptions.map(date => (
                                <option key={date} value={date}>{date}</option>
                            ))}
                        </select>
                        {errors.interviewDate && <span className="form-error">{errors.interviewDate}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="interviewTime">Interview Time</label>
                        <select 
                            id="interviewTime" 
                            name="interviewTime" 
                            value={formData.interviewTime} 
                            onChange={handleChange} 
                            required
                            className={errors.interviewTime ? 'error' : ''}
                        >
                            <option value="">Select interview time</option>
                            {interviewTimeOptions.map(time => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                        {errors.interviewTime && <span className="form-error">{errors.interviewTime}</span>}
                    </div>
                </div>
                {isBrandingSelected() && (
                    <div className="form-row">
                        <div className="form-group previous-work-group">
                            <label>Do you have previous work experience in branding/design?</label>
                            <div className="radio-buttons">
                                <button 
                                    type="button" 
                                    className={`radio-btn ${formData.previousWork === 'yes' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, previousWork: 'yes' }));
                                        setErrors(prev => ({ ...prev, previousWork: '' }));
                                    }}
                                >
                                    Yes
                                </button>
                                <button 
                                    type="button" 
                                    className={`radio-btn ${formData.previousWork === 'no' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, previousWork: 'no' }));
                                        setErrors(prev => ({ ...prev, previousWork: '' }));
                                    }}
                                >
                                    No
                                </button>
                            </div>
                            {errors.previousWork && <span className="form-error">{errors.previousWork}</span>}
                        </div>
                    </div>
                )}
                <button type="submit" className="joinus-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <span className="loading-spinner"></span>
                            Submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                </button>
                
                {/* Status Messages */}
                {submitStatus === 'success' && (
                    <div className="submit-status success">
                        <div className="status-icon">✅</div>
                        <div className="status-content">
                            <h4>Application Submitted Successfully!</h4>
                            <p>Thank you for your interest in joining IEEE AAST Cairo SB. We'll review your application and get back to you soon.</p>
                        </div>
                    </div>
                )}
                
                {submitStatus === 'error' && (
                    <div className="submit-status error">
                        <div className="status-icon">❌</div>
                        <div className="status-content">
                            <h4>Submission Failed</h4>
                            <p>There was an issue submitting your application. Please try again or contact us at <a href="mailto:info@ieeeaastcairo.org">info@ieeeaastcairo.org</a></p>
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

export default JoinUs;
