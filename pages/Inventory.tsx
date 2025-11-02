import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface InventoryProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  isAdmin: boolean;
}

export const Inventory: React.FC<InventoryProps> = ({ inventory, setInventory, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    sku: '',
    quantity: 0,
    reorderLevel: 0,
    supplier: '',
    price: 0,
    unit: 'stuk',
  });

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    const item: InventoryItem = {
      ...newItem,
      id: Date.now().toString(),
    };
    setInventory([...inventory, item]);
    setNewItem({ name: '', sku: '', quantity: 0, reorderLevel: 0, supplier: '', price: 0, unit: 'stuk' });
    setShowAddForm(false);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral">Voorraadbeheer</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Beheer grondstoffen, halffabricaten en eindproducten</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
          >
            + Nieuw Item
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Zoek op naam of SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Add Form */}
      {showAddForm && isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral mb-4">Nieuw Item Toevoegen</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Naam"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="SKU"
              value={newItem.sku}
              onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Aantal"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Herbestel Niveau"
              value={newItem.reorderLevel}
              onChange={(e) => setNewItem({ ...newItem, reorderLevel: parseInt(e.target.value) || 0 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Prijs per eenheid (€)"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="stuk">Stuk</option>
              <option value="meter">Meter</option>
              <option value="kg">Kilogram</option>
              <option value="liter">Liter</option>
              <option value="m2">Vierkante meter</option>
              <option value="doos">Doos</option>
            </select>
            <input
              type="text"
              placeholder="Leverancier"
              value={newItem.supplier}
              onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary col-span-2"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddItem}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              Toevoegen
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Naam</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aantal</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prijs</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Herbestel</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Leverancier</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acties</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInventory.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-neutral">{item.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.quantity} {item.unit}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.price ? `€${item.price.toFixed(2)}/${item.unit}` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.supplier}</td>
                <td className="px-6 py-4">
                  {item.quantity <= item.reorderLevel ? (
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                      Laag
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      OK
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 10)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -10)}
                        className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};