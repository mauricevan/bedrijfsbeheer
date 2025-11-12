import React from "react";
import type { Quote } from "../../../types";

export interface QuoteActionsProps {
  quote: Quote;
  isAdmin: boolean;
  onUpdateStatus: (quoteId: string, newStatus: Quote["status"]) => void;
  onConvertToWorkOrder: (quoteId: string) => void;
  onConvertToInvoice: (quoteId: string) => void;
  onClone: (quoteId: string) => void;
  onDelete: (quoteId: string) => void;
  onAccept: (quoteId: string) => void;
  onEdit: (quoteId: string) => void;
}

/**
 * QuoteActions component for displaying quote action buttons
 * Shows different actions based on quote status and admin permissions
 */
export const QuoteActions: React.FC<QuoteActionsProps> = ({
  quote,
  isAdmin,
  onUpdateStatus,
  onConvertToWorkOrder,
  onConvertToInvoice,
  onClone,
  onDelete,
  onAccept,
  onEdit,
}) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {quote.status === "draft" && (
        <button
          onClick={() => onUpdateStatus(quote.id, "sent")}
          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Verzenden
        </button>
      )}
      {quote.status === "sent" && (
        <>
          <button
            onClick={() => onAccept(quote.id)}
            className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            Accepteren
          </button>
          <button
            onClick={() => onUpdateStatus(quote.id, "rejected")}
            className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Afwijzen
          </button>
        </>
      )}
      {quote.status === "approved" && !quote.workOrderId && (
        <button
          onClick={() => onConvertToWorkOrder(quote.id)}
          className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 font-semibold"
        >
          📋 Maak Werkorder
        </button>
      )}
      {quote.status === "approved" && (
        <button
          onClick={() => onConvertToInvoice(quote.id)}
          className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 font-semibold"
        >
          🧾 Omzetten naar Factuur
        </button>
      )}
      <button
        onClick={() => onClone(quote.id)}
        className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 font-semibold"
        title="Offerte clonen"
      >
        📋 Clonen
      </button>
      <button
        onClick={() => onDelete(quote.id)}
        className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
      >
        Verwijder
      </button>
      <button
        onClick={() => onEdit(quote.id)}
        className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 font-semibold"
        title="Offerte bewerken"
      >
        ✏️ Bewerken
      </button>
    </div>
  );
};

