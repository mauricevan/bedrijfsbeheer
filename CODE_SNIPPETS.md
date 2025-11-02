# 📝 CODE SNIPPETS - Handmatige Implementatie

Als je handmatig wilt implementeren, kopieer deze code:

---

## 1️⃣ Import DollarSign (CRM.tsx top)

```typescript
import { DollarSign, Edit, Trash2, Plus, Building, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
```

---

## 2️⃣ State voor Modal (in CRM component, bij andere state)

```typescript
const [selectedCustomerForFinancials, setSelectedCustomerForFinancials] = useState<Customer | null>(null);
```

---

## 3️⃣ CustomerFinancials Modal Component (voor return statement)

```typescript
const CustomerFinancials: React.FC<{ customer: Customer; onClose: () => void }> = ({ customer, onClose }) => {
  const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
  const customerQuotes = quotes.filter(q => q.customerId === customer.id);
  
  const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = customerInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const totalOutstanding = totalInvoiced - totalPaid;
  const overdue = customerInvoices.filter(inv => 
    inv.status === 'open' && new Date(inv.dueDate) < new Date()
  ).reduce((sum, inv) => sum + inv.amount, 0);
  const totalQuoted = customerQuotes.reduce((sum, q) => sum + q.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Financieel Overzicht</h3>
            <p className="text-gray-600 mt-1">{customer.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-600 text-sm font-medium">Totaal Gefactureerd</div>
            <div className="text-2xl font-bold text-blue-900">€{totalInvoiced.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 text-sm font-medium">Betaald</div>
            <div className="text-2xl font-bold text-green-900">€{totalPaid.toFixed(2)}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-600 text-sm font-medium">Uitstaand</div>
            <div className="text-2xl font-bold text-yellow-900">€{totalOutstanding.toFixed(2)}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-red-600 text-sm font-medium">Achterstallig</div>
            <div className="text-2xl font-bold text-red-900">€{overdue.toFixed(2)}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-purple-600 text-sm font-medium">Offertes</div>
            <div className="text-2xl font-bold text-purple-900">€{totalQuoted.toFixed(2)}</div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-blue-600">📄</span> Facturen ({customerInvoices.length})
          </h4>
          {customerInvoices.length > 0 ? (
            <div className="space-y-2">
              {customerInvoices.map(invoice => (
                <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {invoice.status === 'paid' ? 'Betaald' : invoice.status === 'overdue' ? 'Achterstallig' : 'Open'}
                    </span>
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                    <span className="text-gray-500 text-sm">{new Date(invoice.date).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <span className="font-bold">€{invoice.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Geen facturen</p>
          )}
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="text-purple-600">📋</span> Offertes ({customerQuotes.length})
          </h4>
          {customerQuotes.length > 0 ? (
            <div className="space-y-2">
              {customerQuotes.map(quote => (
                <div key={quote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      quote.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {quote.status === 'accepted' ? 'Geaccepteerd' : 
                       quote.status === 'rejected' ? 'Afgewezen' : 
                       quote.status === 'expired' ? 'Verlopen' : 'Pending'}
                    </span>
                    <span className="font-medium">{quote.quoteNumber}</span>
                    <span className="text-gray-500 text-sm">{new Date(quote.date).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <span className="font-bold">€{quote.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Geen offertes</p>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 4️⃣ Financiën Knop (in customer card, naast Edit button)

```typescript
<button
  onClick={() => setSelectedCustomerForFinancials(customer)}
  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
  title="Financiën"
>
  <DollarSign size={16} />
  Financiën
</button>
```

---

## 5️⃣ Modal Renderen (onderaan return statement, voor </div>)

```typescript
{selectedCustomerForFinancials && (
  <CustomerFinancials
    customer={selectedCustomerForFinancials}
    onClose={() => setSelectedCustomerForFinancials(null)}
  />
)}
```

---

## 6️⃣ Props Toevoegen aan CRM Component (in App.tsx of waar CRM wordt aangeroepen)

Zorg dat CRM deze props krijgt:
```typescript
<CRM 
  customers={customers}
  setCustomers={setCustomers}
  invoices={invoices}      // 👈 BELANGRIJK
  setInvoices={setInvoices} // 👈 BELANGRIJK
  quotes={quotes}           // 👈 BELANGRIJK
  setQuotes={setQuotes}     // 👈 BELANGRIJK
/>
```

---

## 7️⃣ CRM Component Props Interface Updaten

```typescript
interface CRMProps {
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
  invoices: Invoice[];      // 👈 TOEVOEGEN
  setInvoices: (invoices: Invoice[]) => void;  // 👈 TOEVOEGEN
  quotes: Quote[];          // 👈 TOEVOEGEN
  setQuotes: (quotes: Quote[]) => void;  // 👈 TOEVOEGEN
}

const CRM: React.FC<CRMProps> = ({ customers, setCustomers, invoices, setInvoices, quotes, setQuotes }) => {
```

---

## ✅ Klaar!

Test door:
1. App starten: `npm run dev`
2. Naar CRM gaan
3. Klik "Financiën" bij een klant
4. Zie de modal met overzicht

---

## 🔧 Types Nodig? (types.ts)

Zorg dat je deze types hebt:

```typescript
export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  amount: number;
  status: 'open' | 'paid' | 'overdue';
  date: string;
  dueDate: string;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  customerId: number;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  date: string;
}
```

---

**Tijd**: ~15 minuten handmatig
**Makkelijker**: Gebruik `python smart_auto_implementatie.py` 😉
