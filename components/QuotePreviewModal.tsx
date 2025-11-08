/**
 * Quote Preview Modal
 * 
 * Toont een preview van de offerte die wordt aangemaakt vanuit een email
 * en geeft de mogelijkheid om deze te bewerken voordat deze wordt opgeslagen.
 */

import React, { useState, useEffect } from "react";
import { Quote, QuoteItem, QuoteLabor, Customer } from "../types";
import { parseEmailForQuote } from "../utils/emailQuoteParser";
import { findCustomerByEmail } from "../utils/emailCustomerMapping";

interface QuotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quote: Quote, customerId: string) => void;
  emailFrom: string;
  emailSubject: string;
  emailBody: string;
  customers: Customer[];
  onCreateCustomer: (email: string, name: string) => Promise<string>; // Returns customer ID
  currentUserId: string;
}

export const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  emailFrom,
  emailSubject,
  emailBody,
  customers,
  onCreateCustomer,
  currentUserId,
}) => {
  const [quote, setQuote] = useState<Partial<Quote>>({
    items: [],
    labor: [],
    subtotal: 0,
    vatRate: 21,
    vatAmount: 0,
    total: 0,
    notes: "",
    status: "draft",
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Parse email en vul quote wanneer modal opent
  useEffect(() => {
    if (isOpen) {
      const parsed = parseEmailForQuote(emailBody, emailSubject);
      const itemsSubtotal = parsed.items.reduce((sum, item) => sum + item.total, 0);
      const laborSubtotal = parsed.labor
        ? parsed.labor.reduce((sum, l) => sum + l.total, 0)
        : 0;
      const subtotal = itemsSubtotal + laborSubtotal;
      const vatAmount = subtotal * 0.21;
      const total = subtotal + vatAmount;

      setQuote({
        items: parsed.items,
        labor: parsed.labor,
        subtotal,
        vatRate: 21,
        vatAmount,
        total,
        notes: parsed.notes || emailBody,
        status: "draft",
      });

      // Zoek bestaande klant op basis van email mapping eerst
      const mappedCustomerId = findCustomerByEmail(emailFrom);
      let matchingCustomer = mappedCustomerId
        ? customers.find((c) => c.id === mappedCustomerId)
        : null;

      // Als geen mapping, zoek in customers
      if (!matchingCustomer) {
        matchingCustomer = customers.find(
          (c) =>
            c.email.toLowerCase() === emailFrom.toLowerCase() ||
            c.emailAddresses?.some((e) => e.toLowerCase() === emailFrom.toLowerCase())
        );
      }

      setSelectedCustomerId(matchingCustomer?.id || "");
      setNewCustomerName(emailFrom.split("@")[0]);
    }
  }, [isOpen, emailFrom, emailSubject, emailBody, customers]);

  const handleAddItem = () => {
    setQuote({
      ...quote,
      items: [
        ...(quote.items || []),
        { description: "", quantity: 1, pricePerUnit: 0, total: 0 },
      ],
    });
  };

  const handleAddLabor = () => {
    setQuote({
      ...quote,
      labor: [
        ...(quote.labor || []),
        { description: "", hours: 1, hourlyRate: 50, total: 50 },
      ],
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof QuoteItem,
    value: string | number
  ) => {
    const items = [...(quote.items || [])];
    items[index] = { ...items[index], [field]: value };
    if (field === "quantity" || field === "pricePerUnit") {
      items[index].total =
        items[index].quantity * items[index].pricePerUnit;
    }
    updateTotals({ ...quote, items });
  };

  const handleLaborChange = (
    index: number,
    field: keyof QuoteLabor,
    value: string | number
  ) => {
    const labor = [...(quote.labor || [])];
    labor[index] = { ...labor[index], [field]: value };
    if (field === "hours" || field === "hourlyRate") {
      labor[index].total = labor[index].hours * labor[index].hourlyRate;
    }
    updateTotals({ ...quote, labor });
  };

  const handleRemoveItem = (index: number) => {
    const items = [...(quote.items || [])];
    items.splice(index, 1);
    updateTotals({ ...quote, items });
  };

  const handleRemoveLabor = (index: number) => {
    const labor = [...(quote.labor || [])];
    labor.splice(index, 1);
    updateTotals({ ...quote, labor });
  };

  const updateTotals = (updatedQuote: Partial<Quote>) => {
    const itemsSubtotal = (updatedQuote.items || []).reduce(
      (sum, item) => sum + item.total,
      0
    );
    const laborSubtotal = (updatedQuote.labor || []).reduce(
      (sum, l) => sum + l.total,
      0
    );
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * ((updatedQuote.vatRate || 21) / 100);
    const total = subtotal + vatAmount;

    setQuote({
      ...updatedQuote,
      subtotal,
      vatAmount,
      total,
    });
  };

  const handleSave = async () => {
    if (!selectedCustomerId && !isCreatingCustomer) {
      alert("Selecteer een klant of maak een nieuwe klant aan");
      return;
    }

    setIsSaving(true);
    try {
      let customerId = selectedCustomerId;

      // Maak nieuwe klant aan indien nodig
      if (isCreatingCustomer && !customerId) {
        if (!newCustomerName.trim()) {
          alert("Vul een naam in voor de nieuwe klant");
          setIsSaving(false);
          return;
        }
        customerId = await onCreateCustomer(emailFrom, newCustomerName);
      }

      if (!customerId) {
        alert("Geen klant geselecteerd");
        setIsSaving(false);
        return;
      }

      const finalQuote: Quote = {
        id: `Q${Date.now()}`,
        customerId,
        items: quote.items || [],
        labor: quote.labor && quote.labor.length > 0 ? quote.labor : undefined,
        subtotal: quote.subtotal || 0,
        vatRate: quote.vatRate || 21,
        vatAmount: quote.vatAmount || 0,
        total: quote.total || 0,
        notes: quote.notes || "",
        status: "draft",
        createdDate: new Date().toISOString(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        createdBy: currentUserId,
        history: [
          {
            timestamp: new Date().toISOString(),
            action: "created",
            performedBy: currentUserId,
            details: `Automatisch aangemaakt vanuit email: ${emailSubject}`,
          },
        ],
      };

      onConfirm(finalQuote, customerId);
      onClose();
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("Fout bij aanmaken offerte");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Offerte Preview & Bewerken</h2>

        {/* Email Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Van:</strong> {emailFrom}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Onderwerp:</strong> {emailSubject}
          </p>
        </div>

        {/* Customer Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Klant <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setIsCreatingCustomer(false);
              }}
              className="flex-1 border rounded px-3 py-2"
              disabled={isCreatingCustomer}
            >
              <option value="">Selecteer klant...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setIsCreatingCustomer(!isCreatingCustomer);
                setSelectedCustomerId("");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isCreatingCustomer ? "Annuleer" : "Nieuwe Klant"}
            </button>
          </div>

          {isCreatingCustomer && (
            <div className="mt-2 p-3 bg-blue-50 rounded">
              <label className="block text-sm font-medium mb-1">Naam</label>
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Naam van de klant"
              />
              <p className="text-xs text-gray-600 mt-1">
                Email: {emailFrom}
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Producten/Materialen</h3>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              + Item
            </button>
          </div>
          <div className="space-y-2">
            {(quote.items || []).map((item, index) => (
              <div key={index} className="flex gap-2 items-center border p-2 rounded">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  placeholder="Beschrijving"
                  className="flex-1 border rounded px-2 py-1"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", parseInt(e.target.value) || 0)
                  }
                  placeholder="Aantal"
                  className="w-20 border rounded px-2 py-1"
                  min="1"
                />
                <input
                  type="number"
                  value={item.pricePerUnit}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      "pricePerUnit",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Prijs"
                  className="w-24 border rounded px-2 py-1"
                  step="0.01"
                  min="0"
                />
                <span className="w-24 text-right font-medium">
                  €{item.total.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
            {(!quote.items || quote.items.length === 0) && (
              <p className="text-sm text-gray-500 italic">
                Geen items gevonden. Voeg handmatig items toe.
              </p>
            )}
          </div>
        </div>

        {/* Labor */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Werkuren/Diensten</h3>
            <button
              onClick={handleAddLabor}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              + Werkuren
            </button>
          </div>
          <div className="space-y-2">
            {(quote.labor || []).map((labor, index) => (
              <div key={index} className="flex gap-2 items-center border p-2 rounded">
                <input
                  type="text"
                  value={labor.description}
                  onChange={(e) =>
                    handleLaborChange(index, "description", e.target.value)
                  }
                  placeholder="Beschrijving"
                  className="flex-1 border rounded px-2 py-1"
                />
                <input
                  type="number"
                  value={labor.hours}
                  onChange={(e) =>
                    handleLaborChange(index, "hours", parseFloat(e.target.value) || 0)
                  }
                  placeholder="Uren"
                  className="w-20 border rounded px-2 py-1"
                  step="0.1"
                  min="0"
                />
                <input
                  type="number"
                  value={labor.hourlyRate}
                  onChange={(e) =>
                    handleLaborChange(
                      index,
                      "hourlyRate",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Tarief"
                  className="w-24 border rounded px-2 py-1"
                  step="0.01"
                  min="0"
                />
                <span className="w-24 text-right font-medium">
                  €{labor.total.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveLabor(index)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Notities</label>
          <textarea
            value={quote.notes || ""}
            onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Extra notities..."
          />
        </div>

        {/* Totals */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex justify-between mb-1">
            <span>Subtotaal (excl. BTW):</span>
            <span className="font-medium">€{(quote.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>BTW ({quote.vatRate || 21}%):</span>
            <span className="font-medium">€{(quote.vatAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-bold text-lg">
            <span>Totaal (incl. BTW):</span>
            <span>€{(quote.total || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            disabled={isSaving}
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSaving}
          >
            {isSaving ? "Opslaan..." : "Offerte Aanmaken"}
          </button>
        </div>
      </div>
    </div>
  );
};

