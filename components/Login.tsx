import React, { useState } from 'react';
import { Employee } from '../types';

interface LoginProps {
  employees: Employee[];
  onLogin: (employee: Employee) => void;
}

export const Login: React.FC<LoginProps> = ({ employees, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const employee = employees.find(emp => emp.email === email);
    
    if (!employee) {
      setError('Gebruiker niet gevonden');
      return;
    }

    if (employee.password !== password) {
      setError('Onjuist wachtwoord');
      return;
    }

    onLogin(employee);
  };

  // Quick login buttons for demo
  const quickLogin = (emp: Employee) => {
    setEmail(emp.email);
    setPassword(emp.password || '');
    setTimeout(() => onLogin(emp), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bedrijfsbeheer</h1>
          <p className="text-white opacity-90">Dashboard Systeem</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-neutral mb-6">Inloggen</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="naam@bedrijf.nl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              Inloggen
            </button>
          </form>

          {/* Quick Login Demo Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 text-center">Demo accounts:</p>
            <div className="space-y-2">
              {employees.slice(0, 4).map(emp => (
                <button
                  key={emp.id}
                  onClick={() => quickLogin(emp)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.role}</p>
                    </div>
                    {emp.role === 'Manager Productie' && (
                      <span className="px-2 py-1 bg-primary text-white text-xs rounded">Admin</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Wachtwoord voor alle accounts: "1234"
            </p>
          </div>
        </div>

        <p className="text-center text-white text-sm mt-6 opacity-75">
          © 2025 Bedrijfsbeheer Dashboard
        </p>
      </div>
    </div>
  );
};