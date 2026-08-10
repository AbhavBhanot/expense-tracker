import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { validateEmail, validatePassword } from '../utils/auth';

const AuthContext = createContext(null);

function mapSupabaseUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.full_name
      || supabaseUser.user_metadata?.name
      || supabaseUser.email?.split('@')[0]
      || 'User',
    avatar: supabaseUser.user_metadata?.avatar_url
      || supabaseUser.user_metadata?.picture
      || null,
    provider: supabaseUser.app_metadata?.provider || 'email',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, just stop loading
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? mapSupabaseUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signupWithEmail = useCallback(async ({ name, email, password }) => {
    if (!supabase) throw new Error('Authentication is not configured. Please set up Supabase environment variables.');

    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();

    if (!trimmedName) throw new Error('Please enter your full name.');
    if (!validateEmail(trimmedEmail)) throw new Error('Please enter a valid email address.');
    if (!validatePassword(password)) throw new Error('Password must be at least 6 characters long.');

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { full_name: trimmedName }
      }
    });

    if (error) throw new Error(error.message);
  }, []);

  const loginWithEmail = useCallback(async ({ email, password }) => {
    if (!supabase) throw new Error('Authentication is not configured. Please set up Supabase environment variables.');

    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) throw new Error('Please enter a valid email address.');
    if (!password) throw new Error('Please enter your password.');

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) throw new Error(error.message);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Authentication is not configured. Please set up Supabase environment variables.');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    // Clear local budget data before signing out to prevent data leakage between users
    localStorage.removeItem('budget-tracker-data');
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    signupWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout
  }), [user, loading, signupWithEmail, loginWithEmail, loginWithGoogle, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
