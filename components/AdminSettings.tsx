import React, { useState, useMemo } from 'react';
import { ALL_MODULES } from '../constants';
import { ModuleKey, AnalyticsDashboard, OptimizationRecommendation } from '../types';
import { buildAnalyticsDashboard, clearAnalytics } from '../utils/analytics';
// @ts-ignore - JSON import support
import databaseDiagnosticsData from '../data/databaseDiagnostics.json';
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AdminSettingsProps {
  activeModules: Record<ModuleKey, boolean>;
  setActiveModules: React.Dispatch<React.SetStateAction<Record<ModuleKey, boolean>>>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ activeModules, setActiveModules }) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'analytics' | 'database'>('modules');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsDashboard['period']>('month');
  const [selectedDiagnosticCategory, setSelectedDiagnosticCategory] = useState<string>('all');

  const analytics = useMemo(() => buildAnalyticsDashboard(analyticsPeriod), [analyticsPeriod]);
  
  // Database diagnostics data
  const databaseDiagnostics = (databaseDiagnosticsData as any).default || databaseDiagnosticsData || (databaseDiagnosticsData as any);
  
  const diagnostics = useMemo(() => {
    const allIssues = (Array.isArray(databaseDiagnostics) ? databaseDiagnostics : []) as Array<{
      category: string;
      issue: string;
      severity: 'high' | 'medium' | 'low';
      message: string;
      diagnostic_steps: string[];
      suggested_fix: string[];
      test_action: string;
      latency?: number;
      occurrences?: number;
      vendor_specific_info?: any;
    }>;
    
    return selectedDiagnosticCategory === 'all'
      ? allIssues
      : allIssues.filter(issue => issue.category.toLowerCase() === selectedDiagnosticCategory.toLowerCase());
  }, [selectedDiagnosticCategory, databaseDiagnostics]);
  
  // Calculate diagnostics statistics
  const diagnosticsStats = useMemo(() => {
    const allIssues = (Array.isArray(databaseDiagnostics) ? databaseDiagnostics : []) as any[];
    return {
      total: allIssues.length,
      high: allIssues.filter((i: any) => i.severity === 'high').length,
      medium: allIssues.filter((i: any) => i.severity === 'medium').length,
      low: allIssues.filter((i: any) => i.severity === 'low').length,
      categories: Array.from(new Set(allIssues.map((i: any) => i.category))),
      avgLatency: allIssues
        .filter((i: any) => i.latency)
        .reduce((sum: number, i: any) => sum + (i.latency || 0), 0) / 
        (allIssues.filter((i: any) => i.latency).length || 1),
    };
  }, [databaseDiagnostics]);

  const toggleModule = (moduleId: ModuleKey) => {
    setActiveModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const getPriorityColor = (priority: OptimizationRecommendation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-blue-500';
    }
  };

  const getCategoryIcon = (category: OptimizationRecommendation['category']) => {
    switch (category) {
      case 'process': return '⚙️';
      case 'feature': return '✨';
      case 'usability': return '🎨';
      case 'automation': return '🤖';
      case 'quality': return '✅';
    }
  };

  const getEffortLabel = (effort: OptimizationRecommendation['effort']) => {
    switch (effort) {
      case 'low': return 'Laag';
      case 'medium': return 'Gemiddeld';
      case 'high': return 'Hoog';
    }
  };

  // Prepare chart data
  const moduleUsageData = analytics.moduleStats.map(stat => ({
    name: stat.module,
    sessies: stat.totalSessions,
    tijd: stat.totalTime,
    acties: stat.actionsCount,
    fouten: stat.errorCount,
  }));

  const processCycleTimeData = analytics.processMetrics.map(metric => ({
    name: metric.processName,
    gemiddelde: metric.averageCycleTime,
    stappen: metric.averageSteps,
  }));

  const efficiencyData = analytics.userStats
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .slice(0, 10)
    .map(user => ({
      name: user.userName.split(' ')[0], // First name only for privacy
      score: user.efficiencyScore,
      rol: user.role,
    }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral mb-2">Admin Instellingen</h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Beheer modules en analyseer systeem gebruik voor optimalisatie.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'modules'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📦 Module Beheer
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Systeem Analytics
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'database'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🗄️ Database Diagnostics
        </button>
      </div>

      {activeTab === 'modules' && (
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
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header with Period Selector */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral mb-2">
                  📊 Systeem Analytics Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  Lean Six Sigma analyse voor data-driven optimalisatie beslissingen
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Periode:</label>
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value as AnalyticsDashboard['period'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="day">Vandaag</option>
                  <option value="week">Laatste Week</option>
                  <option value="month">Laatste Maand</option>
                  <option value="quarter">Laatste Kwartaal</option>
                  <option value="year">Laatste Jaar</option>
                </select>
                <button
                  onClick={() => {
                    if (confirm('Weet u zeker dat u alle analytics data wilt wissen?')) {
                      clearAnalytics();
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Wis alle analytics data"
                >
                  🗑️ Reset
                </button>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Totale Events</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalEvents.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.trends.usageGrowth > 0 ? '↑' : '↓'} {Math.abs(analytics.trends.usageGrowth).toFixed(1)}% vs vorige periode
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 mb-1">Actieve Gebruikers</p>
                <p className="text-2xl font-bold text-green-600">{analytics.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Unieke gebruikers</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Totale Gebruikstijd</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.totalTime}h</p>
                <p className="text-xs text-gray-500 mt-1">In {analytics.period}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm text-gray-600 mb-1">Efficiency Verandering</p>
                <p className={`text-2xl font-bold ${analytics.trends.efficiencyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.trends.efficiencyChange >= 0 ? '+' : ''}{analytics.trends.efficiencyChange.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">vs vorige periode</p>
              </div>
            </div>
          </div>

          {/* Module Usage Statistics */}
          {analytics.moduleStats.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4">Module Gebruik Statistieken</h3>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moduleUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessies" fill="#0088FE" name="Sessies" />
                    <Bar dataKey="acties" fill="#00C49F" name="Acties" />
                    <Bar dataKey="fouten" fill="#FF8042" name="Fouten" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Module Stats Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-2">Module</th>
                      <th className="text-right py-2 px-2">Sessies</th>
                      <th className="text-right py-2 px-2">Tijd (min)</th>
                      <th className="text-right py-2 px-2">Acties</th>
                      <th className="text-right py-2 px-2">Fouten</th>
                      <th className="text-center py-2 px-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.moduleStats.map((stat) => (
                      <tr key={stat.module} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-2 font-medium">{stat.module}</td>
                        <td className="text-right py-2 px-2">{stat.totalSessions}</td>
                        <td className="text-right py-2 px-2">{stat.totalTime}</td>
                        <td className="text-right py-2 px-2">{stat.actionsCount}</td>
                        <td className="text-right py-2 px-2">
                          <span className={stat.errorCount > 0 ? 'text-red-600 font-semibold' : ''}>
                            {stat.errorCount}
                          </span>
                        </td>
                        <td className="text-center py-2 px-2">
                          {stat.usageTrend === 'increasing' && <span className="text-green-600">↑</span>}
                          {stat.usageTrend === 'decreasing' && <span className="text-red-600">↓</span>}
                          {stat.usageTrend === 'stable' && <span className="text-gray-400">→</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Process Metrics */}
          {analytics.processMetrics.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4">Proces Efficiëntie Metrics</h3>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={processCycleTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="gemiddelde" fill="#8884d8" name="Gemiddelde Cyclus Tijd (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.processMetrics.map((metric) => (
                  <div key={metric.processName} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-neutral mb-3">{metric.processName}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gemiddelde Cyclus Tijd:</span>
                        <span className="font-medium">{metric.averageCycleTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gemiddeld Aantal Stappen:</span>
                        <span className="font-medium">{metric.averageSteps.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Rate:</span>
                        <span className={`font-medium ${metric.completionRate > 80 ? 'text-green-600' : metric.completionRate > 50 ? 'text-orange-600' : 'text-red-600'}`}>
                          {metric.completionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Error Rate:</span>
                        <span className={`font-medium ${metric.errorRate < 5 ? 'text-green-600' : metric.errorRate < 15 ? 'text-orange-600' : 'text-red-600'}`}>
                          {metric.errorRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rework Rate:</span>
                        <span className={`font-medium ${metric.reworkRate < 5 ? 'text-green-600' : metric.reworkRate < 15 ? 'text-orange-600' : 'text-red-600'}`}>
                          {metric.reworkRate.toFixed(1)}%
                        </span>
                      </div>
                      {metric.bottleneckSteps.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Bottlenecks:</p>
                          <ul className="text-xs space-y-1">
                            {metric.bottleneckSteps.slice(0, 3).map((bottleneck, idx) => (
                              <li key={idx} className="text-gray-700">
                                • {bottleneck.step}: {Math.round(bottleneck.averageWaitTime)} min wachttijd
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Efficiency */}
          {analytics.userStats.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4">Gebruiker Efficiency Scores</h3>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={efficiencyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={12} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#00C49F" name="Efficiency Score (0-100)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Optimization Recommendations */}
          {analytics.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4">
                💡 Optimalisatie Aanbevelingen (Lean Six Sigma)
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Data-driven aanbevelingen voor procesverbetering gebaseerd op gebruikspatronen
              </p>
              
              <div className="space-y-4">
                {analytics.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="border-l-4 border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    style={{ borderLeftColor: rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f97316' : '#3b82f6' }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getCategoryIcon(rec.category)}</span>
                          <h4 className="font-semibold text-neutral">{rec.title}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${getPriorityColor(rec.priority)}`}>
                            {rec.priority.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                            ROI: {rec.roi}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">Impact: </span>
                            <span className="font-medium text-green-600">{rec.impact}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Inspanning: </span>
                            <span className="font-medium">{getEffortLabel(rec.effort)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Metric: </span>
                            <span className="font-medium">
                              {rec.metrics.current} {rec.metrics.unit} → {rec.metrics.target} {rec.metrics.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Aanbevolen Acties:</p>
                      <ul className="text-xs space-y-1">
                        {rec.actions.map((action, idx) => (
                          <li key={idx} className="text-gray-600 flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {analytics.totalEvents === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">📊 Geen analytics data beschikbaar</p>
              <p className="text-sm text-gray-400">
                Begin met gebruik van het systeem om analytics data te verzamelen voor optimalisatie analyses.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Database Diagnostics Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral mb-2">
                  🗄️ Database Diagnostics Dashboard
                </h2>
                <p className="text-sm text-gray-600">
                  Baseline diagnostics voor Supabase, NeonDB, PlanetScale en andere managed databases
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <p className="text-sm text-gray-600 mb-1">High Severity</p>
                <p className="text-2xl font-bold text-red-600">{diagnosticsStats.high}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm text-gray-600 mb-1">Medium Severity</p>
                <p className="text-2xl font-bold text-orange-600">{diagnosticsStats.medium}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Low Severity</p>
                <p className="text-2xl font-bold text-blue-600">{diagnosticsStats.low}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 mb-1">Total Issues</p>
                <p className="text-2xl font-bold text-purple-600">{diagnosticsStats.total}</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter op Categorie:
              </label>
              <select
                value={selectedDiagnosticCategory}
                onChange={(e) => setSelectedDiagnosticCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
              >
                <option value="all">Alle Categorieën</option>
                {diagnosticsStats.categories.map((cat) => (
                  <option key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Distribution Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral mb-4">Severity Distributie</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'High', value: diagnosticsStats.high, color: '#ef4444' },
                  { name: 'Medium', value: diagnosticsStats.medium, color: '#f97316' },
                  { name: 'Low', value: diagnosticsStats.low, color: '#3b82f6' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {[
                      { name: 'High', value: diagnosticsStats.high, color: '#ef4444' },
                      { name: 'Medium', value: diagnosticsStats.medium, color: '#f97316' },
                      { name: 'Low', value: diagnosticsStats.low, color: '#3b82f6' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4">
              Gedetecteerde Issues ({diagnostics.length})
            </h3>

            <div className="space-y-4">
              {diagnostics.map((issue, index) => {
                const severityColors = {
                  high: 'border-red-500 bg-red-50',
                  medium: 'border-orange-500 bg-orange-50',
                  low: 'border-blue-500 bg-blue-50',
                };

                const severityTextColors = {
                  high: 'text-red-700',
                  medium: 'text-orange-700',
                  low: 'text-blue-700',
                };

                return (
                  <div
                    key={index}
                    className={`border-l-4 rounded-lg p-4 ${severityColors[issue.severity]} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-neutral text-base sm:text-lg">
                            {issue.issue}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${severityTextColors[issue.severity]} bg-white border`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                            {issue.category}
                          </span>
                          {issue.latency && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                              ⏱️ {issue.latency}ms
                            </span>
                          )}
                          {issue.occurrences && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                              📊 {issue.occurrences}x
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-4">{issue.message}</p>
                      </div>
                    </div>

                    {/* Diagnostic Steps */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        🔍 Diagnostische Stappen:
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        {issue.diagnostic_steps.map((step, idx) => (
                          <li key={idx} className="text-gray-600 list-disc">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suggested Fixes */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        ✅ Voorgestelde Oplossingen:
                      </p>
                      <ul className="text-xs space-y-1 ml-4">
                        {issue.suggested_fix.map((fix, idx) => (
                          <li key={idx} className="text-gray-600 list-disc">
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Vendor Specific Info */}
                    {issue.vendor_specific_info && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-800 mb-2">
                          📌 Platform-specifieke Informatie:
                        </p>
                        <div className="text-xs text-yellow-700 space-y-1">
                          {Object.entries(issue.vendor_specific_info).map(([vendor, info]) => (
                            <div key={vendor}>
                              <span className="font-medium">{vendor}:</span> {String(info)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Action Button */}
                    <div className="flex justify-end pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          alert(`Test actie "${issue.test_action}" zou worden uitgevoerd.\n\nIn productie zou dit een backend API call zijn naar:\nPOST /api/diagnostics/${issue.test_action}`);
                        }}
                        className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-secondary transition-colors font-medium"
                      >
                        🧪 Test: {issue.test_action.replace(/_/g, ' ')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {diagnostics.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen issues gevonden voor de geselecteerde categorie.</p>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-neutral mb-4">
              Issues per Categorie
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {diagnosticsStats.categories.map((category) => {
                const categoryIssues = (Array.isArray(databaseDiagnostics) ? databaseDiagnostics : []).filter(
                  (i: any) => i.category === category
                );
                const highCount = categoryIssues.filter((i: any) => i.severity === 'high').length;
                
                return (
                  <div
                    key={category}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDiagnosticCategory(category.toLowerCase())}
                  >
                    <p className="text-sm font-semibold text-neutral mb-1">{category}</p>
                    <p className="text-2xl font-bold text-primary">{categoryIssues.length}</p>
                    {highCount > 0 && (
                      <p className="text-xs text-red-600 mt-1">⚠️ {highCount} high severity</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};