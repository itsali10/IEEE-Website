import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../config/supabaseClient';

const ProtectedRoute = ({ children, requireAdmin = true }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // If Supabase is not configured, show a warning banner but allow access
  if (!isSupabaseConfigured) {
    return (
      <div>
        <div style={{
          background: 'linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%)',
          border: '2px solid #ffc107',
          borderRadius: '0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#856404',
          fontSize: '0.95rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <strong>Authentication Disabled:</strong> Supabase is not configured. 
            Set up environment variables to enable authentication. See SUPABASE_SETUP.md for details.
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#00629b'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(0, 98, 155, 0.2)',
            borderTopColor: '#00629b',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin)) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

