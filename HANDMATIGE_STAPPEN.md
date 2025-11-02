# HANDMATIGE IMPLEMENTATIE STAPPEN

Omdat automatische scripts niet werken in deze omgeving, volg deze stappen:

## Stap 1: Voeg DollarSign toe aan imports

Zoek in `CRM.tsx` de regel die begint met:
```typescript
import { Edit, Trash2, Plus, ...
```

Voeg `DollarSign` toe aan deze import van 'lucide-react'.

## Stap 2: Voeg state variable toe  

Zoek in `CRM.tsx` waar de useState declarations zijn, voeg toe:
```typescript
const [selectedCustomerForFinancials, setSelectedCustomerForFinancials] = useState<Customer | null>(null);
```

## Stap 3: Voeg CustomerFinancials component toe

Kopieer de complete component code uit `CODE_SNIPPETS.md` sectie 3️⃣
Plak deze VOOR het `return (` statement in de CRM component.

## Stap 4: Voeg Financiën knop toe

Zoek de Edit button bij de customer cards:
```typescript
<button onClick={() => startEditCustomer(customer)}
```

Voeg ERVOOR de Financiën knop toe (code uit `CODE_SNIPPETS.md` sectie 4️⃣).

## Stap 5: Voeg modal render toe

Zoek het einde van de return statement (laatste `</div>` voor de function sluit).
Voeg ERVOOR toe:
```typescript
{selectedCustomerForFinancials && (
  <CustomerFinancials
    customer={selectedCustomerForFinancials}
    onClose={() => setSelectedCustomerForFinancials(null)}
  />
)}
```

## ✅ Klaar!

Start app: `npm run dev`
Test: Klik "Financiën" bij een klant in CRM

---

**Makkelijkere optie**: Dubbelklik `IMPLEMENTEER_NU.bat` om automatisch te doen!
