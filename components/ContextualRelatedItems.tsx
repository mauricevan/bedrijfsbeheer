import React from 'react';
import { Quote, Invoice, WorkOrder, Customer, ModuleKey } from '../types';

interface RelatedItem {
  id: string;
  type: 'quote' | 'invoice' | 'workorder';
  label: string;
  status?: string;
  amount?: number;
  date?: string;
  onClick: () => void;
}

interface ContextualRelatedItemsProps {
  title: string;
  items: RelatedItem[];
  onClose?: () => void;
}

export const ContextualRelatedItems: React.FC<ContextualRelatedItemsProps> = ({
  title,
  items,
  onClose,
}) => {
  if (items.length === 0) return null;

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'quote': return '📋';
      case 'invoice': return '🧾';
      case 'workorder': return '📦';
      default: return '📄';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'quote': return 'border-blue-500 bg-blue-50';
      case 'invoice': return 'border-purple-500 bg-purple-50';
      case 'workorder': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-primary">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-neutral flex items-center gap-2">
          <span>🔗</span>
          {title}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
            title="Sluiten"
          >
            ×
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`w-full text-left p-3 rounded-lg border-l-4 hover:shadow-md transition-all ${getItemColor(item.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-lg">{getItemIcon(item.type)}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-neutral">{item.label}</p>
                  {item.status && (
                    <span className="text-xs text-gray-600 mt-1 inline-block">
                      Status: {item.status}
                    </span>
                  )}
                  {item.date && (
                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                  )}
                </div>
              </div>
              {item.amount && (
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">€{item.amount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Helper function to get related items for a quote
 */
export function getRelatedItemsForQuote(
  quote: Quote,
  invoices: Invoice[],
  workOrders: WorkOrder[],
  onNavigate: (module: ModuleKey, id: string) => void
): RelatedItem[] {
  const items: RelatedItem[] = [];

  // Related work order
  if (quote.workOrderId) {
    const workOrder = workOrders.find(wo => wo.id === quote.workOrderId);
    if (workOrder) {
      items.push({
        id: workOrder.id,
        type: 'workorder',
        label: `Werkorder ${workOrder.id}`,
        status: workOrder.status,
        date: workOrder.createdDate,
        onClick: () => onNavigate(ModuleKey.WORK_ORDERS, workOrder.id),
      });
    }
  }

  // Related invoice
  if (quote.invoiceId) {
    const invoice = invoices.find(inv => inv.id === quote.invoiceId);
    if (invoice) {
      items.push({
        id: invoice.id,
        type: 'invoice',
        label: `Factuur ${invoice.invoiceNumber}`,
        status: invoice.status === 'paid' ? 'Betaald' : invoice.status,
        amount: invoice.total,
        date: invoice.issueDate,
        onClick: () => onNavigate(ModuleKey.ACCOUNTING, invoice.id),
      });
    }
  }

  return items;
}

/**
 * Helper function to get related items for an invoice
 */
export function getRelatedItemsForInvoice(
  invoice: Invoice,
  quotes: Quote[],
  workOrders: WorkOrder[],
  onNavigate: (module: ModuleKey, id: string) => void
): RelatedItem[] {
  const items: RelatedItem[] = [];

  // Related quote
  if (invoice.quoteId) {
    const quote = quotes.find(q => q.id === invoice.quoteId);
    if (quote) {
      items.push({
        id: quote.id,
        type: 'quote',
        label: `Offerte ${quote.id}`,
        status: quote.status === 'approved' ? 'Geaccepteerd' : quote.status,
        amount: quote.total,
        date: quote.createdDate,
        onClick: () => onNavigate(ModuleKey.ACCOUNTING, quote.id),
      });
    }
  }

  // Related work order
  if (invoice.workOrderId) {
    const workOrder = workOrders.find(wo => wo.id === invoice.workOrderId);
    if (workOrder) {
      items.push({
        id: workOrder.id,
        type: 'workorder',
        label: `Werkorder ${workOrder.id}`,
        status: workOrder.status,
        date: workOrder.createdDate,
        onClick: () => onNavigate(ModuleKey.WORK_ORDERS, workOrder.id),
      });
    }
  }

  return items;
}

/**
 * Helper function to get related items for a work order
 */
export function getRelatedItemsForWorkOrder(
  workOrder: WorkOrder,
  quotes: Quote[],
  invoices: Invoice[],
  onNavigate: (module: ModuleKey, id: string) => void
): RelatedItem[] {
  const items: RelatedItem[] = [];

  // Related quote
  if (workOrder.quoteId) {
    const quote = quotes.find(q => q.id === workOrder.quoteId);
    if (quote) {
      items.push({
        id: quote.id,
        type: 'quote',
        label: `Offerte ${quote.id}`,
        status: quote.status === 'approved' ? 'Geaccepteerd' : quote.status,
        amount: quote.total,
        date: quote.createdDate,
        onClick: () => onNavigate(ModuleKey.ACCOUNTING, quote.id),
      });
    }
  }

  // Related invoice
  if (workOrder.invoiceId) {
    const invoice = invoices.find(inv => inv.id === workOrder.invoiceId);
    if (invoice) {
      items.push({
        id: invoice.id,
        type: 'invoice',
        label: `Factuur ${invoice.invoiceNumber}`,
        status: invoice.status === 'paid' ? 'Betaald' : invoice.status,
        amount: invoice.total,
        date: invoice.issueDate,
        onClick: () => onNavigate(ModuleKey.ACCOUNTING, invoice.id),
      });
    }
  }

  return items;
}

