import React, { useState, useMemo, useEffect } from 'react';
import { 
  CartItem, 
  Sale, 
  Customer, 
  InventoryItem, 
  Transaction, 
  PaymentMethod,
  PackingSlip,
  Invoice,
} from '../types';

interface POSProps {
  products: any[]; // Legacy Product type
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customers: Customer[];
  invoices?: Invoice[];
  setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

type POSMode = 'b2c' | 'b2b'; // B2C = Kassa (Particulier), B2B = Pakbon (Bedrijf)

export const POS: React.FC<POSProps> = ({ 
  inventory, 
  setInventory, 
  sales, 
  setSales,
  setTransactions,
  customers,
  invoices = [],
  setInvoices,
}) => {
  // Mode: B2C (Kassa) of B2B (Pakbon)
  const [mode, setMode] = useState<POSMode>('b2c');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showManualItemModal, setShowManualItemModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPackingSlipModal, setShowPackingSlipModal] = useState(false);
  const [showFavoritesSettings, setShowFavoritesSettings] = useState(false);
  
  // Favorieten / Snelkoppelingen
  const [favoriteItems, setFavoriteItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('pos_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [maxFavorites, setMaxFavorites] = useState<number>(() => {
    const saved = localStorage.getItem('pos_max_favorites');
    return saved ? parseInt(saved) : 8; // Default 8 snelkoppelingen
  });
  
  // Manual item form
  const [manualItem, setManualItem] = useState<Partial<CartItem>>({
    name: '',
    price: 0,
    vatRate: '21',
    unit: 'stuk',
    isManual: true,
  });

  // Sla favorieten op in localStorage
  useEffect(() => {
    localStorage.setItem('pos_favorites', JSON.stringify(favoriteItems));
  }, [favoriteItems]);

  useEffect(() => {
    localStorage.setItem('pos_max_favorites', maxFavorites.toString());
  }, [maxFavorites]);

  // Favorieten items uit inventory
  const favoriteInventoryItems = useMemo(() => {
    return inventory.filter(item => favoriteItems.includes(item.id)).slice(0, maxFavorites);
  }, [inventory, favoriteItems, maxFavorites]);

  // Toggle favoriet
  const toggleFavorite = (itemId: string) => {
    if (favoriteItems.includes(itemId)) {
      setFavoriteItems(favoriteItems.filter(id => id !== itemId));
    } else {
      if (favoriteItems.length >= maxFavorites) {
        alert(`⚠️ Maximum aantal favorieten bereikt (${maxFavorites}). Verwijder eerst een favoriet of verhoog het maximum in instellingen.`);
        return;
      }
      setFavoriteItems([...favoriteItems, itemId]);
    }
  };

  // Filtered inventory voor zoekbalk (exclusief favorieten, die komen bovenaan)
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventory.filter(item => !favoriteItems.includes(item.id)).slice(0, 20);
    
