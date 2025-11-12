import React, { useState } from 'react';
import { ProductVariant } from '../types';

interface ProductVariantManagerProps {
  variants: ProductVariant[];
  productId: string;
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  variants,
  productId,
  onVariantsChange,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    name: '',
    sku: '',
    price: undefined,
    stockQuantity: 0,
    options: {},
    active: true,
    trackInventory: true,
  });

  const handleAddVariant = () => {
    if (!newVariant.name) {
      alert('⚠️ Vul ten minste de naam in.');
      return;
    }

    const variant: ProductVariant = {
      id: Date.now().toString(),
      productId,
      name: newVariant.name,
      sku: newVariant.sku,
      price: newVariant.price,
      compareAtPrice: newVariant.compareAtPrice,
      stockQuantity: newVariant.stockQuantity || 0,
      weight: newVariant.weight,
      image: newVariant.image,
      options: newVariant.options || {},
      active: newVariant.active ?? true,
      trackInventory: newVariant.trackInventory ?? true,
    };

    onVariantsChange([...variants, variant]);
    setNewVariant({
      name: '',
      sku: '',
      price: undefined,
      stockQuantity: 0,
      options: {},
      active: true,
      trackInventory: true,
    });
    setShowAddForm(false);
    alert('✅ Variant toegevoegd!');
  };

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setNewVariant({ ...variant });
    setShowAddForm(true);
  };

  const handleUpdateVariant = () => {
    if (!editingVariant || !newVariant.name) {
      alert('⚠️ Vul ten minste de naam in.');
      return;
    }

    const updatedVariant: ProductVariant = {
      ...editingVariant,
      ...newVariant,
    };

    onVariantsChange(variants.map(v => (v.id === editingVariant.id ? updatedVariant : v)));
    setEditingVariant(null);
    setNewVariant({
      name: '',
      sku: '',
      price: undefined,
      stockQuantity: 0,
      options: {},
      active: true,
      trackInventory: true,
    });
    setShowAddForm(false);
    alert('✅ Variant bijgewerkt!');
  };

  const handleDeleteVariant = (variantId: string) => {
    if (confirm('Weet u zeker dat u deze variant wilt verwijderen?')) {
      onVariantsChange(variants.filter(v => v.id !== variantId));
      alert('✅ Variant verwijderd.');
    }
  };

  const handleToggleActive = (variantId: string) => {
    onVariantsChange(
      variants.map(v => (v.id === variantId ? { ...v, active: !v.active } : v))
    );
  };

  // Handle options (key-value pairs)
  const handleAddOption = () => {
    const key = prompt('Optie naam (bijv. "kleur", "maat"):');
    if (!key) return;

    const value = prompt(`Waarde voor "${key}"`);
    if (!value) return;

    setNewVariant({
      ...newVariant,
      options: {
        ...newVariant.options,
        [key]: value,
      },
    });
  };

  const handleRemoveOption = (key: string) => {
    const { [key]: removed, ...rest } = newVariant.options || {};
    setNewVariant({
      ...newVariant,
      options: rest,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Product Varianten ({variants.length})
        </h3>
        <button
          onClick={() => {
            setEditingVariant(null);
            setNewVariant({
              name: '',
              sku: '',
              price: undefined,
              stockQuantity: 0,
              options: {},
              active: true,
              trackInventory: true,
            });
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
        >
          {showAddForm ? 'Annuleren' : '+ Variant Toevoegen'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">
            {editingVariant ? 'Variant Bewerken' : 'Nieuwe Variant'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam * <span className="text-gray-500">(bijv. "Rood - Groot")</span>
              </label>
              <input
                type="text"
                value={newVariant.name || ''}
                onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Naam van de variant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-gray-500">(optioneel)</span>
              </label>
              <input
                type="text"
                value={newVariant.sku || ''}
                onChange={e => setNewVariant({ ...newVariant, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Unieke SKU"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prijs <span className="text-gray-500">(overschrijft product prijs)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={newVariant.price || ''}
                onChange={e =>
                  setNewVariant({
                    ...newVariant,
                    price: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voorraad</label>
              <input
                type="number"
                value={newVariant.stockQuantity || 0}
                onChange={e =>
                  setNewVariant({ ...newVariant, stockQuantity: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gewicht (g) <span className="text-gray-500">(optioneel)</span>
              </label>
              <input
                type="number"
                value={newVariant.weight || ''}
                onChange={e =>
                  setNewVariant({
                    ...newVariant,
                    weight: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Afbeelding URL <span className="text-gray-500">(optioneel)</span>
              </label>
              <input
                type="text"
                value={newVariant.image || ''}
                onChange={e => setNewVariant({ ...newVariant, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Options (Key-Value Pairs) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Opties <span className="text-gray-500">(kleur, maat, etc.)</span>
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-sm text-primary hover:text-secondary font-medium"
              >
                + Optie Toevoegen
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(newVariant.options || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{key}:</span>
                  <span className="text-sm text-gray-900">{value}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(key)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {Object.keys(newVariant.options || {}).length === 0 && (
                <p className="text-sm text-gray-500 italic">Geen opties toegevoegd</p>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newVariant.active ?? true}
                onChange={e => setNewVariant({ ...newVariant, active: e.target.checked })}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Actief</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newVariant.trackInventory ?? true}
                onChange={e => setNewVariant({ ...newVariant, trackInventory: e.target.checked })}
                className="text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Voorraad bijhouden</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={editingVariant ? handleUpdateVariant : handleAddVariant}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              {editingVariant ? 'Bijwerken' : 'Toevoegen'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingVariant(null);
                setNewVariant({
                  name: '',
                  sku: '',
                  price: undefined,
                  stockQuantity: 0,
                  options: {},
                  active: true,
                  trackInventory: true,
                });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Variants List */}
      {variants.length > 0 ? (
        <div className="space-y-2">
          {variants.map(variant => (
            <div
              key={variant.id}
              className={`border rounded-lg p-4 ${
                variant.active ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{variant.name}</h4>
                    {!variant.active && (
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                        Inactief
                      </span>
                    )}
                    {variant.sku && (
                      <span className="text-xs text-gray-500">SKU: {variant.sku}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {variant.price !== undefined && (
                      <div>
                        <span className="text-gray-600">Prijs:</span>{' '}
                        <span className="font-medium">€{variant.price.toFixed(2)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Voorraad:</span>{' '}
                      <span className="font-medium">{variant.stockQuantity}</span>
                    </div>
                    {variant.weight && (
                      <div>
                        <span className="text-gray-600">Gewicht:</span>{' '}
                        <span className="font-medium">{variant.weight}g</span>
                      </div>
                    )}
                    {Object.keys(variant.options).length > 0 && (
                      <div className="col-span-2 md:col-span-4">
                        <span className="text-gray-600">Opties:</span>{' '}
                        {Object.entries(variant.options).map(([key, value], idx) => (
                          <span key={key} className="text-gray-900">
                            <span className="capitalize">{key}</span>: {value}
                            {idx < Object.keys(variant.options).length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(variant.id)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      variant.active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={variant.active ? 'Deactiveren' : 'Activeren'}
                  >
                    {variant.active ? '⏸' : '▶'}
                  </button>
                  <button
                    onClick={() => handleEditVariant(variant)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Geen varianten toegevoegd. Klik op "Variant Toevoegen" om te beginnen.</p>
        </div>
      )}
    </div>
  );
};
