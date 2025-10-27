import React from 'react';
import { NavLink } from 'react-router-dom';
import { ALL_MODULES, ADMIN_MODULE } from '../constants';
import { ModuleKey, Notification } from '../types';

interface SidebarProps {
  activeModules: Record<ModuleKey, boolean>;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  notifications: Notification[];
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModules, 
  isAdmin,
  notifications,
  isMobileOpen,
  onMobileClose
}) => {
  const visibleModules = ALL_MODULES.filter(module => activeModules[module.id]);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-neutral text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Bedrijfsbeheer</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Dashboard Systeem</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Sluit menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {unreadCount > 0 && (
            <div className="mt-3 px-3 py-2 bg-red-500 rounded-lg flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold">Nieuwe meldingen</span>
              <span className="px-2 py-1 bg-white text-red-500 text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 sm:py-4">
          {visibleModules.map(module => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.id}
                to={`/${module.id}`}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center px-4 sm:px-6 py-3 hover:bg-gray-700 transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-gray-300'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">{module.name}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink
              to={`/${ModuleKey.ADMIN_SETTINGS}`}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center px-4 sm:px-6 py-3 hover:bg-gray-700 transition-colors mt-4 border-t border-gray-700 ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300'
                }`
              }
            >
              <ADMIN_MODULE.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">{ADMIN_MODULE.name}</span>
            </NavLink>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-700 rounded-lg">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-400">Versie</p>
              <p className="text-sm font-semibold text-white">4.5.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