    const term = searchTerm.toLowerCase();
    return inventory.filter(item =>
      !favoriteItems.includes(item.id) && (
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term)
      )
    ).slice(0, 20);
  }, [inventory, searchTerm, favoriteItems]);

  // Helper functions
  const calculateVatInclusive = (priceExcl: number, vatRate: '21' | '9' | '0' | 'custom', customRate?: number): number => {
    const rate = vatRate === 'custom' ? (customRate || 0) : parseFloat(vatRate);
    return priceExcl * (1 + rate / 100);
  };

  const getVatRateValue = (vatRate: '21' | '9' | '0' | 'custom', customRate?: number): number => {
    if (vatRate === 'custom') return customRate || 0;
    return parseFloat(vatRate);
  };

  // Cart calculations
  const calculateCartTotals = useMemo(() => {
    let subtotalExclVat = 0;
    let totalVat = 0;
    const vatBreakdown: { rate: number; amount: number }[] = [];

    cart.forEach(item => {
      const priceAfterDiscount = item.price * (1 - (item.discount || 0) / 100);
      const itemSubtotal = priceAfterDiscount * item.quantity;
      const vatRate = getVatRateValue(item.vatRate, item.customVatRate);
      const itemVat = itemSubtotal * (vatRate / 100);
      
      subtotalExclVat += itemSubtotal;
      totalVat += itemVat;

      const existingRate = vatBreakdown.find(b => b.rate === vatRate);
      if (existingRate) {
        existingRate.amount += itemVat;
      } else {
        vatBreakdown.push({ rate: vatRate, amount: itemVat });
      }
    });

    return {
      subtotalExclVat: Math.round(subtotalExclVat * 100) / 100,
      totalVat: Math.round(totalVat * 100) / 100,
      totalInclVat: Math.round((subtotalExclVat + totalVat) * 100) / 100,
      vatBreakdown,
    };
  }, [cart]);

  // Add item from inventory to cart
  const addInventoryItemToCart = (item: InventoryItem) => {
    const existingCartItem = cart.find(c => c.inventoryItemId === item.id);
    
    // Check stock
    if (!item.isManual && item.quantity <= 0) {
      alert(`⚠️ "${item.name}" is niet op voorraad!`);
      return;
    }

    const priceInclVat = calculateVatInclusive(item.salePrice, item.vatRate, item.customVatRate);
    
    if (existingCartItem) {
      setCart(cart.map(c =>
        c.id === existingCartItem.id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      const newCartItem: CartItem = {
        id: Date.now().toString(),
        name: item.name,
        price: item.salePrice, // Prijs excl. BTW
        quantity: 1,
        vatRate: item.vatRate,
        customVatRate: item.customVatRate,
        inventoryItemId: item.id,
        sku: item.sku,
        unit: item.unit || 'stuk',
        isManual: false,
      };
      setCart([...cart, newCartItem]);
    }
  };

  // Add manual item to cart
  const handleAddManualItem = () => {
    if (!manualItem.name || !manualItem.price) {
      alert('⚠️ Vul ten minste naam en prijs in.');
      return;
    }

    const newCartItem: CartItem = {
      id: `manual-${Date.now()}`,
      name: manualItem.name!,
      price: manualItem.price!,
      quantity: 1,
      vatRate: manualItem.vatRate || '21',
      customVatRate: manualItem.customVatRate,
      unit: manualItem.unit || 'stuk',
      isManual: true,
    };

    setCart([...cart, newCartItem]);
    setManualItem({
      name: '',
      price: 0,
      vatRate: '21',
      unit: 'stuk',
      isManual: true,
    });
    setShowManualItemModal(false);
  };

  // Update cart item quantity
  const updateCartQuantity = (itemId: string, delta: number) => {
    const item = cart.find(c => c.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      setCart(cart.filter(c => c.id !== itemId));
    } else {
      // Check stock voor non-manual items
      if (!item.isManual && item.inventoryItemId) {
        const invItem = inventory.find(i => i.id === item.inventoryItemId);
        if (invItem && newQuantity > invItem.quantity) {
          alert(`⚠️ Onvoldoende voorraad! Beschikbaar: ${invItem.quantity} ${invItem.unit || 'stuk'}`);
          return;
        }
      }
      
      setCart(cart.map(c =>
        c.id === itemId ? { ...c, quantity: newQuantity } : c
      ));
    }
  };

  // Apply discount to cart item
  const applyDiscount = (itemId: string, discountPercent: number) => {
    if (discountPercent < 0 || discountPercent > 100) {
      alert('⚠️ Korting moet tussen 0% en 100% zijn.');
      return;
    }
    
    setCart(cart.map(c =>
      c.id === itemId ? { ...c, discount: discountPercent } : c
    ));
  };

  // Apply discount to entire cart
  const applyCartDiscount = (discountPercent: number) => {
    if (discountPercent < 0 || discountPercent > 100) {
      alert('⚠️ Korting moet tussen 0% en 100% zijn.');
      return;
    }
    
    setCart(cart.map(c => ({ ...c, discount: discountPercent })));
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Weet u zeker dat u de winkelwagen wilt legen?')) {
      setCart([]);
    }
  };

  // Complete B2C sale (Direct payment)
  const completeB2CSale = (paymentMethod: PaymentMethod) => {
    if (cart.length === 0) {
      alert('⚠️ Winkelwagen is leeg!');
      return;
    }

    // Check stock voor alle items
    const stockErrors: string[] = [];
    cart.forEach(cartItem => {
      if (!cartItem.isManual && cartItem.inventoryItemId) {
        const invItem = inventory.find(i => i.id === cartItem.inventoryItemId);
        if (invItem && cartItem.quantity > invItem.quantity) {
          stockErrors.push(`${cartItem.name}: onvoldoende voorraad (beschikbaar: ${invItem.quantity})`);
        }
      }
    });

    if (stockErrors.length > 0) {
      alert(`⚠️ Voorraad problemen:\n\n${stockErrors.join('\n')}`);
      return;
    }

    // Update inventory
    const updatedInventory = inventory.map(item => {
      const cartItem = cart.find(c => c.inventoryItemId === item.id);
      if (cartItem && !cartItem.isManual) {
        return { ...item, quantity: item.quantity - cartItem.quantity, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    setInventory(updatedInventory);

    // Create sale
    const sale: Sale = {
      id: `s${Date.now()}`,
      items: cart.map(c => ({
        id: c.id,
        name: c.name,
        price: c.price,
        inventoryItemId: c.inventoryItemId,
        quantity: c.quantity,
      })),
      total: calculateCartTotals.totalInclVat,
      customerId: selectedCustomer?.id || null,
      date: new Date().toISOString().split('T')[0],
    };
    setSales([...sales, sale]);

    // Create transaction
    const transaction: Transaction = {
      id: `t${Date.now()}`,
      type: 'income',
      description: `POS Verkoop (${paymentMethod})${selectedCustomer ? ` - ${selectedCustomer.name}` : ''}`,
      amount: calculateCartTotals.totalInclVat,
      date: sale.date,
    };
    setTransactions(prev => [...prev, transaction]);

    // Reset
    setCart([]);
    setSelectedCustomer(null);
    setShowPaymentModal(false);
    alert(`✅ Verkoop succesvol! Totaal: €${calculateCartTotals.totalInclVat.toFixed(2)}`);
  };

  // Generate packing slip for B2B
  const generatePackingSlip = () => {
    if (cart.length === 0) {
      alert('⚠️ Winkelwagen is leeg!');
      return;
    }

    if (!selectedCustomer) {
      alert('⚠️ Selecteer eerst een bedrijf voor pakbon!');
      return;
    }

    // Check if customer has credit limit (mock check)
    const hasCreditLimit = selectedCustomer.creditLimit && selectedCustomer.creditLimit > 0;
    
    // Generate packing slip number
    const packingSlipNumber = `PKB-${new Date().getFullYear()}-${String((invoices?.length || 0) + 1).padStart(3, '0')}`;
    
    // Calculate due date (14 days default, or from customer settings)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (selectedCustomer.paymentTerms || 14));
    
    const packingSlip: PackingSlip = {
      id: `pkb-${Date.now()}`,
      packingSlipNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      items: [...cart],
      subtotalExclVat: calculateCartTotals.subtotalExclVat,
      totalVat: calculateCartTotals.totalVat,
      totalInclVat: calculateCartTotals.totalInclVat,
      dueDate: dueDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'pending',
      shippingAddress: selectedCustomer.address,
    };

    // Create invoice from packing slip (for B2B)
    if (setInvoices) {
      const invoiceNumber = `${new Date().getFullYear()}-${String((invoices.length + 1)).padStart(3, '0')}`;
      const invoice: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email || '',
        items: cart.map(c => ({
          id: c.id,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
          inventoryItemId: c.inventoryItemId,
        })),
        subtotal: calculateCartTotals.subtotalExclVat,
        tax: calculateCartTotals.totalVat,
        total: calculateCartTotals.totalInclVat,
        status: 'sent',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: packingSlip.dueDate,
        paidDate: undefined,
        notes: `Pakbon ${packingSlipNumber}`,
        history: [],
        timestamps: {
          created: new Date().toISOString(),
          sent: new Date().toISOString(),
        },
      };
      
      setInvoices(prev => [...prev, invoice]);
      packingSlip.invoiceId = invoice.id;
    }

    // Show packing slip modal
    setShowPackingSlipModal(true);
    
    // Reset
    setCart([]);
    setSelectedCustomer(null);
    
    alert(`✅ Pakbon aangemaakt: ${packingSlipNumber}\nTotaal: €${calculateCartTotals.totalInclVat.toFixed(2)}\nVervaldatum: ${new Date(packingSlip.dueDate).toLocaleDateString('nl-NL')}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral">Kassasysteem (POS)</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Snelle checkout voor particulieren • Pakbonnen voor bedrijven
          </p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-3 bg-white rounded-lg p-2 shadow-md">
          <button
            onClick={() => {
              setMode('b2c');
              setSelectedCustomer(null);
              setCart([]);
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              mode === 'b2c'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💰 Kassa (B2C)
          </button>
          <button
            onClick={() => {
              setMode('b2b');
              setCart([]);
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              mode === 'b2b'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📦 Pakbon (B2B)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Search & Products */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={mode === 'b2c' 
                  ? "🔍 Zoek item (bijv. 'sta' voor staalplaat)..." 
                  : "🔍 Zoek item voor pakbon..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
              />
              <button
                onClick={() => setShowManualItemModal(true)}
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold whitespace-nowrap flex items-center gap-2"
                title="Handmatig item toevoegen voor éénmalig gebruik (wordt niet opgeslagen in voorraad)"
              >
                <span>➕</span>
                <span>Handmatig Item (1x)</span>
              </button>
            </div>
          </div>

          {/* Customer Selection (B2B only) */}
          {mode === 'b2b' && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrijf Selecteren <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              >
                <option value="">Selecteer bedrijf...</option>
                {customers
                  .filter(c => c.type === 'business' || !c.type)
                  .map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.creditLimit ? `(Krediet: €${customer.creditLimit})` : ''}
                    </option>
                  ))}
              </select>
              {selectedCustomer && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Klant:</span> {selectedCustomer.name}
                  </p>
                  {selectedCustomer.email && (
                    <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                  )}
                  {selectedCustomer.address && (
                    <p className="text-sm text-gray-600 mt-1">{selectedCustomer.address}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Customer Selection (B2C - Optional) */}
          {mode === 'b2c' && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Klant (Optioneel) - Voor terugkerende klanten
              </label>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value);
                  setSelectedCustomer(customer || null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Gast (Geen klant)</option>
                {customers
                  .filter(c => c.type === 'individual' || !c.type)
                  .map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Favorites Quick Access */}
          {favoriteInventoryItems.length > 0 && !searchTerm && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-4 sm:p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral">⭐ Snelkoppelingen</h2>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                    {favoriteInventoryItems.length}/{maxFavorites}
                  </span>
                </div>
                <button
                  onClick={() => setShowFavoritesSettings(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Beheer favorieten"
                >
                  ⚙️ Instellingen
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {favoriteInventoryItems.map(item => {
                  const priceInclVat = calculateVatInclusive(item.salePrice, item.vatRate, item.customVatRate);
                  const isLowStock = item.quantity <= item.reorderLevel;
                  const isOutOfStock = item.quantity <= 0;
                  
                  return (
                    <div
                      key={item.id}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all min-h-[100px] flex flex-col justify-between ${
                        isOutOfStock && mode === 'b2c'
                          ? 'border-red-200 bg-red-50 opacity-50'
                          : isLowStock
                          ? 'border-orange-200 bg-orange-50 hover:border-orange-400'
                          : 'border-blue-300 bg-white hover:border-blue-500 hover:shadow-md'
                      }`}
                    >
                      {/* Favorite Star Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-600 text-lg z-10"
                        title="Verwijder uit favorieten"
                      >
                        ⭐
                      </button>
                      
                      <button
                        onClick={() => addInventoryItemToCart(item)}
                        disabled={isOutOfStock && mode === 'b2c'}
                        className="w-full text-left"
                      >
                        <div>
                          <h3 className="font-semibold text-neutral text-sm mb-1 line-clamp-2 pr-6">{item.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{item.sku}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-primary">
                            €{priceInclVat.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            incl. {getVatRateValue(item.vatRate, item.customVatRate)}% BTW
                          </p>
                          {isOutOfStock && mode === 'b2c' ? (
                            <p className="text-xs text-red-600 font-semibold mt-1">❌ Uitverkocht</p>
                          ) : isLowStock ? (
                            <p className="text-xs text-orange-600 font-semibold mt-1">
                              ⚠️ Laag ({item.quantity} {item.unit || 'stuk'})
                            </p>
                          ) : (
                            <p className="text-xs text-gray-600 mt-1">
                              ✓ {item.quantity} {item.unit || 'stuk'} op voorraad
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Help Hint for Favorites */}
          {favoriteItems.length === 0 && !searchTerm && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-1">Tip: Maak Snelkoppelingen</h3>
                  <p className="text-sm text-yellow-700">
                    Klik op de <strong>☆ ster</strong> rechtsboven op een item om het toe te voegen aan uw snelkoppelingen. 
                    Snelkoppelingen verschijnen bovenaan voor snelle toegang!
                  </p>
                  <button
                    onClick={() => setShowFavoritesSettings(true)}
                    className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900 font-medium"
                  >
                    ⚙️ Configureer aantal snelkoppelingen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Items Grid */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral">
                {searchTerm ? `Zoekresultaten (${filteredInventory.length})` : 'Alle Items'}
              </h2>
              {!searchTerm && favoriteItems.length > 0 && (
                <button
                  onClick={() => setShowFavoritesSettings(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                  title="Beheer favorieten"
                >
                  ⚙️ Favorieten ({favoriteItems.length}/{maxFavorites})
                </button>
              )}
            </div>
            
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Geen items gevonden</p>
                <p className="text-sm text-gray-400">
                  Typ in de zoekbalk om te zoeken, of klik op "+ Nieuw Item" om handmatig toe te voegen
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredInventory.map(item => {
                  const priceInclVat = calculateVatInclusive(item.salePrice, item.vatRate, item.customVatRate);
                  const isLowStock = item.quantity <= item.reorderLevel;
                  const isOutOfStock = item.quantity <= 0;
                  const isFavorite = favoriteItems.includes(item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all min-h-[100px] flex flex-col justify-between ${
                        isOutOfStock && mode === 'b2c'
                          ? 'border-red-200 bg-red-50 opacity-50'
                          : isLowStock
                          ? 'border-orange-200 bg-orange-50 hover:border-orange-400 hover:bg-orange-100'
                          : 'border-gray-200 bg-white hover:border-primary hover:bg-blue-50 cursor-pointer'
                      }`}
                    >
                      {/* Favorite Star Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className={`absolute top-2 right-2 text-lg z-10 ${
                          isFavorite 
                            ? 'text-yellow-500 hover:text-gray-400' 
                            : 'text-gray-300 hover:text-yellow-500'
                        }`}
                        title={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
                      >
                        {isFavorite ? '⭐' : '☆'}
                      </button>
                      
                      <button
                        onClick={() => addInventoryItemToCart(item)}
                        disabled={isOutOfStock && mode === 'b2c'}
                        className="w-full text-left"
                      >
                        <div>
                          <h3 className="font-semibold text-neutral text-sm mb-1 line-clamp-2 pr-6">{item.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{item.sku}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-primary">
                            €{priceInclVat.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            incl. {getVatRateValue(item.vatRate, item.customVatRate)}% BTW
                          </p>
                          {isOutOfStock && mode === 'b2c' ? (
                            <p className="text-xs text-red-600 font-semibold mt-1">❌ Uitverkocht</p>
                          ) : isLowStock ? (
                            <p className="text-xs text-orange-600 font-semibold mt-1">
                              ⚠️ Laag ({item.quantity} {item.unit || 'stuk'})
                            </p>
                          ) : (
                            <p className="text-xs text-gray-600 mt-1">
                              ✓ {item.quantity} {item.unit || 'stuk'} op voorraad
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral">Winkelwagen</h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  🗑️ Wissen
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">Winkelwagen is leeg</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Voeg items toe via zoeken of handmatig
                  </p>
                </div>
              ) : (
                cart.map(item => {
                  const vatRate = getVatRateValue(item.vatRate, item.customVatRate);
                  const priceAfterDiscount = item.price * (1 - (item.discount || 0) / 100);
                  const itemSubtotal = priceAfterDiscount * item.quantity;
                  const itemVat = itemSubtotal * (vatRate / 100);
                  const itemTotal = itemSubtotal + itemVat;

                  return (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-neutral text-sm">{item.name}</p>
                          {item.sku && <p className="text-xs text-gray-500">{item.sku}</p>}
                          {item.isManual && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded mt-1 inline-block" title="Handmatig toegevoegd item - éénmalig gebruik, niet in voorraad">
                              🆕 Handmatig (1x)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-lg ml-2"
                          title="Verwijderen"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-8 h-8 bg-gray-300 rounded text-sm hover:bg-gray-400 font-bold"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-8 h-8 bg-gray-300 rounded text-sm hover:bg-gray-400 font-bold"
                        >
                          +
                        </button>
                        <span className="text-sm font-medium text-gray-700 ml-auto">
                          €{itemTotal.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-gray-600">
                          €{priceAfterDiscount.toFixed(2)} × {item.quantity} excl. BTW
                        </span>
                        <span className="text-gray-500">
                          BTW {vatRate}%: €{itemVat.toFixed(2)}
                        </span>
                        {item.discount && item.discount > 0 && (
                          <span className="text-green-600 font-semibold">
                            -{item.discount}% korting
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            const discount = prompt(`Korting % voor "${item.name}":`, item.discount?.toString() || '0');
                            if (discount !== null) {
                              const discountValue = parseFloat(discount);
                              if (!isNaN(discountValue)) {
                                applyDiscount(item.id, discountValue);
                              }
                            }
                          }}
                          className="flex-1 px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
                        >
                          💰 Korting
                        </button>
                        <button
                          onClick={() => {
                            const newPrice = prompt(`Nieuwe prijs (excl. BTW) voor "${item.name}":`, item.price.toString());
                            if (newPrice !== null) {
                              const priceValue = parseFloat(newPrice);
                              if (!isNaN(priceValue) && priceValue > 0) {
                                setCart(cart.map(c =>
                                  c.id === item.id ? { ...c, price: priceValue } : c
                                ));
                              }
                            }
                          }}
                          className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          ✏️ Prijs
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="border-t pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotaal excl. BTW:</span>
                  <span className="font-medium">€{calculateCartTotals.subtotalExclVat.toFixed(2)}</span>
                </div>
                
                {/* BTW Breakdown */}
                {calculateCartTotals.vatBreakdown.map((vat, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">BTW {vat.rate}%:</span>
                    <span className="font-medium">€{(Math.round(vat.amount * 100) / 100).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-semibold text-neutral">Totaal incl. BTW:</span>
                  <span className="text-2xl font-bold text-primary">
                    €{calculateCartTotals.totalInclVat.toFixed(2)}
                  </span>
                </div>
                
                {/* Cart Discount */}
                <button
                  onClick={() => {
                    const discount = prompt('Korting % op gehele winkelwagen:', '0');
                    if (discount !== null) {
                      const discountValue = parseFloat(discount);
                      if (!isNaN(discountValue)) {
                        applyCartDiscount(discountValue);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  💰 Korting op Totaal
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {mode === 'b2c' ? (
                <button
                  onClick={() => {
                    if (cart.length === 0) {
                      alert('⚠️ Winkelwagen is leeg!');
                      return;
                    }
                    setShowPaymentModal(true);
                  }}
                  disabled={cart.length === 0}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                    cart.length > 0
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  💰 AFREKENEN
                </button>
              ) : (
                <button
                  onClick={generatePackingSlip}
                  disabled={cart.length === 0 || !selectedCustomer}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
                    cart.length > 0 && selectedCustomer
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  📦 Pakbon Aanmaken
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Item Modal */}
      {showManualItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-neutral">➕ Handmatig Item Toevoegen (Éénmalig Gebruik)</h3>
                <button
                  onClick={() => setShowManualItemModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Info Banner */}
              <div className="bg-purple-50 border-l-4 border-purple-400 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-800">
                  <strong>ℹ️ Eenmalig Item:</strong> Dit item wordt alleen toegevoegd aan de winkelwagen en wordt <strong>niet opgeslagen</strong> in de voorraad. 
                  Perfect voor diensten, meerwerk, of tijdelijke producten.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualItem.name || ''}
                    onChange={(e) => setManualItem({ ...manualItem, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Bijv. Montage dienst"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prijs excl. BTW (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualItem.price || 0}
                    onChange={(e) => setManualItem({ ...manualItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BTW-tarief
                  </label>
                  <select
                    value={manualItem.vatRate || '21'}
                    onChange={(e) => setManualItem({ ...manualItem, vatRate: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="21">Standaard 21%</option>
                    <option value="9">Verlaagd 9%</option>
                    <option value="0">Vrij 0%</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eenheid
                  </label>
                  <select
                    value={manualItem.unit || 'stuk'}
                    onChange={(e) => setManualItem({ ...manualItem, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="stuk">Stuk</option>
                    <option value="uur">Uur</option>
                    <option value="meter">Meter</option>
                    <option value="kg">Kilogram</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={handleAddManualItem}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  ✅ Toevoegen
                </button>
                <button
                  onClick={() => setShowManualItemModal(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (B2C) */}
      {showPaymentModal && mode === 'b2c' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral">💳 Betaalwijze</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-2xl font-bold text-primary text-center mb-2">
                  €{calculateCartTotals.totalInclVat.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  Totaal incl. BTW
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => completeB2CSale('cash')}
                  className="px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
                >
                  💵 Contant
                </button>
                <button
                  onClick={() => completeB2CSale('pin')}
                  className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-lg"
                >
                  💳 PIN
                </button>
                <button
                  onClick={() => completeB2CSale('ideal')}
                  className="px-6 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold text-lg"
                >
                  🏦 iDEAL
                </button>
                <button
                  onClick={() => completeB2CSale('credit')}
                  className="px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg"
                >
                  💳 Creditcard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorites Settings Modal */}
      {showFavoritesSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral">⚙️ Snelkoppelingen Instellingen</h3>
                <button
                  onClick={() => setShowFavoritesSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Maximum Favorites Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Aantal Snelkoppelingen
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxFavorites}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (value >= 1 && value <= 20) {
                        setMaxFavorites(value);
                        // Verwijder overtollige favorieten als max lager wordt
                        if (favoriteItems.length > value) {
                          setFavoriteItems(favoriteItems.slice(0, value));
                        }
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Aantal snelkoppelingen dat bovenaan wordt getoond (1-20)
                  </p>
                </div>

                {/* Current Favorites List */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Huidige Snelkoppelingen ({favoriteItems.length}/{maxFavorites})
                  </label>
                  {favoriteItems.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">Geen favorieten toegevoegd</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Klik op de ☆ knop bij items om ze toe te voegen
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {favoriteInventoryItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-neutral">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          </div>
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className="text-yellow-500 hover:text-red-500 text-lg px-2"
                            title="Verwijderen"
                          >
                            ⭐
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear All Button */}
                {favoriteItems.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Weet u zeker dat u alle snelkoppelingen wilt verwijderen?')) {
                        setFavoriteItems([]);
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    🗑️ Alle Snelkoppelingen Verwijderen
                  </button>
                )}
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowFavoritesSettings(false)}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Packing Slip Success Modal (B2B) */}
      {showPackingSlipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral">✅ Pakbon Aangemaakt</h3>
                <button
                  onClick={() => setShowPackingSlipModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>✅ Pakbon succesvol aangemaakt!</strong><br />
                  De pakbon is automatisch gekoppeld aan een factuur in het Boekhouding module.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Pakbon details kunnen worden bekeken in het Boekhouding → Facturen tab.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowPackingSlipModal(false)}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
