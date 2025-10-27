import React, { useState } from 'react';
import { Notification, User } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  currentUser: User;
  onLogout: () => void;
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isAdmin, 
  notifications, 
  setNotifications,
  currentUser,
  onLogout,
  onMobileMenuToggle
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-orange-500 bg-orange-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-base-300 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
      {/* Left side - Hamburger + Title */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral truncate">
            Welkom, {currentUser.name.split(' ')[0]}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Bedrijfsbeheer Dashboard</p>
        </div>
      </div>
      
      {/* Right side - Notifications + Admin Badge + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Meldingen"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral text-sm sm:text-base">Meldingen</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs sm:text-sm text-primary hover:text-secondary"
                    >
                      Alles gelezen
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Geen meldingen
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notif => (
                      <div
                        key={notif.id}
                        className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getNotificationColor(notif.type)} ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p className={`text-xs sm:text-sm ${!notif.read ? 'font-semibold' : ''} text-neutral`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.date).toLocaleString('nl-NL')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Admin Badge - Hide on small mobile */}
        {isAdmin && (
          <span className="hidden sm:inline-block px-2 sm:px-3 py-1 bg-primary text-white text-xs sm:text-sm rounded-full">
            Admin
          </span>
        )}
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1 sm:gap-2 hover:bg-gray-100 rounded-lg p-1 sm:p-2 transition-colors"
            aria-label="Gebruikersmenu"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
              {getInitials(currentUser.name)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-neutral">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <svg className="w-4 h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <p className="font-semibold text-neutral text-sm sm:text-base">{currentUser.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{currentUser.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentUser.role}</p>
                  {isAdmin && (
                    <span className="inline-block sm:hidden mt-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium text-sm sm:text-base">Uitloggen</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
