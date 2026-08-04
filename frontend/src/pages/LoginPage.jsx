import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Mail, Lock, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

const LoginPage = ({ showToast }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      showToast(`Welcome back, ${userData.name}!`, "success");
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

  const handleQuickFill = (type) => {
    if (type === 'customer') {
      setEmail('user@example.com');
      setPassword('User@123');
    } else {
      setEmail('admin@grandhotel.com');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Hotel className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500">Access your luxury bookings & wishlist</p>
        </div>

        {/* Quick Demo Credentials Assistant */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 space-y-2">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Quick Demo 1-Click Login
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-700 text-[11px] font-semibold border border-amber-300 dark:border-slate-600 hover:bg-amber-100 transition-colors"
            >
              Demo Guest
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 text-amber-400 text-[11px] font-semibold hover:bg-slate-800 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

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
