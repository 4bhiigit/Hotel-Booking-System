import React, { useState, useEffect } from 'react';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart, DoorClosed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WishlistPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setRooms(res.data.rooms || []);
    } catch (err) {
      showToast("Could not fetch wishlist.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveWishlist = async (roomId) => {
    try {
      await api.post(`/wishlist/toggle/${roomId}`);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      showToast("Removed from wishlist.", "info");
    } catch (err) {
      showToast("Failed to remove item.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          My Saved Wishlist
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Handpicked luxury suites you saved for future staycation planning.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching saved rooms..." />
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <DoorClosed className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">Your Wishlist is Empty</h3>
          <p className="text-sm text-slate-500">Browse rooms and tap the heart icon to save your favorites.</p>
          <button
            onClick={() => navigate('/rooms')}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold"
          >
            Explore Rooms Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isWishlisted={true}
              onToggleWishlist={handleRemoveWishlist}
              onBookNow={(r) => setSelectedRoom(r)}
            />
          ))}
        </div>
      )}

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
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

export default WishlistPage;
