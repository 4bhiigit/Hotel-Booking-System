import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Search, MapPin, Star, Phone, Globe, ExternalLink, 
  BedDouble, UtensilsCrossed, Cake, ShieldCheck, Compass, Loader2, Sparkles, AlertCircle, Radio, Coffee, Home
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Places', icon: Compass },
  { id: 'restaurant', label: 'Restaurants', icon: UtensilsCrossed },
  { id: 'cafe', label: 'Cafes & Coffee', icon: Coffee },
  { id: 'hotel', label: 'Hotels', icon: BedDouble },
  { id: 'lodge', label: 'Lodges & Guest Houses', icon: Home },
  { id: 'motel', label: 'Motels & Inns', icon: Navigation },
  { id: 'resort', label: 'Luxury Resorts', icon: Sparkles },
  { id: 'sweets', label: 'Sweets & Bakeries', icon: Cake },
];

// Helper to calculate Haversine distance in KM
const calculateKmDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371.0; // Radius of Earth in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const NearbyPlacesSection = ({ onSelectPlaceForBooking }) => {
  const [category, setCategory] = useState('all');
  const [searchCity, setSearchCity] = useState('');
  const [radiusKm, setRadiusKm] = useState(20); // Default to 20 km strict max range
  const [isLiveTracking, setIsLiveTracking] = useState(true); // Real-time GPS tracking toggle
  const [activeLocationLabel, setActiveLocationLabel] = useState('Detecting live GPS location...');
  
  const [userCoords, setUserCoords] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State for Menu Modal
  const [selectedPlaceForMenu, setSelectedPlaceForMenu] = useState(null);
  const [activeMenuTab, setActiveMenuTab] = useState('All');

  const lastFetchedCoordsRef = useRef(null);
  const watchIdRef = useRef(null);

  const fetchPlaces = async ({ lat, lon, city, category: cat, radius }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const targetRadius = Math.min(Math.max(radius || radiusKm, 1), 20);
      const params = { category: cat || category, radius_km: targetRadius };
      if (city && city.trim()) {
        params.city = city.trim();
      } else if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
      }

      const res = await api.get('/places/nearby', { params });
      if (res.data && res.data.places) {
        // Enforce strict <= 20 km filter on client side as double safety
        const validPlaces = res.data.places.filter(p => p.distance_km <= 20.0 && p.distance_km <= targetRadius);
        setPlaces(validPlaces);
        setActiveLocationLabel(res.data.query_location);
      }
    } catch (err) {
      console.error("Error fetching nearby places:", err);
      setErrorMsg("Failed to load nearby places. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  // Start continuous watchPosition tracking
  const startLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    if ('geolocation' in navigator) {
      setIsLiveTracking(true);
      setLoading(true);
      setErrorMsg('');

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setUserCoords({ lat, lon });
          setSearchCity('');

          const lastCoords = lastFetchedCoordsRef.current;
          // Re-fetch if first load OR moved > 150 meters (0.15 km)
          if (!lastCoords || calculateKmDistance(lastCoords.lat, lastCoords.lon, lat, lon) >= 0.15) {
            lastFetchedCoordsRef.current = { lat, lon };
            fetchPlaces({ lat, lon, category, radius: radiusKm });
          }
        },
        (err) => {
          console.warn("Real-time GPS Watch warning:", err?.message || err);
          // Fallback location (New Delhi)
          const fallbackLat = 28.6139;
          const fallbackLon = 77.2090;
          setUserCoords({ lat: fallbackLat, lon: fallbackLon });
          if (!lastFetchedCoordsRef.current) {
            lastFetchedCoordsRef.current = { lat: fallbackLat, lon: fallbackLon };
            fetchPlaces({ lat: fallbackLat, lon: fallbackLon, category, radius: radiusKm });
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
      watchIdRef.current = id;
    } else {
      const fallbackLat = 28.6139;
      const fallbackLon = 77.2090;
      setUserCoords({ lat: fallbackLat, lon: fallbackLon });
      fetchPlaces({ lat: fallbackLat, lon: fallbackLon, category, radius: radiusKm });
    }
  };

  // Stop watchPosition tracking
  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
  };

  // Lifecycle for real-time tracking
  useEffect(() => {
    startLiveTracking();
    return () => {
      stopLiveTracking();
    };
  }, []);

  // Handle Category Change
  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    fetchPlaces({ 
      lat: userCoords?.lat, 
      lon: userCoords?.lon, 
      city: searchCity, 
      category: newCat,
      radius: radiusKm
    });
  };

  // Handle Radius Change
  const handleRadiusChange = (newRadius) => {
    const clamped = Math.min(Math.max(Number(newRadius), 1), 20);
    setRadiusKm(clamped);
    fetchPlaces({
      lat: userCoords?.lat,
      lon: userCoords?.lon,
      city: searchCity,
      category,
      radius: clamped
    });
  };

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      stopLiveTracking();
      fetchPlaces({ city: searchCity, category, radius: radiusKm });
    }
  };

  // Filtered places strictly capped under 20km
  const filteredPlaces = places.filter(p => p.distance_km <= radiusKm && p.distance_km <= 20.0);

  return (
    <section className="py-16 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Real-Time Live GPS Tracking (20 KM Max Range)
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real-Time Places Around You
            </h2>
            <p className="text-slate-400 mt-2 text-base max-w-2xl">
              Live updates as you move! Automatically discovering all cafes, restaurants, lodges, hotels, motels, resorts & sweet shops within 20 km.
            </p>
          </div>

          {/* Location Controls & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={isLiveTracking ? stopLiveTracking : startLiveTracking}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                isLiveTracking
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLiveTracking ? (
                <>
                  <Radio className="w-4 h-4 text-slate-950 animate-ping" />
                  Live GPS ON (Tracking)
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Enable Live GPS
                </>
              )}
            </button>

            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search city (e.g. Delhi, Jaipur)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchCity && (
                <button 
                  type="submit"
                  className="absolute right-2 top-2 p-1 text-amber-400 hover:text-amber-300"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* 20 KM Range Selector Box */}
        <div className="mb-8 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white">Location Range Filter</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-black">
                Max Limit: 20 KM
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Quick Presets:</span>
              {[5, 10, 15, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => handleRadiusChange(val)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    radiusKm === val
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {val} KM
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span>Showing places within: <strong className="text-amber-400 text-sm">{radiusKm} KM</strong></span>
              <span className="text-slate-400">Range: 1 KM to 20 KM Max</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={radiusKm}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-slate-700"
            />
          </div>
        </div>

        {/* Current Active Location Display */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 text-sm shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium text-slate-200">Active Location:</span>
            <span className="text-amber-400 font-bold truncate">{activeLocationLabel}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {isLiveTracking && userCoords && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live ({userCoords.lat.toFixed(4)}, {userCoords.lon.toFixed(4)})
              </span>
            )}
            <span className="text-slate-400 font-semibold">
              {filteredPlaces.length} places found within {radiusKm} KM
            </span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
            <p className="text-slate-300 font-medium text-base">Fetching live real-world places...</p>
            <p className="text-slate-500 text-sm mt-1">Searching within {radiusKm} KM radius (Max 20 KM limit)</p>
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && (
          <div className="py-12 px-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 font-medium">{errorMsg}</p>
            <button
              onClick={startLiveTracking}
              className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-all"
            >
              Retry Discovery
            </button>
          </div>
        )}

        {/* Places Grid */}
        {!loading && !errorMsg && (
          filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => {
                const isFoodVenue = ['restaurant', 'cafe', 'sweets'].includes(place.category) || (place.menu && place.menu.length > 0);
                const priceLabel = place.price_label || (['restaurant', 'cafe'].includes(place.category) ? 'Avg. Cost' : place.category === 'sweets' ? 'Avg. Price' : 'Est. Price');
                const priceUnit = place.price_unit || (['restaurant', 'cafe'].includes(place.category) ? ' for two' : place.category === 'sweets' ? ' avg order' : ' / night');

                return (
                  <div 
                    key={place.id}
                    className="group rounded-2xl bg-slate-800/90 border border-slate-700/80 overflow-hidden shadow-xl hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
                  >
                    {/* Image & Badges */}
                    <div className="relative h-52 overflow-hidden bg-slate-950">
                      <img 
                        src={place.images[0]} 
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      {/* Category Label Badge */}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-amber-400 font-bold text-xs">
                        {place.category_label}
                      </span>

                      {/* Distance Badge */}
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-md">
                        <Navigation className="w-3 h-3 fill-slate-950" />
                        {place.distance_km} km away
                      </span>

                      {/* Rating */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-md text-xs border border-slate-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-white">{place.rating}</span>
                        <span className="text-slate-400">({place.reviews_count} reviews)</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {place.name}
                        </h3>
                        
                        <div className="flex items-start gap-1.5 mt-2 text-slate-400 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{place.address}</span>
                        </div>

                        {/* Amenities pills */}
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {place.amenities.slice(0, 3).map((amenity, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-slate-300 text-[11px]"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] text-slate-400 block">{priceLabel}</span>
                          <span className="text-base font-extrabold text-amber-400">
                            ₹{place.price_per_night.toLocaleString('en-IN')}
                            <span className="text-xs font-normal text-slate-400"> {priceUnit}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Call Button */}
                          {place.phone && (
                            <a
                              href={`tel:${place.phone}`}
                              title="Call Venue"
                              className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-amber-400 hover:text-white transition-all border border-slate-600"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}

                          {/* Directions Link */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Google Maps Directions"
                            className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-blue-400 hover:text-white transition-all border border-slate-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {/* Action Button: View Menu for Dining vs Book Now for Stays */}
                          {isFoodVenue ? (
                            <button
                              onClick={() => {
                                setSelectedPlaceForMenu(place);
                                setActiveMenuTab('All');
                              }}
                              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
                            >
                              <UtensilsCrossed className="w-3.5 h-3.5" />
                              View Menu
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectPlaceForBooking && onSelectPlaceForBooking(place)}
                              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-800/40 rounded-2xl border border-slate-800">
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold text-lg">No online places found within {radiusKm} KM in this category</p>
              <p className="text-slate-500 text-sm mt-1">Try increasing your distance range (up to 20 KM max), switching categories, or searching for a city (e.g. Delhi, Jaipur, Mumbai)</p>
            </div>
          )
        )}

      </div>

      {/* Interactive Venue Menu Modal */}
      {selectedPlaceForMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="relative p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
              <button
                onClick={() => setSelectedPlaceForMenu(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  {selectedPlaceForMenu.category_label}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedPlaceForMenu.rating} ({selectedPlaceForMenu.reviews_count} reviews)
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-white">
                {selectedPlaceForMenu.name} — Menu
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {selectedPlaceForMenu.address}
              </p>
            </div>

            {/* Menu Category Filter Tabs */}
            {selectedPlaceForMenu.menu && selectedPlaceForMenu.menu.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
                {['All', ...Array.from(new Set(selectedPlaceForMenu.menu.map(item => item.category)))].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveMenuTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeMenuTab === tab
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Menu Items List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedPlaceForMenu.menu && selectedPlaceForMenu.menu.length > 0 ? (
                selectedPlaceForMenu.menu
                  .filter(item => activeMenuTab === 'All' || item.category === activeMenuTab)
                  .map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-4 hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border text-[9px] font-bold ${
                            item.is_veg ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'
                          }`}>
                            {item.is_veg ? '🟢' : '🔴'}
                          </span>
                          <h4 className="font-bold text-white text-base">{item.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-amber-400">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Menu details currently updating from verified venue source.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Avg Cost: <strong className="text-amber-400">₹{selectedPlaceForMenu.price_per_night}</strong> {selectedPlaceForMenu.price_unit}
              </span>
              <button
                onClick={() => setSelectedPlaceForMenu(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700"
              >
                Close Menu
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default NearbyPlacesSection;
