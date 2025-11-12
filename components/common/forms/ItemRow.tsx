import React from "react";
import type { QuoteItem, InventoryItem } from "../../../types";
import { getInventoryItemName } from "../../../features/accounting/utils/helpers";
import { formatCurrency } from "../../../features/accounting/utils/formatters";

export interface ItemRowProps {
  item: QuoteItem;
  index: number;
  inventory: InventoryItem[];
  mode?: "display" | "edit";
  // Edit mode props (optional)
  onItemChange?: (index: number, field: keyof QuoteItem, value: any) => void;
  onInventoryItemChange?: (index: number, inventoryItemId: string) => void;
  onRemoveItem?: (index: number) => void;
  // Inventory selection props (for edit mode)
  inventoryCategoryFilter?: string;
  setInventoryCategoryFilter?: (value: string) => void;
  inventoryCategorySearchTerm?: string;
  setInventoryCategorySearchTerm?: (value: string) => void;
  showInventoryCategoryDropdown?: boolean;
  setShowInventoryCategoryDropdown?: (value: boolean) => void;
  filteredInventoryCategories?: Array<{ id: string; name: string; color?: string }>;
  filteredInventoryForSelection?: InventoryItem[];
  categories?: Array<{ id: string; name: string; color?: string }>;
}

/**
 * Generic ItemRow component for displaying/editing items (quotes/invoices)
 * Supports both display mode (read-only) and edit mode (with editing capabilities)
 * 
 * This component is used by both QuoteItemRow and InvoiceItemRow to avoid code duplication.
 */
export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  index,
  inventory,
  mode = "display",
  onItemChange,
  onInventoryItemChange,
  onRemoveItem,
  inventoryCategoryFilter,
  setInventoryCategoryFilter,
  inventoryCategorySearchTerm,
  setInventoryCategorySearchTerm,
  showInventoryCategoryDropdown,
  setShowInventoryCategoryDropdown,
  filteredInventoryCategories = [],
  filteredInventoryForSelection = [],
  categories = [],
}) => {
  // Display mode - simple read-only display
  if (mode === "display") {
    return (
      <div className="flex justify-between text-sm">
        <span className="text-gray-700">
          {item.inventoryItemId
            ? getInventoryItemName(item.inventoryItemId, inventory)
            : item.description}
          <span className="text-gray-500">
            {" "}
            (×{item.quantity})
          </span>
        </span>
        <span className="font-medium">{formatCurrency(item.total)}</span>
      </div>
    );
  }

  // Edit mode - full editing capabilities
  return (
    <div className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
      {item.inventoryItemId !== undefined ? (
        <div className="col-span-5 space-y-2">
          {/* Category Filter & Search */}
          {categories.length > 0 && setShowInventoryCategoryDropdown && (
            <div className="flex gap-2">
              <div className="relative flex-1" style={{ minWidth: "150px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowInventoryCategoryDropdown(
                      !showInventoryCategoryDropdown
                    );
                    if (setInventoryCategorySearchTerm) {
                      setInventoryCategorySearchTerm("");
                    }
                  }}
                  className={`w-full px-3 py-1.5 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-xs ${
                    inventoryCategoryFilter
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">
                      {inventoryCategoryFilter
                        ? categories.find(
                            (c) => c.id === inventoryCategoryFilter
                          )?.name || "Categorie"
                        : "🏷️ Categorie"}
                    </span>
                    <span className="text-xs">▼</span>
                  </div>
                </button>

                {showInventoryCategoryDropdown &&
                  setShowInventoryCategoryDropdown &&
                  setInventoryCategorySearchTerm && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowInventoryCategoryDropdown(false)}
                      />
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            placeholder="Zoek categorie..."
                            value={inventoryCategorySearchTerm || ""}
                            onChange={(e) =>
                              setInventoryCategorySearchTerm(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          <button
                            type="button"
                            onClick={() => {
                              if (setInventoryCategoryFilter) {
                                setInventoryCategoryFilter("");
                              }
                              setShowInventoryCategoryDropdown(false);
                              setInventoryCategorySearchTerm("");
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors ${
                              !inventoryCategoryFilter
                                ? "bg-blue-50 font-semibold"
                                : ""
                            }`}
                          >
                            <span className="text-gray-600">
                              Alle categorieën
                            </span>
                          </button>
                          {filteredInventoryCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                if (setInventoryCategoryFilter) {
                                  setInventoryCategoryFilter(category.id);
                                }
                                setShowInventoryCategoryDropdown(false);
                                setInventoryCategorySearchTerm("");
                              }}
                              className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                                inventoryCategoryFilter === category.id
                                  ? "bg-blue-50 font-semibold"
                                  : ""
                              }`}
                            >
                              <div
                                className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                style={{
                                  backgroundColor: category.color || "#3B82F6",
                                }}
                              />
                              <span>{category.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
              </div>
              {inventoryCategoryFilter && setInventoryCategoryFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setInventoryCategoryFilter("");
                    if (setInventoryCategorySearchTerm) {
                      setInventoryCategorySearchTerm("");
                    }
                  }}
                  className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Inventory dropdown */}
          {onInventoryItemChange && (
            <select
              value={item.inventoryItemId}
              onChange={(e) => {
                onInventoryItemChange(index, e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecteer voorraad item</option>
              {filteredInventoryForSelection.map((i) => {
                const price = i.price || i.salePrice || 0;
                return (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.autoSku || i.sku}) - €{price.toFixed(2)}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      ) : (
        <input
          type="text"
          placeholder="Beschrijving"
          value={item.description}
          onChange={(e) =>
            onItemChange?.(index, "description", e.target.value)
          }
          className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      )}
      <input
        type="number"
        placeholder="Aantal"
        value={item.quantity}
        onChange={(e) =>
          onItemChange?.(
            index,
            "quantity",
            parseInt(e.target.value) || 0
          )
        }
        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        min="1"
        disabled={mode === "display"}
      />
      <input
        type="number"
        placeholder="Prijs/stuk"
        value={item.pricePerUnit}
        onChange={(e) =>
          onItemChange?.(
            index,
            "pricePerUnit",
            parseFloat(e.target.value) || 0
          )
        }
        className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        step="0.01"
        disabled={mode === "display" || !!item.inventoryItemId}
      />
      <div className="col-span-2 text-right font-medium text-gray-700">
        {formatCurrency(item.total)}
      </div>
      {mode === "edit" && onRemoveItem && (
        <button
          onClick={() => onRemoveItem(index)}
          className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
};

