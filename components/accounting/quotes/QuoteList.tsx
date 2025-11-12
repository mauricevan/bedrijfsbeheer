import React from "react";
import type {
  Quote,
  Customer,
  WorkOrder,
  Invoice,
  InventoryItem,
} from "../../../types";
import {
  getCustomerName,
  getQuoteStatusColor,
  getWorkOrderStatus,
  getWorkOrderBadge,
} from "../../../features/accounting/utils/helpers";
import { formatCurrency } from "../../../features/accounting/utils/formatters";
import { QuoteItemRow } from "./QuoteItemRow";
import { QuoteActions } from "./QuoteActions";

export interface QuoteListProps {
  quotes: Quote[];
  customers: Customer[];
  workOrders: WorkOrder[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  isAdmin: boolean;
  // Statistics
  totalQuoted: number;
  totalApproved: number;
  totalSent: number;
  totalExpired: number;
  approvedQuotes: Quote[];
  sentQuotes: Quote[];
  expiredQuotes: Quote[];
  // Batch mode
  batchMode: boolean;
  setBatchMode: (value: boolean) => void;
  selectedQuotes: string[];
  setSelectedQuotes: (value: string[] | ((prev: string[]) => string[])) => void;
  // Form visibility
  setShowQuoteForm: (value: boolean) => void;
  // Handlers
  onOpenOverviewModal: (type: "all" | "approved" | "sent" | "expired") => void;
  onConvertToWorkOrder: (quoteId: string) => void;
  onConvertToInvoice: (quoteId: string) => void;
  onUpdateStatus: (quoteId: string, status: Quote["status"]) => void;
  onClone: (quoteId: string) => void;
  onDelete: (quoteId: string) => void;
  onAccept: (quoteId: string) => void;
  onEdit?: (quoteId: string) => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  customers,
  workOrders,
  invoices,
  inventory,
  isAdmin,
  totalQuoted,
  totalApproved,
  totalSent,
  totalExpired,
  approvedQuotes,
  sentQuotes,
  expiredQuotes,
  batchMode,
  setBatchMode,
  selectedQuotes,
  setSelectedQuotes,
  setShowQuoteForm,
  onOpenOverviewModal,
  onConvertToWorkOrder,
  onConvertToInvoice,
  onUpdateStatus,
  onClone,
  onDelete,
  onAccept,
  onEdit,
}) => {
  const handleBulkConvertToWorkOrders = () => {
    const approvedQuotesToConvert = quotes.filter(
      (q) =>
        selectedQuotes.includes(q.id) &&
        q.status === "approved" &&
        !q.workOrderId
    );
    if (approvedQuotesToConvert.length === 0) {
      alert("Geen geaccepteerde offertes zonder werkorder geselecteerd!");
      return;
    }
    if (
      confirm(
        `Wil je ${approvedQuotesToConvert.length} offerte(s) omzetten naar werkorders?`
      )
    ) {
      approvedQuotesToConvert.forEach((q) => onConvertToWorkOrder(q.id));
      setSelectedQuotes([]);
      setBatchMode(false);
    }
  };

  const handleBulkSend = () => {
    const draftQuotesToSend = quotes.filter(
      (q) => selectedQuotes.includes(q.id) && q.status === "draft"
    );
    if (draftQuotesToSend.length > 0) {
      if (
        confirm(
          `Wil je ${draftQuotesToSend.length} concept offerte(s) verzenden?`
        )
      ) {
        draftQuotesToSend.forEach((q) => onUpdateStatus(q.id, "sent"));
        setSelectedQuotes([]);
        setBatchMode(false);
      }
    }
  };

  return (
    <>
      {/* Quote Statistics */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => onOpenOverviewModal("all")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Totaal Geoffreerd</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(totalQuoted)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {quotes.length} offertes
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onOpenOverviewModal("approved")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Geaccepteerd</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalApproved)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {approvedQuotes.length} offertes
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onOpenOverviewModal("sent")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verzonden</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(totalSent)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {sentQuotes.length} offertes
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onOpenOverviewModal("expired")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verlopen</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(totalExpired)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expiredQuotes.length} offertes
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </button>
        </div>

        {/* Batch Mode Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="text-sm text-gray-600">
            Totaal: {quotes.length} offertes
            {batchMode && selectedQuotes.length > 0 && (
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {selectedQuotes.length} geselecteerd
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setBatchMode(!batchMode);
                    if (batchMode) {
                      setSelectedQuotes([]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    batchMode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {batchMode ? "✓ Selectie Modus" : "☐ Batch Selectie"}
                </button>
                {batchMode && selectedQuotes.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkConvertToWorkOrders}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      📋 Maak Werkorders (
                      {
                        selectedQuotes.filter((id) => {
                          const q = quotes.find((qu) => qu.id === id);
                          return q?.status === "approved" && !q.workOrderId;
                        }).length
                      }
                      )
                    </button>
                    <button
                      onClick={handleBulkSend}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      📤 Verzend (
                      {
                        selectedQuotes.filter((id) => {
                          const q = quotes.find((qu) => qu.id === id);
                          return q?.status === "draft";
                        }).length
                      }
                      )
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuotes([]);
                        setBatchMode(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                >
                  + Nieuwe Offerte
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quotes.map((quote) => {
          const workOrder = getWorkOrderStatus(quote.workOrderId, workOrders);
          const workOrderBadge = getWorkOrderBadge(workOrder);
          const isCompleted = workOrder?.status === "Completed";
          const isSelected = selectedQuotes.includes(quote.id);

          return (
            <div
              key={quote.id}
              className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                isCompleted ? "border-l-4 border-green-500" : ""
              } ${
                batchMode && isSelected
                  ? "ring-4 ring-blue-500 border-blue-500"
                  : batchMode
                  ? "hover:ring-2 hover:ring-gray-300"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                {batchMode && (
                  <div className="mr-3 mt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuotes([...selectedQuotes, quote.id]);
                        } else {
                          setSelectedQuotes(
                            selectedQuotes.filter((id) => id !== quote.id)
                          );
                        }
                      }}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg text-neutral">
                    {quote.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getCustomerName(quote.customerId, customers)}
                  </p>
                  {workOrderBadge && (
                    <button
                      onClick={() => {
                        alert(`Werkorder ID: ${quote.workOrderId}`);
                      }}
                      className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border-2 ${workOrderBadge.color} hover:opacity-80 transition-opacity cursor-pointer`}
                      title="Klik om naar werkorder te gaan"
                    >
                      {workOrderBadge.icon} {workOrderBadge.text}
                    </button>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getQuoteStatusColor(
                    quote.status
                  )}`}
                >
                  {quote.status === "draft" && "Concept"}
                  {quote.status === "sent" && "Verzonden"}
                  {quote.status === "approved" && "Geaccepteerd"}
                  {quote.status === "rejected" && "Afgewezen"}
                  {quote.status === "expired" && "Verlopen"}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-3">
                <h4 className="text-sm font-semibold text-gray-700">Items:</h4>
                {quote.items.map((item, index) => (
                  <QuoteItemRow
                    key={index}
                    item={item}
                    index={index}
                    inventory={inventory}
                    mode="display"
                  />
                ))}
              </div>

              {/* Labor */}
              {quote.labor && quote.labor.length > 0 && (
                <div className="space-y-2 mb-3 border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Werkuren:
                  </h4>
                  {quote.labor.map((labor, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {labor.description}
                        <span className="text-gray-500">
                          {" "}
                          ({labor.hours}u @ {formatCurrency(labor.hourlyRate)}/u)
                        </span>
                      </span>
                      <span className="font-medium">
                        {formatCurrency(labor.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-3 mb-4 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotaal (excl. BTW):</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>BTW ({quote.vatRate}%):</span>
                  <span>{formatCurrency(quote.vatAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-neutral">
                    Totaal (incl. BTW):
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(quote.total)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Aangemaakt: {quote.createdDate}</span>
                <span>Geldig tot: {quote.validUntil}</span>
              </div>

              {quote.notes && (
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">{quote.notes}</p>
                </div>
              )}

              {/* Visual Pipeline Status */}
              <div className="mb-4">
                <div className="flex items-center justify-between relative mb-2">
                  {/* Progress Bar Background */}
                  <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 rounded-full -translate-y-1/2 z-0"></div>
                  {/* Progress Bar Fill */}
                  <div
                    className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full -translate-y-1/2 z-0 transition-all duration-500"
                    style={{
                      width: `${(() => {
                        let progress = 0;
                        if (
                          quote.status === "approved" ||
                          quote.status === "sent"
                        )
                          progress = 25;
                        if (quote.workOrderId) progress = 50;
                        const invoice = invoices.find(
                          (inv) =>
                            inv.quoteId === quote.id ||
                            inv.workOrderId === quote.workOrderId
                        );
                        if (invoice) progress = 75;
                        if (invoice?.status === "paid") progress = 100;
                        return progress;
                      })()}%`,
                    }}
                  ></div>

                  {/* Pipeline Steps */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                          quote.status === "approved" ||
                          quote.status === "sent"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {quote.status === "approved" || quote.status === "sent"
                          ? "✓"
                          : "1"}
                      </div>
                      <span className="text-xs text-gray-600 mt-1 text-center">
                        Offerte
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                          quote.workOrderId ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        {quote.workOrderId ? "✓" : "2"}
                      </div>
                      <span className="text-xs text-gray-600 mt-1 text-center">
                        Werkorder
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                          invoices.find(
                            (inv) =>
                              inv.quoteId === quote.id ||
                              inv.workOrderId === quote.workOrderId
                          )
                            ? "bg-purple-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {invoices.find(
                          (inv) =>
                            inv.quoteId === quote.id ||
                            inv.workOrderId === quote.workOrderId
                        )
                          ? "✓"
                          : "3"}
                      </div>
                      <span className="text-xs text-gray-600 mt-1 text-center">
                        Factuur
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                          invoices.find(
                            (inv) =>
                              inv.quoteId === quote.id ||
                              inv.workOrderId === quote.workOrderId
                          )?.status === "paid"
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      >
                        {invoices.find(
                          (inv) =>
                            inv.quoteId === quote.id ||
                            inv.workOrderId === quote.workOrderId
                        )?.status === "paid"
                          ? "✓"
                          : "4"}
                      </div>
                      <span className="text-xs text-gray-600 mt-1 text-center">
                        Betaald
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Order Status Info for Completed */}
              {isCompleted && workOrder && (
                <div className="p-3 bg-green-50 rounded-lg mb-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-green-700">
                      Werkorder Voltooid
                    </span>
                  </div>
                  {workOrder.hoursSpent !== undefined &&
                    workOrder.estimatedHours && (
                      <p className="text-xs text-gray-700">
                        ⏱️ Gewerkt: {workOrder.hoursSpent}u (Geschat:{" "}
                        {workOrder.estimatedHours}u)
                        {workOrder.hoursSpent !== workOrder.estimatedHours && (
                          <span
                            className={`ml-2 font-semibold ${
                              workOrder.hoursSpent <=
                              workOrder.estimatedHours * 1.1
                                ? "text-green-600"
                                : workOrder.hoursSpent <=
                                  workOrder.estimatedHours * 1.25
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            (
                            {Math.round(
                              (workOrder.hoursSpent /
                                workOrder.estimatedHours) *
                                100
                            )}
                            %)
                          </span>
                        )}
                      </p>
                    )}
                </div>
              )}

              {/* Editable notification for active workorders */}
              {quote.workOrderId &&
                workOrder &&
                workOrder.status !== "Completed" &&
                isAdmin && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-blue-800">
                          ✏️ Deze offerte is gekoppeld aan een actieve
                          werkorder. Wijzigingen worden automatisch
                          gesynchroniseerd.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <QuoteActions
                quote={quote}
                isAdmin={isAdmin}
                onUpdateStatus={onUpdateStatus}
                onConvertToWorkOrder={onConvertToWorkOrder}
                onConvertToInvoice={onConvertToInvoice}
                onClone={onClone}
                onDelete={onDelete}
                onAccept={onAccept}
                onEdit={onEdit}
              />
            </div>
          );
        })}
      </div>

      {quotes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Geen offertes gevonden</p>
        </div>
      )}
    </>
  );
};

