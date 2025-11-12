import React from "react";
import type {
  Quote,
  Customer,
  WorkOrder,
  InventoryCategory,
} from "../../../types";
import type { ReturnType } from "react";
import type { useQuoteForm } from "../../../features/accounting/hooks/useQuoteForm";
import {
  getCustomerName,
  getQuoteStatusColor,
  getWorkOrderStatus,
  getWorkOrderBadge,
} from "../../../features/accounting/utils/helpers";
import { formatCurrency } from "../../../features/accounting/utils/formatters";
import { filterQuotes, calculateFilteredQuoteTotal } from "../../../features/accounting/utils/filters";
import type { QuoteFilterOptions } from "../../../features/accounting/utils/filters";

export interface QuoteModalsProps {
  // Overview Modal
  showQuotesOverviewModal: boolean;
  setShowQuotesOverviewModal: (show: boolean) => void;
  quotesOverviewType: "all" | "approved" | "sent" | "expired";
  setQuotesOverviewType: (type: "all" | "approved" | "sent" | "expired") => void;
  overviewFilter: {
    customerName: string;
    dateFrom: string;
    dateTo: string;
    minAmount: string;
    maxAmount: string;
  };
  setOverviewFilter: React.Dispatch<
    React.SetStateAction<{
      customerName: string;
      dateFrom: string;
      dateTo: string;
      minAmount: string;
      maxAmount: string;
    }>
  >;
  resetFilters: () => void;
  quotes: Quote[];
  customers: Customer[];
  workOrders: WorkOrder[];
  onEdit: (quoteId: string) => void;
  onClone: (quoteId: string) => void;
  onConvertToWorkOrder: (quoteId: string) => void;

  // Accept Quote Modal
  showAcceptQuoteModal: boolean;
  setShowAcceptQuoteModal: (show: boolean) => void;
  quoteToAccept: string | null;
  setQuoteToAccept: (quoteId: string | null) => void;
  cloneOnAccept: boolean;
  setCloneOnAccept: (clone: boolean) => void;
  onAccept: () => void;

