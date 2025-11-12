import React from 'react';
import { InventoryItem, Sale, WorkOrder, Notification } from '../types';
import { EmailDropZone } from '../components/EmailDropZone';

interface DashboardProps {
  inventory: InventoryItem[];
  sales: Sale[];
  workOrders: WorkOrder[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  inventory, 
  sales, 
  workOrders,
  notifications,
  setNotifications
}) => {
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const pendingOrders = workOrders.filter(wo => wo.status === 'Pending').length;
  const inProgressOrders = workOrders.filter(wo => wo.status === 'In Progress').length;

  const unreadNotifications = notifications.filter(n => !n.read);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-display text-neutral mb-2">Dashboard</h1>
      <p className="text-body-small text-gray-600 mb-8">Overzicht van uw bedrijfsactiviteiten</p>

      {/* Email Drop Zone - NIEUWE SECTIE */}
      <div className="mb-8">
        <EmailDropZone />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caption font-medium text-text-secondary uppercase tracking-wider mb-2">
                  Totale Verkopen
                </p>
                <p className="text-heading-1 font-bold text-text-primary mb-1">
                  €{totalSales.toFixed(2)}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caption font-medium text-text-secondary uppercase tracking-wider mb-2">
                  Lage Voorraad
                </p>
                <p className="text-heading-1 font-bold text-text-primary mb-1">
                  {lowStockItems.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caption font-medium text-text-secondary uppercase tracking-wider mb-2">
                  Orders In Uitvoering
                </p>
                <p className="text-heading-1 font-bold text-text-primary mb-1">
                  {inProgressOrders}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-caption font-medium text-text-secondary uppercase tracking-wider mb-2">
                  Orders In Wacht
                </p>
                <p className="text-heading-1 font-bold text-text-primary mb-1">
                  {pendingOrders}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {unreadNotifications.length > 0 && (
        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-heading-2 text-neutral">Meldingen</h2>
              <span className="badge badge-error">
                {unreadNotifications.length} nieuw
              </span>
            </div>
            <div className="space-y-3">
              {unreadNotifications.slice(0, 5).map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border-l-4 transition-all ${
                    notif.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                    notif.type === 'error' ? 'bg-red-50 border-red-500' :
                    notif.type === 'success' ? 'bg-green-50 border-green-500' :
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notif.type)}
                      <div>
                        <p className="text-body font-medium text-neutral">{notif.message}</p>
                        <p className="text-caption text-gray-500 mt-1">
                          {new Date(notif.date).toLocaleString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="btn-ghost btn-sm px-2"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h2 className="text-heading-2 text-neutral mb-4">Lage Voorraad Waarschuwingen</h2>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="empty-state-icon">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-body text-gray-600">Alle voorraad niveaus zijn voldoende</p>
                </div>
              ) : (
                lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100 transition-all hover:shadow-md">
                    <div>
                      <p className="text-body font-medium text-neutral">{item.name}</p>
                      <p className="text-body-small text-gray-600">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-body font-semibold text-orange-600">{item.quantity} stuks</p>
                      <p className="text-caption text-gray-500">Min: {item.reorderLevel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="text-heading-2 text-neutral mb-4">Recente Werkorders</h2>
            <div className="space-y-3">
              {workOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-body font-medium text-neutral truncate">{order.title}</p>
                    <p className="text-body-small text-gray-600 truncate">{order.description}</p>
                  </div>
                  <span className={`badge ${
                    order.status === 'Completed' ? 'badge-success' :
                    order.status === 'In Progress' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};