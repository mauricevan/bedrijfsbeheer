#!/usr/bin/env python3
"""
FINAAL - Customer Financials Implementatie
Geoptimaliseerd en getest
"""
import os
import shutil
import re
from datetime import datetime
from pathlib import Path

def main():
    print("=" * 70)
    print("🚀 CUSTOMER FINANCIALS IMPLEMENTATIE")
    print("=" * 70)
    
    # Paths
    base_path = Path(r"C:\Users\hp\Desktop\Bedrijfsbeheer2.0")
    crm_path = base_path / "pages" / "CRM.tsx"
    
    if not crm_path.exists():
        print(f"❌ CRM.tsx niet gevonden: {crm_path}")
        return False
    
    print(f"\n📂 Bestand: {crm_path}")
    print(f"📏 Grootte: {crm_path.stat().st_size / 1024:.1f} KB")
    
    # Backup
    backup_path = str(crm_path) + f".backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(crm_path, backup_path)
    print(f"✅ Backup: {backup_path}")
    
    # Lees bestand
    print("\n📖 Bestand lezen...")
    with open(crm_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Check 1: DollarSign import
    print("\n🔍 Check 1: DollarSign import...")
    if 'DollarSign' not in content:
        # Zoek lucide-react import
        pattern = r"(import\s*{[^}]+)(}\s*from\s*['\"]lucide-react['\"])"
        match = re.search(pattern, content)
        if match:
            before_brace = match.group(1)
            after_brace = match.group(2)
            if ', DollarSign' not in before_brace:
                new_import = before_brace + ', DollarSign' + after_brace
                content = content.replace(match.group(0), new_import)
                changes.append("✓ DollarSign toegevoegd aan import")
                print("  ✅ DollarSign toegevoegd")
            else:
                print("  ✅ Reeds aanwezig")
        else:
            print("  ⚠️ Lucide-react import niet gevonden")
    else:
        print("  ✅ Reeds aanwezig")
    
    # Check 2: Props interface
    print("\n🔍 Check 2: Props interface...")
    if 'invoices' not in content or 'CRMProps' not in content:
        print("  ⚠️ Props moeten handmatig aangepast worden in App.tsx")
        print("  ⚠️ Zorg dat CRM component invoices en quotes props krijgt")
    else:
        print("  ✅ Props lijken aanwezig")
    
    # Check 3: State variable
    print("\n🔍 Check 3: State variable...")
    if 'selectedCustomerForFinancials' not in content:
        # Zoek een useState lijn en voeg eronder toe
        pattern = r"(const \[customers, setCustomers\] = useState<Customer\[\]>\(props\.customers\);)"
        if re.search(pattern, content):
            new_state = r"\1\n  const [selectedCustomerForFinancials, setSelectedCustomerForFinancials] = useState<Customer | null>(null);"
            content = re.sub(pattern, new_state, content)
            changes.append("✓ State variable toegevoegd")
            print("  ✅ State variable toegevoegd")
        else:
            print("  ⚠️ Kon state niet automatisch toevoegen")
    else:
        print("  ✅ Reeds aanwezig")
    
    # Check 4: CustomerFinancials component
    print("\n🔍 Check 4: CustomerFinancials component...")
    if 'const CustomerFinancials' not in content:
        # Voeg component toe voor return statement
        component = '''
  // Customer Financials Modal
  const CustomerFinancials: React.FC<{ customer: Customer; onClose: () => void }> = ({ customer, onClose }) => {
    const customerInvoices = (props.invoices || []).filter(inv => inv.customerId === customer.id);
    const customerQuotes = (props.quotes || []).filter(q => q.customerId === customer.id);
    
    const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = customerInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const totalOutstanding = totalInvoiced - totalPaid;
    const overdue = customerInvoices.filter(inv => 
      inv.status === 'overdue'
    ).reduce((sum, inv) => sum + inv.total, 0);
    const totalQuoted = customerQuotes.reduce((sum, q) => sum + q.total, 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Financieel Overzicht</h3>
              <p className="text-gray-600 mt-1">{customer.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
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
                  <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {invoice.status === 'paid' ? 'Betaald' : invoice.status === 'overdue' ? 'Achterstallig' : 'Open'}
                      </span>
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <span className="text-gray-500 text-sm">{new Date(invoice.issueDate).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <span className="font-bold">€{invoice.total.toFixed(2)}</span>
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
                  <div key={quote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        quote.status === 'approved' ? 'bg-green-100 text-green-700' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        quote.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {quote.status === 'approved' ? 'Geaccepteerd' : 
                         quote.status === 'rejected' ? 'Afgewezen' : 
                         quote.status === 'expired' ? 'Verlopen' : 
                         quote.status === 'sent' ? 'Verzonden' : 'Draft'}
                      </span>
                      <span className="font-medium">OFF-{quote.id.slice(0, 8)}</span>
                      <span className="text-gray-500 text-sm">{new Date(quote.createdDate).toLocaleDateString('nl-NL')}</span>
                    </div>
                    <span className="font-bold">€{quote.total.toFixed(2)}</span>
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
'''
        # Voeg toe voor return statement
        if '  return (' in content:
            content = content.replace('  return (', component + '\n\n  return (', 1)
            changes.append("✓ CustomerFinancials component toegevoegd")
            print("  ✅ Component toegevoegd")
        else:
            print("  ⚠️ Kon return statement niet vinden")
    else:
        print("  ✅ Reeds aanwezig")
    
    # Check 5: Financiën knop
    print("\n🔍 Check 5: Financiën knop...")
    if 'onClick={() => setSelectedCustomerForFinancials(customer)}' not in content:
        # Zoek edit button en voeg financiën knop ervoor toe
        button = '''<button
                      onClick={() => setSelectedCustomerForFinancials(customer)}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
                      title="Financiën"
                    >
                      <DollarSign size={16} />
                      Financiën
                    </button>
                    '''
        
        # Zoek naar de edit button
        pattern = r'(<button\s+onClick=\{\(\) => startEditCustomer\(customer\)\})'
        if re.search(pattern, content):
            content = re.sub(pattern, button + r'\1', content)
            changes.append("✓ Financiën knop toegevoegd")
            print("  ✅ Knop toegevoegd")
        else:
            print("  ⚠️ Kon edit button niet vinden")
    else:
        print("  ✅ Reeds aanwezig")
    
    # Check 6: Modal render
    print("\n🔍 Check 6: Modal render...")
    if '{selectedCustomerForFinancials &&' not in content:
        modal_render = '''
      {/* Customer Financials Modal */}
      {selectedCustomerForFinancials && (
        <CustomerFinancials
          customer={selectedCustomerForFinancials}
          onClose={() => setSelectedCustomerForFinancials(null)}
        />
      )}
'''
        # Voeg toe voor de laatste </div> van de component
        # Zoek naar het patroon van de laatste closing div
        lines = content.split('\n')
        for i in range(len(lines) - 10, len(lines)):
            if '</div>' in lines[i] and i > len(lines) - 15:
                lines.insert(i, modal_render)
                changes.append("✓ Modal render toegevoegd")
                print("  ✅ Modal render toegevoegd")
                break
        content = '\n'.join(lines)
    else:
        print("  ✅ Reeds aanwezig")
    
    # Schrijf terug als er wijzigingen zijn
    if content != original_content:
        print("\n💾 Wijzigingen opslaan...")
        with open(crm_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ Bestand opgeslagen")
    else:
        print("\n✅ Geen wijzigingen nodig - alles al aanwezig!")
    
    # Summary
    print("\n" + "=" * 70)
    if changes:
        print("✅ IMPLEMENTATIE VOLTOOID!")
        print("=" * 70)
        print("\n📋 Toegepaste wijzigingen:")
        for change in changes:
            print(f"  {change}")
    else:
        print("ℹ️  ALLES AL AANWEZIG!")
        print("=" * 70)
        print("\nGeen wijzigingen nodig.")
    
    print(f"\n💾 Backup locatie: {backup_path}")
    print("\n🎯 Volgende stappen:")
    print("  1. Start app: npm run dev")
    print("  2. Ga naar CRM tab")
    print("  3. Klik 'Financiën' bij een klant")
    print("  4. Geniet van de nieuwe feature! 🎉")
    
    print("\n" + "=" * 70)
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            print("\n⚠️ Script gefaald. Check de output hierboven.")
            input("\nDruk op Enter om af te sluiten...")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        input("\nDruk op Enter om af te sluiten...")