  // Clone Quote Modal
  showCloneQuoteModal: boolean;
  setShowCloneQuoteModal: (show: boolean) => void;
  quoteForm: ReturnType<typeof useQuoteForm>;
  customers: Customer[];
  calculateQuoteTotals: () => {
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  onSaveClonedQuote: () => void;
}

/**
 * Quotes Overview Modal Component
 */
const QuotesOverviewModal: React.FC<{
  show: boolean;
  onClose: () => void;
  type: "all" | "approved" | "sent" | "expired";
  filter: QuoteModalsProps["overviewFilter"];
  setFilter: QuoteModalsProps["setOverviewFilter"];
  resetFilters: () => void;
  quotes: Quote[];
  customers: Customer[];
  workOrders: WorkOrder[];
  onEdit: (quoteId: string) => void;
  onClone: (quoteId: string) => void;
  onConvertToWorkOrder: (quoteId: string) => void;
}> = ({
  show,
  onClose,
  type,
  filter,
  setFilter,
  resetFilters,
  quotes,
  customers,
  workOrders,
  onEdit,
  onClone,
  onConvertToWorkOrder,
}) => {
  if (!show) return null;

  const getFilteredQuotes = () => {
    const filterOptions: QuoteFilterOptions = {
      type,
      customerName: filter.customerName,
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      minAmount: filter.minAmount ? parseFloat(filter.minAmount) : undefined,
      maxAmount: filter.maxAmount ? parseFloat(filter.maxAmount) : undefined,
    };
    return filterQuotes(quotes, filterOptions);
  };

  const getFilteredQuotesTotal = () => {
    return calculateFilteredQuoteTotal(getFilteredQuotes());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral flex items-center gap-3">
              {type === "all" && "📊 Totaal Geoffreerd"}
              {type === "approved" && "✅ Geaccepteerde Offertes"}
              {type === "sent" && "📤 Verzonden Offertes"}
              {type === "expired" && "⚠️ Verlopen Offertes"}
            </h2>
            <button
              onClick={() => {
                onClose();
                resetFilters();
              }}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              🔍 Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klantnaam
                </label>
                <input
                  type="text"
                  value={filter.customerName}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      customerName: e.target.value,
                    })
                  }
                  placeholder="Zoek op klantnaam..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum vanaf
                </label>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      dateFrom: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum tot
                </label>
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      dateTo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Bedrag (€)
                </label>
                <input
                  type="number"
                  value={filter.minAmount}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      minAmount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Bedrag (€)
                </label>
                <input
                  type="number"
                  value={filter.maxAmount}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      maxAmount: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  🔄 Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Totaal */}
          <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Totaal Gefilterd:
              </span>
              <span className="text-3xl font-bold text-blue-600">
                €{getFilteredQuotesTotal().toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {getFilteredQuotes().length} offertes gevonden
            </div>
          </div>
        </div>

        {/* Quotes List */}
        <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
          {getFilteredQuotes().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                🔍 Geen offertes gevonden met deze filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredQuotes().map((quote) => {
                const workOrder = getWorkOrderStatus(
                  quote.workOrderId,
                  workOrders
                );
                const badge = getWorkOrderBadge(workOrder);

                return (
                  <div
                    key={quote.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                          <p className="font-semibold text-lg text-gray-800">
                            {quote.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getCustomerName(quote.customerId, customers)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(quote.total)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getQuoteStatusColor(
                            quote.status
                          )}`}
                        >
                          {quote.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600 mt-3">
                      <div>
                        <span className="font-semibold">Aangemaakt:</span>
                        <p>{quote.createdDate}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Geldig tot:</span>
                        <p>{quote.validUntil}</p>
                      </div>
                      {badge && (
                        <div>
                          <span className="font-semibold">Werkorder:</span>
                          <p>{badge.text}</p>
                        </div>
                      )}
                    </div>

                    {badge && (
                      <div className="mt-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border-2 ${badge.color}`}
                        >
                          {badge.icon} {badge.text}
                        </span>
                      </div>
                    )}

                    {quote.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <strong>Notities:</strong> {quote.notes}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          onClose();
                          onEdit(quote.id);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                        title="Offerte bewerken"
                      >
                        ✏️ Bewerken
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onClone(quote.id);
                        }}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-semibold"
                        title="Offerte clonen"
                      >
                        📋 Clonen
                      </button>
                      {(quote.status === "approved" ||
                        quote.status === "sent") &&
                        !quote.workOrderId && (
                          <button
                            onClick={() => {
                              onClose();
                              onConvertToWorkOrder(quote.id);
                            }}
                            className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                            title="Verzend naar werkorder"
                          >
                            📤 Naar Werkorder
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              onClose();
              resetFilters();
            }}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
          >
            ✓ Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Accept Quote Modal Component
 */
const AcceptQuoteModal: React.FC<{
  show: boolean;
  quoteToAccept: string | null;
  quotes: Quote[];
  cloneOnAccept: boolean;
  setCloneOnAccept: (clone: boolean) => void;
  onClose: () => void;
  onAccept: () => void;
}> = ({
  show,
  quoteToAccept,
  quotes,
  cloneOnAccept,
  setCloneOnAccept,
  onClose,
  onAccept,
}) => {
  if (!show || !quoteToAccept) return null;

  const quote = quotes.find((q) => q.id === quoteToAccept);
  if (!quote) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Offerte Accepteren
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Deze offerte wordt geaccepteerd en gemarkeerd als goedgekeurd.
          </p>
          {quote.validUntil && (
            <p className="text-xs text-gray-500">
              Geldig tot:{" "}
              {new Date(quote.validUntil).toLocaleDateString("nl-NL")}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={cloneOnAccept}
              onChange={(e) => setCloneOnAccept(e.target.checked)}
              className="mt-1 mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700 block">
                📋 Kloon voor volgende periode
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                {quote.validUntil
                  ? `Nieuwe offerte wordt aangemaakt met geldigheidsdatum ${new Date(
                      new Date(quote.validUntil).getTime() +
                        30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("nl-NL")} (+30 dagen vanaf huidige geldigheidsdatum)`
                  : "Nieuwe offerte wordt aangemaakt voor volgende maand (status: Concept)"}
              </span>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            ✓ Accepteren
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Clone Quote Modal Component
 */
const CloneQuoteModal: React.FC<{
  show: boolean;
  quoteForm: ReturnType<typeof useQuoteForm>;
  customers: Customer[];
  calculateQuoteTotals: () => {
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  onClose: () => void;
  onSave: () => void;
}> = ({
  show,
  quoteForm,
  customers,
  calculateQuoteTotals,
  onClose,
  onSave,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto p-4 sm:p-6 sm:my-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-neutral">
            📋 Offerte Clonen
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Alle velden zijn aanpasbaar. Het nieuwe
            offerte krijgt automatisch een uniek Q-nummer en de datum wordt op
            vandaag gezet.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klant *
            </label>
            <select
              value={quoteForm.formData.customerId}
              onChange={(e) =>
                quoteForm.handleChange("customerId", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecteer klant</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BTW Tarief (%)
              </label>
              <input
                type="number"
                value={quoteForm.formData.vatRate}
                onChange={(e) =>
                  quoteForm.handleChange("vatRate", Number(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geldig Tot *
              </label>
              <input
                type="date"
                value={quoteForm.formData.validUntil}
                onChange={(e) =>
                  quoteForm.handleChange("validUntil", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notities
            </label>
            <textarea
              value={quoteForm.formData.notes}
              onChange={(e) => quoteForm.handleChange("notes", e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Extra opmerkingen..."
            />
          </div>

          {quoteForm.formData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotaal:</span>
                <span className="font-semibold">
                  {formatCurrency(calculateQuoteTotals().subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  BTW ({quoteForm.formData.vatRate}%):
                </span>
                <span className="font-semibold">
                  {formatCurrency(calculateQuoteTotals().vatAmount)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Totaal:</span>
                <span className="text-primary">
                  {formatCurrency(calculateQuoteTotals().total)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            ✓ Gecloneerde Offerte Opslaan
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * QuoteModals component - combines all quote modals
 */
export const QuoteModals: React.FC<QuoteModalsProps> = (props) => {
  return (
    <>
      <QuotesOverviewModal
        show={props.showQuotesOverviewModal}
        onClose={() => props.setShowQuotesOverviewModal(false)}
        type={props.quotesOverviewType}
        filter={props.overviewFilter}
        setFilter={props.setOverviewFilter}
        resetFilters={props.resetFilters}
        quotes={props.quotes}
        customers={props.customers}
        workOrders={props.workOrders}
        onEdit={props.onEdit}
        onClone={props.onClone}
        onConvertToWorkOrder={props.onConvertToWorkOrder}
      />
      <AcceptQuoteModal
        show={props.showAcceptQuoteModal}
        quoteToAccept={props.quoteToAccept}
        quotes={props.quotes}
        cloneOnAccept={props.cloneOnAccept}
        setCloneOnAccept={props.setCloneOnAccept}
        onClose={() => {
          props.setShowAcceptQuoteModal(false);
          props.setQuoteToAccept(null);
          props.setCloneOnAccept(false);
        }}
        onAccept={props.onAccept}
      />
      <CloneQuoteModal
        show={props.showCloneQuoteModal}
        quoteForm={props.quoteForm}
        customers={props.customers}
        calculateQuoteTotals={props.calculateQuoteTotals}
        onClose={() => props.setShowCloneQuoteModal(false)}
        onSave={props.onSaveClonedQuote}
      />
    </>
  );
};

