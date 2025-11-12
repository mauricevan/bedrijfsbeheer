import React from "react";
import { formatCurrency } from "../../../features/accounting/utils/formatters";

export interface LaborItem {
  description: string;
  hours: number;
  hourlyRate: number;
  total: number;
}

export interface LaborInputProps {
  labor: LaborItem[];
  onAddLabor: () => void;
  onRemoveLabor: (index: number) => void;
  onLaborChange: (index: number, field: keyof LaborItem, value: any) => void;
}

/**
 * LaborInput Component
 * 
 * Reusable component for managing labor items (work hours) in quotes and invoices.
 * Used in QuoteForm and InvoiceForm to avoid code duplication.
 */
export const LaborInput: React.FC<LaborInputProps> = ({
  labor,
  onAddLabor,
  onRemoveLabor,
  onLaborChange,
}) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral">Werkuren (optioneel)</h3>
        <button
          onClick={onAddLabor}
          className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
        >
          + Werkuren Toevoegen
        </button>
      </div>

      {labor.map((laborItem, index) => (
        <div
          key={index}
          className="grid grid-cols-12 gap-2 items-center p-3 bg-green-50 rounded-lg"
        >
          <input
            type="text"
            placeholder="Beschrijving werkzaamheden"
            value={laborItem.description}
            onChange={(e) =>
              onLaborChange(index, "description", e.target.value)
            }
            className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Uren"
            value={laborItem.hours}
            onChange={(e) =>
              onLaborChange(index, "hours", parseFloat(e.target.value) || 0)
            }
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            step="0.5"
            min="0"
          />
          <input
            type="number"
            placeholder="Uurtarief"
            value={laborItem.hourlyRate}
            onChange={(e) =>
              onLaborChange(
                index,
                "hourlyRate",
                parseFloat(e.target.value) || 0
              )
            }
            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            step="0.01"
          />
          <div className="col-span-2 text-right font-medium text-gray-700">
            {formatCurrency(laborItem.total)}
          </div>
          <button
            onClick={() => onRemoveLabor(index)}
            className="col-span-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

