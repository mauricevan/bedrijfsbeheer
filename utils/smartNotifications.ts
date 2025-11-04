import { Notification, NotificationAction, Quote, Invoice, WorkOrder, ModuleKey } from '../types';

/**
 * Create a smart notification with action buttons
 */
export function createSmartNotification(
  type: 'info' | 'warning' | 'error' | 'success',
  message: string,
  actions?: NotificationAction[],
  relatedModule?: ModuleKey,
  relatedId?: string
): Notification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    date: new Date().toISOString(),
    read: false,
    relatedModule,
    relatedId,
    actions,
  };
}

/**
 * Create notification for approved quote - suggests creating work order
 */
export function createQuoteApprovedNotification(
  quote: Quote,
  onCreateWorkOrder: () => void,
  onViewQuote: () => void
): Notification {
  return createSmartNotification(
    'success',
    `✅ Offerte ${quote.id} is geaccepteerd! Maak nu een werkorder aan.`,
    [
      {
        label: '📋 Maak Werkorder',
        action: onCreateWorkOrder,
        variant: 'primary',
      },
      {
        label: '👁️ Bekijk Offerte',
        action: onViewQuote,
        variant: 'secondary',
      },
    ],
    ModuleKey.ACCOUNTING,
    quote.id
  );
}

/**
 * Create notification for completed work order - suggests creating invoice
 */
export function createWorkOrderCompletedNotification(
  workOrder: WorkOrder,
  onCreateInvoice: () => void,
  onViewWorkOrder: () => void
): Notification {
  return createSmartNotification(
    'success',
    `✅ Werkorder ${workOrder.id} is voltooid! Maak nu een factuur aan.`,
    [
      {
        label: '🧾 Maak Factuur',
        action: onCreateInvoice,
        variant: 'primary',
      },
      {
        label: '👁️ Bekijk Werkorder',
        action: onViewWorkOrder,
        variant: 'secondary',
      },
    ],
    ModuleKey.WORK_ORDERS,
    workOrder.id
  );
}

/**
 * Create notification for sent invoice - suggests marking as paid when payment arrives
 */
export function createInvoiceSentNotification(
  invoice: Invoice,
  onMarkAsPaid: () => void,
  onViewInvoice: () => void
): Notification {
  return createSmartNotification(
    'info',
    `📧 Factuur ${invoice.invoiceNumber} is verzonden. Markeer als betaald wanneer betaling is ontvangen.`,
    [
      {
        label: '💰 Markeer als Betaald',
        action: onMarkAsPaid,
        variant: 'success',
      },
      {
        label: '👁️ Bekijk Factuur',
        action: onViewInvoice,
        variant: 'secondary',
      },
    ],
    ModuleKey.ACCOUNTING,
    invoice.id
  );
}

/**
 * Create notification for overdue invoice - suggests follow-up action
 */
export function createInvoiceOverdueNotification(
  invoice: Invoice,
  onSendReminder: () => void,
  onViewInvoice: () => void
): Notification {
  const daysOverdue = Math.floor(
    (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return createSmartNotification(
    'error',
    `⚠️ Factuur ${invoice.invoiceNumber} is ${daysOverdue} dag(en) te laat! Verstuur een herinnering.`,
    [
      {
        label: '📧 Verstuur Herinnering',
        action: onSendReminder,
        variant: 'danger',
      },
      {
        label: '👁️ Bekijk Factuur',
        action: onViewInvoice,
        variant: 'secondary',
      },
    ],
    ModuleKey.ACCOUNTING,
    invoice.id
  );
}

/**
 * Create notification for low stock - suggests reordering
 */
export function createLowStockNotification(
  itemName: string,
  itemId: string,
  onReorder: () => void,
  onViewItem: () => void
): Notification {
  return createSmartNotification(
    'warning',
    `⚠️ Laag voorraad: ${itemName} is bijna op!`,
    [
      {
        label: '📦 Bestel Nu',
        action: onReorder,
        variant: 'primary',
      },
      {
        label: '👁️ Bekijk Item',
        action: onViewItem,
        variant: 'secondary',
      },
    ],
    ModuleKey.INVENTORY,
    itemId
  );
}

