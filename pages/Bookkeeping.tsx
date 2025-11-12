import React, { useState, useMemo } from 'react';
import { 
  LedgerAccount, 
  JournalEntry, 
  VATReport, 
  CustomerDossier, 
  SupplierDossier,
  InvoiceArchiveItem,
  Invoice,
  Quote,
  QuoteItem,
  QuoteLabor,
  PackingSlip,
  Customer,
  Supplier,
  Employee,
  User
} from '../types';

interface BookkeepingProps {
  invoices: Invoice[];
  setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>;
  quotes?: Quote[];
  setQuotes?: React.Dispatch<React.SetStateAction<Quote[]>>;
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

const BookkeepingComponent: React.FC<BookkeepingProps> = ({
  invoices,
  setInvoices,
  quotes = [],
  setQuotes,
  customers,
  suppliers = [],
  employees,
  currentUser,
  isAdmin,
  packingSlips = [],
}) => {
  const [activeTab, setActiveTab] = useState<'grootboek' | 'facturen' | 'kassa' | 'btw' | 'dossiers' | 'journaal'>('grootboek');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetailModal, setShowInvoiceDetailModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneType, setCloneType] = useState<'invoice' | 'quote'>('invoice');
  const [cloneFormData, setCloneFormData] = useState<Partial<Invoice>>({});
  const [kassaView, setKassaView] = useState<'list' | 'overview'>('list'); // list = facturen lijst, overview = financieel overzicht
  const [kassaPeriodFilter, setKassaPeriodFilter] = useState<'today' | 'week' | 'quarter' | 'year' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [facturenView, setFacturenView] = useState<'list' | 'overview'>('list'); // list = facturen lijst, overview = financieel overzicht
  const [facturenPeriodFilter, setFacturenPeriodFilter] = useState<'today' | 'week' | 'quarter' | 'year' | 'all' | 'custom'>('all');
  const [facturenCustomStartDate, setFacturenCustomStartDate] = useState<string>('');
  const [facturenCustomEndDate, setFacturenCustomEndDate] = useState<string>('');
  const [facturenCustomerFilter, setFacturenCustomerFilter] = useState<string>(''); // Filter op klant naam
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
      date: inv.issueDate || new Date().toISOString().split('T')[0],
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

  // Filter kassa verkopen (facturen met "Kassa verkoop" in notes of customerName "Particulier (Kassa)")
  const posInvoices = useMemo(() => {
    return invoices.filter(inv => 
      (inv.notes && inv.notes.includes('Kassa verkoop')) || 
      inv.customerName === 'Particulier (Kassa)'
    );
  }, [invoices]);

  // Helper: Get payment method from invoice notes
  const getPaymentMethod = (notes?: string): string => {
    if (!notes) return 'Onbekend';
    if (notes.includes('cash')) return '💵 Contant';
    if (notes.includes('pin')) return '💳 PIN';
    if (notes.includes('ideal')) return '🏦 iDEAL';
    if (notes.includes('credit')) return '💳 Creditcard';
    return 'Onbekend';
  };

  // Helper: Get date range for period filter
  const getDateRange = (period: 'today' | 'week' | 'quarter' | 'year' | 'all' | 'custom', startDate?: string, endDate?: string): { start: string; end: string } => {
    // Get today's date in local timezone (not UTC)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Format as YYYY-MM-DD in local timezone
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    if (period === 'today') {
      const todayStr = formatDate(today);
      return { start: todayStr, end: todayStr };
    }
    
    if (period === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (zondag)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (zaterdag)
      return {
        start: formatDate(weekStart),
        end: formatDate(weekEnd)
      };
    }
    
    if (period === 'quarter') {
      const quarter = Math.floor(today.getMonth() / 3);
      const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
      const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);
      return {
        start: formatDate(quarterStart),
        end: formatDate(quarterEnd)
      };
    }
    
    if (period === 'year') {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      return {
        start: formatDate(yearStart),
        end: formatDate(yearEnd)
      };
    }
    
    if (period === 'all') {
      // Return a very wide date range (10 years in the past to 1 year in the future)
      const allStart = new Date(today.getFullYear() - 10, 0, 1);
      const allEnd = new Date(today.getFullYear() + 1, 11, 31);
      return {
        start: formatDate(allStart),
        end: formatDate(allEnd)
      };
    }
    
    // Custom period
    if (period === 'custom' && startDate && endDate) {
      return { start: startDate, end: endDate };
    }
    
