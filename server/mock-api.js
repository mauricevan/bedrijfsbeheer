/**
 * Mock API Server for Dashboard Data
 * Run with: node server/mock-api.js
 * Default port: 3001
 * 
 * Note: This requires express and cors to be installed:
 * npm install express cors
 * 
 * This can be used for development/testing when you want to simulate API calls
 * In production, replace this with real database queries
 */

import express from 'express';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock data generator (matches the structure from the prompt)
function generateMockDashboardData() {
  const now = new Date();
  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const period = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  // Generate mock sales data (last 6 months)
  const salesByMonth = [];
  const previousYearSales = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
    
    // Current year (slightly increasing trend)
    const baseRevenue = 14000 + (5 - i) * 600 + Math.random() * 1000;
    salesByMonth.push({
      month: monthKey,
      revenue: Math.round(baseRevenue * 100) / 100
    });

    // Previous year (lower baseline)
    const prevYearRevenue = 12000 + (5 - i) * 550 + Math.random() * 800;
    const prevYearDate = new Date(now.getFullYear() - 1, date.getMonth(), 1);
    const prevMonthKey = `${String(prevYearDate.getMonth() + 1).padStart(2, '0')}/${String(prevYearDate.getFullYear()).slice(-2)}`;
    previousYearSales.push({
      month: prevMonthKey,
      revenue: Math.round(prevYearRevenue * 100) / 100
    });
  }

  // Mock payment behavior
  const paymentBehavior = salesByMonth.map(item => ({
    month: item.month,
    onTime: Math.round(item.revenue * 0.85),
    late: Math.round(item.revenue * 0.15)
  }));

  return {
    period,
    comparisonToPrevious: {
      revenueChange: 0.12,
      invoicesChange: -0.05,
      openAmountChange: -0.08,
      quoteConversionChange: 0.09
    },
    stats: {
      totalRevenue: 17660,
      totalInvoiced: 32975,
      openAmount: 15290,
      averagePaymentTermDays: 7,
      openQuotes: 2
    },
    salesByMonth,
    previousYearSales,
    openByCustomer: [
      { name: 'Industrial Partners BV', amount: 8200, daysOpen: 12 },
      { name: 'Metaal Constructies NV', amount: 6800, daysOpen: 21 },
      { name: 'Techbouw BV', amount: 4200, daysOpen: 45 }
    ],
    topCustomers: [
      { name: 'Techbouw BV', revenue: 14000, profit: 4800, trend: 0.1 },
      { name: 'Industrial Partners BV', revenue: 9600, profit: 3100, trend: -0.03 },
      { name: 'Metaal Constructies NV', revenue: 8800, profit: 2900, trend: 0.07 },
      { name: 'AgroTech BV', revenue: 6400, profit: 2400, trend: 0.04 },
      { name: 'Energix Solutions', revenue: 5800, profit: 2000, trend: -0.02 }
    ],
    quotesByStatus: [
      { status: 'Goedgekeurd', count: 4, totalValue: 7800 },
      { status: 'Afgewezen', count: 2, totalValue: 2400 },
      { status: 'In afwachting', count: 3, totalValue: 4200 },
      { status: 'Verlopen', count: 1, totalValue: 1000 }
    ],
    paymentBehavior,
    insights: [
      '💡 Klant Techbouw BV heeft 3 openstaande facturen van €4.200 die gemiddeld 45 dagen oud zijn.',
      '⚠️ Metaal Constructies NV heeft deze maand 21 dagen overschrijding op betalingen.',
      '✅ Omzet steeg met 12% t.o.v. vorige maand — beste maand dit kwartaal.',
      '📈 Conversieratio offertes: 66% (+9% t.o.v. vorige maand).'
    ]
  };
}

// API Endpoints
app.get('/api/dashboard-data', (req, res) => {
  try {
    const data = generateMockDashboardData();
    res.json(data);
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    res.status(500).json({ error: 'Failed to generate dashboard data' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard data available at: http://localhost:${PORT}/api/dashboard-data`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

