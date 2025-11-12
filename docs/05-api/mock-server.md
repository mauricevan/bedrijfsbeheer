# Mock API Server

Deze mock API server kan gebruikt worden voor ontwikkeling en testen wanneer je API calls wilt simuleren. In productie kun je deze vervangen door echte database queries.

## Installatie

Om de mock API server te gebruiken, installeer eerst de benodigde dependencies:

```bash
npm install express cors
```

Of installeer alle dependencies (inclusief dev dependencies):
```bash
npm install
```

## Starten

Start de mock API server:

```bash
node server/mock-api.js
```

Of met npm script (nadat je de scripts hebt toegevoegd):
```bash
npm run mock-api
```

De server draait standaard op `http://localhost:3001`

## Endpoints

### GET `/api/dashboard-data`

Retourneert mock dashboard data in het formaat zoals gespecificeerd in de prompt.

**Response:**
```json
{
  "period": "November 2025",
  "comparisonToPrevious": {
    "revenueChange": 0.12,
    "invoicesChange": -0.05,
    "openAmountChange": -0.08,
    "quoteConversionChange": 0.09
  },
  "stats": {
    "totalRevenue": 17660,
    "totalInvoiced": 32975,
    "openAmount": 15290,
    "averagePaymentTermDays": 7,
    "openQuotes": 2
  },
  "salesByMonth": [...],
  "previousYearSales": [...],
  "openByCustomer": [...],
  "topCustomers": [...],
  "quotesByStatus": [...],
  "paymentBehavior": [...],
  "insights": [...]
}
```

### GET `/health`

Health check endpoint om te verifiëren dat de server draait.

## Gebruik in Frontend

Het dashboard gebruikt momenteel direct de data uit de React state. Als je later de mock API wilt gebruiken, kun je de `transformDashboardData` functie uit `utils/dashboardData.ts` gebruiken om de data te transformeren, of direct een API call maken:

```typescript
// Voorbeeld API call (optioneel)
const fetchDashboardData = async () => {
  const response = await fetch('http://localhost:3001/api/dashboard-data');
  const data = await response.json();
  return data;
};
```

## Productie

Voor productie gebruik, vervang deze mock API door:
- Echte database queries (SQLite, PostgreSQL, etc.)
- Een REST API of GraphQL endpoint
- Een backend framework zoals NestJS, Express met TypeORM, etc.

## Configuratie

Je kunt de poort aanpassen via een environment variable:

```bash
PORT=3001 node server/mock-api.js
```

Of door de `PORT` variabele aan te passen in `mock-api.js`.

