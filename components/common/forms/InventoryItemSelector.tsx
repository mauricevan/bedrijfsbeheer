import React from "react";
import type { InventoryItem, InventoryCategory } from "../../../types";

export interface InventoryItemSelectorProps {
  inventory: InventoryItem[];
  categories: InventoryCategory[];
  onAddInventoryItem: () => void;
  onAddCustomItem: () => void;
  // Inventory selection state (from useInventorySelection hook)
  inventorySearchTerm: string;
  setInventorySearchTerm: (value: string) => void;
  inventoryCategoryFilter: string;
  setInventoryCategoryFilter: (value: string) => void;
  inventoryCategorySearchTerm: string;
  setInventoryCategorySearchTerm: (value: string) => void;
  showInventoryCategoryDropdown: boolean;
  setShowInventoryCategoryDropdown: (value: boolean) => void;
  filteredInventoryCategories: Array<{ id: string; name: string; color?: string }>;
}

/**
 * InventoryItemSelector Component
 * 
 * Reusable component for selecting inventory items with category filtering and search.
 * Used in QuoteForm and InvoiceForm to avoid code duplication.
 * 
 * Note: This component receives inventory selection state via props, which should be
 * provided by the useInventorySelection hook in the parent component.
 */
export const InventoryItemSelector: React.FC<InventoryItemSelectorProps> = ({
  inventory,
  categories,
  onAddInventoryItem,
  onAddCustomItem,
  inventorySearchTerm,
  setInventorySearchTerm,
  inventoryCategoryFilter,
  setInventoryCategoryFilter,
  inventoryCategorySearchTerm,
  setInventoryCategorySearchTerm,
  showInventoryCategoryDropdown,
  setShowInventoryCategoryDropdown,
  filteredInventoryCategories,
}) => {

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral">Items</h3>
        <div className="flex gap-2">
          <button
            onClick={onAddInventoryItem}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
          >
            + Uit Voorraad
          </button>
          <button
            onClick={onAddCustomItem}
            className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
          >
            + Custom Item
          </button>
        </div>
      </div>

      {/* Category Filter & Search */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Filter Dropdown */}
          <div
            className="relative flex-shrink-0"
            style={{ minWidth: "180px", maxWidth: "250px" }}
          >
            <button
              type="button"
              onClick={() => {
                setShowInventoryCategoryDropdown(!showInventoryCategoryDropdown);
                setInventoryCategorySearchTerm("");
              }}
              className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${
                inventoryCategoryFilter
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {inventoryCategoryFilter
                    ? categories.find((c) => c.id === inventoryCategoryFilter)
                        ?.name || "Categorie"
                    : "🏷️ Categorie..."}
                </span>
                <span className="text-xs">▼</span>
              </div>
            </button>

            {showInventoryCategoryDropdown && (
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
                      value={inventoryCategorySearchTerm}
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
                        setInventoryCategoryFilter("");
                        setShowInventoryCategoryDropdown(false);
                        setInventoryCategorySearchTerm("");
                      }}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 transition-colors ${
                        !inventoryCategoryFilter
                          ? "bg-blue-50 font-semibold"
                          : ""
                      }`}
                    >
                      <span className="text-gray-600">Alle categorieën</span>
                    </button>
                    {filteredInventoryCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setInventoryCategoryFilter(category.id);
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
                        <span className="ml-auto text-xs text-gray-500">
                          (
                          {
                            inventory.filter(
                              (i) => i.categoryId === category.id
                            ).length
                          }
                          )
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Clear filter button */}
          {inventoryCategoryFilter && (
            <button
              type="button"
              onClick={() => {
                setInventoryCategoryFilter("");
                setInventoryCategorySearchTerm("");
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ✕ Wis
            </button>
          )}

          {/* Search input */}
          <input
            type="text"
            placeholder="Zoek op naam, SKU, categorie..."
            value={inventorySearchTerm}
            onChange={(e) => setInventorySearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </>
  );
};

