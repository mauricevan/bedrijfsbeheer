import React, { useState, useEffect, useRef } from 'react';
import { WorkOrderStatus, InventoryItem, InventoryCategory } from '../../../types';

interface EmailInfo {
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

interface InventorySelection {
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface EmailWorkOrderData {
  title: string;
  description: string;
  location?: string;
  scheduledDate?: string;
  estimatedHours?: number;
  estimatedCost?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: WorkOrderStatus;
  requiredInventory?: { itemId: string; quantity: number }[];
  notes?: string;
}

interface EmailWorkOrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmailWorkOrderData) => void;
  emailInfo: EmailInfo;
  customerName: string;
  availableInventory?: InventoryItem[];
  categories?: InventoryCategory[]; // 🆕 V5.10: Categories for filtering
}

export const EmailWorkOrderEditModal: React.FC<EmailWorkOrderEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  emailInfo,
  customerName,
  availableInventory = [],
  categories = []
}) => {
  const [showEmailPreview, setShowEmailPreview] = useState(true);
  const [formData, setFormData] = useState<EmailWorkOrderData>({
    title: `${customerName} - Email: ${emailInfo.subject}`,
    description: emailInfo.body,
    location: '',
    scheduledDate: '',
    estimatedHours: undefined,
    estimatedCost: undefined,
    priority: 'normal',
    status: 'To Do' as WorkOrderStatus,
    requiredInventory: [],
    notes: ''
  });

  const [selectedInventory, setSelectedInventory] = useState<InventorySelection[]>([]);
  const [newInventoryId, setNewInventoryId] = useState('');
  const [newInventoryQuantity, setNewInventoryQuantity] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [charCount, setCharCount] = useState(emailInfo.body.length);

  // 🆕 V5.10: Search/filter state voor materialen
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);
  const inventoryDropdownRef = useRef<HTMLDivElement>(null);

  // 🆕 V5.10: Extra filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'stock-high' | 'stock-low' | 'price-low' | 'price-high'>('name-asc');

  // 🆕 V5.10: Filter en sorteer materialen
  const filteredInventory = availableInventory
    .filter(item => {
      // Tekstzoeken
      const matchesSearch = item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
                           item.id.toLowerCase().includes(inventorySearchTerm.toLowerCase());

      // Categorie filter
      const matchesCategory = !selectedCategoryId || item.categoryId === selectedCategoryId;

      // Voorraad filter
      const matchesStock = stockFilter === 'all' ||
                          (stockFilter === 'in-stock' && item.quantity > 0) ||
                          (stockFilter === 'low-stock' && item.quantity > 0 && item.quantity <= 10);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'stock-high':
          return b.quantity - a.quantity;
        case 'stock-low':
          return a.quantity - b.quantity;
        case 'price-low':
          return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        case 'price-high':
          return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: `${customerName} - Email: ${emailInfo.subject}`,
        description: emailInfo.body,
        location: '',
        scheduledDate: '',
        estimatedHours: undefined,
        estimatedCost: undefined,
        priority: 'normal',
        status: 'To Do' as WorkOrderStatus,
        requiredInventory: [],
        notes: ''
      });
      setSelectedInventory([]);
      setErrors({});
      setCharCount(emailInfo.body.length);
      setInventorySearchTerm('');
      setShowInventoryDropdown(false);
      setSelectedCategoryId('');
      setStockFilter('all');
      setSortBy('name-asc');
    }
  }, [isOpen, emailInfo, customerName]);

  // 🆕 V5.10: Click outside handler om dropdown te sluiten
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inventoryDropdownRef.current && !inventoryDropdownRef.current.contains(event.target as Node)) {
        setShowInventoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (field: keyof EmailWorkOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === 'description') {
      setCharCount(value.length);
    }
  };

  const handleAddInventory = () => {
    if (!newInventoryId) return;

    const item = availableInventory.find(inv => inv.id === newInventoryId);
    if (!item) return;

    if (selectedInventory.some(inv => inv.itemId === newInventoryId)) {
      alert('Dit item is al toegevoegd');
      return;
    }

    setSelectedInventory(prev => [...prev, {
      itemId: newInventoryId,
      itemName: item.name,
      quantity: newInventoryQuantity
    }]);

    setNewInventoryId('');
    setNewInventoryQuantity(1);
    setInventorySearchTerm('');
    setShowInventoryDropdown(false);
  };

  // 🆕 V5.10: Selecteer materiaal uit dropdown
  const handleSelectInventory = (itemId: string) => {
    setNewInventoryId(itemId);
    const item = availableInventory.find(inv => inv.id === itemId);
    if (item) {
      setInventorySearchTerm(item.name);
    }
    setShowInventoryDropdown(false);
  };

  const handleRemoveInventory = (itemId: string) => {
    setSelectedInventory(prev => prev.filter(inv => inv.itemId !== itemId));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel is verplicht';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschrijving is verplicht';
    }

    if (formData.description.length > 2000) {
      newErrors.description = 'Beschrijving mag maximaal 2000 karakters bevatten';
    }

    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Uren moeten positief zijn';
    }

    if (formData.estimatedCost && formData.estimatedCost < 0) {
      newErrors.estimatedCost = 'Kosten moeten positief zijn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const finalData: EmailWorkOrderData = {
      ...formData,
      requiredInventory: selectedInventory.map(inv => ({
        itemId: inv.itemId,
        quantity: inv.quantity
      }))
    };

    onSave(finalData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Werkorder Details Bewerken</h2>
            <p className="text-purple-100 text-sm mt-1">Pas de gegevens aan voordat de werkorder wordt aangemaakt</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-purple-800 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Email Preview Section */}
          <div className="mb-6 border border-gray-200 rounded-lg">
            <button
              onClick={() => setShowEmailPreview(!showEmailPreview)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-gray-700">Originele Email Informatie</span>
              </div>
              {showEmailPreview ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            
            {showEmailPreview && (
              <div className="p-4 bg-white space-y-2 text-sm">
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-600">Van:</span>
                    <span className="ml-2 text-gray-800">{emailInfo.from}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-600">Aan:</span>
                    <span className="ml-2 text-gray-800">{emailInfo.to}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-600">Onderwerp:</span>
                    <span className="ml-2 text-gray-800">{emailInfo.subject}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="font-medium text-gray-600">Datum:</span>
                    <span className="ml-2 text-gray-800">{emailInfo.date}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Titel van de werkorder"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs ml-2">
                  ({charCount}/2000 karakters)
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={10}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Beschrijving van het werk (uit email, bewerkbaar)"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Row 1: Location and Scheduled Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locatie
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Werklocatie"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geplande Datum
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate || ''}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Row 2: Estimated Hours and Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geschatte Uren
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.estimatedHours && (
                  <p className="text-red-500 text-sm mt-1">{errors.estimatedHours}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geschatte Kosten (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimatedCost || ''}
                  onChange={(e) => handleInputChange('estimatedCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.estimatedCost ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.estimatedCost && (
                  <p className="text-red-500 text-sm mt-1">{errors.estimatedCost}</p>
                )}
              </div>
            </div>

            {/* Row 3: Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioriteit
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="low">Laag</option>
                  <option value="normal">Normaal</option>
                  <option value="high">Hoog</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as WorkOrderStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Inventory Section - HIGHLIGHTED */}
            {availableInventory.length > 0 && (
              <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 className="font-bold text-blue-900 text-lg">🧱 Benodigde Materialen</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">Voeg hier de materialen toe die nodig zijn voor deze werkorder</p>

                {/* 🆕 V5.10: Filter controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-white border border-blue-200 rounded-lg">
                  {/* Categorie Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      📁 Categorie
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                      <option value="">Alle categorieën</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voorraad Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      📦 Voorraad Status
                    </label>
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value as 'all' | 'in-stock' | 'low-stock')}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                      <option value="all">Alle voorraad</option>
                      <option value="in-stock">Alleen op voorraad</option>
                      <option value="low-stock">Lage voorraad (≤10)</option>
                    </select>
                  </div>

                  {/* Sorteer */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      🔃 Sorteer op
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                      <option value="name-asc">Naam (A-Z)</option>
                      <option value="name-desc">Naam (Z-A)</option>
                      <option value="stock-high">Voorraad (Hoog-Laag)</option>
                      <option value="stock-low">Voorraad (Laag-Hoog)</option>
                      <option value="price-low">Prijs (Laag-Hoog)</option>
                      <option value="price-high">Prijs (Hoog-Laag)</option>
                    </select>
                  </div>

                  {/* Reset Filters Button */}
                  {(selectedCategoryId || stockFilter !== 'all' || sortBy !== 'name-asc') && (
                    <div className="md:col-span-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId('');
                          setStockFilter('all');
                          setSortBy('name-asc');
                        }}
                        className="text-xs px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mb-3">
                  {/* 🆕 V5.10: Zoekbaar materialen veld met dropdown */}
                  <div className="flex-1 relative" ref={inventoryDropdownRef}>
                    <div className="relative">
                      <input
                        type="text"
                        value={inventorySearchTerm}
                        onChange={(e) => {
                          setInventorySearchTerm(e.target.value);
                          setShowInventoryDropdown(true);
                          if (!e.target.value) {
                            setNewInventoryId('');
                          }
                        }}
                        onFocus={() => setShowInventoryDropdown(true)}
                        className="w-full px-3 py-2 pl-10 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="🔍 Zoek materiaal op naam..."
                      />
                      <svg
                        className="w-5 h-5 text-blue-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Dropdown met gefilterde materialen */}
                    {showInventoryDropdown && inventorySearchTerm && (
                      <div className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {filteredInventory.length > 0 ? (
                          <>
                            <div className="sticky top-0 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 border-b border-blue-200">
                              {filteredInventory.length} resultaten gevonden
                            </div>
                            {filteredInventory.map(item => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelectInventory(item.id)}
                                className="w-full text-left px-3 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex justify-between items-center group"
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-500">ID: {item.id}</span>
                                    {item.categoryId && categories.find(c => c.id === item.categoryId) && (
                                      <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                        📁 {categories.find(c => c.id === item.categoryId)?.name}
                                      </span>
                                    )}
                                    {item.sellingPrice && (
                                      <span className="text-xs text-green-600 font-semibold">
                                        €{item.sellingPrice.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-sm ml-2">
                                  <span className={`px-2 py-1 rounded-full font-semibold ${
                                    item.quantity > 10
                                      ? 'bg-green-100 text-green-700'
                                      : item.quantity > 0
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    Voorraad: {item.quantity}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="px-3 py-6 text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">Geen materialen gevonden</p>
                            <p className="text-xs mt-1">Probeer een andere zoekterm</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Geselecteerd item indicator */}
                    {newInventoryId && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold">Geselecteerd: {availableInventory.find(i => i.id === newInventoryId)?.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewInventoryId('');
                            setInventorySearchTerm('');
                          }}
                          className="ml-auto text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={newInventoryQuantity}
                    onChange={(e) => setNewInventoryQuantity(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Aantal"
                  />

                  <button
                    type="button"
                    onClick={handleAddInventory}
                    disabled={!newInventoryId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Toevoegen
                  </button>
                </div>

                {selectedInventory.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-bold text-green-700">Toegevoegde materialen ({selectedInventory.length}):</p>
                    </div>
                    {selectedInventory.map(inv => (
                      <div
                        key={inv.itemId}
                        className="flex items-center justify-between bg-white border-2 border-green-200 p-3 rounded-lg shadow-sm"
                      >
                        <div>
                          <span className="font-medium">{inv.itemName}</span>
                          <span className="text-gray-600 ml-2">× {inv.quantity}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveInventory(inv.itemId)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                          title="Verwijder dit materiaal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">Geen materialen toegevoegd</p>
                        <p className="text-xs text-yellow-700 mt-1">Let op: Als er geen materialen worden toegevoegd, zal de werkorder zonder voorraad worden aangemaakt. Voeg materialen toe indien nodig voor dit werk.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extra Notities
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                placeholder="Eventuele extra notities..."
              />
            </div>
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd> om te annuleren
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl+Enter</kbd> om op te slaan
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              Volgende (Toewijzen →)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailWorkOrderEditModal;
