import React, { useState } from 'react';
import { X, Calendar, Users, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import api from '../services/api';

const BookingModal = ({ room, onClose, onSuccess, onError }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 4);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState(formatDate(nextDay));
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate nights
  const dateIn = new Date(checkIn);
  const dateOut = new Date(checkOut);
  const diffTime = Math.max(0, dateOut - dateIn);
  const nightsCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = nightsCount * room.price_per_night;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateIn >= dateOut) {
      onError("Check-out date must be after check-in date.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: parseInt(guestsCount),
        special_requests: specialRequests,
      };

      const res = await api.post('/bookings', payload);
      onSuccess("Reservation confirmed successfully! Your booking invoice is ready.", res.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || "Booking failed. Please try again.";
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Reserve Suite</h3>
              <p className="text-xs text-amber-400 font-medium">{room.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Check-In */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Check-In Date
              </label>
              <input
                type="date"
                required
                min={formatDate(new Date())}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Check-Out Date
              </label>
              <input
                type="date"
                required
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              Number of Guests
            </label>
            <select
              value={guestsCount}
              onChange={(e) => setGuestsCount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            >
              {[...Array(room.capacity)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Special Requests (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Airport pickup, high floor, anniversary decor..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              Payment Method (INR)
            </label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm / BHIM)</option>
              <option value="card">Credit / Debit Card (Visa, MasterCard, RuPay)</option>
              <option value="netbanking">Net Banking (HDFC, ICICI, SBI, Axis)</option>
              <option value="pay_at_hotel">Pay at Hotel Check-in</option>
            </select>
          </div>

          {/* Price Calculation Summary */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Rate per night</span>
              <span className="font-semibold">₹{room.price_per_night?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Duration</span>
              <span className="font-semibold">{nightsCount} {nightsCount === 1 ? "Night" : "Nights"}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Taxes & GST (18% Included)</span>
              <span className="font-semibold text-emerald-600">Included</span>
            </div>
            <div className="pt-2 border-t border-amber-200/60 dark:border-slate-700 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Total Payment</span>
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">₹{totalPrice?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Demo Payment Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Instant Confirmation. GST Invoice & Check-in QR Code generated instantly.</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {submitting ? "Processing..." : "Confirm & Pay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
