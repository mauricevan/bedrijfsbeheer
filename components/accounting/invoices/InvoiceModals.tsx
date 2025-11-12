import React from "react";
import type {
  Invoice,
  Customer,
  WorkOrder,
} from "../../../types";
import type { ReturnType } from "react";
import type { useInvoiceForm } from "../../../features/accounting/hooks/useInvoiceForm";
import {
  getCustomerName,
  getInvoiceStatusColor,
  getWorkOrderStatus,
  getWorkOrderBadge,
  getWorkOrderForInvoice,
} from "../../../features/accounting/utils/helpers";
import { formatCurrency } from "../../../features/accounting/utils/formatters";
import {
  filterInvoices,
  calculateFilteredInvoiceTotal,
  type InvoiceFilterOptions,
} from "../../../features/accounting/utils/filters";

export interface InvoiceModalsProps {
  // Overview Modal
  showOverviewModal: boolean;
  setShowOverviewModal: (show: boolean) => void;
  overviewType: "all" | "paid" | "outstanding" | "overdue";
  setOverviewType: (type: "all" | "paid" | "outstanding" | "overdue") => void;
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
  invoices: Invoice[];
  customers: Customer[];
  workOrders: WorkOrder[];
  onEdit: (invoiceId: string) => void;
  onClone: (invoiceId: string) => void;
  onConvertToWorkOrder: (invoiceId: string) => void;

