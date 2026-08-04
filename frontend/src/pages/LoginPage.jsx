import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Mail, Lock, LogIn, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';

const LoginPage = ({ showToast }) => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();

  const [authMode, setAuthMode] = useState('email'); // 'email' | 'phone'
  
  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone OTP Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user: userData, welcome_message } = await login(email, password);
      showToast(welcome_message || `Welcome back, ${userData.name}! Thanks for signing in to Grand Hotel.`, "success");
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: "1083948201-google-client-id.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse
        });
      } catch (err) {
        console.warn("Google GIS init warning:", err);
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      const { user: userData, welcome_message } = await loginWithGoogle({
        credential: response.credential
      });
      showToast(welcome_message || `Welcome ${userData.name}! Google authentication successful.`, "success");
      navigate(userData.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      showToast("Google Authentication failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Prompt fallback email authentication if one-tap is closed
            loginWithPromptFallback();
          }
        });
      } else {
        await loginWithPromptFallback();
      }
    } catch (err) {
      showToast("Google sign-in failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loginWithPromptFallback = async () => {
    const inputEmail = prompt("Enter your verified Google Email address for instant sign-in:");
    if (!inputEmail) return;
    const googleUser = {
      name: inputEmail.split('@')[0].toUpperCase(),
      email: inputEmail,
      google_id: `google-uid-${Date.now()}`
    };
    const { user: userData, welcome_message } = await loginWithGoogle(googleUser);
    showToast(welcome_message || `Signed in with Google as ${userData.name}!`, "success");
    navigate(userData.role === 'admin' ? '/admin' : '/');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await sendPhoneOtp(phone);
      setOtpSent(true);
      if (res.otp) {
        setOtp(res.otp);
      }
      showToast(res.message || `Verification OTP code generated: ${res.otp}`, "success");
    } catch (err) {
      showToast("Failed to send OTP. Please check mobile number.", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast("Please enter the 6-digit OTP code.", "error");
      return;
    }
    setLoading(true);
    try {
      const { user: userData, welcome_message } = await verifyPhoneOtp(phone, otp);
      showToast(welcome_message || "Thanks for signing in to Grand Hotel! Phone OTP verified successfully.", "success");
      navigate(userData.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid OTP code.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };


  const handleQuickFill = (type) => {
    setAuthMode('email');
    if (type === 'customer') {
      setEmail('user@example.com');
      setPassword('User@123');
    } else {
      setEmail('admin@grandhotel.com');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Hotel className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to Grand Hotel</h2>
          <p className="text-xs text-slate-500">Access your luxury bookings, wishlist & rewards</p>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setAuthMode('email')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'email'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('phone')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMode === 'phone'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-md'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Phone OTP Login
          </button>
        </div>

        {/* Quick Demo Credentials Assistant */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 space-y-1.5">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Quick Demo 1-Click Credentials
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="flex-1 py-1.5 px-3 rounded-xl bg-white dark:bg-slate-700 text-[11px] font-semibold border border-amber-300 dark:border-slate-600 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Demo Guest
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 text-amber-400 text-[11px] font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* MODE 1: Email Form */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Authenticating..." : "Sign In with Email"}
            </button>
          </form>
        )}

        {/* MODE 2: Phone OTP Form */}
        {authMode === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  {sendingOtp ? "Sending OTP..." : "Send Verification OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>OTP sent to <strong>{phone}</strong></span>
                  <button type="button" onClick={() => setOtpSent(false)} className="text-amber-500 font-bold underline cursor-pointer">Change</button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Enter 6-Digit OTP Code (Demo: 555888)
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    required
                    placeholder="555888"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold tracking-widest text-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {loading ? "Verifying..." : "Verify OTP & Sign In"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Google 1-Click Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign In with Google</span>
        </button>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-amber-600 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
