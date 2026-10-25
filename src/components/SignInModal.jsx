import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignInModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { signIn, signUp } = useAuth();

  // 'login' | 'signup'
  const [mode, setMode] = useState(initialMode);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  // Reset transient form state every time the modal opens, and whenever the
  // mode is switched, so stale errors/values don't linger.
  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setEmail('');
      setPassword('');
      setError('');
      setSucceeded(false);
      setLoading(false);
      setMode(initialMode === 'signup' ? 'signup' : 'login');
    }
  }, [isOpen, initialMode]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setSucceeded(false);
    setPassword('');
  };

  if (!isOpen) return null;

  const validate = () => {
    if (mode === 'signup' && !fullName.trim()) {
      return 'Please enter your full name.';
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp({ fullName: fullName.trim(), email: email.trim(), password });
      } else {
        await signIn({ email: email.trim(), password });
      }
      setSucceeded(true);
      setLoading(false);
      setTimeout(() => {
        setSucceeded(false);
        onClose();
      }, 1200);
    } catch (err) {
      setLoading(false);
      setError(mapAuthError(err, mode));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-gold bg-dark-750 p-8 shadow-[0_0_40px_rgba(229,162,60,0.25)] text-center animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-3xl font-bold tracking-wide text-gold mb-1">
          {mode === 'signup' ? 'Sign Up' : 'Login'}
        </h2>
        <p className="text-xs text-textMuted mb-6">
          {mode === 'signup'
            ? 'Create your StreamScout account to track what you watch'
            : 'Log in to access your watchlist and Continue Watching'}
        </p>
        <p className="-mt-4 mb-5 text-[10px] leading-relaxed text-textMuted">Demo accounts are saved only in this browser. This is not secure, real-world authentication.</p>

        {succeeded ? (
          <div className="rounded-xl bg-gold/10 border border-gold p-6 text-gold font-bold text-sm my-4 animate-fade-up">
            {mode === 'signup'
              ? '✓ Sign Up successful! You are now logged in.'
              : '✓ Login successful! Welcome back to StreamScout.'}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-dark-line bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-dark-line bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full rounded-lg border border-dark-line bg-dark-900 py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
              {mode === 'signup' && (
                <p className="mt-1.5 text-[11px] text-textMuted">
                  Must be at least 8 characters.
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-gold py-3 text-sm font-bold text-black transition hover:bg-gold-amber hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? mode === 'signup'
                  ? 'Signing up...'
                  : 'Logging in...'
                : mode === 'signup'
                ? 'Sign Up'
                : 'Login'}
            </button>
          </form>
        )}

        <p className="mt-6 text-xs text-textMuted">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-gold cursor-pointer font-semibold hover:underline"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-gold cursor-pointer font-semibold hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

// Turns local demo-account errors into friendlier, user-facing copy.
function mapAuthError(err, mode) {
  const message = err?.message || '';
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please check your details and try again.';
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 8 characters.';
  }
  if (lower.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (lower.includes('user_already_exists') || err?.code === 'user_already_exists') {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (err?.code === 'local_storage_unavailable') {
    return 'Browser storage is unavailable. Enable local storage and try again.';
  }
  if (err?.code === 'crypto_unavailable') {
    return 'This browser cannot run the local login securely enough. Try a current browser on localhost or HTTPS.';
  }
  if (err?.code === 'account_corrupted') {
    return 'This demo account could not be read. Please sign up again.';
  }

  return message || `Something went wrong while trying to ${mode === 'signup' ? 'sign up' : 'log in'}.`;
}

export default SignInModal;
