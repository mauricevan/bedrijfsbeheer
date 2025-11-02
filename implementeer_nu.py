#!/usr/bin/env python3
"""
Direct Implementatie Script - Voegt CustomerFinancials toe aan CRM
"""
import os
import shutil
from datetime import datetime

def backup_file(filepath):
    """Maak backup van bestand"""
    backup_path = f"{filepath}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(filepath, backup_path)
    print(f"✅ Backup: {backup_path}")
    return backup_path

def check_if_exists(filepath, search_text):
    """Check of tekst al bestaat in bestand"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return search_text in content

def add_dollar_sign_import(filepath):
    """Voeg DollarSign toe aan lucide-react import"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'DollarSign' in content:
        print("✅ DollarSign import al aanwezig")
        return False
    
    # Zoek lucide-react import
    if "from 'lucide-react'" in content:
        # Voeg DollarSign toe aan import
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if "from 'lucide-react'" in line and 'import {' in line:
                # Vind de positie om DollarSign toe te voegen
                if 'DollarSign' not in line:
                    # Voeg toe aan einde van imports voor de '}'
                    line = line.replace(' }', ', DollarSign }')
                    lines[i] = line
                    print("✅ DollarSign toegevoegd aan import")
                    break
        
        content = '\n'.join(lines)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    print("❌ Kon lucide-react import niet vinden")
    return False

def add_state_variable(filepath):
    """Voeg selectedCustomerForFinancials state toe"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'selectedCustomerForFinancials' in content:
        print("✅ State variable al aanwezig")
        return False
    
    # Zoek naar useState declarations en voeg toe
    search_text = "const [customers, setCustomers] = useState<Customer[]>(props.customers);"
    if search_text in content:
        new_state = "\n  const [selectedCustomerForFinancials, setSelectedCustomerForFinancials] = useState<Customer | null>(null);"
        content = content.replace(search_text, search_text + new_state)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ State variable toegevoegd")
        return True
    
    print("⚠️ Kon geschikte plek voor state niet vinden - handmatig toevoegen")
    return False

def add_customer_financials_component(filepath):
    """Voeg CustomerFinancials modal component toe"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'const CustomerFinancials' in content:
        print("✅ CustomerFinancials component al aanwezig")
        return False
    
    # Voeg component toe voor het return statement
    modal_component = '''
  // Customer Financials Modal Component
  const CustomerFinancials: React.FC<{ customer: Customer; onClose: () => void }> = ({ customer, onClose }) => {
    const customerInvoices = props.invoices?.filter(inv => inv.customerId === customer.id) || [];
    const customerQuotes = props.quotes?.filter(q => q.customerId === customer.id) || [];
    
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
          </div>

          {/* Summary Cards */}
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

          {/* Invoices Section */}
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

          {/* Quotes Section */}
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
'''
    
    # Zoek naar "return (" en voeg component ervoor toe
    if '  return (' in content:
        content = content.replace('  return (', modal_component + '\n\n  return (')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ CustomerFinancials component toegevoegd")
        return True
    
    print("❌ Kon return statement niet vinden")
    return False

def add_financials_button(filepath):
    """Voeg Financiën knop toe bij klant cards"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'setSelectedCustomerForFinancials' in content and 'onClick={() => setSelectedCustomerForFinancials(customer)}' in content:
        print("✅ Financiën knop al aanwezig")
        return False
    
    # Zoek de edit button en voeg financiën knop ervoor toe
    button_html = '''<button
                      onClick={() => setSelectedCustomerForFinancials(customer)}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1"
                      title="Financiën"
                    >
                      <DollarSign size={16} />
                      Financiën
                    </button>
                    '''
    
    # Zoek naar de edit button locatie
    search_pattern = '''<button
                      onClick={() => startEditCustomer(customer)}'''
    
    if search_pattern in content:
        content = content.replace(search_pattern, button_html + search_pattern)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ Financiën knop toegevoegd")
        return True
    
    print("⚠️ Kon edit button niet vinden - handmatig toevoegen")
    return False

def add_modal_render(filepath):
    """Voeg modal render toe aan return statement"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '{selectedCustomerForFinancials &&' in content:
        print("✅ Modal render al aanwezig")
        return False
    
    # Zoek naar laatste </div> voor de return sluiting
    # We voegen de modal render toe vlak voor het einde
    modal_render = '''
      {/* Customer Financials Modal */}
      {selectedCustomerForFinancials && (
        <CustomerFinancials
          customer={selectedCustomerForFinancials}
          onClose={() => setSelectedCustomerForFinancials(null)}
        />
      )}
'''
    
    # Zoek het einde van de component (laatste </div> voor de function sluiting)
    lines = content.split('\n')
    
    # Vind de laatste </div> in de return statement
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].strip() == '</div>' and i > len(lines) - 20:
            # Voeg modal render toe voor deze laatste </div>
            lines.insert(i, modal_render)
            print("✅ Modal render toegevoegd")
            break
    
    content = '\n'.join(lines)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def main():
    print("=" * 60)
    print("🚀 DIRECTE IMPLEMENTATIE - Customer Financials")
    print("=" * 60)
    
    crm_file = r"C:\Users\hp\Desktop\Bedrijfsbeheer2.0\pages\CRM.tsx"
    
    # Check of bestand bestaat
    if not os.path.exists(crm_file):
        print(f"❌ CRM.tsx niet gevonden op: {crm_file}")
        return False
    
    print(f"\n📂 Bestand: {crm_file}")
    
    # Stap 1: Backup
    print("\n📦 Stap 1: Backup maken...")
    backup_path = backup_file(crm_file)
    
    # Stap 2: Check wat al bestaat
    print("\n🔍 Stap 2: Status check...")
    has_component = check_if_exists(crm_file, 'const CustomerFinancials')
    has_button = check_if_exists(crm_file, 'Financiën')
    has_dollarsign = check_if_exists(crm_file, 'DollarSign')
    
    print(f"  - CustomerFinancials component: {'✅' if has_component else '❌'}")
    print(f"  - Financiën knop: {'✅' if has_button else '❌'}")
    print(f"  - DollarSign import: {'✅' if has_dollarsign else '❌'}")
    
    # Stap 3: Implementeer wat ontbreekt
    changes_made = []
    
    print("\n⚙️ Stap 3: Implementatie...")
    
    if not has_dollarsign:
        if add_dollar_sign_import(crm_file):
            changes_made.append("DollarSign import")
    
    if add_state_variable(crm_file):
        changes_made.append("State variable")
    
    if not has_component:
        if add_customer_financials_component(crm_file):
            changes_made.append("CustomerFinancials component")
    
    if not has_button:
        if add_financials_button(crm_file):
            changes_made.append("Financiën knop")
    
    if add_modal_render(crm_file):
        changes_made.append("Modal render")
    
    # Summary
    print("\n" + "=" * 60)
    if changes_made:
        print("✅ IMPLEMENTATIE VOLTOOID!")
        print("=" * 60)
        print("\n📋 Toegevoegd:")
        for change in changes_made:
            print(f"  ✓ {change}")
        print(f"\n💾 Backup: {backup_path}")
        print("\n🎯 Volgende stappen:")
        print("  1. Start app: npm run dev")
        print("  2. Ga naar CRM tab")
        print("  3. Klik 'Financiën' bij een klant")
        print("  4. Test de modal!")
    else:
        print("ℹ️  ALLES AL AANWEZIG")
        print("=" * 60)
        print("\nGeen wijzigingen nodig - alles werkt al!")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🎉 Klaar! Start de app en test de feature.")
        else:
            print("\n⚠️ Er zijn problemen. Check de output hierboven.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
