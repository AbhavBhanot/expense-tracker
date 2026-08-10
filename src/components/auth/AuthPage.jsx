import React, { useState } from 'react';
import { 
  Wallet, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBudget } from '../../contexts/BudgetContext';

const isSupabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL);

export default function AuthPage() {
  const { signupWithEmail, loginWithEmail, loginWithGoogle, loading } = useAuth();
  const { state, toggleTheme } = useBudget();
  const isDark = (state.settings?.theme || 'dark') === 'dark';

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await signupWithEmail({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setSuccess('Account created successfully! Check your email to confirm your account.');
      } else {
        await loginWithEmail({
          email: formData.email,
          password: formData.password
        });
        setSuccess('Logged in successfully!');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background visual graphics */}
      <div className="auth-bg-decorations" aria-hidden="true">
        <div className="auth-blob auth-blob-1"></div>
        <div className="auth-blob auth-blob-2"></div>
      </div>

      <div className="auth-card-wrapper animate-fadeIn">
        {/* Top Header Bar inside Card */}
        <div className="auth-card-header">
          <div className="auth-brand">
            <div className="auth-logo-icon">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="auth-brand-title">BudgetTrack</h1>
              <span className="auth-brand-subtitle">Smart Financial Management</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-icon auth-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Auth Body */}
        <div className="auth-card-body">
          <div className="auth-welcome-text">
            <h2>{mode === 'login' ? 'Welcome back' : 'Get started with BudgetTrack'}</h2>
            <p className="text-secondary">
              {mode === 'login'
                ? 'Enter your credentials to access your expense tracker'
                : 'Create your free account to track expenses and set budgets'}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="auth-alert auth-alert-error animate-fadeIn" role="alert">
              <AlertCircle size={18} className="auth-alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert auth-alert-success animate-fadeIn" role="status">
              <CheckCircle2 size={18} className="auth-alert-icon" />
              <span>{success}</span>
            </div>
          )}

          {/* Google OAuth Button — triggers real Supabase OAuth redirect */}
          <div className="google-auth-section">
            <button
              type="button"
              className="btn auth-google-btn"
              onClick={async () => {
                setError('');
                setGoogleLoading(true);
                try {
                  await loginWithGoogle();
                  // Page will redirect to Google — no need to reset loading state
                } catch (err) {
                  setError(err.message || 'Google sign-in failed. Please try again.');
                  setGoogleLoading(false);
                }
              }}
              disabled={googleLoading || loading || formLoading || !isSupabaseConfigured}
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg className="google-icon" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.41l3.99-3.14z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              )}
              <span>
                {googleLoading
                  ? 'Redirecting to Google…'
                  : mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
              </span>
            </button>
            {!isSupabaseConfigured && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 'var(--space-2)' }}>
                Google sign-in requires Supabase configuration
              </p>
            )}
          </div>

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={formLoading}
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={formLoading || googleLoading || loading}
            >
              {formLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle text */}
          <div className="auth-footer-toggle">
            {mode === 'login' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button type="button" className="auth-link" onClick={() => handleModeSwitch('signup')}>
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button type="button" className="auth-link" onClick={() => handleModeSwitch('login')}>
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
