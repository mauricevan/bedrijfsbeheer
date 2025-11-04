import React, { useState, useMemo } from 'react';
import { 
  LedgerAccount, 
  JournalEntry, 
  VATReport, 
  CustomerDossier, 
  SupplierDossier,
  InvoiceArchiveItem,
  Invoice,
  PackingSlip,
  Customer,
  Supplier,
  Employee,
  User
} from '../types';

interface BookkeepingProps {
  invoices: Invoice[];
  customers: Customer[];
  suppliers?: Supplier[];
  employees: Employee[];
  currentUser: User;
  isAdmin: boolean;
  packingSlips?: PackingSlip[];
}

// Standaard MKB Grootboekrekeningen
const STANDARD_LEDGER_ACCOUNTS: LedgerAccount[] = [
  { id: '1300', accountNumber: '1300', name: 'Debiteuren', type: 'asset', category: 'debiteuren', description: 'Openstaande facturen klanten', isStandard: true, createdAt: new Date().toISOString() },
  { id: '1400', accountNumber: '1400', name: 'Voorraad', type: 'asset', category: 'voorraad', description: 'Voorraad goederen', isStandard: true, createdAt: new Date().toISOString() },
  { id: '4000', accountNumber: '4000', name: 'Inkoop grondstoffen', type: 'expense', category: 'inkoop', description: 'Inkoop grondstoffen en materialen', isStandard: true, createdAt: new Date().toISOString() },
  { id: '4400', accountNumber: '4400', name: 'Inkoop diensten', type: 'expense', category: 'inkoop', description: 'Inkoop externe diensten', isStandard: true, createdAt: new Date().toISOString() },
  { id: '8000', accountNumber: '8000', name: 'Omzet goederen (21% BTW)', type: 'revenue', category: 'omzet', description: 'Omzet uit verkoop goederen', isStandard: true, createdAt: new Date().toISOString() },
  { id: '8010', accountNumber: '8010', name: 'Omzet diensten (9% BTW)', type: 'revenue', category: 'omzet', description: 'Omzet uit diensten', isStandard: true, createdAt: new Date().toISOString() },
  { id: '8020', accountNumber: '8020', name: 'Omzet vrijgesteld (0%)', type: 'revenue', category: 'omzet', description: 'Omzet vrijgesteld van BTW', isStandard: true, createdAt: new Date().toISOString() },
  { id: '1600', accountNumber: '1600', name: 'Crediteuren', type: 'liability', category: 'crediteuren', description: 'Openstaande inkoopfacturen', isStandard: true, createdAt: new Date().toISOString() },
  { id: '2200', accountNumber: '2200', name: 'BTW hoog (21%)', type: 'liability', category: 'btw', description: 'BTW af te dragen 21%', isStandard: true, createdAt: new Date().toISOString() },
  { id: '2210', accountNumber: '2210', name: 'BTW laag (9%)', type: 'liability', category: 'btw', description: 'BTW af te dragen 9%', isStandard: true, createdAt: new Date().toISOString() },
];

