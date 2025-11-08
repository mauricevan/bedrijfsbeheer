import React, { useState } from 'react';
import { Customer, Quote, QuoteItem, QuoteLabor } from '../types';
import { parseEmlFile } from '../utils/emlParser';
import { parseEmailForQuote } from '../utils/emailQuoteParser';

interface QuoteEmailIntegrationProps {
  customers: Customer[];
  onQuoteCreated: (quote: Quote) => void;
}

export const QuoteEmailIntegration: React.FC<QuoteEmailIntegrationProps> = ({
  customers,
  onQuoteCreated,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsProcessing(true);

    try {
      const files = Array.from(e.dataTransfer.files);
      const emlFile = files.find((f) => f.name.endsWith('.eml'));

      if (!emlFile) {
        alert('⚠️ Geen .eml bestand gevonden. Sleep een Outlook email (.eml) hierheen.');
        setIsProcessing(false);
        return;
      }

      // Parse EML file
      const emailData = await parseEmlFile(emlFile);
      
      // Parse for quote data
      const quoteData = parseEmailForQuote(emailData);

      // Try to match customer based on email
      const matchedCustomer = customers.find(
        (c) =>
          c.email?.toLowerCase() === emailData.from?.toLowerCase() ||
          c.email?.toLowerCase() === emailData.to?.toLowerCase()
      );

      setParsedData({ emailData, quoteData, matchedCustomer });
      setSelectedCustomerId(matchedCustomer?.id || '');
      setShowPreview(true);
    } catch (error) {
      console.error('Error parsing email:', error);
      alert('❌ Fout bij het verwerken van de email. Controleer het bestandsformaat.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedCustomerId || !parsedData) return;

    const { quoteData, emailData } = parsedData;
    const now = new Date().toISOString();

    // Create Quote object
    const quote: Quote = {
      id: `Q${Date.now()}`,
      customerId: selectedCustomerId,
      items: quoteData.items || [],
      labor: quoteData.labor && quoteData.labor.length > 0 ? quoteData.labor : undefined,
      subtotal: quoteData.subtotal || 0,
      vatRate: 21,
      vatAmount: (quoteData.subtotal || 0) * 0.21,
      total: (quoteData.subtotal || 0) * 1.21,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      validUntil: '',
      notes: `Aangemaakt vanuit email: ${emailData.subject || ''}

Van: ${emailData.from || 'Onbekend'}
Datum: ${emailData.date || new Date().toISOString()}

Originele inhoud:
${emailData.body?.substring(0, 500) || ''}`,
      createdBy: 'system',
      timestamps: {
        created: now,
      },
      history: [
        {
          timestamp: now,
          action: 'created',
          performedBy: 'system',
          details: `Offerte automatisch aangemaakt vanuit email parsing`,
        },
      ],
    };

    onQuoteCreated(quote);
    handleCancel();
  };

  const handleCancel = () => {
    setShowPreview(false);
    setParsedData(null);
    setSelectedCustomerId('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📧</span>
        <div>
          <h3 className="font-semibold text-lg text-neutral">
            Email naar Offerte Parser
          </h3>
          <p className="text-sm text-gray-600">
            Sleep een Outlook email (.eml) hierheen om automatisch een offerte aan te maken
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      >
        {isProcessing ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 font-medium">Email verwerken...</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">📨</div>
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Sleep Outlook Email Hier
            </p>
            <p className="text-sm text-gray-500">
              Ondersteunde formaten: .eml bestanden uit Outlook
            </p>
            <p className="text-xs text-gray-400 mt-2">
              De email wordt automatisch geparset voor producten, diensten en werkuren
            </p>
          </>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && parsedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-neutral flex items-center gap-2">
                <span>📧</span>
                <span>Email Preview & Offerte Aanmaken</span>
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Email Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Email Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Van:</span>
                    <p className="text-gray-800">{parsedData.emailData.from || 'Onbekend'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Onderwerp:</span>
                    <p className="text-gray-800">{parsedData.emailData.subject || 'Geen onderwerp'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Datum:</span>
                    <p className="text-gray-800">
                      {parsedData.emailData.date
                        ? new Date(parsedData.emailData.date).toLocaleString('nl-NL')
                        : 'Onbekend'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecteer Klant *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Kies een klant --</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.email ? `(${customer.email})` : ''}
                    </option>
                  ))}
                </select>
                {parsedData.matchedCustomer && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Automatisch gematcht: {parsedData.matchedCustomer.name}
                  </p>
                )}
              </div>

              {/* Parsed Quote Data */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">
                  Geparseerde Offerte Data
                </h3>

                {/* Items */}
                {parsedData.quoteData.items && parsedData.quoteData.items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Items ({parsedData.quoteData.items.length})
                    </h4>
                    <div className="space-y-2">
                      {parsedData.quoteData.items.map((item: QuoteItem, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white rounded p-2 text-sm flex justify-between"
                        >
                          <span className="text-gray-700">{item.description}</span>
                          <span className="font-medium">
                            {item.quantity}x €{item.pricePerUnit.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Labor */}
                {parsedData.quoteData.labor && parsedData.quoteData.labor.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Werkuren ({parsedData.quoteData.labor.length})
                    </h4>
                    <div className="space-y-2">
                      {parsedData.quoteData.labor.map((labor: QuoteLabor, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white rounded p-2 text-sm flex justify-between"
                        >
                          <span className="text-gray-700">{labor.description}</span>
                          <span className="font-medium">
                            {labor.hours}u × €{labor.hourlyRate.toFixed(2)}/u
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="border-t border-blue-200 pt-3 mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Subtotaal:</span>
                    <span className="font-semibold">
                      €{(parsedData.quoteData.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">BTW (21%):</span>
                    <span className="font-semibold">
                      €{((parsedData.quoteData.subtotal || 0) * 0.21).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Totaal:</span>
                    <span className="text-primary">
                      €{((parsedData.quoteData.subtotal || 0) * 1.21).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Warning if no items found */}
                {(!parsedData.quoteData.items || parsedData.quoteData.items.length === 0) &&
                  (!parsedData.quoteData.labor || parsedData.quoteData.labor.length === 0) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600 text-lg">⚠️</span>
                        <div>
                          <p className="text-sm font-semibold text-orange-800">
                            Geen Items of Werkuren Gevonden
                          </p>
                          <p className="text-xs text-orange-700">
                            Er zijn geen items of werkuren uit de email gehaald. 
                            Je kunt deze handmatig toevoegen nadat je de offerte hebt aangemaakt.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleConfirm}
                  disabled={!selectedCustomerId}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedCustomerId
                      ? 'bg-primary text-white hover:bg-secondary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ✓ Offerte Formulier Invullen
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
