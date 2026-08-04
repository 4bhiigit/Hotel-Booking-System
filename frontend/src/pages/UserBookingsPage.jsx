import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  Calendar, Download, QrCode, XCircle, CheckCircle2, Clock, Hotel, X 
} from 'lucide-react';

const UserBookingsPage = ({ showToast }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // QR Modal State
  const [qrModalData, setQrModalData] = useState(null);
  
  // Cancel Dialog State
  const [cancelBookingId, setCancelBookingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/my-bookings?status=${activeTab}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      showToast("Could not load reservations.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

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
      showToast("PDF Invoice downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to download PDF invoice.", "error");
    }
  };

  const handleFetchQR = async (bookingId) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/qr`);
      setQrModalData(res.data);
    } catch (err) {
      showToast("Could not load QR verification code.", "error");
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    try {
      await api.put(`/bookings/${cancelBookingId}/status`, { status: "cancelled" });
      showToast("Reservation cancelled successfully.", "info");
      setCancelBookingId(null);
      fetchBookings();
    } catch (err) {
      showToast("Could not cancel reservation.", "error");
    }
  };

  const statusBadges = {
    confirmed: { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", icon: CheckCircle2 },
    checked_in: { bg: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300", icon: Clock },
    completed: { bg: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", icon: CheckCircle2 },
    cancelled: { bg: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300", icon: XCircle },
    pending: { bg: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300", icon: Clock },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Reservations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your hotel bookings, download invoices, and access instant check-in QR passes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 self-start">
          {["All", "confirmed", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-amber-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Fetching your reservations..." />
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No Reservations Found</h3>
          <p className="text-sm text-slate-500">You don't have any bookings matching this tab.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const BadgeIcon = statusBadges[booking.status]?.icon || Clock;
            const room = booking.room_details;

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/90 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                {/* Room thumbnail & title */}
                <div className="flex gap-4 items-center">
                  <img
                    src={room?.images?.[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"}
                    alt={room?.title || "Room"}
                    className="w-24 h-24 rounded-2xl object-cover bg-slate-200 dark:bg-slate-800 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        REF: #{booking.booking_reference}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          statusBadges[booking.status]?.bg || "bg-slate-100"
                        }`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {booking.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {room?.title || "Luxury Suite"}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Check-In: <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.check_in}</span> | Check-Out: <span className="font-semibold text-slate-800 dark:text-slate-200">{booking.check_out}</span> ({booking.nights_count} nights)
                    </p>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 font-medium block">Total Amount Paid</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      ₹{booking.total_price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Invoice Download */}
                    <button
                      onClick={() => handleDownloadInvoice(booking.id, booking.booking_reference)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                      title="Download PDF Invoice"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-500" /> PDF Invoice
                    </button>

                    {/* QR Code Pass */}
                    <button
                      onClick={() => handleFetchQR(booking.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 transition-colors"
                      title="View Check-In QR Pass"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Check-in QR
                    </button>

                    {/* Cancel button if confirmed */}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => setCancelBookingId(booking.id)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-xs font-bold text-rose-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base">Check-In Pass</h3>
              <button onClick={() => setQrModalData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Booking Ref: #{qrModalData.booking_reference}</p>
            
            <div className="p-4 bg-white rounded-2xl inline-block border border-slate-200 shadow-inner">
              <img src={qrModalData.qr_code} alt="QR Pass" className="w-48 h-48 mx-auto" />
            </div>

            <p className="text-[11px] text-slate-400">Show this QR code at front desk upon arrival for instant check-in verification.</p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Cancel */}
      <ConfirmationDialog
        isOpen={Boolean(cancelBookingId)}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel Booking"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelBookingId(null)}
      />
    </div>
  );
};

export default UserBookingsPage;
