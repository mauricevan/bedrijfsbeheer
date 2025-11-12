import React, { useState, useRef } from 'react';
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
  
  // Tip 4: Swipe gestures for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.touches[0].clientX;
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && isMobileOpen) {
      // Swipe left to close sidebar
      onMobileClose();
    } else if (isRightSwipe && !isMobileOpen) {
      // Swipe right to open sidebar (handled by Header hamburger menu)
    }
  };

  return (
    <>
      {/* Mobile Overlay with swipe gesture */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      )}
      
      {/* Sidebar with swipe gesture */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-neutral text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-2 font-bold">Bedrijfsbeheer</h1>
              <p className="text-body-small text-gray-400 mt-1">Dashboard Systeem</p>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onMobileClose}
              className="lg:hidden btn-ghost p-2"
              aria-label="Sluit menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {unreadCount > 0 && (
            <div className="mt-4 px-4 py-3 bg-error rounded-xl flex items-center justify-between shadow-lg">
              <span className="text-body-small font-semibold">Nieuwe meldingen</span>
              <span className="badge bg-white text-error">
                {unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleModules.map(module => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.id}
                to={`/${module.id}`}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center px-6 py-3 hover:bg-gray-700 transition-all ${
                    isActive ? 'bg-primary text-white border-l-4 border-accent' : 'text-gray-300'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-body font-medium">{module.name}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink
              to={`/${ModuleKey.ADMIN_SETTINGS}`}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 hover:bg-gray-700 transition-all mt-4 border-t border-gray-700 ${
                  isActive ? 'bg-primary text-white border-l-4 border-accent' : 'text-gray-300'
                }`
              }
            >
              <ADMIN_MODULE.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-body font-medium">{ADMIN_MODULE.name}</span>
            </NavLink>
          )}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-xl">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-caption text-gray-400">Versie</p>
              <p className="text-body-small font-semibold text-white">5.8.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
