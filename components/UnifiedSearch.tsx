import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Quote, Invoice, WorkOrder, Customer, ModuleKey } from '../types';

interface SearchResult {
  id: string;
  type: 'quote' | 'invoice' | 'workorder' | 'customer';
  title: string;
  subtitle: string;
  amount?: number;
  status?: string;
  date?: string;
  module: ModuleKey;
  onClick: () => void;
}

interface UnifiedSearchProps {
  quotes: Quote[];
  invoices: Invoice[];
  workOrders: WorkOrder[];
  customers: Customer[];
  onNavigate: (module: ModuleKey, id: string) => void;
  onClose?: () => void;
}

export const UnifiedSearch: React.FC<UnifiedSearchProps> = ({
  quotes,
  invoices,
  workOrders,
  customers,
  onNavigate,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search through all data
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search quotes
    quotes.forEach(quote => {
      const customerName = customers.find(c => c.id === quote.customerId)?.name || 'Onbekend';
      const matchId = quote.id.toLowerCase().includes(term);
      const matchCustomer = customerName.toLowerCase().includes(term);
      
      if (matchId || matchCustomer) {
        results.push({
          id: quote.id,
          type: 'quote',
          title: `Offerte ${quote.id}`,
          subtitle: customerName,
          amount: quote.total,
          status: quote.status,
          date: quote.createdDate,
          module: ModuleKey.ACCOUNTING,
          onClick: () => {
            onNavigate(ModuleKey.ACCOUNTING, quote.id);
            setIsOpen(false);
            setSearchTerm('');
            if (onClose) onClose();
          },
        });
      }
    });

    // Search invoices
    invoices.forEach(invoice => {
      const customer = customers.find(c => c.id === invoice.customerId);
      const customerName = customer?.name || customer?.company || 'Onbekend';
      const matchNumber = invoice.invoiceNumber.toLowerCase().includes(term);
      const matchCustomer = customerName.toLowerCase().includes(term);
      
      if (matchNumber || matchCustomer) {
        results.push({
          id: invoice.id,
          type: 'invoice',
          title: `Factuur ${invoice.invoiceNumber}`,
          subtitle: customerName,
          amount: invoice.total,
          status: invoice.status,
          date: invoice.issueDate,
          module: ModuleKey.ACCOUNTING,
          onClick: () => {
            onNavigate(ModuleKey.ACCOUNTING, invoice.id);
            setIsOpen(false);
            setSearchTerm('');
            if (onClose) onClose();
          },
        });
      }
    });

    // Search work orders
    workOrders.forEach(workOrder => {
      const customer = workOrder.customerId 
        ? customers.find(c => c.id === workOrder.customerId)
        : null;
      const customerName = customer?.name || customer?.company || 'Geen klant';
      const matchId = workOrder.id.toLowerCase().includes(term);
      const matchTitle = workOrder.title.toLowerCase().includes(term);
      const matchCustomer = customerName.toLowerCase().includes(term);
      
      if (matchId || matchTitle || matchCustomer) {
        results.push({
          id: workOrder.id,
          type: 'workorder',
          title: workOrder.title,
          subtitle: `${workOrder.id} • ${customerName}`,
          status: workOrder.status,
          date: workOrder.createdDate,
          module: ModuleKey.WORK_ORDERS,
          onClick: () => {
            onNavigate(ModuleKey.WORK_ORDERS, workOrder.id);
            setIsOpen(false);
            setSearchTerm('');
            if (onClose) onClose();
          },
        });
      }
    });

    // Search customers
    customers.forEach(customer => {
      const matchName = customer.name.toLowerCase().includes(term);
      const matchCompany = customer.company?.toLowerCase().includes(term);
      const matchEmail = customer.email?.toLowerCase().includes(term);
      
      if (matchName || matchCompany || matchEmail) {
        results.push({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: customer.company || customer.email || '',
          module: ModuleKey.CRM,
          onClick: () => {
            onNavigate(ModuleKey.CRM, customer.id);
            setIsOpen(false);
            setSearchTerm('');
            if (onClose) onClose();
          },
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [searchTerm, quotes, invoices, workOrders, customers, onNavigate, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
        e.preventDefault();
        searchResults[selectedIndex].onClick();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote': return '📋';
      case 'invoice': return '🧾';
      case 'workorder': return '📦';
      case 'customer': return '👤';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'invoice': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'workorder': return 'bg-green-50 border-green-200 text-green-700';
      case 'customer': return 'bg-gray-50 border-gray-200 text-gray-700';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'paid': case 'betaald': case 'voltooid': case 'completed': case 'approved': case 'geaccepteerd':
        return 'bg-green-100 text-green-800';
      case 'sent': case 'verzonden': case 'in uitvoering': case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue': case 'verlopen': case 'expired':
        return 'bg-red-100 text-red-800';
      case 'draft': case 'concept': case 'to do':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl mx-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="🔍 Zoek offerte, factuur, werkorder of klant..."
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {searchResults.length > 0 ? (
            <>
              <div className="p-2 border-b border-gray-200 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600">
                  {searchResults.length} resultaat{searchResults.length !== 1 ? 'en' : ''} gevonden
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {searchResults.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={result.onClick}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    } ${getTypeColor(result.type)}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{getTypeIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-neutral truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {result.subtitle}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {result.status && (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(result.status)}`}>
                                {result.status}
                              </span>
                            )}
                            {result.date && (
                              <span className="text-xs text-gray-500">
                                {result.date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {result.amount !== undefined && (
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm text-primary">
                            €{result.amount.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Gebruik ↑↓ om te navigeren, Enter om te selecteren, Esc om te sluiten
                </p>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Geen resultaten gevonden voor "{searchTerm}"</p>
              <p className="text-xs text-gray-400 mt-2">Probeer een andere zoekterm</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

