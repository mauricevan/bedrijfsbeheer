# API Overzicht

## Huidige Implementatie

Het Bedrijfsbeheer Dashboard gebruikt momenteel **in-memory state management** via React hooks. Er is geen externe API of database verbinding in de huidige ontwikkelomgeving.

## Architectuur

### Frontend State Management

De applicatie draait volledig client-side met:
- React 19 met TypeScript
- Centralized state in App component
- Props drilling voor data distributie
- Local state management per module

### Data Opslag

**Huidige situatie (Development):**
- Alle data in memory (Redux/React state)
- Demo data geladen bij applicatie start
- Data verloren bij page refresh
- Geen persistentie tussen sessies

**Toekomstige situatie (Production):**
- REST API met Express/NestJS backend
- Database (SQLite, PostgreSQL, of MySQL)
- JWT authentication
- Persistent storage

## Mock API Server

Voor development en testing is er een optionele mock API server beschikbaar:

- Locatie: `/server/mock-api.js`
- Draait op: `http://localhost:3001`
- Simuleert API calls voor dashboard data
- Zie [Mock Server Documentatie](./mock-server.md)

## API Endpoints (Toekomstig)

### Authenticatie
```
POST /api/auth/login       - Login met email/password
POST /api/auth/logout      - Logout gebruiker
GET  /api/auth/me          - Ophalen huidige gebruiker
POST /api/auth/refresh     - Refresh JWT token
```

### Dashboard
```
GET  /api/dashboard        - Dashboard statistieken
GET  /api/notifications    - Notificaties ophalen
PUT  /api/notifications/:id - Markeer als gelezen
```

### Voorraadbeheer
```
GET    /api/inventory           - Alle voorraad items
GET    /api/inventory/:id       - Enkel item
POST   /api/inventory           - Nieuw item aanmaken
PUT    /api/inventory/:id       - Item bijwerken
DELETE /api/inventory/:id       - Item verwijderen
PATCH  /api/inventory/:id/stock - Update voorraad niveau
```

### Werkorders
```
GET    /api/workorders                - Alle werkorders
GET    /api/workorders/:id            - Enkele werkorder
POST   /api/workorders                - Nieuwe werkorder
PUT    /api/workorders/:id            - Werkorder bijwerken
DELETE /api/workorders/:id            - Werkorder verwijderen
PATCH  /api/workorders/:id/status     - Update status
PATCH  /api/workorders/:id/hours      - Update gewerkte uren
GET    /api/workorders/employee/:id   - Werkorders per medewerker
```

### CRM
```
GET    /api/customers          - Alle klanten
GET    /api/customers/:id      - Enkele klant
POST   /api/customers          - Nieuwe klant
PUT    /api/customers/:id      - Klant bijwerken
DELETE /api/customers/:id      - Klant verwijderen
GET    /api/leads              - Alle leads
POST   /api/leads              - Nieuwe lead
PUT    /api/leads/:id          - Lead bijwerken
```

### Boekhouding
```
GET    /api/invoices           - Alle facturen
GET    /api/invoices/:id       - Enkele factuur
POST   /api/invoices           - Nieuwe factuur
PUT    /api/invoices/:id       - Factuur bijwerken
DELETE /api/invoices/:id       - Factuur verwijderen
GET    /api/quotes             - Alle offertes
POST   /api/quotes             - Nieuwe offerte
PUT    /api/quotes/:id         - Offerte bijwerken
```

### HRM
```
GET    /api/employees          - Alle medewerkers
GET    /api/employees/:id      - Enkele medewerker
POST   /api/employees          - Nieuwe medewerker
PUT    /api/employees/:id      - Medewerker bijwerken
DELETE /api/employees/:id      - Medewerker verwijderen
PUT    /api/employees/:id/password - Wachtwoord wijzigen
```

### Webshop
```
GET    /api/webshop/products   - Alle producten
GET    /api/webshop/orders     - Alle bestellingen
POST   /api/webshop/orders     - Nieuwe bestelling
PUT    /api/webshop/orders/:id - Bestelling bijwerken
```

## Data Formaten

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optionele boodschap"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## HTTP Status Codes

- `200 OK` - Succesvolle operatie
- `201 Created` - Resource aangemaakt
- `204 No Content` - Succesvolle delete
- `400 Bad Request` - Validatie error
- `401 Unauthorized` - Niet ingelogd
- `403 Forbidden` - Geen toegang
- `404 Not Found` - Resource niet gevonden
- `500 Internal Server Error` - Server error

## Authenticatie & Autorisatie

### JWT Tokens (Toekomstig)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Payload
```json
{
  "userId": "123",
  "email": "sophie@bedrijf.nl",
  "role": "admin",
  "isAdmin": true,
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Role-Based Access Control
- **Admin**: Volledige API toegang
- **User**: Beperkte toegang (eigen data)

## Migratie Plan

### Fase 1: Mock API Setup ✅
- Mock server opgezet
- Demo endpoints beschikbaar

### Fase 2: Backend Development 🔄
- [ ] Express/NestJS backend opzetten
- [ ] Database schema ontwerpen
- [ ] REST API endpoints implementeren
- [ ] JWT authenticatie toevoegen

### Fase 3: Frontend Integratie 🔄
- [ ] API client library (axios/fetch)
- [ ] Redux Thunk of RTK Query voor async actions
- [ ] Error handling & loading states
- [ ] Optimistic UI updates

### Fase 4: Production Deployment 📅
- [ ] Database migrations
- [ ] Production environment config
- [ ] SSL/TLS certificaten
- [ ] Rate limiting & security
- [ ] Monitoring & logging

## API Client Voorbeeld

### Fetch API
```typescript
// api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchInventory() {
  const response = await fetch(`${API_URL}/api/inventory`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }

  return response.json();
}
```

### Met Error Handling
```typescript
export async function createWorkOrder(data: WorkOrder) {
  try {
    const response = await fetch(`${API_URL}/api/workorders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create work order');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## Gerelateerde Documentatie

- [Mock Server](./mock-server.md) - Mock API server setup
- [State Management](../02-architecture/state-management.md) - Huidige state management
- [Security](../02-architecture/security.md) - Authenticatie & autorisatie
- [Technical Stack](../02-architecture/technical-stack.md) - Technische details
