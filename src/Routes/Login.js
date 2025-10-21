import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../config/supabaseClient';
import HeroWithSlope from '../components/HeroWithSlope/HeroWithSlope';
import '../css/loginStyles.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, user, isAdmin, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    console.log('[Login] 🚪 Logout button clicked');
    try {
      await signOut();
      console.log('[Login] ✅ SignOut completed, forcing page reload...');
      // Force a complete page reload to ensure clean state
      window.location.href = '/';
    } catch (err) {
      console.error('[Login] ❌ Unexpected logout error:', err);
      // Force reload anyway to clear state
      window.location.href = '/';
    }
  };

  // Redirect if already logged in (any role)
  useEffect(() => {
    if (!loading && user) {
      console.log('[Login] ✅ User is authenticated, redirecting to dashboard...');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      console.log('[Login] 🔐 Attempting login...');
      const { error } = await signIn(formData.email, formData.password);

        if (error) {
          console.error('[Login] ❌ Login error:', error);
          
          // Handle different error types
          if (error.message.includes('Access denied')) {
            setLoginError('Access denied. Only Officers and Board members can access this system.');
          } else if (error.message.includes('Invalid login credentials')) {
            setLoginError('Invalid email or password. Please try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setLoginError('Please confirm your email address before logging in.');
          } else if (error.message.includes('Too many requests')) {
            setLoginError('Too many login attempts. Please try again later.');
          } else {
            setLoginError(error.message || 'An error occurred during login. Please try again.');
          }
        } else {
          // Success - let useEffect handle the redirect
          console.log('[Login] ✅ Login successful, waiting for auth state update...');
        }
    } catch (error) {
      console.error('[Login] ❌ Unexpected error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show already logged in message
  if (user && !loading) {
    return (
      <div className="login-container">
        <HeroWithSlope pName="Sign In" canvasId="login-gradient-canvas" />
        <div className="login-content-wrapper">
          <div className="hero-login-spacer"></div>
          
          <div className="login-section">
            <div className="login-card">
              <div className="login-header">
                <h2>Already Logged In</h2>
                <p>You are currently logged in as <strong>{user.email}</strong></p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
                border: '2px solid #4caf50',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
                  <strong style={{ color: '#2e7d32' }}>Signed in</strong>
                  {isAdmin ? (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                      You have Board/Officer access.
                    </p>
                  ) : (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                      You are signed in as a member.
                    </p>
                  )}
                </>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  className="login-submit-btn"
                  onClick={() => navigate('/dashboard')}
                  style={{ background: 'linear-gradient(135deg, #00629b 0%, #004a75 100%)' }}
                >
                  Go to Dashboard
                </button>
                <button 
                  className="login-submit-btn"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <HeroWithSlope pName="Login" canvasId="login-gradient-canvas" />
      <div className="login-content-wrapper">
        <div className="hero-login-spacer"></div>
        
        <div className="login-section">
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Please sign in to access the dashboard</p>
            </div>

            {!isSupabaseConfigured && (
              <div className="login-warning-banner">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Supabase Not Configured</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                    Please set up your Supabase environment variables to enable authentication.
                    See <code>SUPABASE_SETUP.md</code> for instructions.
                  </p>
                </div>
              </div>
            )}

            {loginError && (
              <div className="login-error-banner">
                <span className="error-icon">⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ali@example.com"
                  className={errors.email ? 'error' : ''}
                  autoComplete="email"
                  disabled={isSubmitting}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'error' : ''}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="login-footer">
              <p className="login-info">
                🔒 This is a secure area for members of the IEEE AAST Cairo SB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

