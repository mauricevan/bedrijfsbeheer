import React from 'react';
import { ALL_MODULES } from '../constants';
import { ModuleKey } from '../types';

interface AdminSettingsProps {
  activeModules: Record<ModuleKey, boolean>;
  setActiveModules: React.Dispatch<React.SetStateAction<Record<ModuleKey, boolean>>>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ activeModules, setActiveModules }) => {
  const toggleModule = (moduleId: ModuleKey) => {
    setActiveModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-neutral mb-2">Admin Instellingen</h1>
      <p className="text-gray-600 mb-8">Beheer welke modules actief zijn voor alle gebruikers.</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-neutral mb-6">Module Beheer</h2>
        
        <div className="space-y-4">
          {ALL_MODULES.map(module => {
            const Icon = module.icon;
            const isActive = activeModules[module.id];

            return (
              <div
                key={module.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral">{module.name}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleModule(module.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-primary text-white hover:bg-secondary'
                  }`}
                >
                  {isActive ? 'Uitschakelen' : 'Inschakelen'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-100 border-l-4 border-primary rounded">
          <p className="text-sm text-blue-900">
            <strong>Let op:</strong> Uitgeschakelde modules zijn niet zichtbaar in de navigatie en zijn niet toegankelijk voor gebruikers.
          </p>
        </div>
      </div>
    </div>
  );
};