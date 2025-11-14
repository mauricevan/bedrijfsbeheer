# Accounting Hooks Tests

Deze directory bevat unit tests voor alle accounting hooks.

## Setup

Installeer eerst de benodigde dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/react-hooks jest-environment-jsdom
```

## Test Bestanden

- **`useQuotes.test.tsx`** - Tests voor useQuotes hook
- **`useInvoices.test.tsx`** - Tests voor useInvoices hook
- **`useTransactions.test.ts`** - Tests voor useTransactions hook
- **`useAccountingDashboard.test.ts`** - Tests voor useAccountingDashboard hook

## Tests Uitvoeren

```bash
# Alle tests uitvoeren
npm test

# Tests in watch mode
npm run test:watch

# Tests met coverage rapport
npm run test:coverage
```

## Test Coverage

De tests dekken de volgende functionaliteiten:

### useQuotes Hook
- ✅ Initialisatie met default state
- ✅ Quote form openen/sluiten
- ✅ Quote bewerken
- ✅ Quote status updaten
- ✅ Quote verwijderen
- ✅ Quote clonen
- ✅ Quote accepteren met/zonder clone

### useInvoices Hook
- ✅ Initialisatie met default state
- ✅ Invoice form openen/sluiten
- ✅ Invoice bewerken
- ✅ Invoice status updaten
- ✅ Invoice verwijderen
- ✅ Invoice clonen
- ✅ Validatie checklist beheren

### useTransactions Hook
- ✅ Initialisatie met alle transactions
- ✅ Filteren op type (all/income/expense)
- ✅ Filter updates wanneer transactions wijzigen
- ✅ Lege arrays afhandelen

### useAccountingDashboard Hook
- ✅ Transaction statistieken berekenen
- ✅ Invoice statistieken berekenen
- ✅ Quote statistieken berekenen
- ✅ Herberekenen wanneer data wijzigt
- ✅ Lege arrays afhandelen

## Mock Data

De tests gebruiken mock data uit `../../services/__tests__/testHelpers.ts`:
- mockUser
- mockEmployee
- mockCustomer
- mockQuote
- mockInvoice
- mockTransaction
- mockWorkOrder

## Notities

- Tests gebruiken `renderHook` van `@testing-library/react` voor hook testing
- Alle dependencies zijn gemockt (services, utils, analytics)
- Tests zijn geïsoleerd en kunnen onafhankelijk worden uitgevoerd
- Window methods (alert, confirm) zijn gemockt voor betere test controle



