import React, { useState } from 'react';
import { Sale, InventoryItem, Quote, WorkOrder } from '../types';

interface ReportsProps {
  sales: Sale[];
  inventory: InventoryItem[];
  quotes: Quote[];
  workOrders: WorkOrder[];
}

export const Reports: React.FC<ReportsProps> = ({ sales, inventory, quotes, workOrders }) => {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'quotes' | 'workorders'>('sales');

  // Sales Analytics
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;
  const totalItems = sales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Inventory Analytics
  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * 50), 0);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);

  // Quotes Analytics
  const totalQuotesValue = quotes.reduce((sum, q) => sum + q.total, 0);
  const approvedQuotes = quotes.filter(q => q.status === 'approved');
  const approvedQuotesValue = approvedQuotes.reduce((sum, q) => sum + q.total, 0);
  const conversionRate = quotes.length > 0 ? (approvedQuotes.length / quotes.length) * 100 : 0;

  // WorkOrders Analytics
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'Completed');
  const inProgressWorkOrders = workOrders.filter(wo => wo.status === 'In Progress');
  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'Pending');
  const totalHoursSpent = workOrders.reduce((sum, wo) => sum + (wo.hoursSpent || 0), 0);
  const averageHoursPerOrder = completedWorkOrders.length > 0 
    ? completedWorkOrders.reduce((sum, wo) => sum + (wo.hoursSpent || 0), 0) / completedWorkOrders.length 
    : 0;

  // Top Products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.id) || { name: item.name, quantity: 0, revenue: 0 };
      productSales.set(item.id, {
        name: item.name,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + (item.price * item.quantity)
      });
    });
  });
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales by Date
  const salesByDate = sales.reduce((acc, sale) => {
    acc[sale.date] = (acc[sale.date] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-neutral mb-2">Rapportages</h1>
      <p className="text-gray-600 mb-8">Genereer rapporten en analyseer bedrijfsprestaties</p>

      {/* Report Type Selector */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setReportType('sales')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            reportType === 'sales'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Verkoop Rapport
        </button>
        <button
          onClick={() => setReportType('inventory')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            reportType === 'inventory'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Voorraad Rapport
        </button>
        <button
          onClick={() => setReportType('quotes')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            reportType === 'quotes'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Offertes Rapport
        </button>
        <button
          onClick={() => setReportType('workorders')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            reportType === 'workorders'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Werkorders Rapport
        </button>
      </div>

      {reportType === 'sales' && (
        <div className="space-y-6">
          {/* Sales KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Totale Omzet</p>
              <p className="text-3xl font-bold text-primary">€{totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{sales.length} verkopen</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Gemiddelde Verkoop</p>
              <p className="text-3xl font-bold text-primary">€{averageSale.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">Per transactie</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Totaal Verkochte Items</p>
              <p className="text-3xl font-bold text-primary">{totalItems}</p>
              <p className="text-xs text-gray-500 mt-2">Alle producten</p>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral mb-4">Top 5 Producten</h2>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} verkocht</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">€{product.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Omzet</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral mb-4">Verkopen per Datum</h2>
            <div className="space-y-2">
              {Object.entries(salesByDate)
                .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                .map(([date, total]) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-neutral">{date}</span>
                    <span className="text-lg font-bold text-primary">€{total.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Totale Voorraadwaarde</p>
              <p className="text-3xl font-bold text-primary">€{totalInventoryValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">Geschatte waarde</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Lage Voorraad</p>
              <p className="text-3xl font-bold text-orange-600">{lowStockItems.length}</p>
              <p className="text-xs text-gray-500 mt-2">Items onder herbestel niveau</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Niet op Voorraad</p>
              <p className="text-3xl font-bold text-red-600">{outOfStockItems.length}</p>
              <p className="text-xs text-gray-500 mt-2">Items zonder voorraad</p>
            </div>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">Lage Voorraad Waarschuwingen</h2>
              <div className="space-y-3">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <div>
                      <p className="font-semibold text-neutral">{item.name}</p>
                      <p className="text-sm text-gray-600">SKU: {item.sku} | Leverancier: {item.supplier}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{item.quantity}</p>
                      <p className="text-xs text-gray-500">Min: {item.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Inventory */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral mb-4">Volledige Voorraad Overzicht</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Voorraad</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Herbestel</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-neutral">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">{item.reorderLevel}</td>
                      <td className="px-4 py-3 text-sm">
                        {item.quantity === 0 ? (
                          <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                            Niet op voorraad
                          </span>
                        ) : item.quantity <= item.reorderLevel ? (
                          <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">
                            Laag
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                            Voldoende
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'quotes' && (
        <div className="space-y-6">
          {/* Quotes KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Totale Offertes Waarde</p>
              <p className="text-3xl font-bold text-primary">€{totalQuotesValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{quotes.length} offertes</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Geaccepteerde Waarde</p>
              <p className="text-3xl font-bold text-green-600">€{approvedQuotesValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{approvedQuotes.length} geaccepteerd</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Conversie Rate</p>
              <p className="text-3xl font-bold text-blue-600">{conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-2">Acceptatie percentage</p>
            </div>
          </div>

          {/* Quotes Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral mb-4">Offertes per Status</h2>
            <div className="space-y-3">
              {['draft', 'sent', 'approved', 'rejected', 'expired'].map(status => {
                const statusQuotes = quotes.filter(q => q.status === status);
                const statusValue = statusQuotes.reduce((sum, q) => sum + q.total, 0);
                return (
                  <div key={status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'approved' ? 'bg-green-100 text-green-800' :
                        status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        status === 'rejected' ? 'bg-red-100 text-red-800' :
                        status === 'expired' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status === 'draft' && 'Concept'}
                        {status === 'sent' && 'Verzonden'}
                        {status === 'approved' && 'Geaccepteerd'}
                        {status === 'rejected' && 'Afgewezen'}
                        {status === 'expired' && 'Verlopen'}
                      </span>
                      <span className="text-sm text-gray-600">{statusQuotes.length} offertes</span>
                    </div>
                    <span className="text-lg font-bold text-primary">€{statusValue.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {reportType === 'workorders' && (
        <div className="space-y-6">
          {/* WorkOrders KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Totaal Orders</p>
              <p className="text-3xl font-bold text-primary">{workOrders.length}</p>
              <p className="text-xs text-gray-500 mt-2">Alle werkorders</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Afgerond</p>
              <p className="text-3xl font-bold text-green-600">{completedWorkOrders.length}</p>
              <p className="text-xs text-gray-500 mt-2">Voltooide orders</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Totaal Uren</p>
              <p className="text-3xl font-bold text-blue-600">{totalHoursSpent.toFixed(1)}u</p>
              <p className="text-xs text-gray-500 mt-2">Gewerkte uren</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Gem. Uren/Order</p>
              <p className="text-3xl font-bold text-purple-600">{averageHoursPerOrder.toFixed(1)}u</p>
              <p className="text-xs text-gray-500 mt-2">Per afgeronde order</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral mb-4">Werkorders per Status</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600">In Wacht</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingWorkOrders.length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">In Uitvoering</p>
                <p className="text-2xl font-bold text-blue-700">{inProgressWorkOrders.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Afgerond</p>
                <p className="text-2xl font-bold text-green-700">{completedWorkOrders.length}</p>
              </div>
            </div>
          </div>

          {/* Recent Completed Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral mb-4">Recent Afgeronde Werkorders</h2>
            <div className="space-y-3">
              {completedWorkOrders.slice(0, 10).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-neutral">{order.title}</p>
                    <p className="text-sm text-gray-600">{order.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Afgerond: {order.completedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{order.hoursSpent || 0}u</p>
                    <p className="text-xs text-gray-500">Gewerkt</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};