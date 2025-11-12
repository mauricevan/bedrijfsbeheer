import React, { useState, useMemo } from 'react';
import {
  WebshopProduct,
  ProductCategory,
  ProductVariant,
  ProductImage,
  Order,
  OrderStatus,
  PaymentStatus,
  InventoryItem,
  Customer,
} from '../types';

interface WebshopProps {
  inventory: InventoryItem[];
  customers: Customer[];
  isAdmin: boolean;
  webshopProducts: WebshopProduct[];
  setWebshopProducts: React.Dispatch<React.SetStateAction<WebshopProduct[]>>;
}

type TabType = 'products' | 'categories' | 'orders';

export const Webshop: React.FC<WebshopProps> = ({
  inventory,
  customers,
  isAdmin,
  webshopProducts,
  setWebshopProducts,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  
  // Products state - gebruik props als primary source
  const [products, setProducts] = useState<WebshopProduct[]>(webshopProducts);
  
  // Sync local state met props
  React.useEffect(() => {
    setProducts(webshopProducts);
  }, [webshopProducts]);
  
  // Update parent state wanneer local state verandert
  const updateProducts = (newProducts: WebshopProduct[]) => {
    setProducts(newProducts);
    setWebshopProducts(newProducts);
  };
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WebshopProduct | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Product form state
  const [newProduct, setNewProduct] = useState<Partial<WebshopProduct>>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    price: 0,
    compareAtPrice: undefined,
    costPrice: undefined,
    inventoryItemId: undefined,
    stockQuantity: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    categoryIds: [],
    featuredCategoryId: undefined,
    hasVariants: false,
    variants: [],
    images: [],
    featuredImage: undefined,
    status: 'draft',
    visibility: 'public',
    metaTitle: '',
    metaDescription: '',
    tags: [],
    weight: undefined,
    dimensions: undefined,
    shippingRequired: true,
    shippingClass: 'standard',
    taxClass: 'standard',
    requireShipping: true,
    digitalProduct: false,
    allowReviews: true,
    adminNotes: '',
  });

  // Categories state
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<ProductCategory>>({
    name: '',
    slug: '',
    description: '',
    parentId: undefined,
    image: undefined,
    order: 0,
    active: true,
    metaTitle: '',
    metaDescription: '',
  });
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Helper functions
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const generateSku = (name: string): string => {
    const prefix = name
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, '') || 'PRD';
    const number = products.length + 1;
    return `${prefix}-${number.toString().padStart(4, '0')}`;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(productSearchTerm.toLowerCase()));
      
      const matchesStatus = 
        productStatusFilter === 'all' || product.status === productStatusFilter;
      
      const matchesCategory =
        productCategoryFilter === 'all' || product.categoryIds.includes(productCategoryFilter);
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, productSearchTerm, productStatusFilter, productCategoryFilter]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase());
      
      const matchesStatus =
        orderStatusFilter === 'all' || order.status === orderStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchTerm, orderStatusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
    
    return {
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
    };
  }, [products, orders]);

  // Product handlers
  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.sku) {
      alert('⚠️ Vul ten minste naam en SKU in.');
      return;
    }

    const slug = newProduct.slug || generateSlug(newProduct.name!);
    const product: WebshopProduct = {
      id: Date.now().toString(),
      name: newProduct.name!,
      slug,
      description: newProduct.description || '',
      shortDescription: newProduct.shortDescription,
      sku: newProduct.sku,
      price: newProduct.price || 0,
      compareAtPrice: newProduct.compareAtPrice,
      costPrice: newProduct.costPrice,
      inventoryItemId: newProduct.inventoryItemId,
      stockQuantity: newProduct.stockQuantity || 0,
      lowStockThreshold: newProduct.lowStockThreshold,
      trackInventory: newProduct.trackInventory ?? true,
      categoryIds: newProduct.categoryIds || [],
      featuredCategoryId: newProduct.featuredCategoryId,
      hasVariants: newProduct.hasVariants || false,
      variants: newProduct.variants || [],
      images: newProduct.images || [],
      featuredImage: newProduct.featuredImage,
      status: newProduct.status || 'draft',
      visibility: newProduct.visibility || 'public',
      metaTitle: newProduct.metaTitle,
      metaDescription: newProduct.metaDescription,
      tags: newProduct.tags || [],
      weight: newProduct.weight,
      dimensions: newProduct.dimensions,
      shippingRequired: newProduct.shippingRequired ?? true,
      shippingClass: newProduct.shippingClass,
      taxClass: newProduct.taxClass || 'standard',
      requireShipping: newProduct.requireShipping ?? true,
      digitalProduct: newProduct.digitalProduct || false,
      allowReviews: newProduct.allowReviews ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotes: newProduct.adminNotes,
    };

    updateProducts([...products, product]);
    setNewProduct({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      sku: '',
      price: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
      trackInventory: true,
      categoryIds: [],
      hasVariants: false,
      variants: [],
      images: [],
      status: 'draft',
      visibility: 'public',
      tags: [],
      shippingRequired: true,
      requireShipping: true,
      digitalProduct: false,
      allowReviews: true,
    });
    setShowProductForm(false);
    alert(`✅ Product "${product.name}" succesvol aangemaakt!`);
  };

  const handleEditProduct = (product: WebshopProduct) => {
    setEditingProduct(product);
    setNewProduct({
      ...product,
    });
    setShowProductForm(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct || !newProduct.name || !newProduct.sku) {
      alert('⚠️ Vul ten minste naam en SKU in.');
      return;
    }

    const updatedProduct: WebshopProduct = {
      ...editingProduct,
      ...newProduct,
      updatedAt: new Date().toISOString(),
    };

    updateProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setShowProductForm(false);
    setNewProduct({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      sku: '',
      price: 0,
      stockQuantity: 0,
      categoryIds: [],
      hasVariants: false,
      variants: [],
      images: [],
      status: 'draft',
      visibility: 'public',
      tags: [],
    });
    alert(`✅ Product "${updatedProduct.name}" succesvol bijgewerkt!`);
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product && confirm(`Weet u zeker dat u "${product.name}" wilt verwijderen?`)) {
      updateProducts(products.filter(p => p.id !== id));
      alert(`✅ Product verwijderd.`);
    }
  };

  const handleToggleProductStatus = (product: WebshopProduct) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    updateProducts(products.map(p => 
      p.id === product.id 
        ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  // Category handlers
  const handleCreateCategory = () => {
    if (!newCategory.name) {
      alert('⚠️ Vul ten minste de naam in.');
      return;
    }

    const slug = newCategory.slug || generateSlug(newCategory.name);
    const category: ProductCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      slug,
      description: newCategory.description,
      parentId: newCategory.parentId,
      image: newCategory.image,
      order: newCategory.order || categories.length,
      active: newCategory.active ?? true,
      metaTitle: newCategory.metaTitle,
      metaDescription: newCategory.metaDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories([...categories, category]);
    setNewCategory({
      name: '',
      slug: '',
      description: '',
      order: categories.length,
      active: true,
    });
    setShowCategoryForm(false);
    alert(`✅ Categorie "${category.name}" succesvol aangemaakt!`);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setNewCategory({ ...category });
    setShowCategoryForm(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name) {
      alert('⚠️ Vul ten minste de naam in.');
      return;
    }

    const updatedCategory: ProductCategory = {
      ...editingCategory,
      ...newCategory,
      updatedAt: new Date().toISOString(),
    };

    setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
    setEditingCategory(null);
    setShowCategoryForm(false);
    setNewCategory({
      name: '',
      slug: '',
      description: '',
      order: categories.length,
      active: true,
    });
    alert(`✅ Categorie "${updatedCategory.name}" succesvol bijgewerkt!`);
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      // Check if category has products
      const hasProducts = products.some(p => p.categoryIds.includes(id));
      if (hasProducts) {
        alert('⚠️ Deze categorie bevat nog producten. Verwijder eerst de producten of wijs ze toe aan een andere categorie.');
        return;
      }
      
      if (confirm(`Weet u zeker dat u "${category.name}" wilt verwijderen?`)) {
        setCategories(categories.filter(c => c.id !== id));
        alert(`✅ Categorie verwijderd.`);
      }
    }
  };

  // Order handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => 
      o.id === orderId 
        ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
        : o
    ));
    alert(`✅ Order status bijgewerkt naar "${newStatus}".`);
  };

  const handleUpdatePaymentStatus = (orderId: string, newStatus: PaymentStatus) => {
    const now = new Date().toISOString();
    setOrders(orders.map(o => 
      o.id === orderId 
        ? { 
            ...o, 
            paymentStatus: newStatus,
            paidAt: newStatus === 'paid' ? now : o.paidAt,
            updatedAt: now,
          }
        : o
    ));
    alert(`✅ Betalingsstatus bijgewerkt naar "${newStatus}".`);
  };

  // Get category name
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Onbekend';
  };

  // Get inventory item name
  const getInventoryItemName = (itemId?: string) => {
    if (!itemId) return 'Geen koppeling';
    return inventory.find(i => i.id === itemId)?.name || 'Onbekend';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral">Webshop Beheer</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Beheer uw online winkel - producten, categorieën en bestellingen
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Actieve Producten</p>
          <p className="text-2xl font-bold text-blue-600">{stats.activeProducts}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Totaal Bestellingen</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 mb-1">Openstaand</p>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Totaal Omzet</p>
          <p className="text-2xl font-bold text-purple-600">
            €{stats.totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📦 Producten ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏷️ Categorieën ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Bestellingen ({orders.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search & Filters */}
            <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Zoek producten..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Alle Statussen</option>
                <option value="active">Actief</option>
                <option value="draft">Concept</option>
                <option value="archived">Gearchiveerd</option>
              </select>
              {categories.length > 0 && (
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Alle Categorieën</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                  title="Grid weergave"
                >
                  ▦
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                  title="Lijst weergave"
                >
                  ☰
                </button>
              </div>
            </div>
            
            {/* Add Button */}
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    slug: '',
                    description: '',
                    sku: generateSku('Nieuw Product'),
                    price: 0,
                    stockQuantity: 0,
                    lowStockThreshold: 5,
                    trackInventory: true,
                    categoryIds: [],
                    hasVariants: false,
                    variants: [],
                    images: [],
                    status: 'draft',
                    visibility: 'public',
                    tags: [],
                    shippingRequired: true,
                    requireShipping: true,
                    digitalProduct: false,
                    allowReviews: true,
                  });
                  setShowProductForm(true);
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium whitespace-nowrap"
              >
                + Nieuw Product
              </button>
            )}
          </div>

          {/* Product Form Modal */}
          {(showProductForm || editingProduct) && isAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral">
                    {editingProduct ? '✏️ Product Bewerken' : '➕ Nieuw Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setNewProduct({
                        name: '',
                        slug: '',
                        description: '',
                        sku: '',
                        price: 0,
                        stockQuantity: 0,
                        categoryIds: [],
                        hasVariants: false,
                        variants: [],
                        images: [],
                        status: 'draft',
                        visibility: 'public',
                        tags: [],
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Basic Information Section */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      📝 Basis Informatie
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Productnaam <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newProduct.name || ''}
                          onChange={(e) => {
                            setNewProduct({
                              ...newProduct,
                              name: e.target.value,
                              slug: newProduct.slug || generateSlug(e.target.value),
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Bijv. Staal plaat 10mm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL Slug (auto-generatie)
                        </label>
                        <input
                          type="text"
                          value={newProduct.slug || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="bijv. staal-plaat-10mm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Wordt automatisch gegenereerd uit naam</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newProduct.sku || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="PRD-0001"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Korte Beschrijving (voor product cards)
                        </label>
                        <input
                          type="text"
                          value={newProduct.shortDescription || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Korte, pakkende beschrijving (max 150 karakters)"
                          maxLength={150}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Volledige Beschrijving
                        </label>
                        <textarea
                          value={newProduct.description || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Gedetailleerde productbeschrijving..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Inventory Section */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      💰 Prijs & Voorraad
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Verkoopprijs (€) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.price || 0}
                          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Wasprijs (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.compareAtPrice || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                          placeholder="Optioneel"
                        />
                        <p className="text-xs text-gray-500 mt-1">Voor strikethrough prijs</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Inkoopprijs (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newProduct.costPrice || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                          placeholder="Voor winstberekening"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Voorraad
                        </label>
                        <input
                          type="number"
                          value={newProduct.stockQuantity || 0}
                          onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lage Voorraad Drempel
                        </label>
                        <input
                          type="number"
                          value={newProduct.lowStockThreshold || 5}
                          onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: parseInt(e.target.value) || 5 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          min="0"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newProduct.trackInventory ?? true}
                            onChange={(e) => setNewProduct({ ...newProduct, trackInventory: e.target.checked })}
                            className="w-5 h-5 text-primary"
                          />
                          <span className="text-sm font-medium text-gray-700">Voorraad bijhouden</span>
                        </label>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Koppel met Voorraad Item (optioneel)
                        </label>
                        <select
                          value={newProduct.inventoryItemId || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, inventoryItemId: e.target.value || undefined })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Geen koppeling</option>
                          {inventory.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.sku}) - Voorraad: {item.quantity}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {newProduct.inventoryItemId 
                            ? `Gekoppeld: ${getInventoryItemName(newProduct.inventoryItemId)}`
                            : 'Synchroniseer voorraad met Inventory module'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Categories Section */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      🏷️ Categorieën
                    </h3>
                    {categories.length === 0 ? (
                      <p className="text-sm text-gray-600 mb-4">
                        Geen categorieën beschikbaar. Maak eerst categorieën aan in de Categorieën tab.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selecteer Categorieën (meerdere mogelijk)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                          {categories.filter(c => c.active).map(category => (
                            <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                              <input
                                type="checkbox"
                                checked={(newProduct.categoryIds || []).includes(category.id)}
                                onChange={(e) => {
                                  const currentIds = newProduct.categoryIds || [];
                                  if (e.target.checked) {
                                    setNewProduct({ ...newProduct, categoryIds: [...currentIds, category.id] });
                                  } else {
                                    setNewProduct({ ...newProduct, categoryIds: currentIds.filter(id => id !== category.id) });
                                  }
                                }}
                                className="w-4 h-4 text-primary"
                              />
                              <span className="text-sm">{category.name}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primaire Categorie (voor product cards)
                          </label>
                          <select
                            value={newProduct.featuredCategoryId || ''}
                            onChange={(e) => setNewProduct({ ...newProduct, featuredCategoryId: e.target.value || undefined })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Geen primaire categorie</option>
                            {(newProduct.categoryIds || []).map(id => {
                              const cat = categories.find(c => c.id === id);
                              return cat ? <option key={id} value={id}>{cat.name}</option> : null;
                            })}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Visibility Section */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      👁️ Status & Zichtbaarheid
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={newProduct.status || 'draft'}
                          onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="draft">Concept (niet zichtbaar)</option>
                          <option value="active">Actief (zichtbaar in webshop)</option>
                          <option value="archived">Gearchiveerd</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zichtbaarheid
                        </label>
                        <select
                          value={newProduct.visibility || 'public'}
                          onChange={(e) => setNewProduct({ ...newProduct, visibility: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="public">Publiek (voor iedereen)</option>
                          <option value="private">Privé (alleen ingelogde klanten)</option>
                          <option value="hidden">Verborgen (niet in catalogus)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Section */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      🚚 Verzending
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newProduct.digitalProduct || false}
                          onChange={(e) => setNewProduct({ ...newProduct, digitalProduct: e.target.checked, shippingRequired: !e.target.checked })}
                          className="w-5 h-5 text-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Digitaal product (geen verzending)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newProduct.requireShipping ?? true}
                          onChange={(e) => setNewProduct({ ...newProduct, requireShipping: e.target.checked })}
                          disabled={newProduct.digitalProduct}
                          className="w-5 h-5 text-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Verzending vereist</span>
                      </div>
                      {!newProduct.digitalProduct && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gewicht (gram)
                            </label>
                            <input
                              type="number"
                              value={newProduct.weight || ''}
                              onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Verzendcategorie
                            </label>
                            <select
                              value={newProduct.shippingClass || 'standard'}
                              onChange={(e) => setNewProduct({ ...newProduct, shippingClass: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="standard">Standaard</option>
                              <option value="express">Express</option>
                              <option value="large">Groot formaat</option>
                              <option value="fragile">Breekbaar</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lengte (cm)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={newProduct.dimensions?.length || ''}
                                onChange={(e) => setNewProduct({ 
                                  ...newProduct, 
                                  dimensions: { 
                                    ...newProduct.dimensions, 
                                    length: e.target.value ? parseFloat(e.target.value) : undefined 
                                  } 
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Breedte (cm)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={newProduct.dimensions?.width || ''}
                                onChange={(e) => setNewProduct({ 
                                  ...newProduct, 
                                  dimensions: { 
                                    ...newProduct.dimensions, 
                                    width: e.target.value ? parseFloat(e.target.value) : undefined 
                                  } 
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hoogte (cm)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={newProduct.dimensions?.height || ''}
                                onChange={(e) => setNewProduct({ 
                                  ...newProduct, 
                                  dimensions: { 
                                    ...newProduct.dimensions, 
                                    height: e.target.value ? parseFloat(e.target.value) : undefined 
                                  } 
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="bg-teal-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      🔍 SEO & Marketing
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Title (SEO)
                        </label>
                        <input
                          type="text"
                          value={newProduct.metaTitle || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="SEO title tag (max 60 karakters)"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(newProduct.metaTitle || '').length}/60 karakters
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description (SEO)
                        </label>
                        <textarea
                          value={newProduct.metaDescription || ''}
                          onChange={(e) => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="SEO meta description (max 160 karakters)"
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(newProduct.metaDescription || '').length}/160 karakters
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags (gescheiden door komma's)
                        </label>
                        <input
                          type="text"
                          value={(newProduct.tags || []).join(', ')}
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                            setNewProduct({ ...newProduct, tags });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="staal, metaal, plaat, constructie"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tags helpen bij zoeken en filtering
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      ⚙️ Extra Opties
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BTW Tarief
                        </label>
                        <select
                          value={newProduct.taxClass || 'standard'}
                          onChange={(e) => setNewProduct({ ...newProduct, taxClass: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="standard">Standaard (21%)</option>
                          <option value="reduced">Verlaagd (9%)</option>
                          <option value="zero">Nul (0%)</option>
                          <option value="exempt">Vrijgesteld</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newProduct.allowReviews ?? true}
                          onChange={(e) => setNewProduct({ ...newProduct, allowReviews: e.target.checked })}
                          className="w-5 h-5 text-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Reviews toestaan</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notities (niet zichtbaar voor klanten)
                      </label>
                      <textarea
                        value={newProduct.adminNotes || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, adminNotes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Interne notities over dit product..."
                      />
                    </div>
                  </div>

                  {/* Image Upload Section (Placeholder) */}
                  <div className="bg-pink-50 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                      🖼️ Product Afbeeldingen
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-gray-500 mb-2">📷 Image Upload Functionaliteit</p>
                      <p className="text-xs text-gray-400">
                        Wordt geïmplementeerd bij frontend integratie. 
                        Hier kunnen afbeeldingen geüpload worden en worden gekoppeld aan producten.
                      </p>
                      <button
                        type="button"
                        disabled
                        className="mt-4 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                      >
                        Upload Afbeelding (Komt Later)
                      </button>
                    </div>
                    {newProduct.images && newProduct.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {newProduct.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">Image {idx + 1}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...(newProduct.images || [])];
                                newImages.splice(idx, 1);
                                setNewProduct({ ...newProduct, images: newImages });
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    {editingProduct ? (
                      <button
                        onClick={handleUpdateProduct}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                      >
                        💾 Product Bijwerken
                      </button>
                    ) : (
                      <button
                        onClick={handleCreateProduct}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                      >
                        ✅ Product Aanmaken
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                        setNewProduct({
                          name: '',
                          slug: '',
                          description: '',
                          sku: '',
                          price: 0,
                          stockQuantity: 0,
                          categoryIds: [],
                          hasVariants: false,
                          variants: [],
                          images: [],
                          status: 'draft',
                          visibility: 'public',
                          tags: [],
                        });
                      }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products List/Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                {products.length === 0 ? '📦 Nog geen producten' : '🔍 Geen producten gevonden'}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {products.length === 0 
                  ? 'Begin met het toevoegen van uw eerste product!'
                  : 'Probeer andere zoektermen of filters.'}
              </p>
              {products.length === 0 && isAdmin && (
                <button
                  onClick={() => {
                    setNewProduct({
                      name: '',
                      slug: '',
                      description: '',
                      sku: generateSku('Nieuw Product'),
                      price: 0,
                      stockQuantity: 0,
                      lowStockThreshold: 5,
                      trackInventory: true,
                      categoryIds: [],
                      hasVariants: false,
                      variants: [],
                      images: [],
                      status: 'draft',
                      visibility: 'public',
                      tags: [],
                      shippingRequired: true,
                      requireShipping: true,
                      digitalProduct: false,
                      allowReviews: true,
                    });
                    setShowProductForm(true);
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  + Voeg Eerste Product Toe
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-4'
            }>
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                    viewMode === 'grid' ? 'p-4' : 'p-6 flex flex-col sm:flex-row gap-4'
                  }`}
                >
                  {/* Product Image Placeholder */}
                  <div className={`${viewMode === 'grid' ? 'mb-4' : 'w-24 sm:w-32 flex-shrink-0'}`}>
                    <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${
                      viewMode === 'grid' ? 'aspect-square' : 'w-full h-24 sm:h-32'
                    }`}>
                      {product.featuredImage ? (
                        <img src={product.featuredImage} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-gray-400 text-xs">🖼️ Geen afbeelding</span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-neutral text-base sm:text-lg">
                        {product.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(product.status)}`}>
                        {product.status === 'active' ? 'Actief' : product.status === 'draft' ? 'Concept' : 'Gearchiveerd'}
                      </span>
                    </div>
                    
                    {viewMode === 'grid' && product.shortDescription && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        SKU: {product.sku}
                      </span>
                      {product.categoryIds.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {product.categoryIds.slice(0, 1).map(id => getCategoryName(id)).join(', ')}
                          {product.categoryIds.length > 1 && ' +' + (product.categoryIds.length - 1)}
                        </span>
                      )}
                      {product.trackInventory && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          product.stockQuantity <= (product.lowStockThreshold || 0)
                            ? 'bg-red-100 text-red-800'
                            : product.stockQuantity > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          📦 {product.stockQuantity} op voorraad
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {product.compareAtPrice && product.compareAtPrice > product.price ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">
                              €{product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              €{product.compareAtPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            €{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.digitalProduct && (
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                          💾 Digitaal
                        </span>
                      )}
                    </div>

                    {viewMode === 'list' && (
                      <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.shortDescription || product.description}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {isAdmin && (
                      <div className="flex gap-2 mt-auto pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          ✏️ Bewerken
                        </button>
                        <button
                          onClick={() => handleToggleProductStatus(product)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            product.status === 'active'
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {product.status === 'active' ? '📝 Concept' : '✅ Activeren'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral">Categorie Beheer</h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({
                    name: '',
                    slug: '',
                    description: '',
                    order: categories.length,
                    active: true,
                  });
                  setShowCategoryForm(true);
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium whitespace-nowrap"
              >
                + Nieuwe Categorie
              </button>
            )}
          </div>

          {/* Category Form Modal */}
          {(showCategoryForm || editingCategory) && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-neutral mb-4">
                {editingCategory ? '✏️ Categorie Bewerken' : '➕ Nieuwe Categorie'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategory.name || ''}
                    onChange={(e) => {
                      setNewCategory({
                        ...newCategory,
                        name: e.target.value,
                        slug: newCategory.slug || generateSlug(e.target.value),
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Bijv. Staal Producten"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={newCategory.slug || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="bijv. staal-producten"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Categorie beschrijving..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hoofdcategorie (optioneel)
                    </label>
                    <select
                      value={newCategory.parentId || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Geen (hoofdcategorie)</option>
                      {categories.filter(c => c.id !== editingCategory?.id).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volgorde
                    </label>
                    <input
                      type="number"
                      value={newCategory.order || 0}
                      onChange={(e) => setNewCategory({ ...newCategory, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newCategory.active ?? true}
                    onChange={(e) => setNewCategory({ ...newCategory, active: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Categorie is actief</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={newCategory.metaTitle || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, metaTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="SEO title voor deze categorie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Meta Description
                  </label>
                  <textarea
                    value={newCategory.metaDescription || ''}
                    onChange={(e) => setNewCategory({ ...newCategory, metaDescription: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="SEO beschrijving voor deze categorie"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                {editingCategory ? (
                  <button
                    onClick={handleUpdateCategory}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    💾 Bijwerken
                  </button>
                ) : (
                  <button
                    onClick={handleCreateCategory}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    ✅ Aanmaken
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setNewCategory({
                      name: '',
                      slug: '',
                      description: '',
                      order: categories.length,
                      active: true,
                    });
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">🏷️ Nog geen categorieën</p>
              <p className="text-sm text-gray-400 mb-6">
                Begin met het aanmaken van categorieën om uw producten te organiseren.
              </p>
              {isAdmin && (
                <button
                  onClick={() => {
                    setNewCategory({
                      name: '',
                      slug: '',
                      description: '',
                      order: 0,
                      active: true,
                    });
                    setShowCategoryForm(true);
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  + Voeg Eerste Categorie Toe
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {categories
                .sort((a, b) => {
                  // Sort by parent first, then by order
                  if (a.parentId && !b.parentId) return 1;
                  if (!a.parentId && b.parentId) return -1;
                  return a.order - b.order;
                })
                .map(category => {
                  const parentCategory = category.parentId 
                    ? categories.find(c => c.id === category.parentId)
                    : null;
                  const productCount = products.filter(p => p.categoryIds.includes(category.id)).length;
                  
                  return (
                    <div
                      key={category.id}
                      className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${
                        parentCategory ? 'ml-4 sm:ml-8 border-l-4 border-purple-300' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {parentCategory && (
                              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                Sub van: {parentCategory.name}
                              </span>
                            )}
                            <h3 className="font-semibold text-neutral text-lg">
                              {category.name}
                            </h3>
                            {!category.active && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Inactief
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              📦 {productCount} product{productCount !== 1 ? 'en' : ''}
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Slug: {category.slug}
                            </span>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Volgorde: {category.order}
                            </span>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                            >
                              ✏️ Bewerken
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                              🗑️ Verwijderen
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Zoek bestellingen..."
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Alle Statussen</option>
                <option value="pending">Openstaand</option>
                <option value="processing">In Behandeling</option>
                <option value="shipped">Verzonden</option>
                <option value="delivered">Afgeleverd</option>
                <option value="cancelled">Geannuleerd</option>
                <option value="refunded">Terugbetaald</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                {orders.length === 0 ? '📋 Nog geen bestellingen' : '🔍 Geen bestellingen gevonden'}
              </p>
              <p className="text-sm text-gray-400">
                {orders.length === 0 
                  ? 'Bestellingen verschijnen hier zodra klanten producten bestellen.'
                  : 'Probeer andere zoektermen of filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-neutral text-lg">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' ? 'Openstaand' :
                           order.status === 'processing' ? 'In Behandeling' :
                           order.status === 'shipped' ? 'Verzonden' :
                           order.status === 'delivered' ? 'Afgeleverd' :
                           order.status === 'cancelled' ? 'Geannuleerd' :
                           'Terugbetaald'}
                        </span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded ${getStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus === 'pending' ? '💰 Niet betaald' :
                           order.paymentStatus === 'paid' ? '✅ Betaald' :
                           order.paymentStatus === 'failed' ? '❌ Betaling mislukt' :
                           '↩️ Terugbetaald'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Klant:</span> {order.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {order.customerEmail}
                        </div>
                        <div>
                          <span className="font-medium">Datum:</span> {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                        </div>
                        <div>
                          <span className="font-medium">Aantal items:</span> {order.items.length}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">
                        €{order.total.toFixed(2)}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 mt-3 justify-end">
                          {order.status === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateOrderStatus(order.id, 'processing');
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              In Behandeling
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateOrderStatus(order.id, 'shipped');
                              }}
                              className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              Verzonden
                            </button>
                          )}
                          {order.paymentStatus === 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdatePaymentStatus(order.id, 'paid');
                              }}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Betaald
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Detail Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between z-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral">
                    Bestelling: {selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-neutral mb-3">Klant Informatie</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Naam:</span> {selectedOrder.customerName}</p>
                        <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</p>
                        {selectedOrder.customerPhone && (
                          <p><span className="font-medium">Telefoon:</span> {selectedOrder.customerPhone}</p>
                        )}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-neutral mb-3">Bestel Informatie</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Datum:</span> {new Date(selectedOrder.createdAt).toLocaleString('nl-NL')}</p>
                        <p><span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </p>
                        <p><span className="font-medium">Betaling:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-neutral mb-4">Bestelde Items</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Aantal</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Prijs</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Subtotaal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item, idx) => (
                            <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-xs text-gray-500">SKU: {item.productSku}</p>
                                  {item.variantId && (
                                    <p className="text-xs text-gray-500">Variant: {item.productSnapshot?.variantName}</p>
                                  )}
                                </div>
                              </td>
                              <td className="text-right py-3 px-4">{item.quantity}</td>
                              <td className="text-right py-3 px-4">€{item.price.toFixed(2)}</td>
                              <td className="text-right py-3 px-4 font-medium">€{item.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={3} className="text-right py-3 px-4 font-semibold">
                              Subtotaal:
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">
                              €{selectedOrder.subtotal.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="text-right py-3 px-4 font-semibold">
                              BTW:
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">
                              €{selectedOrder.tax.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="text-right py-3 px-4 font-semibold">
                              Verzendkosten:
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">
                              €{selectedOrder.shippingCost.toFixed(2)}
                            </td>
                          </tr>
                          {selectedOrder.discount > 0 && (
                            <tr>
                              <td colSpan={3} className="text-right py-3 px-4 font-semibold text-green-600">
                                Korting:
                              </td>
                              <td className="text-right py-3 px-4 font-semibold text-green-600">
                                -€{selectedOrder.discount.toFixed(2)}
                              </td>
                            </tr>
                          )}
                          <tr className="border-t-2 border-gray-300">
                            <td colSpan={3} className="text-right py-3 px-4 font-bold text-lg">
                              Totaal:
                            </td>
                            <td className="text-right py-3 px-4 font-bold text-lg text-primary">
                              €{selectedOrder.total.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Shipping & Payment Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h3 className="font-semibold text-neutral mb-3">Verzendadres</h3>
                      <div className="text-sm space-y-1">
                        <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                        {selectedOrder.shippingAddress.company && (
                          <p>{selectedOrder.shippingAddress.company}</p>
                        )}
                        <p>{selectedOrder.shippingAddress.addressLine1}</p>
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <p>{selectedOrder.shippingAddress.addressLine2}</p>
                        )}
                        <p>{selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-sm"><span className="font-medium">Tracking:</span> {selectedOrder.trackingNumber}</p>
                          {selectedOrder.carrier && (
                            <p className="text-sm"><span className="font-medium">Vervoerder:</span> {selectedOrder.carrier}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-neutral mb-3">Factuuradres</h3>
                      <div className="text-sm space-y-1">
                        <p>{selectedOrder.billingAddress.firstName} {selectedOrder.billingAddress.lastName}</p>
                        {selectedOrder.billingAddress.company && (
                          <p>{selectedOrder.billingAddress.company}</p>
                        )}
                        <p>{selectedOrder.billingAddress.addressLine1}</p>
                        {selectedOrder.billingAddress.addressLine2 && (
                          <p>{selectedOrder.billingAddress.addressLine2}</p>
                        )}
                        <p>{selectedOrder.billingAddress.postalCode} {selectedOrder.billingAddress.city}</p>
                        <p>{selectedOrder.billingAddress.country}</p>
                      </div>
                      {selectedOrder.paymentMethod && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-sm"><span className="font-medium">Betaalmethode:</span> {selectedOrder.paymentMethod}</p>
                          {selectedOrder.paymentReference && (
                            <p className="text-sm"><span className="font-medium">Referentie:</span> {selectedOrder.paymentReference}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {(selectedOrder.customerNotes || selectedOrder.adminNotes) && (
                    <div>
                      <h3 className="font-semibold text-neutral mb-3">Notities</h3>
                      <div className="space-y-3">
                        {selectedOrder.customerNotes && (
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-blue-800 mb-1">Klant Notitie:</p>
                            <p className="text-sm text-blue-700">{selectedOrder.customerNotes}</p>
                          </div>
                        )}
                        {selectedOrder.adminNotes && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-yellow-800 mb-1">Admin Notitie:</p>
                            <p className="text-sm text-yellow-700">{selectedOrder.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <div className="flex-1 flex flex-wrap gap-2">
                        {selectedOrder.status !== 'processing' && selectedOrder.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              handleUpdateOrderStatus(selectedOrder.id, 'processing');
                              setSelectedOrder({ ...selectedOrder, status: 'processing' });
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            In Behandeling
                          </button>
                        )}
                        {selectedOrder.status === 'processing' && (
                          <button
                            onClick={() => {
                              handleUpdateOrderStatus(selectedOrder.id, 'shipped');
                              setSelectedOrder({ ...selectedOrder, status: 'shipped' });
                            }}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                          >
                            Als Verzonden Markeren
                          </button>
                        )}
                        {selectedOrder.paymentStatus === 'pending' && (
                          <button
                            onClick={() => {
                              handleUpdatePaymentStatus(selectedOrder.id, 'paid');
                              setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid', paidAt: new Date().toISOString() });
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            Als Betaald Markeren
                          </button>
                        )}
                        {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                          <button
                            onClick={() => {
                              if (confirm('Weet u zeker dat u deze bestelling wilt annuleren?')) {
                                handleUpdateOrderStatus(selectedOrder.id, 'cancelled');
                                setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            Annuleren
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                      >
                        Sluiten
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
