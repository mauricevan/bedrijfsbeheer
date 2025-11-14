# Accounting Services Tests

Deze directory bevat unit tests voor alle accounting services.

## Setup

Installeer eerst de benodigde dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest
```

## Test Bestanden

- **`quoteService.test.ts`** - Tests voor alle quote service functies
- **`invoiceService.test.ts`** - Tests voor alle invoice service functies
- **`transactionService.test.ts`** - Tests voor alle transaction service functies
- **`testHelpers.ts`** - Mock data helpers voor tests

## Tests Uitvoeren

```bash
# Alle tests uitvoeren
npm test

# Tests in watch mode (automatisch herhalen bij wijzigingen)
npm run test:watch

# Tests met coverage rapport
npm run test:coverage
```

## Test Coverage

De tests dekken de volgende functionaliteiten:

### Quote Service
- ✅ `createQuote` - Quote aanmaken met validatie
- ✅ `updateQuote` - Quote bijwerken
- ✅ `updateQuoteStatus` - Status wijzigen
- ✅ `deleteQuote` - Quote verwijderen
- ✅ `cloneQuote` - Quote clonen
- ✅ `convertQuoteToInvoice` - Conversie naar factuur
- ✅ `syncQuoteToWorkOrder` - Synchronisatie met werkorder

### Invoice Service
- ✅ `createInvoice` - Factuur aanmaken met validatie
- ✅ `updateInvoice` - Factuur bijwerken
- ✅ `updateInvoiceStatus` - Status wijzigen (met reminder dates)
- ✅ `deleteInvoice` - Factuur verwijderen
- ✅ `cloneInvoice` - Factuur clonen
- ✅ `convertInvoiceToWorkOrder` - Conversie naar werkorder
- ✅ `syncInvoiceToWorkOrder` - Synchronisatie met werkorder
- ✅ `sendInvoiceReminder` - Herinnering verzenden
- ✅ `shouldShowValidationModal` - Validatie modal logica

### Transaction Service
- ✅ `groupTransactionsByMonth` - Groeperen per maand
- ✅ `groupTransactionsByType` - Groeperen per type (income/expense)
- ✅ `sortTransactionsByDateDesc` - Sorteren op datum (nieuwste eerst)
- ✅ `sortTransactionsByDateAsc` - Sorteren op datum (oudste eerst)
- ✅ `sortTransactionsByAmountDesc` - Sorteren op bedrag (hoogste eerst)
- ✅ `sortTransactionsByAmountAsc` - Sorteren op bedrag (laagste eerst)
- ✅ `getTransactionsByDateRange` - Filteren op datum bereik
- ✅ `getTransactionsByMonth` - Filteren op maand
- ✅ `getTransactionsByYear` - Filteren op jaar

## Mock Data

De `testHelpers.ts` file bevat mock data voor:
- Users
- Employees
- Customers
- Quote Items & Labor
- Quotes
- Invoices
- Transactions
- Work Orders

## Notities

- Alle service functies zijn pure functies (geen side effects)
- Tests gebruiken mocks voor dependencies (validators, calculations, helpers)
- Tests zijn geïsoleerd en kunnen onafhankelijk worden uitgevoerd



