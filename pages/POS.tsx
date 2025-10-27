import React, { useState } from 'react';
import { Product, CartItem, Sale, Customer, InventoryItem, Transaction } from '../types';

interface POSProps {
  products: Product[];
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customers: Customer[];
}

export const POS: React.FC<POSProps> = ({ 
  products, 
  inventory, 
  setInventory, 
  sales, 
  setSales,
  setTransactions,
  customers 
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const completeSale = () => {
    if (cart.length === 0) {
      alert('Winkelwagen is leeg!');
      return;
    }

    // Update inventory
    const updatedInventory = [...inventory];
    cart.forEach(cartItem => {
      const invItem = updatedInventory.find(i => i.id === cartItem.inventoryItemId);
      if (invItem) {
        invItem.quantity -= cartItem.quantity;
      }
    });
    setInventory(updatedInventory);

    // Create sale
    const sale: Sale = {
      id: `s${Date.now()}`,
      items: [...cart],
      total: calculateTotal(),
      customerId: selectedCustomer,
      date: new Date().toISOString().split('T')[0],
    };
    setSales([...sales, sale]);

    // Create transaction
    const transaction: Transaction = {
      id: `t${Date.now()}`,
      type: 'income',
      description: `Verkoop order #${sale.id}`,
      amount: sale.total,
      date: sale.date,
    };
    setTransactions(prev => [...prev, transaction]);

    // Reset
    setCart([]);
    setSelectedCustomer(null);
    alert('Verkoop succesvol voltooid!');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-neutral mb-2">Kassasysteem (POS)</h1>
      <p className="text-gray-600 mb-8">Verwerk betalingen en registreer verkopen</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-neutral mb-4">Producten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(product => {
                const invItem = inventory.find(i => i.id === product.inventoryItemId);
                const inStock = invItem && invItem.quantity > 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => inStock && addToCart(product)}
                    disabled={!inStock}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      inStock
                        ? 'border-gray-200 hover:border-primary hover:bg-blue-50 cursor-pointer'
                        : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <h3 className="font-semibold text-neutral">{product.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">€{product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Voorraad: {invItem?.quantity || 0}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-neutral mb-4">Winkelwagen</h2>

            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Klant (optioneel)
              </label>
              <select
                value={selectedCustomer || ''}
                onChange={(e) => setSelectedCustomer(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Geen klant</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  Winkelwagen is leeg
                </p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-neutral text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">€{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-300 rounded text-sm hover:bg-gray-400"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-300 rounded text-sm hover:bg-gray-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral">Totaal:</span>
                <span className="text-2xl font-bold text-primary">
                  €{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={completeSale}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  cart.length > 0
                    ? 'bg-primary text-white hover:bg-secondary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Verkoop Voltooien
              </button>
              <button
                onClick={() => setCart([])}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Wissen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};