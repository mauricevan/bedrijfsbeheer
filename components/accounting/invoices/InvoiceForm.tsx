import React from "react";
import type {
  Customer,
  InventoryItem,
  InventoryCategory,
} from "../../../types";
import type { ReturnType } from "react";
import type { useInvoiceForm } from "../../../features/accounting/hooks/useInvoiceForm";
import { useInventorySelection } from "../../../features/accounting/hooks/useInventorySelection";
import { formatCurrency } from "../../../features/accounting/utils/formatters";
import { InvoiceItemRow } from "./InvoiceItemRow";
import { InventoryItemSelector, LaborInput } from "../../common/forms";

export interface InvoiceFormProps {
  invoiceForm: ReturnType<typeof useInvoiceForm>;
  customers: Customer[];
  inventory: InventoryItem[];
  categories: InventoryCategory[];
  onSave: () => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceForm,
  customers,
  inventory,
  categories,
  onSave,
  onCancel,
}) => {
  const {
    inventorySearchTerm,
    setInventorySearchTerm,
    inventoryCategoryFilter,
    setInventoryCategoryFilter,
    inventoryCategorySearchTerm,
    setInventoryCategorySearchTerm,
    showInventoryCategoryDropdown,
    setShowInventoryCategoryDropdown,
    filteredInventoryCategories,
    filteredInventoryForSelection,
  } = useInventorySelection(inventory, categories);

  const {
    handleAddInventoryItem,
    handleAddCustomItem,
    handleAddLabor,
    handleRemoveItem,
    handleRemoveLabor,
    handleInventoryItemChange,
    handleItemChange,
    handleLaborChange,
  } = invoiceForm;

  const calculateInvoiceTotals = () => {
    return invoiceForm.totals();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-neutral mb-4">
        {invoiceForm.editingInvoiceId
          ? "Factuur Bewerken"
          : "Nieuwe Factuur"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          value={invoiceForm.formData.customerId}
          onChange={(e) =>
            invoiceForm.handleChange("customerId", e.target.value)
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Selecteer klant *</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={invoiceForm.formData.issueDate}
          onChange={(e) =>
            invoiceForm.handleChange("issueDate", e.target.value)
          }
          placeholder="Factuurdatum *"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="date"
          value={invoiceForm.formData.dueDate}
          onChange={(e) =>
            invoiceForm.handleChange("dueDate", e.target.value)
          }
          placeholder="Vervaldatum *"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Betalingstermijn"
          value={invoiceForm.formData.paymentTerms}
          onChange={(e) =>
            invoiceForm.handleChange("paymentTerms", e.target.value)
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Items Section */}
      <div className="space-y-3 mb-6">
        <InventoryItemSelector
          inventory={inventory}
          categories={categories}
          onAddInventoryItem={handleAddInventoryItem}
          onAddCustomItem={handleAddCustomItem}
          inventorySearchTerm={inventorySearchTerm}
          setInventorySearchTerm={setInventorySearchTerm}
          inventoryCategoryFilter={inventoryCategoryFilter}
          setInventoryCategoryFilter={setInventoryCategoryFilter}
          inventoryCategorySearchTerm={inventoryCategorySearchTerm}
          setInventoryCategorySearchTerm={setInventoryCategorySearchTerm}
          showInventoryCategoryDropdown={showInventoryCategoryDropdown}
          setShowInventoryCategoryDropdown={setShowInventoryCategoryDropdown}
          filteredInventoryCategories={filteredInventoryCategories}
        />

        {invoiceForm.formData.items.map((item, index) => (
          <InvoiceItemRow
            key={index}
            item={item}
            index={index}
            inventory={inventory}
            mode="edit"
            onItemChange={handleItemChange}
            onInventoryItemChange={handleInventoryItemChange}
            onRemoveItem={handleRemoveItem}
            inventoryCategoryFilter={inventoryCategoryFilter}
            setInventoryCategoryFilter={setInventoryCategoryFilter}
            inventoryCategorySearchTerm={inventoryCategorySearchTerm}
            setInventoryCategorySearchTerm={setInventoryCategorySearchTerm}
            showInventoryCategoryDropdown={showInventoryCategoryDropdown}
            setShowInventoryCategoryDropdown={setShowInventoryCategoryDropdown}
            filteredInventoryCategories={filteredInventoryCategories}
            filteredInventoryForSelection={filteredInventoryForSelection}
            categories={categories}
          />
        ))}
      </div>

      {/* Labor Section */}
      <LaborInput
        labor={invoiceForm.formData.labor}
        onAddLabor={handleAddLabor}
        onRemoveLabor={handleRemoveLabor}
        onLaborChange={handleLaborChange}
      />

      <textarea
        placeholder="Notities (optioneel)"
        value={invoiceForm.formData.notes}
        onChange={(e) => invoiceForm.handleChange("notes", e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
      />

      {/* Totals Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Subtotaal (excl. BTW):</span>
          <span className="font-semibold">
            {formatCurrency(calculateInvoiceTotals().subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>BTW ({invoiceForm.formData.vatRate}%):</span>
          <span className="font-semibold">
            {formatCurrency(calculateInvoiceTotals().vatAmount)}
          </span>
        </div>
        <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
          <span>Totaal (incl. BTW):</span>
          <span>{formatCurrency(calculateInvoiceTotals().total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          {invoiceForm.editingInvoiceId
            ? "Factuur Bijwerken"
            : "Factuur Aanmaken"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
};

