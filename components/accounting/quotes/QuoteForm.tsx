import React from "react";
import type {
  Customer,
  InventoryItem,
  InventoryCategory,
} from "../../../types";
import type { ReturnType } from "react";
import type { useQuoteForm } from "../../../features/accounting/hooks/useQuoteForm";
import { useInventorySelection } from "../../../features/accounting/hooks/useInventorySelection";
import { formatCurrency } from "../../../features/accounting/utils/formatters";
import { QuoteItemRow } from "./QuoteItemRow";
import { InventoryItemSelector, LaborInput } from "../../common/forms";

export interface QuoteFormProps {
  quoteForm: ReturnType<typeof useQuoteForm>;
  customers: Customer[];
  inventory: InventoryItem[];
  categories: InventoryCategory[];
  onSave: () => void;
  onCancel: () => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  quoteForm,
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
  } = quoteForm;

  const calculateQuoteTotals = () => {
    return quoteForm.totals();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-neutral mb-4">
        {quoteForm.editingQuoteId ? "Offerte Bewerken" : "Nieuwe Offerte"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={quoteForm.formData.customerId}
          onChange={(e) =>
            quoteForm.handleChange("customerId", e.target.value)
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
          value={quoteForm.formData.validUntil}
          onChange={(e) =>
            quoteForm.handleChange("validUntil", e.target.value)
          }
          placeholder="Geldig tot *"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">BTW:</label>
          <input
            type="number"
            value={quoteForm.formData.vatRate}
            onChange={(e) =>
              quoteForm.handleChange(
                "vatRate",
                parseFloat(e.target.value) || 0
              )
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            step="0.1"
          />
          <span className="text-gray-600">%</span>
        </div>
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

        {quoteForm.formData.items.map((item, index) => (
          <QuoteItemRow
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
        labor={quoteForm.formData.labor}
        onAddLabor={handleAddLabor}
        onRemoveLabor={handleRemoveLabor}
        onLaborChange={handleLaborChange}
      />

      <textarea
        placeholder="Notities (optioneel)"
        value={quoteForm.formData.notes}
        onChange={(e) => quoteForm.handleChange("notes", e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
      />

      {/* Totals Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Subtotaal (excl. BTW):</span>
          <span className="font-semibold">
            {formatCurrency(calculateQuoteTotals().subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>BTW ({quoteForm.formData.vatRate}%):</span>
          <span className="font-semibold">
            {formatCurrency(calculateQuoteTotals().vatAmount)}
          </span>
        </div>
        <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
          <span>Totaal (incl. BTW):</span>
          <span>{formatCurrency(calculateQuoteTotals().total)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          {quoteForm.editingQuoteId
            ? "Offerte Bijwerken"
            : "Offerte Aanmaken"}
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

