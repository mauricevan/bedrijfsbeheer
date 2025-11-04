import { Quote, Invoice, WorkOrder, Customer } from '../types';

export interface WorkflowValidationResult {
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  canProceed: boolean;
  suggestedAction?: string;
}

/**
 * Validate if quote can be converted to work order
 */
export function validateQuoteToWorkOrder(
  quote: Quote,
  workOrders: WorkOrder[]
): WorkflowValidationResult {
  // Check if quote is approved
  if (quote.status !== 'approved') {
    return {
      isValid: false,
      message: `⚠️ Deze offerte is nog niet geaccepteerd. Status: ${quote.status}. Alleen geaccepteerde offertes kunnen worden omgezet naar werkorders.`,
      severity: 'error',
      canProceed: false,
      suggestedAction: 'Wacht op goedkeuring van de klant voordat je een werkorder maakt.',
    };
  }

  // Check if work order already exists
  if (quote.workOrderId) {
    const existingWorkOrder = workOrders.find(wo => wo.id === quote.workOrderId);
    if (existingWorkOrder) {
      return {
        isValid: false,
        message: `⚠️ Deze offerte heeft al een gekoppelde werkorder: ${existingWorkOrder.id}. Status: ${existingWorkOrder.status}.`,
        severity: 'error',
        canProceed: false,
        suggestedAction: `Bekijk de bestaande werkorder ${existingWorkOrder.id} in plaats van een nieuwe aan te maken.`,
      };
    }
  }

  // Check if invoice already exists (should convert existing invoice to work order instead)
  if (quote.invoiceId) {
    return {
      isValid: false,
      message: `⚠️ Deze offerte heeft al een factuur. Maak eerst de werkorder voordat je factureert.`,
      severity: 'warning',
      canProceed: false,
      suggestedAction: 'Gebruik de bestaande factuur en maak daar een werkorder van.',
    };
  }

  return {
    isValid: true,
    message: '✅ Offerte kan worden omgezet naar werkorder.',
    severity: 'info',
    canProceed: true,
  };
}

/**
 * Validate if work order can be converted to invoice
 */
export function validateWorkOrderToInvoice(
  workOrder: WorkOrder,
  quotes: Quote[],
  invoices: Invoice[]
): WorkflowValidationResult {
  // Check if work order is completed
  if (workOrder.status !== 'Voltooid') {
    return {
      isValid: false,
      message: `⚠️ Deze werkorder is nog niet voltooid. Status: ${workOrder.status}. Alleen voltooide werkorders kunnen worden gefactureerd.`,
      severity: 'error',
      canProceed: false,
      suggestedAction: 'Voltooi eerst de werkorder voordat je een factuur maakt.',
    };
  }

  // Check if invoice already exists
  if (workOrder.invoiceId) {
    const existingInvoice = invoices.find(inv => inv.id === workOrder.invoiceId);
    if (existingInvoice) {
      return {
        isValid: false,
        message: `⚠️ Deze werkorder heeft al een factuur: ${existingInvoice.invoiceNumber}. Status: ${existingInvoice.status}.`,
        severity: 'error',
        canProceed: false,
        suggestedAction: `Bekijk de bestaande factuur ${existingInvoice.invoiceNumber} in plaats van een nieuwe aan te maken.`,
      };
    }
  }

  // Check if quote exists and has invoice
  if (workOrder.quoteId) {
    const quote = quotes.find(q => q.id === workOrder.quoteId);
    if (quote?.invoiceId) {
      const existingInvoice = invoices.find(inv => inv.id === quote.invoiceId);
      if (existingInvoice) {
        return {
          isValid: false,
          message: `⚠️ De offerte heeft al een factuur. Deze wordt automatisch bijgewerkt met de werkelijke uren.`,
          severity: 'info',
          canProceed: true,
          suggestedAction: 'De bestaande factuur wordt bijgewerkt met de werkelijke gewerkte uren.',
        };
      }
    }
  }

  // Check if customer exists
  if (!workOrder.customerId) {
    return {
      isValid: false,
      message: `⚠️ Deze werkorder heeft geen gekoppelde klant. Voeg eerst een klant toe voordat je factureert.`,
      severity: 'error',
      canProceed: false,
      suggestedAction: 'Koppel eerst een klant aan deze werkorder.',
    };
  }

  return {
    isValid: true,
    message: '✅ Werkorder kan worden omgezet naar factuur.',
    severity: 'info',
    canProceed: true,
  };
}

/**
 * Validate if quote can be converted to invoice (without work order)
 */
export function validateQuoteToInvoice(
  quote: Quote,
  workOrders: WorkOrder[]
): WorkflowValidationResult {
  // Check if quote is approved
  if (quote.status !== 'approved') {
    return {
      isValid: false,
      message: `⚠️ Deze offerte is nog niet geaccepteerd. Status: ${quote.status}. Alleen geaccepteerde offertes kunnen direct worden gefactureerd.`,
      severity: 'error',
      canProceed: false,
      suggestedAction: 'Wacht op goedkeuring van de klant voordat je factureert.',
    };
  }

  // Check if work order exists and is not completed
  if (quote.workOrderId) {
    const workOrder = workOrders.find(wo => wo.id === quote.workOrderId);
    if (workOrder && workOrder.status !== 'Voltooid') {
      return {
        isValid: false,
        message: `⚠️ Deze offerte heeft een actieve werkorder (${workOrder.id}). Status: ${workOrder.status}. Wacht tot de werkorder is voltooid voordat je factureert.`,
        severity: 'warning',
        canProceed: false,
        suggestedAction: 'Wacht tot de werkorder is voltooid. De factuur wordt dan automatisch aangemaakt met de werkelijke uren.',
      };
    }
  }

  // Check if invoice already exists
  if (quote.invoiceId) {
    return {
      isValid: false,
      message: `⚠️ Deze offerte heeft al een factuur. Maak geen dubbele factuur aan.`,
      severity: 'error',
      canProceed: false,
      suggestedAction: 'Bekijk de bestaande factuur in plaats van een nieuwe aan te maken.',
    };
  }

  return {
    isValid: true,
    message: '✅ Offerte kan worden omgezet naar factuur.',
    severity: 'info',
    canProceed: true,
  };
}

