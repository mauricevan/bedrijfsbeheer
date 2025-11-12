import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModuleKey } from '../types';

interface NavItem {
  id: ModuleKey;
  icon: string;
  label: string;
}

const primaryNavItems: NavItem[] = [
  { id: ModuleKey.DASHBOARD, icon: '📊', label: 'Dashboard' },
  { id: ModuleKey.POS, icon: '💰', label: 'POS' },
  { id: ModuleKey.WORK_ORDERS, icon: '🔧', label: 'Werkorders' },
  { id: ModuleKey.INVENTORY, icon: '📦', label: 'Voorraad' },
  { id: ModuleKey.CRM, icon: '👥', label: 'CRM' },
];

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {primaryNavItems.map((item) => {
          const isActive = currentPath === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-primary-500'
              }`}
              aria-label={item.label}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
