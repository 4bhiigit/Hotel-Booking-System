import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, DoorClosed, CalendarCheck, Home } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Rooms', path: '/admin/rooms', icon: DoorClosed },
    { label: 'Reservations', path: '/admin/bookings', icon: CalendarCheck },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-80px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Control Center</p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Main Site
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
