import React from 'react';
import { Hotel, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                <Hotel className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                GRAND HOTEL
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Experience pinnacle luxury, fine dining, and breathtaking beachfront suites. Crafted for unforgettable moments and peaceful getaways.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link to="/rooms" className="hover:text-amber-400 transition-colors">Suites & Rooms</Link></li>
              <li><Link to="/wishlist" className="hover:text-amber-400 transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/my-bookings" className="hover:text-amber-400 transition-colors">Reservation Lookup</Link></li>
            </ul>
          </div>

          {/* Room Types */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Accommodations</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/rooms?type=Presidential" className="hover:text-amber-400 transition-colors">Presidential Suites</Link></li>
              <li><Link to="/rooms?type=Suite" className="hover:text-amber-400 transition-colors">Executive Suites</Link></li>
              <li><Link to="/rooms?type=Deluxe" className="hover:text-amber-400 transition-colors">Deluxe Ocean Rooms</Link></li>
              <li><Link to="/rooms?type=Double" className="hover:text-amber-400 transition-colors">Classic Double Rooms</Link></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Concierge</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Oberoi Complex, Lake Pichola, Udaipur, Rajasthan 313001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>+91 1800 200 4726 (1800-200-GRAND)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>concierge@grandhotel.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Grand Hotel & Resort. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Industry-Level AWS Deployment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
