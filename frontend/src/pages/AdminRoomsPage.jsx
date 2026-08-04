import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { 
  Plus, Edit, Trash2, DoorClosed, Star, X, Check, Search 
} from 'lucide-react';

const AdminRoomsPage = ({ showToast }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Delete State
  const [deleteRoomId, setDeleteRoomId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    room_number: '',
    type: 'Deluxe',
    price_per_night: 15000,
    capacity: 2,
    description: '',
    amenities: ['WiFi', 'Air Conditioning', 'TV'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
    is_available: true
  });

  const availableAmenitiesList = ["WiFi", "Air Conditioning", "Ocean View", "Mini Bar", "Balcony", "Jacuzzi", "Butler Service", "Workstation", "Breakfast Included"];

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rooms?limit=50');
      setRooms(res.data.rooms || []);
    } catch (err) {
      showToast("Could not load rooms.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      title: '',
      room_number: `${Math.floor(100 + Math.random() * 900)}`,
      type: 'Deluxe',
      price_per_night: 15000,
      capacity: 2,
      description: 'Luxury room with modern amenities and high-speed internet.',
      amenities: ['WiFi', 'Air Conditioning', 'TV'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
      is_available: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      title: room.title,
      room_number: room.room_number,
      type: room.type,
      price_per_night: room.price_per_night,
      capacity: room.capacity,
      description: room.description,
      amenities: room.amenities || [],
      images: room.images || [],
      is_available: room.is_available
    });
    setShowModal(true);
  };

  const handleToggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
      };
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, formData);
        showToast("Room updated successfully!", "success");
      } else {
        await api.post('/rooms', formData);
        showToast("New room added successfully!", "success");
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      const msg = err.response?.data?.detail || "Action failed.";
      showToast(msg, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteRoomId) return;
    try {
      await api.delete(`/rooms/${deleteRoomId}`);
      showToast("Room deleted successfully.", "info");
      setDeleteRoomId(null);
      fetchRooms();
    } catch (err) {
      showToast("Failed to delete room.", "error");
    }
  };

  const handleToggleAvailability = async (room) => {
    try {
      await api.put(`/rooms/${room.id}`, { is_available: !room.is_available });
      showToast(`Room availability changed to ${!room.is_available ? "Available" : "Booked"}`, "success");
      fetchRooms();
    } catch (err) {
      showToast("Failed to toggle status.", "error");
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.room_number.includes(searchTerm) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Room & Inventory Management</h1>
          <p className="text-xs text-slate-500">Create, edit, or delete hotel room listings.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 text-white font-bold text-xs shadow-md flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Add New Room
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by title, room #, type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Fetching inventory..." />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Room Title</th>
                  <th className="p-4">Number</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Night</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <img
                        src={room.images?.[0] || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <span>{room.title}</span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">#{room.room_number}</td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-lg font-bold">{room.type}</span></td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">₹{room.price_per_night?.toLocaleString('en-IN')}</td>
                    <td className="p-4">{room.capacity} Guests</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleAvailability(room)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                          room.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {room.is_available ? 'Available' : 'Booked'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteRoomId(room.id)}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg">{editingRoom ? "Edit Room Details" : "Create New Room Listing"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Room Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential">Presidential</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Price/Night (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Max Guests</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-500 mb-1.5">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {availableAmenitiesList.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-600 text-white font-bold shadow-md hover:bg-amber-700"
                >
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(deleteRoomId)}
        title="Delete Room Listing?"
        message="Are you sure you want to delete this room from database?"
        confirmText="Delete Room"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteRoomId(null)}
      />
    </div>
  );
};

export default AdminRoomsPage;
