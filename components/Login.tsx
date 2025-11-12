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
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-display text-white mb-2">Bedrijfsbeheer</h1>
          <p className="text-body text-white opacity-90">Dashboard Systeem</p>
        </div>

        {/* Login Card */}
        <div className="card shadow-xl-custom">
          <div className="card-body">
            <h2 className="text-heading-2 text-neutral mb-6">Inloggen</h2>
          
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="naam@bedrijf.nl"
                  required
                />
              </div>

              <div>
                <label className="block text-body-small font-medium text-gray-700 mb-2">
                  Wachtwoord
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-body-small text-red-600 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn btn-primary btn-lg"
              >
                Inloggen
              </button>
            </form>

            {/* Quick Login Demo Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-body-small text-gray-600 mb-4 text-center">Demo accounts:</p>
              <div className="space-y-2">
                {employees.slice(0, 4).map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => quickLogin(emp)}
                    className="w-full btn btn-secondary text-left"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="text-body-small font-medium text-neutral">{emp.name}</p>
                        <p className="text-caption text-gray-500">{emp.role}</p>
                      </div>
                      {emp.role === 'Manager Productie' && (
                        <span className="badge badge-info">Admin</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-caption text-gray-500 mt-4 text-center">
                Wachtwoord voor alle accounts: "1234"
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white text-body-small mt-6 opacity-75">
          © 2025 Bedrijfsbeheer Dashboard
        </p>
      </div>
    </div>
  );
};