/**
 * Validate if invoice can be converted to work order
 */
export function validateInvoiceToWorkOrder(
  invoice: Invoice,
  workOrders: WorkOrder[]
): WorkflowValidationResult {
  // Check if work order already exists
  if (invoice.workOrderId) {
    const existingWorkOrder = workOrders.find(wo => wo.id === invoice.workOrderId);
    if (existingWorkOrder) {
      return {
        isValid: false,
        message: `⚠️ Deze factuur heeft al een gekoppelde werkorder: ${existingWorkOrder.id}. Status: ${existingWorkOrder.status}.`,
        severity: 'error',
        canProceed: false,
        suggestedAction: `Bekijk de bestaande werkorder ${existingWorkOrder.id} in plaats van een nieuwe aan te maken.`,
      };
    }
  }

  // Check if invoice is in draft or sent status
  if (!['draft', 'sent'].includes(invoice.status)) {
    return {
      isValid: false,
      message: `⚠️ Deze factuur kan niet worden omgezet naar werkorder. Status: ${invoice.status}. Alleen concept- of verzonden facturen kunnen worden omgezet.`,
      severity: 'error',
      canProceed: false,
      suggestedAction: 'Alleen concept- of verzonden facturen kunnen worden omgezet naar werkorders.',
    };
  }

  return {
    isValid: true,
    message: '✅ Factuur kan worden omgezet naar werkorder.',
    severity: 'info',
    canProceed: true,
  };
}

/**
 * Validate if quote can be edited (check if work order is active)
 */
export function validateQuoteEdit(
  quote: Quote,
  workOrders: WorkOrder[]
): WorkflowValidationResult {
  if (quote.workOrderId) {
    const workOrder = workOrders.find(wo => wo.id === quote.workOrderId);
    if (workOrder) {
      if (workOrder.status === 'Voltooid') {
        return {
          isValid: false,
          message: `🔒 Deze werkorder is al voltooid. Materialen en uren kunnen niet meer worden aangepast. Je kunt alleen notities toevoegen.`,
          severity: 'error',
          canProceed: false,
          suggestedAction: 'De werkorder is voltooid. Alleen notities kunnen nog worden aangepast.',
        };
      }
      
      if (workOrder.status === 'In Uitvoering') {
        return {
          isValid: true,
          message: `⚠️ Deze werkorder is momenteel actief. Wijzigingen worden doorgevoerd, maar de toegewezen medewerker ontvangt een notificatie.`,
          severity: 'warning',
          canProceed: true,
          suggestedAction: 'Weet je zeker dat je wijzigingen wilt doorvoeren? De toegewezen medewerker ontvangt een notificatie.',
        };
      }
    }
  }

  return {
    isValid: true,
    message: '✅ Offerte kan worden bewerkt.',
    severity: 'info',
    canProceed: true,
  };
}

/**
 * Validate if invoice can be edited (check if work order is completed)
 */
export function validateInvoiceEdit(
  invoice: Invoice,
  workOrders: WorkOrder[]
): WorkflowValidationResult {
  if (invoice.workOrderId) {
    const workOrder = workOrders.find(wo => wo.id === invoice.workOrderId);
    if (workOrder && workOrder.status === 'Voltooid') {
      return {
        isValid: false,
        message: `🔒 Deze factuur is gekoppeld aan een voltooide werkorder. Wijzigingen kunnen de factuur inconsistent maken.`,
        severity: 'warning',
        canProceed: false,
        suggestedAction: 'De werkorder is voltooid. Alleen notities kunnen nog worden aangepast.',
      };
    }
  }

  if (invoice.status === 'paid') {
    return {
      isValid: false,
      message: `🔒 Deze factuur is al betaald. Wijzigingen kunnen niet meer worden doorgevoerd.`,
      severity: 'error',
      canProceed: false,
      suggestedAction: 'Betaalde facturen kunnen niet meer worden bewerkt.',
    };
  }

  return {
    isValid: true,
    message: '✅ Factuur kan worden bewerkt.',
    severity: 'info',
    canProceed: true,
  };
}

/**
 * Get workflow guardrail message for UI display
 */
export function getWorkflowGuardrailMessage(
  validation: WorkflowValidationResult
): { icon: string; color: string; message: string } {
  switch (validation.severity) {
    case 'error':
      return {
        icon: '🔒',
        color: 'bg-red-50 border-red-500 text-red-800',
        message: validation.message,
      };
    case 'warning':
      return {
        icon: '⚠️',
        color: 'bg-orange-50 border-orange-500 text-orange-800',
        message: validation.message,
      };
    default:
      return {
        icon: 'ℹ️',
        color: 'bg-blue-50 border-blue-500 text-blue-800',
        message: validation.message,
      };
  }
}

