import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RoomCard from '../components/RoomCard';
import RoomFilterBar from '../components/RoomFilterBar';
import BookingModal from '../components/BookingModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, DoorClosed } from 'lucide-react';

const RoomsPage = ({ showToast }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1, total: 0 });
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const initialFilters = {
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || 'All',
    capacity: searchParams.get('capacity') || '',
    max_price: searchParams.get('max_price') || '150000',
    sort_by: searchParams.get('sort_by') || 'price_asc',
    page: parseInt(searchParams.get('page') || '1')
  };

  const [filters, setFilters] = useState(initialFilters);

  // Sync URL searchParams to filters state on navigation changes
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || 'All',
      capacity: searchParams.get('capacity') || '',
      max_price: searchParams.get('max_price') || '150000',
      sort_by: searchParams.get('sort_by') || 'price_asc',
      page: parseInt(searchParams.get('page') || '1')
    });
  }, [searchParams]);

  // Fetch Wishlist IDs if logged in
  useEffect(() => {
    if (user) {
      api.get('/wishlist')
        .then(res => setWishlistedIds(res.data.room_ids || []))
        .catch(() => {});
    }
  }, [user]);

  // Fetch Rooms when filters change
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (filters.search) query.append('search', filters.search);
        if (filters.type && filters.type !== 'All') query.append('type', filters.type);
        if (filters.capacity) query.append('capacity', filters.capacity);
        if (filters.max_price) query.append('max_price', filters.max_price);
        if (filters.sort_by) query.append('sort_by', filters.sort_by);
        query.append('page', filters.page);
        query.append('limit', '6');

        const res = await api.get(`/rooms?${query.toString()}`);
        setRooms(res.data.rooms || []);
        setPagination({
          page: res.data.page,
          total_pages: res.data.total_pages,
          total: res.data.total
        });
      } catch (err) {
        showToast("Failed to load rooms.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);

    const newParams = new URLSearchParams();
    if (updated.search) newParams.set('search', updated.search);
    if (updated.type && updated.type !== 'All') newParams.set('type', updated.type);
    if (updated.capacity) newParams.set('capacity', updated.capacity);
    if (updated.max_price && updated.max_price !== '150000') newParams.set('max_price', updated.max_price);
    if (updated.sort_by && updated.sort_by !== 'price_asc') newParams.set('sort_by', updated.sort_by);
    if (updated.page > 1) newParams.set('page', updated.page.toString());
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'All',
      capacity: '',
      max_price: '150000',
      sort_by: 'price_asc',
      page: 1
    });
    setSearchParams({});
  };

  const handleToggleWishlist = async (roomId) => {
    if (!user) {
      showToast("Please sign in to save wishlist items.", "info");
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/wishlist/toggle/${roomId}`);
      if (res.data.added) {
        setWishlistedIds(prev => [...prev, roomId]);
        showToast("Added to wishlist!", "success");
      } else {
        setWishlistedIds(prev => prev.filter(id => id !== roomId));
        showToast("Removed from wishlist.", "info");
      }
    } catch (err) {
      showToast("Could not update wishlist.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Luxury Rooms & Suites
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore our collection of hand-crafted rooms equipped with top-tier amenities.
        </p>
      </div>

      {/* Filter Component */}
      <RoomFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Rooms Grid */}
      {loading ? (
        <LoadingSpinner text="Searching available rooms..." />
      ) : rooms.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <DoorClosed className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No Rooms Match Your Criteria</h3>
          <p className="text-sm text-slate-500">Try adjusting your price range or filter choices.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              isWishlisted={wishlistedIds.includes(room.id)}
              onToggleWishlist={handleToggleWishlist}
              onBookNow={(r) => {
                if (!user) {
                  showToast("Please sign in to make a reservation.", "info");
                  navigate('/login');
                } else {
                  setSelectedRoom(r);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button
            disabled={filters.page >= pagination.total_pages}
            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={(msg) => showToast(msg, "success")}
          onError={(err) => showToast(err, "error")}
        />
      )}
    </div>
  );
};

export default RoomsPage;
