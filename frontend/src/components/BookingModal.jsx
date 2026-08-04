import React, { useState } from 'react';
import { 
  X, Calendar, Users, ShieldCheck, CreditCard, Sparkles, 
  Lock, Smartphone, Building2, CheckCircle2, ArrowLeft 
} from 'lucide-react';
import api from '../services/api';

const BookingModal = ({ room, onClose, onSuccess, onError }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 4);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const [step, setStep] = useState(1); // 1: Reservation Details, 2: Payment Gateway
  const [checkIn, setCheckIn] = useState(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState(formatDate(nextDay));
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking, pay_at_hotel
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Calculate nights
  const dateIn = new Date(checkIn);
  const dateOut = new Date(checkOut);
  const diffTime = Math.max(0, dateOut - dateIn);
  const nightsCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = nightsCount * room.price_per_night;

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (dateIn >= dateOut) {
      onError("Check-out date must be after check-in date.");
      return;
    }
    setStep(2);
  };

  const handleFinalPaymentSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === 'upi' && upiApp === 'custom' && !upiId.includes('@')) {
      onError("Please enter a valid UPI ID (e.g. username@upi).");
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        onError("Please enter a valid 16-digit Card Number.");
        return;
      }
      if (!cardExpiry || !cardCvc) {
        onError("Please complete Card Expiry and CVV details.");
        return;
      }
    }

    setProcessingPayment(true);
    setSubmitting(true);

    // Simulate 2.2s Payment Processing Gateway Animation
    setTimeout(async () => {
      try {
        const payload = {
          room_id: room.id,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: parseInt(guestsCount),
          special_requests: `${specialRequests ? specialRequests + ' | ' : ''}Paid via ${paymentMethod.toUpperCase()}`,
        };

        const res = await api.post('/bookings', payload);
        setProcessingPayment(false);
        onSuccess(`Payment of ₹${totalPrice.toLocaleString('en-IN')} successful via ${paymentMethod.toUpperCase()}! Reservation confirmed.`, res.data);
        onClose();
      } catch (err) {
        setProcessingPayment(false);
        const msg = err.response?.data?.detail || "Payment transaction failed. Please try again.";
        onError(msg);
      } finally {
        setSubmitting(false);
      }
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {step === 2 ? (
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Back to dates"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                {step === 1 ? "Reserve Luxury Suite" : "Secure Payment Gateway"}
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  Step {step} of 2
                </span>
              </h3>
              <p className="text-xs text-amber-400 font-medium line-clamp-1">{room.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Dates & Reservation Form */}
        {step === 1 && (
          <form onSubmit={handleNextToPayment} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
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

            {/* Price Summary */}
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
                <span>GST & Luxury Tax (18%)</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>
              <div className="pt-2 border-t border-amber-200/60 dark:border-slate-700 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total Payable</span>
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">₹{totalPrice?.toLocaleString('en-IN')}</span>
              </div>
            </div>

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
                className="w-1/2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Pay</span>
                <CreditCard className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Payment Gateway Tabbed Interface */}
        {step === 2 && (
          <form onSubmit={handleFinalPaymentSubmit} className="p-6 space-y-5 relative">
            
            {/* Processing Payment Overlay */}
            {processingPayment && (
              <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md rounded-b-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin flex items-center justify-center">
                    <Lock className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Processing Secure Payment...</h4>
                  <p className="text-xs text-amber-300 mt-1">Connecting with 256-bit SSL Banking Gateway</p>
                </div>
                <p className="text-xs text-slate-400">Amount: <span className="text-white font-bold">₹{totalPrice.toLocaleString('en-IN')}</span></p>
              </div>
            )}

            {/* Total Amount Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Amount to Pay</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <Lock className="w-3.5 h-3.5" />
                <span>256-Bit Encrypted</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs">UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs">Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pay_at_hotel')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'pay_at_hotel'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs">At Hotel</span>
              </button>
            </div>

            {/* TAB 1: UPI Options */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 animate-fade-in p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Select Instant UPI App
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'gpay', name: 'Google Pay' },
                    { id: 'phonepe', name: 'PhonePe' },
                    { id: 'paytm', name: 'Paytm' },
                    { id: 'custom', name: 'Other UPI' }
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        upiApp === app.id
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>

                {upiApp === 'custom' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Enter VPA / UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="mobile@okaxis / username@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Scan QR code or click Pay to trigger instant prompt in {upiApp.toUpperCase()}.
                    </p>
                    <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=upi://pay?pa=grandhotel@icici&pn=GrandHotel&am=${totalPrice}&cu=INR`} 
                        alt="UPI QR Code" 
                        className="w-28 h-28 mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Credit / Debit Card */}
            {paymentMethod === 'card' && (
              <div className="space-y-3.5 animate-fade-in p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    maxLength="19"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      maxLength="5"
                      placeholder="08/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      maxLength="4"
                      placeholder="***"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Net Banking */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-3 animate-fade-in p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Select Bank for NetBanking
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra", "Punjab National Bank"].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedBank === bank
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-md'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Pay at Hotel */}
            {paymentMethod === 'pay_at_hotel' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pay at Hotel Front Desk</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Zero advance payment required today. Your suite will be reserved instantly and you can pay cash/card during check-in.
                </p>
              </div>
            )}

            {/* Submit Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {submitting ? "Processing..." : `Pay ₹${totalPrice.toLocaleString('en-IN')}`}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
