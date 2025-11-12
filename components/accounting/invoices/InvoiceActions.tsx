import React from "react";
import type { Invoice } from "../../../types";

export interface InvoiceActionsProps {
  invoice: Invoice;
  isAdmin: boolean;
  onUpdateStatus: (invoiceId: string, status: Invoice["status"]) => void;
  onConvertToWorkOrder: (invoiceId: string) => void;
  onClone: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  onEdit?: (invoiceId: string) => void;
}

/**
 * InvoiceActions component for displaying invoice action buttons
 * Shows different actions based on invoice status and admin permissions
 */
export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  isAdmin,
  onUpdateStatus,
  onConvertToWorkOrder,
  onClone,
  onDelete,
  onEdit,
}) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {invoice.status === "draft" && (
        <button
          onClick={() => onUpdateStatus(invoice.id, "sent")}
          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Verzenden
        </button>
      )}
      {(invoice.status === "sent" || invoice.status === "draft") &&
        !invoice.workOrderId && (
          <button
            onClick={() => onConvertToWorkOrder(invoice.id)}
            className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
          >
            📋 Maak Werkorder
          </button>
        )}
      {(invoice.status === "sent" || invoice.status === "overdue") && (
        <button
          onClick={() => onUpdateStatus(invoice.id, "paid")}
          className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
        >
          ✓ Markeer als Betaald
        </button>
      )}
      {invoice.status !== "paid" && invoice.status !== "cancelled" && (
        <button
          onClick={() => onUpdateStatus(invoice.id, "cancelled")}
          className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
        >
          Annuleren
        </button>
      )}
      <button
        onClick={() => onClone(invoice.id)}
        className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 font-semibold"
        title="Factuur clonen"
      >
        📋 Clonen
      </button>
      <button
        onClick={() => onDelete(invoice.id)}
        className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
      >
        Verwijder
      </button>
      {onEdit && (
        <button
          onClick={() => onEdit(invoice.id)}
          className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 font-semibold"
          title="Factuur bewerken"
        >
          ✏️ Bewerken
        </button>
      )}
    </div>
  );
};

