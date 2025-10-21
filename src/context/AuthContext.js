import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (email) => {
    try {
      if (!email || !isSupabaseConfigured) {
        console.log('[Auth] fetchProfile - skipping (no email or Supabase not configured)');
        return null;
      }
      
      console.log('[Auth] fetchProfile - querying student table for:', email);
      console.log('[Auth] fetchProfile - email type:', typeof email, 'length:', email.length);
      console.log('[Auth] fetchProfile - email exact value:', JSON.stringify(email));
      
      // Add timeout protection (10 seconds)
      const timeoutId = setTimeout(() => {
        console.error('[Auth] fetchProfile - query taking longer than 10 seconds...');
      }, 10000);
      
      let data, error;
      try {
        const result = await supabase
          .from('student')
          .select('*')
          .eq('email', email)
          .limit(1)
          .maybeSingle();
        data = result.data;
        error = result.error;
        console.log('[Auth] fetchProfile - query returned data:', data);
      } catch (queryError) {
        error = queryError;
      }
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('[Auth] fetchProfile - error:', error);
        return null;
      }
      
      console.log('[Auth] fetchProfile - result:', data ? 'Found' : 'Not found');
      return data || null;
    } catch (err) {
      console.error('[Auth] fetchProfile - unexpected error:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing auth...');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('[Auth] Error getting session:', sessionError);
        }
        
        console.log('[Auth] Session:', currentSession ? 'Found' : 'None');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.email) {
          console.log('[Auth] Fetching profile for:', currentSession.user.email);
          const p = await fetchProfile(currentSession.user.email);
          
          if (!mounted) return;
          
          console.log('[Auth] Profile:', p);
          console.log('[Auth] Profile role:', p?.role);
          setProfile(p);
          const admin = Boolean(
            p && 
            p.role && 
            typeof p.role === 'string' && 
            (p.role.trim().toLowerCase() === 'officer' || p.role.trim().toLowerCase() === 'board')
          );
          console.log('[Auth] Has elevated access:', admin, '(role was:', p?.role, ')');
          setIsAdmin(admin);
        } else {
          console.log('[Auth] No user email, clearing profile');
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          console.log('[Auth] Initialization complete');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[Auth] Auth state changed:', event, currentSession ? 'Session exists' : 'No session');
        
        // Don't process INITIAL_SESSION or SIGNED_IN - we handle these in initializeAuth and signIn
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          console.log('[Auth] Skipping', event, 'event - already processed');
          return;
        }
        
        // Only process SIGNED_OUT and TOKEN_REFRESHED
        if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out');
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token refreshed, keeping existing state');
          setSession(currentSession);
          return;
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please add environment variables.') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      // Allow members to login, still compute isAdmin
      const p = await fetchProfile(email);
      console.log('[Auth] Login - fetched profile:', p);
      console.log('[Auth] Login - profile role:', p?.role);
      const admin = Boolean(
        p && 
        p.role && 
        typeof p.role === 'string' && 
        (p.role.trim().toLowerCase() === 'officer' || p.role.trim().toLowerCase() === 'board')
      );
      console.log('[Auth] Login - has elevated access:', admin, '(role was:', p?.role, ')');
      // Set state for any authenticated user
      setProfile(p);
      setIsAdmin(admin);
      setUser(data.user);
      setSession(data.session);
      return { data, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('[Auth] Signing out...');
      
      // Clear all auth state first
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);

      if (!isSupabaseConfigured) {
        console.log('[Auth] Supabase not configured, session cleared');
        return { error: null };
      }

      // Sign out from Supabase
      console.log('[Auth] Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      
      // Clear any lingering storage (force clear)
      try {
        console.log('[Auth] Clearing localStorage...');
        localStorage.removeItem('supabase.auth.token');
        // Clear all supabase keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('sb-')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('[Auth] Cleared keys:', keysToRemove);
      } catch (storageErr) {
        console.warn('[Auth] Could not clear localStorage:', storageErr);
      }

      if (error) {
        console.error('[Auth] Supabase signOut error:', error);
        return { error };
      }

      console.log('[Auth] Sign out successful');
      return { error: null };
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
      return { error: err };
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) return { error };
      return { data, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error };
      return { data, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error };
      return { data, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    profile,
    isAdmin,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

