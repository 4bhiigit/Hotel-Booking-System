import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  IndianRupee, Calendar, DoorClosed, Users, TrendingUp, CheckCircle2, Clock, XCircle 
} from 'lucide-react';

const AdminDashboardPage = ({ showToast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        showToast("Failed to load dashboard analytics.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner text="Computing real-time analytics..." />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Analytics & Revenue Overview</h1>
        <p className="text-xs text-slate-500">Live operational stats across hotel inventory and customer bookings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">₹{data.total_revenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% from previous month
          </p>
        </div>

        {/* Total Bookings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reservations</span>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.total_bookings}</p>
          <p className="text-[11px] text-slate-500">{data.confirmed_bookings} Confirmed | {data.pending_bookings} Pending</p>
        </div>

        {/* Occupancy Rate */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-600">
              <DoorClosed className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.occupancy_rate}%</p>
          <p className="text-[11px] text-slate-500">{data.available_rooms} of {data.total_rooms} Rooms Available</p>
        </div>

        {/* Registered Users */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customers</span>
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.total_users}</p>
          <p className="text-[11px] text-slate-500">Registered Guest Profiles</p>
        </div>

      </div>

      {/* Charts / Visual Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Monthly Revenue Bar Progress Visualization */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Revenue Trends</h3>
          <div className="space-y-4">
            {data.monthly_revenue.map((item) => {
              const maxRev = Math.max(...data.monthly_revenue.map(m => m.revenue)) || 1;
              const percentage = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{item.month}</span>
                    <span>₹{item.revenue.toLocaleString('en-IN')} ({item.bookings} Bookings)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reservation Status Breakdown */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status Breakdown</h3>
          <div className="space-y-4">
            {data.status_breakdown.map((sb) => (
              <div key={sb.status} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{sb.status}</span>
                <span className="px-3 py-1 bg-amber-500 text-white font-bold text-xs rounded-xl">
                  {sb.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