const Bookkeeping: React.FC<BookkeepingProps> = ({
  invoices,
  customers,
  suppliers = [],
  employees,
  currentUser,
  isAdmin,
  packingSlips = [],
}) => {
  const [activeTab, setActiveTab] = useState<'grootboek' | 'facturen' | 'btw' | 'dossiers' | 'journaal'>('grootboek');
  const [ledgerAccounts] = useState<LedgerAccount[]>(STANDARD_LEDGER_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [vatReports, setVatReports] = useState<VATReport[]>([]);
  const [customerDossiers, setCustomerDossiers] = useState<CustomerDossier[]>([]);
  const [supplierDossiers, setSupplierDossiers] = useState<SupplierDossier[]>([]);
  const [invoiceArchive, setInvoiceArchive] = useState<InvoiceArchiveItem[]>([]);

  // Check permissions
  const hasAccess = isAdmin || currentUser.role === 'Manager Productie';
  const hasDossierAccess = hasAccess || currentUser.role?.includes('Verkoper') || currentUser.role?.includes('Inkoop');

  if (!hasAccess && !hasDossierAccess) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Geen Toegang</h2>
          <p className="text-yellow-700">Je hebt geen toegang tot de Boekhouding module. Neem contact op met je beheerder.</p>
        </div>
      </div>
    );
  }

  // Automatisch factuurarchief genereren vanuit bestaande facturen
  useMemo(() => {
    const archiveItems: InvoiceArchiveItem[] = invoices.map(inv => ({
      id: `arch-${inv.id}`,
      invoiceNumber: inv.invoiceNumber,
      invoiceId: inv.id,
      date: inv.date || new Date().toISOString().split('T')[0],
      dueDate: inv.dueDate,
      customerId: inv.customerId,
      customerName: inv.customerName || 'Onbekend',
      totalExclVat: inv.subtotal || 0,
      vatAmount: inv.vatAmount || 0,
      totalInclVat: inv.total || 0,
      status: inv.status === 'paid' ? 'paid' : inv.status === 'overdue' ? 'overdue' : 'outstanding',
      paidDate: inv.paidDate,
      workOrderId: inv.workOrderId,
      pdfUploaded: false,
      createdAt: inv.createdAt || new Date().toISOString(),
      updatedAt: inv.updatedAt || new Date().toISOString(),
    }));
    setInvoiceArchive(archiveItems);
  }, [invoices]);

  // Automatisch journaalposten genereren vanuit facturen
  useMemo(() => {
    const entries: JournalEntry[] = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'paid')
      .map((inv, index) => {
        // Bepaal BTW tarief (standaard 21%)
        const vatRate = inv.vatRate || 21;
        const isService = vatRate === 9;
        const isExempt = vatRate === 0;

        // Bepaal omzetrekening
        let revenueAccount = '8000'; // Standaard: Omzet goederen (21%)
        if (isService) revenueAccount = '8010'; // Omzet diensten (9%)
        if (isExempt) revenueAccount = '8020'; // Omzet vrijgesteld (0%)

        // Bepaal BTW rekening
        const vatAccount = vatRate === 9 ? '2210' : '2200';

        const lines: JournalEntryLine[] = [
          {
            id: `line-${inv.id}-1`,
            accountId: '1300',
            accountNumber: '1300',
            accountName: 'Debiteuren',
            debit: inv.total,
            credit: 0,
            description: `Factuur ${inv.invoiceNumber}`,
          },
          {
            id: `line-${inv.id}-2`,
            accountId: revenueAccount,
            accountNumber: revenueAccount,
            accountName: ledgerAccounts.find(a => a.accountNumber === revenueAccount)?.name || 'Omzet',
            debit: 0,
            credit: inv.subtotal,
            description: `Omzet factuur ${inv.invoiceNumber}`,
          },
        ];

        // Voeg BTW regel toe (behalve voor vrijgesteld)
        if (!isExempt) {
          lines.push({
            id: `line-${inv.id}-3`,
            accountId: vatAccount,
            accountNumber: vatAccount,
            accountName: ledgerAccounts.find(a => a.accountNumber === vatAccount)?.name || 'BTW',
            debit: 0,
            credit: inv.vatAmount,
            description: `BTW ${vatRate}% factuur ${inv.invoiceNumber}`,
          });
        }

        const invoiceDate = inv.date || new Date().toISOString().split('T')[0];
        const year = invoiceDate.split('-')[0] || new Date().getFullYear().toString();
        
        return {
          id: `jrn-${inv.id}`,
          entryNumber: `JRN-${year}-${String(index + 1).padStart(3, '0')}`,
          date: invoiceDate,
          description: `Verkoop aan ${inv.customerName || 'Klant'} (factuur ${inv.invoiceNumber})`,
          reference: inv.invoiceNumber,
          sourceType: 'invoice',
          sourceId: inv.id,
          lines,
          createdBy: currentUser.employeeId,
          createdAt: inv.createdAt || new Date().toISOString(),
        };
      });

    setJournalEntries(entries);
  }, [invoices, ledgerAccounts, currentUser.employeeId]);

  // BTW Rapport berekenen (voor huidige periode)
  useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // Filter facturen voor huidige maand
    const periodInvoices = invoices.filter(inv => {
      if (!inv.date) return false;
      const invDate = new Date(inv.date);
      return invDate >= new Date(startDate) && invDate <= new Date(endDate) && 
             (inv.status === 'sent' || inv.status === 'paid');
    });

    let revenue21 = 0;
    let revenue9 = 0;
    let revenue0 = 0;
    let vat21 = 0;
    let vat9 = 0;

    periodInvoices.forEach(inv => {
      const vatRate = inv.vatRate || 21;
      if (vatRate === 21) {
        revenue21 += inv.subtotal;
        vat21 += inv.vatAmount;
      } else if (vatRate === 9) {
        revenue9 += inv.subtotal;
        vat9 += inv.vatAmount;
      } else {
        revenue0 += inv.subtotal;
      }
    });

    const totalVatToPay = vat21 + vat9; // TODO: Voorbelasting aftrekken

    const report: VATReport = {
      id: `vat-${currentYear}-${currentMonth}`,
      period: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
      periodType: 'month',
      startDate,
      endDate,
      revenue21,
      vat21,
      revenue9,
      vat9,
      revenue0,
      vat0: 0,
      purchaseVat21: 0, // TODO: Berekenen vanuit inkoopfacturen
      purchaseVat9: 0,
      totalPurchaseVat: 0,
      totalVatToPay,
      createdAt: new Date().toISOString(),
    };

    setVatReports([report]);
  }, [invoices]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral mb-2">
        Boekhouding & Dossier
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6">
        Volledig digitaal boekhouddossier - grootboek, BTW-aangifte, journaal en klantdossiers
      </p>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap gap-2 -mb-px">
          {hasAccess && (
            <>
              <button
                onClick={() => setActiveTab('grootboek')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'grootboek'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Grootboek
              </button>
              <button
                onClick={() => setActiveTab('facturen')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'facturen'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📄 Factuur Archief
              </button>
              <button
                onClick={() => setActiveTab('btw')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'btw'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🧾 BTW-Overzicht
              </button>
              <button
                onClick={() => setActiveTab('journaal')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'journaal'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📝 Journaal
              </button>
            </>
          )}
          {hasDossierAccess && (
            <button
              onClick={() => setActiveTab('dossiers')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dossiers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📁 Dossiers
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'grootboek' && hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Grootboekrekeningen</h2>
              <button
                onClick={() => {
                  // Export naar CSV
                  const csv = [
                    ['Rekening', 'Naam', 'Type', 'Categorie'],
                    ...ledgerAccounts.map(acc => [
                      acc.accountNumber,
                      acc.name,
                      acc.type,
                      acc.category,
                    ]),
                  ].map(row => row.join(',')).join('\n');
                  
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `grootboek-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm"
              >
                📥 Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rekening</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorie</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Omschrijving</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ledgerAccounts.map(account => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{account.accountNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{account.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{account.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{account.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{account.description || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'facturen' && hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Factuur & Pakbon Archief</h2>
            <div className="mb-4 flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Zoek op nummer, klant, datum..."
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">Alle statussen</option>
                <option value="paid">Betaald</option>
                <option value="outstanding">Openstaand</option>
                <option value="overdue">Vervallen</option>
              </select>
            </div>
            <div className="space-y-2">
              {invoiceArchive.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Geen facturen in archief</p>
              ) : (
                invoiceArchive.map(item => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      item.status === 'overdue' ? 'border-red-300 bg-red-50' :
                      item.status === 'paid' ? 'border-green-300 bg-green-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">Factuur {item.invoiceNumber}</h3>
                        <p className="text-sm text-gray-600">Klant: {item.customerName}</p>
                        <p className="text-sm text-gray-500">Datum: {new Date(item.date).toLocaleDateString('nl-NL')}</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">€{item.totalInclVat.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'paid' ? 'bg-green-100 text-green-800' :
                          item.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status === 'paid' ? 'BETAALD' : item.status === 'overdue' ? 'VERVALLEN' : 'OPENSTAAND'}
                        </span>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                            📄 PDF
                          </button>
                          {item.status !== 'paid' && (
                            <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">
                              📧 Herinnering
                            </button>
                          )}
                          {item.status === 'outstanding' && (
                            <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                              ✓ Betaald
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'btw' && hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">BTW-Overzicht</h2>
            <div className="mb-4 flex gap-2 flex-wrap">
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                {vatReports.map(report => (
                  <option key={report.id} value={report.period}>
                    {report.periodType === 'month' 
                      ? `${report.period.split('-')[0]} Maand ${report.period.split('-')[1]}`
                      : report.period}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => {
                  // Export naar XML (placeholder)
                  alert('XML export functionaliteit komt binnenkort beschikbaar');
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                📥 Export XML
              </button>
              <button 
                onClick={() => {
                  // Print PDF (placeholder)
                  window.print();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                📄 Print PDF
              </button>
            </div>
            {vatReports.length > 0 ? (
              vatReports.map(report => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">
                    Periode: {report.periodType === 'month' 
                      ? `${report.period.split('-')[0]} Maand ${report.period.split('-')[1]}`
                      : report.period}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-2">
                      <span>Omzet 21%:</span>
                      <span className="font-semibold">€{report.revenue21.toFixed(2)} → BTW €{report.vat21.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Omzet 9%:</span>
                      <span className="font-semibold">€{report.revenue9.toFixed(2)} → BTW €{report.vat9.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span>Omzet 0%:</span>
                      <span className="font-semibold">€{report.revenue0.toFixed(2)} → BTW €{report.vat0.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-gray-400">
                      <span className="font-semibold">Totaal af te dragen:</span>
                      <span className="font-bold text-lg">€{(report.vat21 + report.vat9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span>Voorbelasting (inkoop):</span>
                      <span className="font-semibold">€{report.totalPurchaseVat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t-2 border-primary">
                      <span className="font-bold text-lg">Te betalen:</span>
                      <span className="font-bold text-xl text-primary">€{report.totalVatToPay.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                <p>Geen BTW-gegevens beschikbaar voor deze periode</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'journaal' && hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transactieregistratie (Journaal)</h2>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
                + Handmatig Toevoegen
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Zoek op omschrijving, referentie..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            {journalEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Geen journaalposten gevonden</p>
                <p className="text-sm mt-2">Journaalposten worden automatisch aangemaakt vanuit POS/Pakbon/Facturen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {journalEntries.map(entry => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{entry.entryNumber}</span>
                      <span className="text-sm text-gray-500">{entry.date ? new Date(entry.date).toLocaleDateString('nl-NL') : '-'}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{entry.description}</p>
                    <div className="bg-gray-50 rounded p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1">Rekening</th>
                            <th className="text-right py-1">Debet</th>
                            <th className="text-right py-1">Credit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.lines.map(line => (
                            <tr key={line.id} className="border-b">
                              <td className="py-1">{line.accountNumber} {line.accountName}</td>
                              <td className="text-right py-1">{line.debit > 0 ? `€${line.debit.toFixed(2)}` : '-'}</td>
                              <td className="text-right py-1">{line.credit > 0 ? `€${line.credit.toFixed(2)}` : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dossiers' && hasDossierAccess && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Klant- & Leveranciersdossiers</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Zoek klant of leverancier..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="space-y-4">
              {customerDossiers.length === 0 && supplierDossiers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Geen dossiers gevonden</p>
              ) : (
                <>
                  {customerDossiers.map(dossier => (
                    <div key={dossier.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{dossier.customerName}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Adres: {dossier.address || '-'}</p>
                          <p className="text-sm text-gray-600">KvK: {dossier.kvkNumber || '-'}</p>
                          <p className="text-sm text-gray-600">BTW: {dossier.vatNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-600">Openstaand: €{dossier.outstandingBalance.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Credit-limiet: €{dossier.creditLimit?.toFixed(2) || '-'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Facturen</button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Pakbonnen</button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Offertes</button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">Notities</button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookkeeping;

