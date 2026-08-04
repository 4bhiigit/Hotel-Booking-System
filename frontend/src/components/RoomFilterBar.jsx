import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

const RoomFilterBar = ({ filters, onFilterChange, onReset }) => {
  const roomTypes = ["All", "Single", "Double", "Deluxe", "Suite", "Presidential"];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/90 space-y-6 mb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <SlidersHorizontal className="w-5 h-5 text-amber-500" />
          <span>Search & Filter Luxury Suites</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Keyword */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Keyword Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Suite, Jacuzzi, Ocean..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Room Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Room Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {roomTypes.map((t) => (
              <option key={t} value={t}>{t === "All" ? "All Suite Categories" : t}</option>
            ))}
          </select>
        </div>

        {/* Guest Capacity */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Minimum Guests
          </label>
          <select
            value={filters.capacity}
            onChange={(e) => onFilterChange('capacity', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Any Guests</option>
            <option value="1">1+ Guest</option>
            <option value="2">2+ Guests</option>
            <option value="4">4+ Guests</option>
            <option value="6">6+ Guests</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Sort Results By
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange('sort_by', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="newest">Newly Added</option>
          </select>
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
          <span>Max Price per Night</span>
          <span className="text-amber-600 font-extrabold text-sm">₹{Number(filters.max_price || 150000).toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="5000"
          max="150000"
          step="5000"
          value={filters.max_price || 150000}
          onChange={(e) => onFilterChange('max_price', e.target.value)}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>
    </div>
  );
};

export default RoomFilterBar;
