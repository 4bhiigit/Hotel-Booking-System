import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Phone, Lock, Save, ShieldCheck } from 'lucide-react';

const ProfilePage = ({ showToast }) => {
  const { user, updateProfileState } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      updateProfileState(res.data);
      showToast("Profile details updated successfully!", "success");
    } catch (err) {
      showToast("Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      showToast("Password updated successfully!", "success");
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.detail || "Password change failed. Check your current password.";
      showToast(msg, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      
      {/* Header Profile Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex items-center gap-6">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-20 h-20 rounded-full border-4 border-amber-500 bg-amber-100 object-cover shadow-lg"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-0.5">{user.role} Member</p>
          <p className="text-xs text-slate-300 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Info Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-4">
            <User className="w-5 h-5 text-amber-500" />
            <span>Personal Information</span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? "Saving..." : "Save Profile Changes"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-2 font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-4">
            <Lock className="w-5 h-5 text-amber-500" />
            <span>Security & Password</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
