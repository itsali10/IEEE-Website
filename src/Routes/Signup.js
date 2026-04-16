import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import HeroWithSlope from "../components/HeroWithSlope/HeroWithSlope";
import '../css/joinUsStyles.css';

const committeeOptions = [
    'Computer Society (CS)',
    'Power & Energy Society (PES)',
    'Robotics and Automation Society (RAS)',
    'Industrial Electronics Society (IES)',
    'Events',
    'Branding',
    'Human Resources (HR)',
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

// Helper function to convert committee display name to database format
const formatCommitteeForDatabase = (committee) => {
    if (!committee) return null;
    
    const committeeMap = {
        'Computer Society (CS)': 'COMPUTER_SOCIETY',
        'Power & Energy Society (PES)': 'POWER_ENERGY_SOCIETY',
        'Robotics and Automation Society (RAS)': 'ROBOTICS_AUTOMATION_SOCIETY',
        'Industrial Electronics Society (IES)': 'INDUSTRIAL_ELECTRONICS_SOCIETY',
        'Events': 'EVENTS',
        'Branding': 'BRANDING',
        'Human Resources (HR)': 'HUMAN_RESOURCES',
    };
    
    return committeeMap[committee] || committee.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
};

const Signup = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        student_id: '',
        dob: '',
        age: '',
        gender: '',
        faculty: '',
        department: '',
        graduationYear: '',
        committee: '',
        hasIEEEMembership: '',
        ieeeMembershipId: '',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [signupError, setSignupError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            console.log('[Signup] User already authenticated, redirecting to dashboard...');
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

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
        // Exactly 11 digits, digits only
        const phoneRegex = /^\d{11}$/;
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value.trim())) return 'Phone number must be exactly 11 digits';
        return '';
    };

    const validateStudentId = (value) => {
        // Exactly 9 digits
        const idRegex = /^\d{9}$/;
        if (!value.trim()) return 'This field is required';
        if (!idRegex.test(value.trim())) return 'Student ID must be exactly 9 digits';
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
    };

    const validateConfirmPassword = (password, confirmPassword) => {
        if (!confirmPassword) return 'Please confirm your password';
        if (password !== confirmPassword) return 'Passwords do not match';
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

    const validateField = (name, value) => {
        switch (name) {
            case 'full_name':
            case 'faculty':
            case 'department':
                return validateName(value);
            case 'email':
                return validateEmail(value);
            case 'phone':
                return validatePhone(value);
            case 'password':
                return validatePassword(value);
            case 'confirmPassword':
                return validateConfirmPassword(formData.password, value);
            case 'dob':
                return validateDateOfBirth(value);
            case 'student_id':
                return validateStudentId(value);
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Update form data
        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: value
            };
            
            // If faculty changes, reset department
            if (name === 'faculty') {
                newData.department = '';
            }

            // Auto-calculate age if date of birth changes
            if (name === 'dob' && value) {
                const birthDate = new Date(value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                newData.age = age.toString();
            }
            
            return newData;
        });

        // Real-time validation
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
        setSignupError('');
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'full_name', 'email', 'phone', 'password', 'confirmPassword',
            'student_id', 'dob', 'faculty', 'department', 
            'graduationYear', 'committee', 'gender', 'hasIEEEMembership'
        ];

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Verify email and committee against Google Sheets via a Web App endpoint
    const verifyAgainstGoogleSheets = async (email, committee) => {
        const endpoint = process.env.REACT_APP_SHEETS_VERIFY_URL;
        if (!endpoint) {
            throw new Error('Verification endpoint not configured. Set REACT_APP_SHEETS_VERIFY_URL.');
        }

        const url = `${endpoint}?email=${encodeURIComponent(email)}&committee=${encodeURIComponent(committee)}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Verification service unavailable. Please try again later.');
        }
        const data = await response.json();
        // Expecting { eligible: boolean, reason?: string }
        if (typeof data.eligible !== 'boolean') {
            throw new Error('Invalid verification response.');
        }
        return data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSignupError('');

        if (!validateForm()) {
            // Form has errors, scroll to first error
            const firstError = document.querySelector('.form-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setIsSubmitting(false);
            return;
        }

        if (!isSupabaseConfigured) {
            setSignupError('Supabase is not configured. Please contact the administrator.');
            setIsSubmitting(false);
            return;
        }

        try {
            console.log('[Signup] Creating auth user...');
            // Step 0: Verify eligibility against Google Sheets (email and committee)
            try {
                console.log('[Signup] Verifying eligibility in Google Sheets...');
                const result = await verifyAgainstGoogleSheets(formData.email.trim(), formData.committee.trim());
                if (!result.eligible) {
                    // Check if it's a committee mismatch error
                    if (result.reason && (result.reason.includes('committee') || result.reason.includes('Committee'))) {
                        setSignupError('Please sign up with the committee you are currently in. The selected committee does not match your record in the database.');
                    } else {
                        setSignupError('User not found in the database.');
                    }
                    setIsSubmitting(false);
                    return;
                }
                console.log('[Signup] Eligibility verified. Proceeding with signup...');
            } catch (verErr) {
                console.error('[Signup] Verification error:', verErr);
                setSignupError('User not found in the database.');
                setIsSubmitting(false);
                return;
            }
            
            // Step 1: Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                console.error('[Signup] Auth error:', authError);
                if (authError.message.includes('already registered') || authError.message.includes('already exists') || authError.message.includes('User already registered')) {
                    setSignupError('This user already exists.');
                } else {
                    setSignupError(authError.message || 'Failed to create account. Please try again.');
                }
                setIsSubmitting(false);
                return;
            }

            if (!authData.user) {
                setSignupError('Failed to create user account. Please try again.');
                setIsSubmitting(false);
                return;
            }

            console.log('[Signup] Auth user created with ID:', authData.user.id);

            // Step 2: Create student record using the auth user's ID
            // Convert all string fields to uppercase for database (except email)
            const studentData = {
                id: authData.user.id, // Use auth user ID as student ID
                student_id: formData.student_id.toUpperCase(),
                full_name: formData.full_name.toUpperCase(),
                date_of_birth: formData.dob || null,
                email: formData.email, // Keep email in original format
                age: formData.age ? parseInt(formData.age, 10) : null,
                phone_number: formData.phone || null, // Keep phone in original format
                gender: formData.gender ? formData.gender.toUpperCase() : null,
                faculty: formData.faculty ? formData.faculty.toUpperCase() : null,
                department: formData.department ? formData.department.toUpperCase() : null,
                graduation_year: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
                committee: formatCommitteeForDatabase(formData.committee),
                ieee_member: formData.hasIEEEMembership === 'yes' 
                    ? formData.ieeeMembershipId.toUpperCase() 
                    : (formData.hasIEEEMembership === 'no' ? 'NO' : null),
                role: 'MEMBER', // Default role in uppercase
            };

            console.log('[Signup] Creating student record...');
            const { error: studentError } = await supabase
                .from('student')
                .insert([studentData]);

            if (studentError) {
                console.error('[Signup] Student record error:', studentError);
                setSignupError(`Failed to create student profile: ${studentError.message}. Please contact support.`);
                setIsSubmitting(false);
                return;
            }

            console.log('[Signup] Student record created successfully');
            setSubmitStatus('success');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login', { 
                    state: { message: 'Account created successfully! Please sign in.' } 
                });
            }, 3000);

        } catch (error) {
            console.error('[Signup] Unexpected error:', error);
            setSignupError('An unexpected error occurred. Please try again.');
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="joinus-container">
            <HeroWithSlope pName="Sign Up" canvasId="signup-gradient-canvas" />
            <div className="joinus-content-wrapper">
                <div className="hero-joinus-spacer"></div>
                <section className="joinus-hero">
                    <h2>Create Your Account</h2>
                    <p>Join IEEE AAST Cairo Student Branch and become part of our community</p>
                </section>

                {!isSupabaseConfigured && (
                    <div style={{
                        background: 'linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%)',
                        border: '2px solid #ffc107',
                        borderRadius: '8px',
                        padding: '16px',
                        margin: '0 auto 24px',
                        maxWidth: '600px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        color: '#856404'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                        <div>
                            <strong>Supabase Not Configured</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                                Please set up your Supabase environment variables to enable registration.
                            </p>
                        </div>
                    </div>
                )}

                {signupError && (
                    <div style={{
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '8px',
                        padding: '16px',
                        margin: '0 auto 24px',
                        maxWidth: '600px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#c33'
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                        <span>{signupError}</span>
                    </div>
                )}

                <form className="joinus-form" onSubmit={handleSubmit}>
                    {/* Account Information */}
                    <div className="form-row">
                        <div className="form-group">
                        <label htmlFor="full_name">Full Name</label>
                            <input 
                                type="text" 
                                id="full_name" 
                                name="full_name" 
                                value={formData.full_name} 
                                onChange={handleChange} 
                                required 
                                autoComplete="name"
                                placeholder="John Doe"
                                className={errors.full_name ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                        </div>
                        <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required 
                                autoComplete="email"
                                placeholder="your.email@example.com"
                                className={errors.email ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>
                        {/* Username field removed */}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required 
                                autoComplete="new-password"
                                placeholder="At least 6 characters"
                                className={errors.password ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                name="confirmPassword" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                required 
                                autoComplete="new-password"
                                placeholder="Re-enter password"
                                className={errors.confirmPassword ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    {/* Personal Information */}
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
                                placeholder="01234567890"
                                className={errors.phone ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.phone && <span className="form-error">{errors.phone}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="student_id">Student ID</label>
                            <input 
                                type="text" 
                                id="student_id" 
                                name="student_id" 
                                value={formData.student_id} 
                                onChange={handleChange} 
                                required 
                                placeholder="211006425"
                                className={errors.student_id ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.student_id && <span className="form-error">{errors.student_id}</span>}
                        </div>
                    </div>

                    <div className="form-row">
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
                                disabled={isSubmitting}
                            />
                            {errors.dob && <span className="form-error">{errors.dob}</span>}
                        </div>
                        <div className="form-group gender-group">
                            <label>Gender</label>
                            <div className="radio-buttons">
                                <button 
                                    type="button" 
                                    className={`radio-btn ${formData.gender === 'Male' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, gender: 'Male' }));
                                        setErrors(prev => ({ ...prev, gender: '' }));
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Male
                                </button>
                                <button 
                                    type="button" 
                                    className={`radio-btn ${formData.gender === 'Female' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, gender: 'Female' }));
                                        setErrors(prev => ({ ...prev, gender: '' }));
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Female
                                </button>
                            </div>
                            {errors.gender && <span className="form-error">{errors.gender}</span>}
                        </div>
                    </div>

                    {/* Academic Information */}
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
                                disabled={isSubmitting}
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
                                disabled={!formData.faculty || isSubmitting}
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
                            <label htmlFor="graduationYear">Expected Graduation Year</label>
                            <input 
                                type="number" 
                                id="graduationYear" 
                                name="graduationYear" 
                                min={2026}
                                max={new Date().getFullYear() + 10}
                                value={formData.graduationYear} 
                                onChange={handleChange} 
                                required 
                                placeholder="2026"
                                className={errors.graduationYear ? 'error' : ''}
                                disabled={isSubmitting}
                            />
                            {errors.graduationYear && <span className="form-error">{errors.graduationYear}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="committee">Committee</label>
                            <select 
                                id="committee" 
                                name="committee" 
                                value={formData.committee} 
                                onChange={handleChange}
                                required
                                className={errors.committee ? 'error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">Select committee</option>
                                {committeeOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {errors.committee && <span className="form-error">{errors.committee}</span>}
                        </div>
                    </div>

                    {/* IEEE Membership */}
                    <div className="form-row">
                        <div className="form-group ieee-membership-group">
                            <label>Do you have an active IEEE membership?</label>
                            <div className="radio-buttons">
                                <button 
                                    type="button" 
                                    className={`radio-btn ${formData.hasIEEEMembership === 'yes' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, hasIEEEMembership: 'yes' }));
                                        setErrors(prev => ({ ...prev, hasIEEEMembership: '' }));
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Yes
                                </button>
                                <button 
                                    type="button" 
                                    className={`radio-btn ${formData.hasIEEEMembership === 'no' ? 'active' : ''}`}
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, hasIEEEMembership: 'no', ieeeMembershipId: '' }));
                                        setErrors(prev => ({ ...prev, hasIEEEMembership: '', ieeeMembershipId: '' }));
                                    }}
                                    disabled={isSubmitting}
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
                                        disabled={isSubmitting}
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

                    <button type="submit" className="joinus-submit" disabled={isSubmitting || !isSupabaseConfigured}>
                        {isSubmitting ? (
                            <>
                                <span className="loading-spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                    
                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                        <div className="submit-status success">
                            <div className="status-icon">✅</div>
                            <div className="status-content">
                                <h4>Account Created Successfully!</h4>
                                <p>Thank you for joining IEEE AAST Cairo SB. Redirecting you to login...</p>
                            </div>
                        </div>
                    )}
                    
                    {submitStatus === 'error' && (
                        <div className="submit-status error">
                            <div className="status-icon">❌</div>
                            <div className="status-content">
                                <h4>Signup Failed</h4>
                                <p>There was an issue creating your account. Please try again.</p>
                            </div>
                        </div>
                    )}
                </form>
                <section className="joinus-contact">
                    <p>Already have an account? <a href="/login" style={{ fontWeight: 600 }}>Sign in here</a></p>
                </section>
            </div>
        </div>
    );
};

export default Signup;
