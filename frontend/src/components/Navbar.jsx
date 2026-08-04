import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Hotel, Sun, Moon, Heart, Calendar, User, LayoutDashboard, LogOut, Menu, X 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                GRAND HOTEL
              </span>
              <span className="block text-[10px] font-medium tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                Resort & Spa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link
              to="/"
              className={`transition-colors hover:text-amber-500 ${
                isActive('/') ? 'text-amber-600 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/rooms"
              className={`transition-colors hover:text-amber-500 ${
                isActive('/rooms') ? 'text-amber-600 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              Suites & Rooms
            </Link>
            
            {user && (
              <>
                <Link
                  to="/wishlist"
                  className={`flex items-center gap-1.5 transition-colors hover:text-amber-500 ${
                    isActive('/wishlist') ? 'text-amber-600 font-semibold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  Wishlist
                </Link>
                <Link
                  to="/my-bookings"
                  className={`flex items-center gap-1.5 transition-colors hover:text-amber-500 ${
                    isActive('/my-bookings') ? 'text-amber-600 font-semibold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-500" />
                  My Reservations
                </Link>
              </>
            )}
          </div>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-9 h-9 rounded-full bg-amber-100 object-cover"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-amber-600 dark:text-amber-400 capitalize font-medium">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.email}</p>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-105"
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 space-y-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 dark:text-slate-200 font-medium"
          >
            Home
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 dark:text-slate-200 font-medium"
          >
            Suites & Rooms
          </Link>
          
          {user ? (
            <>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 dark:text-slate-200 font-medium"
              >
                Wishlist
              </Link>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 dark:text-slate-200 font-medium"
              >
                My Reservations
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-amber-600 font-medium"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-800 dark:text-slate-200 font-medium"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-rose-600 font-semibold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-amber-600 text-white font-semibold"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
