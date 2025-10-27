import React from 'react';
import { NavLink } from 'react-router-dom';
import { ALL_MODULES, ADMIN_MODULE } from '../constants';
import { ModuleKey, Notification } from '../types';

interface SidebarProps {
  activeModules: Record<ModuleKey, boolean>;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  notifications: Notification[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModules, 
  isAdmin,
  notifications 
}) => {
  const visibleModules = ALL_MODULES.filter(module => activeModules[module.id]);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <aside className="w-64 bg-neutral text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Bedrijfsbeheer</h1>
        <p className="text-sm text-gray-400 mt-1">Dashboard Systeem</p>
        {unreadCount > 0 && (
          <div className="mt-3 px-3 py-2 bg-red-500 rounded-lg flex items-center justify-between">
            <span className="text-sm font-semibold">Nieuwe meldingen</span>
            <span className="px-2 py-1 bg-white text-red-500 text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {visibleModules.map(module => {
          const Icon = module.icon;
          return (
            <NavLink
              key={module.id}
              to={`/${module.id}`}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 hover:bg-gray-700 transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-gray-300'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{module.name}</span>
            </NavLink>
          );
        })}

        {isAdmin && (
          <NavLink
            to={`/${ModuleKey.ADMIN_SETTINGS}`}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 hover:bg-gray-700 transition-colors mt-4 border-t border-gray-700 ${
                isActive ? 'bg-primary text-white' : 'text-gray-300'
              }`
            }
          >
            <ADMIN_MODULE.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{ADMIN_MODULE.name}</span>
          </NavLink>
        )}
      </nav>

      <div className="p-6 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-700 rounded-lg">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-gray-400">Versie</p>
            <p className="text-sm font-semibold text-white">2.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};