    // Default to today if custom dates not set
    const todayStr = formatDate(today);
    return { start: todayStr, end: todayStr };
  };

  // Extract all items from POS invoices for financial overview
  interface POSItemRow {
    id: string;
    date: string;
    invoiceNumber: string;
    invoiceId: string;
    customerName: string;
    paymentMethod: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
    vatRate: number;
    vatAmount: number;
    unit?: string;
  }

  // Extract all items from invoices for financial overview
  interface FactuurItemRow {
    id: string;
    date: string;
    invoiceNumber: string;
    invoiceId: string;
    customerName: string;
    status: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
    total: number;
    vatRate: number;
    vatAmount: number;
    unit?: string;
  }

  const posItemRows = useMemo(() => {
    const { start, end } = getDateRange(kassaPeriodFilter, customStartDate, customEndDate);
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    
    const filteredInvoices = posInvoices.filter(inv => {
      if (!inv.issueDate) return false;
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });

    const rows: POSItemRow[] = [];
    
    filteredInvoices.forEach(inv => {
      const paymentMethod = getPaymentMethod(inv.notes);
      const vatRate = inv.vatRate || 21;
      
      inv.items.forEach((item, idx) => {
        // Calculate VAT for this item (proportional)
        const itemVatAmount = (item.total * vatRate) / (100 + vatRate);
        const itemPriceExclVat = item.total - itemVatAmount;
        
        rows.push({
          id: `${inv.id}-item-${idx}`,
          date: inv.issueDate || '',
          invoiceNumber: inv.invoiceNumber,
          invoiceId: inv.id,
          customerName: inv.customerName || 'Particulier (Kassa)',
          paymentMethod,
          productName: item.description,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          total: item.total,
          vatRate,
          vatAmount: itemVatAmount,
        });
      });
    });
    
    // Sort by date (newest first)
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [posInvoices, kassaPeriodFilter, customStartDate, customEndDate]);

  // Calculate totals for overview
  const overviewTotals = useMemo(() => {
    const totalItems = posItemRows.length;
    const totalQuantity = posItemRows.reduce((sum, row) => sum + row.quantity, 0);
    const totalRevenue = posItemRows.reduce((sum, row) => sum + row.total, 0);
    const totalVat = posItemRows.reduce((sum, row) => sum + row.vatAmount, 0);
    const totalExclVat = totalRevenue - totalVat;
    const uniqueInvoices = new Set(posItemRows.map(row => row.invoiceId)).size;
    const uniqueProducts = new Set(posItemRows.map(row => row.productName)).size;
    
    // Calculate totals per payment method
    const pinRevenue = posItemRows
      .filter(row => row.paymentMethod.includes('PIN'))
      .reduce((sum, row) => sum + row.total, 0);
    
    const cashRevenue = posItemRows
      .filter(row => row.paymentMethod.includes('Contant'))
      .reduce((sum, row) => sum + row.total, 0);
    
    const idealRevenue = posItemRows
      .filter(row => row.paymentMethod.includes('iDEAL'))
      .reduce((sum, row) => sum + row.total, 0);
    
    const creditRevenue = posItemRows
      .filter(row => row.paymentMethod.includes('Creditcard'))
      .reduce((sum, row) => sum + row.total, 0);
    
    return {
      totalItems,
      totalQuantity,
      totalRevenue,
      totalVat,
      totalExclVat,
      uniqueInvoices,
      uniqueProducts,
      pinRevenue,
      cashRevenue,
      idealRevenue,
      creditRevenue,
    };
  }, [posItemRows]);

  // Extract all items from invoices for financial overview (excludes POS invoices)
  const facturenItemRows = useMemo(() => {
    const { start, end } = getDateRange(facturenPeriodFilter, facturenCustomStartDate, facturenCustomEndDate);
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    
    // Filter out POS invoices (they are shown in Kassa Verkopen tab)
    const regularInvoices = invoices.filter(inv => {
      if (!inv.issueDate) return false;
      const invDate = new Date(inv.issueDate);
      if (invDate < startDate || invDate > endDate) return false;
      
      // Exclude POS invoices
      if (inv.notes?.includes('Kassa verkoop') || inv.customerName === 'Particulier (Kassa)') {
        return false;
      }
      
      // Filter on customer name if specified
      if (facturenCustomerFilter && facturenCustomerFilter.trim() !== '') {
        const customerName = inv.customerName || '';
        if (!customerName.toLowerCase().includes(facturenCustomerFilter.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });

    const rows: FactuurItemRow[] = [];
    
    regularInvoices.forEach(inv => {
      // Skip invoices without items
      if (!inv.items || inv.items.length === 0) {
        return;
      }
      
      const vatRate = inv.vatRate || 21;
      
      inv.items.forEach((item, idx) => {
        // Calculate VAT for this item (proportional)
        const itemVatAmount = (item.total * vatRate) / (100 + vatRate);
        
        rows.push({
          id: `${inv.id}-item-${idx}`,
          date: inv.issueDate || '',
          invoiceNumber: inv.invoiceNumber,
          invoiceId: inv.id,
          customerName: inv.customerName || 'Onbekend',
          status: inv.status,
          productName: item.description,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          total: item.total,
          vatRate,
          vatAmount: itemVatAmount,
        });
      });
    });
    
    // Sort by date (newest first)
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, facturenPeriodFilter, facturenCustomStartDate, facturenCustomEndDate, facturenCustomerFilter]);

  // Calculate totals for facturen overview
  const facturenOverviewTotals = useMemo(() => {
    const totalItems = facturenItemRows.length;
    const totalQuantity = facturenItemRows.reduce((sum, row) => sum + row.quantity, 0);
    const totalRevenue = facturenItemRows.reduce((sum, row) => sum + row.total, 0);
    const totalVat = facturenItemRows.reduce((sum, row) => sum + row.vatAmount, 0);
    const totalExclVat = totalRevenue - totalVat;
    const uniqueInvoices = new Set(facturenItemRows.map(row => row.invoiceId)).size;
    const uniqueProducts = new Set(facturenItemRows.map(row => row.productName)).size;
    const uniqueCustomers = new Set(facturenItemRows.map(row => row.customerName)).size;
    
    // Calculate totals per status
    const paidRevenue = facturenItemRows
      .filter(row => row.status === 'paid')
      .reduce((sum, row) => sum + row.total, 0);
    
    const outstandingRevenue = facturenItemRows
      .filter(row => row.status === 'sent' || row.status === 'outstanding')
      .reduce((sum, row) => sum + row.total, 0);
    
    const overdueRevenue = facturenItemRows
      .filter(row => row.status === 'overdue')
      .reduce((sum, row) => sum + row.total, 0);
    
    const draftRevenue = facturenItemRows
      .filter(row => row.status === 'draft')
      .reduce((sum, row) => sum + row.total, 0);
    
    return {
      totalItems,
      totalQuantity,
      totalRevenue,
      totalVat,
      totalExclVat,
      uniqueInvoices,
      uniqueProducts,
      uniqueCustomers,
      paidRevenue,
      outstandingRevenue,
      overdueRevenue,
      draftRevenue,
    };
  }, [facturenItemRows]);

  // Helper functies
  const getCustomerName = (customerId?: string) => {
    if (!customerId || customerId === 'guest') return 'Particulier (Kassa)';
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Onbekend';
  };

  // Open invoice detail modal
  const openInvoiceDetail = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setShowInvoiceDetailModal(true);
    }
  };

  // Clone invoice to new invoice
  const handleCloneToInvoice = () => {
    if (!selectedInvoice || !setInvoices) return;
    
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    
    // Generate new invoice number
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .filter(inv => inv.invoiceNumber.startsWith(`${year}-`))
      .map(inv => parseInt(inv.invoiceNumber.split('-')[1]))
      .filter(n => !isNaN(n));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const invoiceNumber = `${year}-${String(nextNumber).padStart(3, '0')}`;
    
    const newInvoice: Invoice = {
      ...selectedInvoice,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      status: 'draft',
      issueDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
      paidDate: undefined,
      notes: `Gekloond van factuur ${selectedInvoice.invoiceNumber}`,
      history: [],
      timestamps: {
        created: new Date().toISOString(),
      },
    };
    
    setInvoices(prev => [...prev, newInvoice]);
    setShowInvoiceDetailModal(false);
    setShowCloneModal(false);
    alert(`✅ Factuur ${invoiceNumber} succesvol aangemaakt als kopie van ${selectedInvoice.invoiceNumber}`);
  };

  // Clone invoice to quote
  const handleCloneToQuote = () => {
    if (!selectedInvoice || !setQuotes) return;
    
    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    
    // Generate new quote number
    const existingNumbers = quotes
      .map(q => q.id.replace('Q', ''))
      .map(id => parseInt(id))
      .filter(n => !isNaN(n));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const quoteId = `Q${nextNumber}`;
    
    const newQuote: Quote = {
      id: quoteId,
      customerId: selectedInvoice.customerId,
      items: selectedInvoice.items,
      labor: selectedInvoice.labor,
      subtotal: selectedInvoice.subtotal,
      vatRate: selectedInvoice.vatRate,
      vatAmount: selectedInvoice.vatAmount,
      total: selectedInvoice.total,
      status: 'draft',
      createdDate: today,
      validUntil: validUntil.toISOString().split('T')[0],
      notes: `Gekloond van factuur ${selectedInvoice.invoiceNumber}`,
      createdBy: currentUser.employeeId,
      history: [],
    };
    
    setQuotes(prev => [...prev, newQuote]);
    setShowInvoiceDetailModal(false);
    setShowCloneModal(false);
    alert(`✅ Offerte ${quoteId} succesvol aangemaakt als kopie van factuur ${selectedInvoice.invoiceNumber}`);
  };

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

            const invoiceDate = inv.issueDate || new Date().toISOString().split('T')[0];
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
    // BTW-regels: BTW wordt afgedragen op basis van factuurdatum (verzenddatum), niet betaaldatum
    // Daarom meenemen: 'sent' (verzonden) EN 'paid' (betaald) facturen
    // Draft facturen worden NIET meegenomen (nog niet verzonden)
    const periodInvoices = invoices.filter(inv => {
      if (!inv.issueDate) return false;
      const invDate = new Date(inv.issueDate);
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
                onClick={() => setActiveTab('kassa')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'kassa'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🛒 Kassa Verkopen
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📄 Factuur & Pakbon Archief</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFacturenView('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    facturenView === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📄 Facturen Lijst
                </button>
                <button
                  onClick={() => setFacturenView('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    facturenView === 'overview'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Financieel Overzicht
                </button>
              </div>
            </div>

            {facturenView === 'list' ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Overzicht van alle facturen en pakbonnen (exclusief kassa verkopen)
                </p>
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
                        onClick={() => openInvoiceDetail(item.invoiceId)}
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                          item.status === 'overdue' ? 'border-red-300 bg-red-50' :
                          item.status === 'paid' ? 'border-green-300 bg-green-50' :
                          'border-gray-200 bg-white'
                        }`}
                        title="Klik om details te zien"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">Factuur {item.invoiceNumber}</h3>
                            <p className="text-sm text-gray-600">Klant: {item.customerName}</p>
                            <p className="text-sm text-gray-500">Datum: {item.date ? new Date(item.date).toLocaleDateString('nl-NL') : '-'}</p>
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
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // PDF placeholder
                                }}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                              >
                                📄 PDF
                              </button>
                              {item.status !== 'paid' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Herinnering placeholder
                                  }}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                                >
                                  📧 Herinnering
                                </button>
                              )}
                              {item.status === 'outstanding' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (setInvoices) {
                                      const invoice = invoices.find(inv => inv.id === item.invoiceId);
                                      if (invoice) {
                                        const updatedInvoice: Invoice = {
                                          ...invoice,
                                          status: 'paid',
                                          paidDate: new Date().toISOString().split('T')[0],
                                          history: [
                                            ...(invoice.history || []),
                                            {
                                              timestamp: new Date().toISOString(),
                                              action: 'paid',
                                              performedBy: currentUser.employeeId,
                                              details: `Factuur gemarkeerd als betaald`,
                                              fromStatus: invoice.status,
                                              toStatus: 'paid',
                                            },
                                          ],
                                        };
                                        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
                                        alert(`✅ Factuur ${item.invoiceNumber} gemarkeerd als betaald`);
                                      }
                                    }
                                  }}
                                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                                >
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
              </>
            ) : (
              <>
                {/* Period Filter and Customer Filter */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Periode Filter</label>
                      <select
                        value={facturenPeriodFilter}
                        onChange={(e) => {
                          setFacturenPeriodFilter(e.target.value as any);
                          if (e.target.value !== 'custom') {
                            setFacturenCustomStartDate('');
                            setFacturenCustomEndDate('');
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">📅 Alle Facturen</option>
                        <option value="today">📅 Vandaag</option>
                        <option value="week">📅 Deze Week</option>
                        <option value="quarter">📅 Dit Kwartaal</option>
                        <option value="year">📅 Dit Jaar</option>
                        <option value="custom">📅 Aangepaste Periode</option>
                      </select>
                    </div>
                    {facturenPeriodFilter === 'custom' && (
                      <>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Vanaf</label>
                          <input
                            type="date"
                            value={facturenCustomStartDate}
                            onChange={(e) => setFacturenCustomStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tot</label>
                          <input
                            type="date"
                            value={facturenCustomEndDate}
                            onChange={(e) => setFacturenCustomEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter op Klant</label>
                      <input
                        type="text"
                        placeholder="Zoek op klantnaam..."
                        value={facturenCustomerFilter}
                        onChange={(e) => setFacturenCustomerFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {(() => {
                          const { start, end } = getDateRange(facturenPeriodFilter, facturenCustomStartDate, facturenCustomEndDate);
                          if (start === end) {
                            return `Periode: ${new Date(start).toLocaleDateString('nl-NL')}`;
                          }
                          return `Periode: ${new Date(start).toLocaleDateString('nl-NL')} - ${new Date(end).toLocaleDateString('nl-NL')}`;
                        })()}
                      </span>
                      {facturenItemRows.length > 0 && (
                        <button
                          onClick={() => {
                            const { start, end } = getDateRange(facturenPeriodFilter, facturenCustomStartDate, facturenCustomEndDate);
                            const periodLabel = facturenPeriodFilter === 'all' ? 'alle' :
                                             facturenPeriodFilter === 'today' ? 'vandaag' :
                                             facturenPeriodFilter === 'week' ? 'deze-week' :
                                             facturenPeriodFilter === 'quarter' ? 'dit-kwartaal' :
                                             facturenPeriodFilter === 'year' ? 'dit-jaar' :
                                             `custom-${start}-${end}`;
                            
                            const csv = [
                              ['Datum', 'Factuur', 'Klant', 'Status', 'Product', 'Aantal', 'Prijs per stuk', 'BTW %', 'BTW bedrag', 'Totaal (incl. BTW)'],
                              ...facturenItemRows.map(row => [
                                row.date ? new Date(row.date).toLocaleDateString('nl-NL') : '',
                                row.invoiceNumber,
                                row.customerName,
                                row.status === 'paid' ? 'Betaald' : row.status === 'overdue' ? 'Vervallen' : row.status === 'sent' ? 'Verzonden' : 'Draft',
                                row.productName,
                                row.quantity.toString(),
                                `€${row.pricePerUnit.toFixed(2)}`,
                                `${row.vatRate}%`,
                                `€${row.vatAmount.toFixed(2)}`,
                                `€${row.total.toFixed(2)}`
                              ]),
                              [], // Empty row
                              ['TOTAAL', '', '', '', '', facturenOverviewTotals.totalQuantity.toString(), '', '', `€${facturenOverviewTotals.totalVat.toFixed(2)}`, `€${facturenOverviewTotals.totalRevenue.toFixed(2)}`]
                            ].map(row => row.join(',')).join('\n');
                            
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `facturen-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
                        >
                          📥 Export CSV
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4 mb-6">
                  {/* First row: General totals */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Totaal Items</p>
                      <p className="text-2xl font-bold text-blue-900">{facturenOverviewTotals.totalItems}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-green-600 font-medium mb-1">Totaal Aantal</p>
                      <p className="text-2xl font-bold text-green-900">{facturenOverviewTotals.totalQuantity}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs text-purple-600 font-medium mb-1">Omzet (incl. BTW)</p>
                      <p className="text-2xl font-bold text-purple-900">€{facturenOverviewTotals.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <p className="text-xs text-orange-600 font-medium mb-1">BTW Totaal</p>
                      <p className="text-2xl font-bold text-orange-900">€{facturenOverviewTotals.totalVat.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Second row: Status totals */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-green-600 font-medium mb-1">✅ Betaald Omzet</p>
                      <p className="text-2xl font-bold text-green-900">€{facturenOverviewTotals.paidRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-xs text-yellow-600 font-medium mb-1">⏳ Openstaand Omzet</p>
                      <p className="text-2xl font-bold text-yellow-900">€{facturenOverviewTotals.outstandingRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-xs text-red-600 font-medium mb-1">⚠️ Vervallen Omzet</p>
                      <p className="text-2xl font-bold text-red-900">€{facturenOverviewTotals.overdueRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-600 font-medium mb-1">📝 Draft Omzet</p>
                      <p className="text-2xl font-bold text-gray-900">€{facturenOverviewTotals.draftRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Excel-like Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Datum</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Factuur</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Klant</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Status</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Product</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Aantal</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Prijs per stuk</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">BTW %</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">BTW bedrag</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase">Totaal (incl. BTW)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {facturenItemRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                              Geen facturen gevonden voor de geselecteerde periode en filters
                            </td>
                          </tr>
                        ) : (
                          <>
                            {facturenItemRows.map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-100 whitespace-nowrap">
                                  {row.date ? new Date(row.date).toLocaleDateString('nl-NL') : '-'}
                                </td>
                                <td className="px-3 py-3 text-sm font-medium text-gray-900 border-r border-gray-100 whitespace-nowrap">
                                  {row.invoiceNumber}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-100">
                                  {row.customerName}
                                </td>
                                <td className="px-3 py-3 text-sm border-r border-gray-100 whitespace-nowrap">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    row.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    row.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                    row.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {row.status === 'paid' ? 'Betaald' : row.status === 'overdue' ? 'Vervallen' : row.status === 'sent' ? 'Verzonden' : 'Draft'}
                                  </span>
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-100 font-medium">
                                  {row.productName}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  {row.quantity}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  €{row.pricePerUnit.toFixed(2)}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  {row.vatRate}%
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  €{row.vatAmount.toFixed(2)}
                                </td>
                                <td className="px-3 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                                  €{row.total.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                              <td colSpan={5} className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                                TOTAAL
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-200">
                                {facturenOverviewTotals.totalQuantity}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-500 text-right border-r border-gray-200">
                                -
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-500 text-right border-r border-gray-200">
                                -
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-200">
                                €{facturenOverviewTotals.totalVat.toFixed(2)}
                              </td>
                              <td className="px-3 py-3 text-sm text-primary text-right font-bold">
                                €{facturenOverviewTotals.totalRevenue.toFixed(2)}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Stats */}
                {facturenItemRows.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Unieke Facturen</p>
                      <p className="text-xl font-bold text-gray-900">{facturenOverviewTotals.uniqueInvoices}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Unieke Producten</p>
                      <p className="text-xl font-bold text-gray-900">{facturenOverviewTotals.uniqueProducts}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Unieke Klanten</p>
                      <p className="text-xl font-bold text-gray-900">{facturenOverviewTotals.uniqueCustomers}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'kassa' && hasAccess && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">🛒 Kassa Verkopen</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setKassaView('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    kassaView === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📄 Facturen Lijst
                </button>
                <button
                  onClick={() => setKassaView('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    kassaView === 'overview'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Financieel Overzicht
                </button>
              </div>
            </div>

            {kassaView === 'list' ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Overzicht van alle verkopen via het kassasysteem (direct betaald)
                </p>
                <div className="space-y-2">
                  {posInvoices.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Geen kassa verkopen gevonden</p>
                  ) : (
                    posInvoices.map(invoice => (
                      <div
                        key={invoice.id}
                        onClick={() => openInvoiceDetail(invoice.id)}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-green-50 border-green-200"
                        title="Klik om details te zien"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">Factuur {invoice.invoiceNumber}</h3>
                            <p className="text-sm text-gray-600">Klant: {invoice.customerName || 'Particulier (Kassa)'}</p>
                            <p className="text-sm text-gray-500">Datum: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('nl-NL') : '-'}</p>
                            <p className="text-sm text-gray-500">Betaalmethode: {getPaymentMethod(invoice.notes)}</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">€{invoice.total.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✅ BETAALD
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Period Filter */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Periode Filter</label>
                      <select
                        value={kassaPeriodFilter}
                        onChange={(e) => {
                          setKassaPeriodFilter(e.target.value as any);
                          if (e.target.value !== 'custom') {
                            setCustomStartDate('');
                            setCustomEndDate('');
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="today">📅 Vandaag</option>
                        <option value="week">📅 Deze Week</option>
                        <option value="quarter">📅 Dit Kwartaal</option>
                        <option value="year">📅 Dit Jaar</option>
                        <option value="custom">📅 Aangepaste Periode</option>
                      </select>
                    </div>
                    {kassaPeriodFilter === 'custom' && (
                      <>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Vanaf</label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tot</label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {(() => {
                          const { start, end } = getDateRange(kassaPeriodFilter, customStartDate, customEndDate);
                          if (start === end) {
                            return `Periode: ${new Date(start).toLocaleDateString('nl-NL')}`;
                          }
                          return `Periode: ${new Date(start).toLocaleDateString('nl-NL')} - ${new Date(end).toLocaleDateString('nl-NL')}`;
                        })()}
                      </span>
                      {posItemRows.length > 0 && (
                        <button
                          onClick={() => {
                            const { start, end } = getDateRange(kassaPeriodFilter, customStartDate, customEndDate);
                            const periodLabel = kassaPeriodFilter === 'today' ? 'vandaag' :
                                               kassaPeriodFilter === 'week' ? 'deze-week' :
                                               kassaPeriodFilter === 'quarter' ? 'dit-kwartaal' :
                                               kassaPeriodFilter === 'year' ? 'dit-jaar' :
                                               `custom-${start}-${end}`;
                            
                            const csv = [
                              ['Datum', 'Factuur', 'Klant', 'Betaalmethode', 'Product', 'Aantal', 'Prijs per stuk', 'BTW %', 'BTW bedrag', 'Totaal (incl. BTW)'],
                              ...posItemRows.map(row => [
                                row.date ? new Date(row.date).toLocaleDateString('nl-NL') : '',
                                row.invoiceNumber,
                                row.customerName,
                                row.paymentMethod.replace(/[💵💳🏦]/g, '').trim(), // Remove emojis for CSV
                                row.productName,
                                row.quantity.toString(),
                                `€${row.pricePerUnit.toFixed(2)}`,
                                `${row.vatRate}%`,
                                `€${row.vatAmount.toFixed(2)}`,
                                `€${row.total.toFixed(2)}`
                              ]),
                              [], // Empty row
                              ['TOTAAL', '', '', '', '', overviewTotals.totalQuantity.toString(), '', '', `€${overviewTotals.totalVat.toFixed(2)}`, `€${overviewTotals.totalRevenue.toFixed(2)}`]
                            ].map(row => row.join(',')).join('\n');
                            
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `kassa-verkopen-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
                        >
                          📥 Export CSV
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="space-y-4 mb-6">
                  {/* First row: General totals */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Totaal Items</p>
                      <p className="text-2xl font-bold text-blue-900">{overviewTotals.totalItems}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-green-600 font-medium mb-1">Totaal Aantal</p>
                      <p className="text-2xl font-bold text-green-900">{overviewTotals.totalQuantity}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs text-purple-600 font-medium mb-1">Omzet (incl. BTW)</p>
                      <p className="text-2xl font-bold text-purple-900">€{overviewTotals.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <p className="text-xs text-orange-600 font-medium mb-1">BTW Totaal</p>
                      <p className="text-2xl font-bold text-orange-900">€{overviewTotals.totalVat.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Second row: Payment method totals */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                      <p className="text-xs text-cyan-600 font-medium mb-1">💳 PIN Omzet</p>
                      <p className="text-2xl font-bold text-cyan-900">€{overviewTotals.pinRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-xs text-yellow-600 font-medium mb-1">💵 Contant Omzet</p>
                      <p className="text-2xl font-bold text-yellow-900">€{overviewTotals.cashRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-medium mb-1">🏦 iDEAL Omzet</p>
                      <p className="text-2xl font-bold text-indigo-900">€{overviewTotals.idealRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                      <p className="text-xs text-pink-600 font-medium mb-1">💳 Creditcard Omzet</p>
                      <p className="text-2xl font-bold text-pink-900">€{overviewTotals.creditRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Excel-like Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Datum</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Factuur</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Klant</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Betaalmethode</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Product</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Aantal</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">Prijs per stuk</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">BTW %</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase border-r border-gray-200">BTW bedrag</th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-700 uppercase">Totaal (incl. BTW)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {posItemRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                              Geen kassa verkopen gevonden voor de geselecteerde periode
                            </td>
                          </tr>
                        ) : (
                          <>
                            {posItemRows.map((row) => (
                              <tr key={row.id} className="hover:bg-gray-50">
                                <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-100 whitespace-nowrap">
                                  {row.date ? new Date(row.date).toLocaleDateString('nl-NL') : '-'}
                                </td>
                                <td className="px-3 py-3 text-sm font-medium text-gray-900 border-r border-gray-100 whitespace-nowrap">
                                  {row.invoiceNumber}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-100">
                                  {row.customerName}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-100 whitespace-nowrap">
                                  {row.paymentMethod}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-100 font-medium">
                                  {row.productName}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  {row.quantity}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  €{row.pricePerUnit.toFixed(2)}
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  {row.vatRate}%
                                </td>
                                <td className="px-3 py-3 text-sm text-gray-700 text-right border-r border-gray-100 whitespace-nowrap">
                                  €{row.vatAmount.toFixed(2)}
                                </td>
                                <td className="px-3 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                                  €{row.total.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                              <td colSpan={5} className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                                TOTAAL
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-200">
                                {overviewTotals.totalQuantity}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-500 text-right border-r border-gray-200">
                                -
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-500 text-right border-r border-gray-200">
                                -
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-900 text-right border-r border-gray-200">
                                €{overviewTotals.totalVat.toFixed(2)}
                              </td>
                              <td className="px-3 py-3 text-sm text-primary text-right font-bold">
                                €{overviewTotals.totalRevenue.toFixed(2)}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Stats */}
                {posItemRows.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Unieke Facturen</p>
                      <p className="text-xl font-bold text-gray-900">{overviewTotals.uniqueInvoices}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Unieke Producten</p>
                      <p className="text-xl font-bold text-gray-900">{overviewTotals.uniqueProducts}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Omzet (excl. BTW)</p>
                      <p className="text-xl font-bold text-gray-900">€{overviewTotals.totalExclVat.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
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

      {/* Invoice Detail Modal (Read-only) */}
      {showInvoiceDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral">Factuur Details</h2>
                <button
                  onClick={() => {
                    setShowInvoiceDetailModal(false);
                    setSelectedInvoice(null);
                    setShowCloneModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Read-only Invoice Details */}
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Factuurnummer</p>
                      <p className="font-semibold text-lg">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        selectedInvoice.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedInvoice.status === 'paid' ? 'BETAALD' :
                         selectedInvoice.status === 'overdue' ? 'VERVALLEN' :
                         selectedInvoice.status === 'sent' ? 'VERZONDEN' : 'DRAFT'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Klant</p>
                      <p className="font-medium">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Factuurdatum</p>
                      <p className="font-medium">{selectedInvoice.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString('nl-NL') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vervaldatum</p>
                      <p className="font-medium">{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('nl-NL') : '-'}</p>
                    </div>
                    {selectedInvoice.paidDate && (
                      <div>
                        <p className="text-sm text-gray-600">Betaaldatum</p>
                        <p className="font-medium">{new Date(selectedInvoice.paidDate).toLocaleDateString('nl-NL')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Omschrijving</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Aantal</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Prijs per eenheid</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Totaal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right">€{item.pricePerUnit.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium">€{item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Labor (if any) */}
                {selectedInvoice.labor && selectedInvoice.labor.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Werkuren</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Omschrijving</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Uren</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Uurtarief</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Totaal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedInvoice.labor.map((labor, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{labor.description}</td>
                              <td className="px-4 py-3 text-sm text-right">{labor.hours}</td>
                              <td className="px-4 py-3 text-sm text-right">€{labor.hourlyRate.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm text-right font-medium">€{labor.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotaal (excl. BTW)</span>
                    <span className="font-medium">€{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">BTW ({selectedInvoice.vatRate}%)</span>
                    <span className="font-medium">€{selectedInvoice.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-primary">
                    <span className="font-bold text-lg">Totaal (incl. BTW)</span>
                    <span className="font-bold text-xl text-primary">€{selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Notities</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>

              {/* Clone Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowCloneModal(true);
                    setCloneType('invoice');
                  }}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  📋 Klonen naar Factuur
                </button>
                {setQuotes && (
                  <button
                    onClick={() => {
                      setShowCloneModal(true);
                      setCloneType('quote');
                    }}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    📄 Klonen naar Offerte
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowInvoiceDetailModal(false);
                    setSelectedInvoice(null);
                    setShowCloneModal(false);
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clone Confirmation Modal */}
      {showCloneModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-neutral mb-4">
                {cloneType === 'invoice' ? 'Klonen naar Factuur' : 'Klonen naar Offerte'}
              </h3>
              <p className="text-gray-700 mb-6">
                Weet u zeker dat u factuur <strong>{selectedInvoice.invoiceNumber}</strong> wilt klonen naar een{' '}
                {cloneType === 'invoice' ? 'nieuwe factuur' : 'nieuwe offerte'}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (cloneType === 'invoice') {
                      handleCloneToInvoice();
                    } else {
                      handleCloneToQuote();
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  ✅ Bevestigen
                </button>
                <button
                  onClick={() => {
                    setShowCloneModal(false);
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Bookkeeping = React.memo(BookkeepingComponent);
export default Bookkeeping;

