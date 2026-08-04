import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { 
  Star, Users, ShieldCheck, Heart, Wifi, Coffee, Tv, Sparkles, ArrowLeft, CheckCircle2 
} from 'lucide-react';

const RoomDetailPage = ({ showToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data);
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0]);
        }
      } catch (err) {
        showToast("Room details unavailable.", "error");
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (user && room) {
      api.get('/wishlist').then(res => {
        setIsWishlisted((res.data.room_ids || []).includes(room.id));
      }).catch(() => {});
    }
  }, [user, room]);

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast("Please sign in to save wishlist items.", "info");
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/wishlist/toggle/${room.id}`);
      setIsWishlisted(res.data.added);
      showToast(res.data.message, res.data.added ? "success" : "info");
    } catch (err) {
      showToast("Failed to update wishlist.", "error");
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!room) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Back Button */}
      <Link
        to="/rooms"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Rooms Catalog
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full">
              {room.type} Suite
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-500" />
              <span>{room.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {room.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Room Reference No: #{room.room_number}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleWishlist}
            className={`p-3 rounded-2xl border transition-all ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* High Res Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 h-[420px] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-lg">
          <img
            src={activeImage || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"}
            alt={room.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-hidden">
          {room.images && room.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`h-24 md:h-32 w-full rounded-2xl overflow-hidden border-2 transition-all ${
                activeImage === img ? 'border-amber-500 scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Specs & Booking Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suite Overview</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {room.description}
            </p>

            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Capacity: {room.capacity} Guests
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Free Cancellation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Daily Housekeeping
                </span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Included Luxury Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities && room.amenities.map((am, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{am}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card Sidebar */}
        <div>
          <div className="sticky top-28 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Nightly Rate</span>
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white block">
                  ₹{room.price_per_night?.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full">
                Best Price Guarantee
              </span>
            </div>

            <div className="space-y-3">
              <button
                disabled={!room.is_available}
                onClick={() => {
                  if (!user) {
                    showToast("Please sign in to proceed with booking.", "info");
                    navigate('/login');
                  } else {
                    setShowBookingModal(true);
                  }
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-extrabold text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50"
              >
                {room.is_available ? "Reserve Now" : "Currently Booked"}
              </button>
            </div>

            <div className="text-center text-xs text-slate-400 space-y-1">
              <p>No immediate payment required for quote setup.</p>
              <p>Instant PDF invoice upon confirmation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          room={room}
          onClose={() => setShowBookingModal(false)}
          onSuccess={(msg) => {
            showToast(msg, "success");
            navigate('/my-bookings');
          }}
          onError={(err) => showToast(err, "error")}
        />
      )}
    </div>
  );
};

export default RoomDetailPage;
