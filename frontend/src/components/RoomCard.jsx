import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Heart, Wifi, Tv, Coffee } from 'lucide-react';

const RoomCard = ({ room, onToggleWishlist, isWishlisted = false, onBookNow }) => {
  const defaultImage = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80";
  const mainImage = room.images && room.images.length > 0 ? room.images[0] : defaultImage;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/90 hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={mainImage}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Room Type Badge */}
        <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-amber-400 rounded-full border border-amber-500/30">
          {room.type}
        </span>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(room.id);
            }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:text-rose-500 transition-colors shadow-md"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        )}

        {/* Availability Badge */}
        {!room.is_available && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 bg-rose-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl">
              Currently Booked
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-500" />
              <span>{room.rating ? room.rating.toFixed(1) : "4.8"}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>Up to {room.capacity} Guests</span>
            </div>
          </div>

          <Link to={`/rooms/${room.id}`}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors line-clamp-1">
              {room.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {room.description}
          </p>

          {/* Amenities Chips */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {room.amenities && room.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
              >
                {amenity}
              </span>
            ))}
            {room.amenities && room.amenities.length > 3 && (
              <span className="px-2 py-1 text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer: Price & Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price per night</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              ₹{room.price_per_night?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/rooms/${room.id}`}
              className="px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Details
            </Link>

            {onBookNow && room.is_available && (
              <button
                onClick={() => onBookNow(room)}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-105"
              >
                Book
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
