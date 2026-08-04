import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar, CheckCircle2, Clock, XCircle, Search, Download, User 
} from 'lucide-react';

const AdminBookingsPage = ({ showToast }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/all?status=${statusFilter}&search=${searchTerm}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      showToast("Failed to load reservations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchTerm]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      showToast(`Booking status updated to ${newStatus}.`, "success");
      fetchBookings();
    } catch (err) {
      showToast("Failed to update status.", "error");
    }
  };

  const handleDownloadInvoice = async (bookingId, ref) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${ref}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Downloaded PDF invoice.", "success");
    } catch (err) {
      showToast("Invoice download failed.", "error");
    }
  };

  const statusBadges = {
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    checked_in: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    completed: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Guest Reservations Registry</h1>
          <p className="text-xs text-slate-500">Manage check-ins, status transitions, and print booking receipts.</p>
        </div>

        {/* Status Filter */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
          {["All", "confirmed", "checked_in", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-500"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by reference ID or requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
        />
      </div>

      {/* Reservations Table */}
      {loading ? (
        <LoadingSpinner text="Fetching reservations..." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Room Suite</th>
                  <th className="p-4">Check-In / Out</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-amber-600 dark:text-amber-400">
                      #{booking.booking_reference}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      <div>{booking.user_details?.name || "Guest"}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{booking.user_details?.email}</div>
                    </td>
                    <td className="p-4 font-medium">{booking.room_details?.title || "Suite"}</td>
                    <td className="p-4 font-medium">
                      <div>{booking.check_in}</div>
                      <div className="text-[10px] text-slate-400">{booking.check_out} ({booking.nights_count} nights)</div>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                      ₹{booking.total_price?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${statusBadges[booking.status] || "bg-slate-100"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleDownloadInvoice(booking.id, booking.booking_reference)}
                        className="p-2 text-slate-500 hover:text-amber-600 rounded-xl"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {booking.status === "confirmed" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "checked_in")}
                          className="px-2.5 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 rounded-xl font-bold hover:bg-sky-100"
                        >
                          Check In
                        </button>
                      )}

                      {booking.status === "checked_in" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "completed")}
                          className="px-2.5 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl font-bold hover:bg-purple-100"
                        >
                          Check Out
                        </button>
                      )}

                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                          className="px-2 py-1 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