  // Clone Invoice Modal
  showCloneInvoiceModal: boolean;
  setShowCloneInvoiceModal: (show: boolean) => void;
  invoiceForm: ReturnType<typeof useInvoiceForm>;
  calculateInvoiceTotals: () => {
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  onSaveClonedInvoice: () => void;
  onSaveClonedInvoiceAndSendToWorkOrder: () => void;

  // Validation Modal
  showInvoiceValidationModal: boolean;
  setShowInvoiceValidationModal: (show: boolean) => void;
  invoiceToValidate: Invoice | null;
  setInvoiceToValidate: (invoice: Invoice | null) => void;
  validationChecklist: {
    hoursChecked: boolean;
    materialsChecked: boolean;
    extraWorkAdded: boolean;
  };
  setValidationChecklist: React.Dispatch<
    React.SetStateAction<{
      hoursChecked: boolean;
      materialsChecked: boolean;
      extraWorkAdded: boolean;
    }>
  >;
  onConfirmValidation: () => void;
}

/**
 * Invoice Overview Modal Component
 */
const InvoiceOverviewModal: React.FC<{
  show: boolean;
  onClose: () => void;
  type: "all" | "paid" | "outstanding" | "overdue";
  filter: InvoiceModalsProps["overviewFilter"];
  setFilter: InvoiceModalsProps["setOverviewFilter"];
  resetFilters: () => void;
  invoices: Invoice[];
  customers: Customer[];
  workOrders: WorkOrder[];
  onEdit: (invoiceId: string) => void;
  onClone: (invoiceId: string) => void;
  onConvertToWorkOrder: (invoiceId: string) => void;
}> = ({
  show,
  onClose,
  type,
  filter,
  setFilter,
  resetFilters,
  invoices,
  customers,
  workOrders,
  onEdit,
  onClone,
  onConvertToWorkOrder,
}) => {
  if (!show) return null;

  const getFilteredInvoices = () => {
    const filterOptions: InvoiceFilterOptions = {
      type,
      customerName: filter.customerName,
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      minAmount: filter.minAmount ? parseFloat(filter.minAmount) : undefined,
      maxAmount: filter.maxAmount ? parseFloat(filter.maxAmount) : undefined,
    };
    return filterInvoices(invoices, customers, filterOptions);
  };

  const getFilteredTotal = () => {
    return calculateFilteredInvoiceTotal(getFilteredInvoices());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-lg shadow-2xl w-full sm:max-w-6xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral flex items-center gap-3">
              {type === "all" && "📊 Totaal Gefactureerd"}
              {type === "paid" && "✅ Betaalde Facturen"}
              {type === "outstanding" && "⏳ Uitstaande Facturen"}
              {type === "overdue" && "⚠️ Verlopen Facturen"}
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

          {/* 🆕 V5.6: Info banner voor betaalde facturen */}
          {type === "paid" && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Betaalde facturen zijn verplaatst naar Boekhouding &
                    Dossier
                  </p>
                  <p className="text-xs text-blue-700">
                    Alle betaalde facturen zijn automatisch geregistreerd in
                    het{" "}
                    <span className="font-semibold">
                      Boekhouding & Dossier
                    </span>{" "}
                    module. Ga daarheen voor een volledig overzicht van alle
                    betaalde facturen.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                {formatCurrency(getFilteredTotal())}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {getFilteredInvoices().length} facturen gevonden
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
          {getFilteredInvoices().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                🔍 Geen facturen gevonden met deze filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredInvoices().map((invoice) => {
                const workOrder = getWorkOrderStatus(
                  invoice.workOrderId,
                  workOrders
                );
                const badge = getWorkOrderBadge(workOrder);

                return (
                  <div
                    key={invoice.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧾</span>
                        <div>
                          <p className="font-semibold text-lg text-gray-800">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getCustomerName(invoice.customerId, customers)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(invoice.total)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getInvoiceStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mt-3">
                      <div>
                        <span className="font-semibold">Factuurdatum:</span>
                        <p>{invoice.issueDate}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Vervaldatum:</span>
                        <p>{invoice.dueDate}</p>
                      </div>
                      <div>
                        <span className="font-semibold">
                          Betalingstermijn:
                        </span>
                        <p>{invoice.paymentTerms}</p>
                      </div>
                      {invoice.paidDate && (
                        <div>
                          <span className="font-semibold">Betaald op:</span>
                          <p>{invoice.paidDate}</p>
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

                    {invoice.notes && (
                      <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                        <strong>Notities:</strong> {invoice.notes}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          onClose();
                          onEdit(invoice.id);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                        title="Factuur bewerken"
                      >
                        ✏️ Bewerken
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onClone(invoice.id);
                        }}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-semibold"
                        title="Factuur clonen"
                      >
                        📋 Clonen
                      </button>
                      {(invoice.status === "sent" ||
                        invoice.status === "draft") &&
                        !invoice.workOrderId && (
                          <button
                            onClick={() => {
                              onClose();
                              onConvertToWorkOrder(invoice.id);
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
 * Clone Invoice Modal Component
 */
const CloneInvoiceModal: React.FC<{
  show: boolean;
  invoiceForm: ReturnType<typeof useInvoiceForm>;
  customers: Customer[];
  calculateInvoiceTotals: () => {
    subtotal: number;
    vatAmount: number;
    total: number;
  };
  onClose: () => void;
  onSave: () => void;
  onSaveAndSendToWorkOrder: () => void;
}> = ({
  show,
  invoiceForm,
  customers,
  calculateInvoiceTotals,
  onClose,
  onSave,
  onSaveAndSendToWorkOrder,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-4xl sm:w-full h-full sm:h-auto p-4 sm:p-6 sm:my-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-neutral">
            📋 Factuur Clonen
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
            💡 <strong>Tip:</strong> De nieuwe factuur krijgt automatisch een
            nieuw factuurnummer en de datum wordt op vandaag gezet.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klant *
            </label>
            <select
              value={invoiceForm.formData.customerId}
              onChange={(e) =>
                invoiceForm.handleChange("customerId", e.target.value)
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
                Factuurdatum *
              </label>
              <input
                type="date"
                value={invoiceForm.formData.issueDate}
                onChange={(e) =>
                  invoiceForm.handleChange("issueDate", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vervaldatum *
              </label>
              <input
                type="date"
                value={invoiceForm.formData.dueDate}
                onChange={(e) =>
                  invoiceForm.handleChange("dueDate", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BTW Tarief (%)
              </label>
              <input
                type="number"
                value={invoiceForm.formData.vatRate}
                onChange={(e) =>
                  invoiceForm.handleChange("vatRate", Number(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Betalingstermijn
              </label>
              <input
                type="text"
                value={invoiceForm.formData.paymentTerms}
                onChange={(e) =>
                  invoiceForm.handleChange("paymentTerms", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="14 dagen"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notities
            </label>
            <textarea
              value={invoiceForm.formData.notes}
              onChange={(e) =>
                invoiceForm.handleChange("notes", e.target.value)
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Extra opmerkingen..."
            />
          </div>

          {invoiceForm.formData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotaal:</span>
                <span className="font-semibold">
                  {formatCurrency(calculateInvoiceTotals().subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  BTW ({invoiceForm.formData.vatRate}%):
                </span>
                <span className="font-semibold">
                  {formatCurrency(calculateInvoiceTotals().vatAmount)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Totaal:</span>
                <span className="text-primary">
                  {formatCurrency(calculateInvoiceTotals().total)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex gap-3">
            <button
              onClick={onSave}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              ✓ Gecloneerde Factuur Opslaan
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Annuleren
            </button>
          </div>
          <button
            onClick={onSaveAndSendToWorkOrder}
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            📤 Opslaan en naar Werkorder Sturen
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Invoice Validation Modal Component
 */
const InvoiceValidationModal: React.FC<{
  show: boolean;
  invoiceToValidate: Invoice | null;
  invoices: Invoice[];
  workOrders: WorkOrder[];
  validationChecklist: {
    hoursChecked: boolean;
    materialsChecked: boolean;
    extraWorkAdded: boolean;
  };
  setValidationChecklist: React.Dispatch<
    React.SetStateAction<{
      hoursChecked: boolean;
      materialsChecked: boolean;
      extraWorkAdded: boolean;
    }>
  >;
  onClose: () => void;
  onEdit: (invoiceId: string) => void;
  onConfirm: () => void;
}> = ({
  show,
  invoiceToValidate,
  invoices,
  workOrders,
  validationChecklist,
  setValidationChecklist,
  onClose,
  onEdit,
  onConfirm,
}) => {
  if (!show || !invoiceToValidate) return null;

  const workOrder = getWorkOrderForInvoice(
    invoiceToValidate.id,
    invoices,
    workOrders
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-3xl sm:w-full h-full sm:h-auto sm:my-8 sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral flex items-center gap-2">
            <span>⚠️</span>
            <span>Factuur Validatie Voordat Verzenden</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Warning Message */}
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Belangrijk:</strong> Deze factuur is automatisch
              aangemaakt na voltooiing van een werkorder. Controleer alle
              gegevens zorgvuldig voordat u naar de klant verzendt.
            </p>
          </div>

          {/* Comparison Section */}
          {workOrder && (() => {
            const estimatedHours = workOrder.estimatedHours || 0;
            const actualHours = workOrder.hoursSpent || 0;
            const estimatedCost =
              invoiceToValidate.estimatedCost ||
              workOrder.estimatedCost ||
              0;
            const actualCost = invoiceToValidate.total;

            return (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral">
                  Vergelijking: Geschat vs Werkelijk
                </h3>

                {/* Hours Comparison */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    ⏱️ Werkuren
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Geschat</p>
                      <p className="text-lg font-bold text-blue-600">
                        {estimatedHours}u
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Gewerkt</p>
                      <p
                        className={`text-lg font-bold ${
                          actualHours <= estimatedHours * 1.1
                            ? "text-green-600"
                            : actualHours <= estimatedHours * 1.25
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {actualHours}u
                      </p>
                      {estimatedHours > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          (
                          {Math.round((actualHours / estimatedHours) * 100)}%
                          van geschat)
                        </p>
                      )}
                    </div>
                  </div>
                  {estimatedHours > 0 && actualHours > estimatedHours * 1.1 && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                      ⚠️ Meerdere uren gewerkt dan geschat. Overweeg meerwerk
                      facturering.
                    </div>
                  )}
                </div>

                {/* Cost Comparison */}
                {estimatedCost > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      💰 Kosten
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Geschat Totaal</p>
                        <p className="text-lg font-bold text-blue-600">
                          €{estimatedCost.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Factuur Totaal</p>
                        <p
                          className={`text-lg font-bold ${
                            actualCost <= estimatedCost * 1.1
                              ? "text-green-600"
                              : actualCost <= estimatedCost * 1.2
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          €{actualCost.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ({actualCost > estimatedCost ? "+" : ""}€
                          {(actualCost - estimatedCost).toFixed(2)})
                        </p>
                      </div>
                    </div>
                    {actualCost > estimatedCost * 1.1 && (
                      <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                        ⚠️ Factuurbedrag is hoger dan geschat. Controleer items
                        en meerwerk.
                      </div>
                    )}
                  </div>
                )}

                {/* Materials Summary */}
                {invoiceToValidate.items.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      📦 Materialen
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {invoiceToValidate.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0"
                        >
                          <span className="text-gray-700">
                            {item.description}
                          </span>
                          <span className="font-medium text-gray-900">
                            {item.quantity}x €{item.pricePerUnit.toFixed(2)} =
                            €{item.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-300">
                      <p className="text-sm font-semibold text-gray-700">
                        Subtotaal Materialen: €
                        {invoiceToValidate.items
                          .reduce((sum, item) => sum + item.total, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Labor Summary */}
                {invoiceToValidate.labor &&
                  invoiceToValidate.labor.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        👷 Werkuren
                      </h4>
                      <div className="space-y-2">
                        {invoiceToValidate.labor.map((labor, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0"
                          >
                            <span className="text-gray-700">
                              {labor.description}
                            </span>
                            <span className="font-medium text-gray-900">
                              {labor.hours}u × €{labor.hourlyRate.toFixed(2)}/u
                              = €{labor.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-300">
                        <p className="text-sm font-semibold text-gray-700">
                          Subtotaal Werkuren: €
                          {invoiceToValidate.labor
                            .reduce((sum, labor) => sum + labor.total, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            );
          })()}

          {/* Validation Checklist */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-neutral mb-4">
              ✅ Validatie Checklist
            </h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={validationChecklist.hoursChecked}
                  onChange={(e) =>
                    setValidationChecklist({
                      ...validationChecklist,
                      hoursChecked: e.target.checked,
                    })
                  }
                  className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    ⏱️ Uren gecontroleerd (gewerkte uren vs geschat)
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Controleer of de gewerkte uren kloppen en of meerwerk nodig
                    is
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={validationChecklist.materialsChecked}
                  onChange={(e) =>
                    setValidationChecklist({
                      ...validationChecklist,
                      materialsChecked: e.target.checked,
                    })
                  }
                  className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    📦 Materialen gecontroleerd
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Controleer of alle gebruikte materialen zijn opgenomen tegen
                    juiste prijzen
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={validationChecklist.extraWorkAdded}
                  onChange={(e) =>
                    setValidationChecklist({
                      ...validationChecklist,
                      extraWorkAdded: e.target.checked,
                    })
                  }
                  className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    ➕ Meerwerk toegevoegd (indien nodig)
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Indien er extra werk is uitgevoerd, is dit toegevoegd aan de
                    factuur
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              ⚡ Snelle Acties
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onEdit(invoiceToValidate.id)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                ✏️ Factuur Bewerken
              </button>
              {workOrder && (
                <button
                  onClick={() => {
                    alert(
                      `Werkorder ID: ${workOrder.id}\nTitel: ${workOrder.title}\nStatus: ${workOrder.status}`
                    );
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  📋 Bekijk Werkorder
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={onConfirm}
              disabled={
                !validationChecklist.hoursChecked ||
                !validationChecklist.materialsChecked
              }
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                validationChecklist.hoursChecked &&
                validationChecklist.materialsChecked
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              ✓ Validatie Voltooid - Factuur Verzenden
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
    </div>
  );
};

/**
 * InvoiceModals component - combines all invoice modals
 */
export const InvoiceModals: React.FC<InvoiceModalsProps> = (props) => {
  return (
    <>
      <InvoiceOverviewModal
        show={props.showOverviewModal}
        onClose={() => props.setShowOverviewModal(false)}
        type={props.overviewType}
        filter={props.overviewFilter}
        setFilter={props.setOverviewFilter}
        resetFilters={props.resetFilters}
        invoices={props.invoices}
        customers={props.customers}
        workOrders={props.workOrders}
        onEdit={props.onEdit}
        onClone={props.onClone}
        onConvertToWorkOrder={props.onConvertToWorkOrder}
      />
      <CloneInvoiceModal
        show={props.showCloneInvoiceModal}
        invoiceForm={props.invoiceForm}
        customers={props.customers}
        calculateInvoiceTotals={props.calculateInvoiceTotals}
        onClose={() => props.setShowCloneInvoiceModal(false)}
        onSave={props.onSaveClonedInvoice}
        onSaveAndSendToWorkOrder={props.onSaveClonedInvoiceAndSendToWorkOrder}
      />
      <InvoiceValidationModal
        show={props.showInvoiceValidationModal}
        invoiceToValidate={props.invoiceToValidate}
        invoices={props.invoices}
        workOrders={props.workOrders}
        validationChecklist={props.validationChecklist}
        setValidationChecklist={props.setValidationChecklist}
        onClose={() => {
          props.setShowInvoiceValidationModal(false);
          props.setInvoiceToValidate(null);
          props.setValidationChecklist({
            hoursChecked: false,
            materialsChecked: false,
            extraWorkAdded: false,
          });
        }}
        onEdit={props.onEdit}
        onConfirm={props.onConfirmValidation}
      />
    </>
  );
};

