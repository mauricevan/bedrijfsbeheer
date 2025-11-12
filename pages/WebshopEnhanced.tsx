import React, { useState, useMemo } from 'react';
import {
  WebshopProduct,
  ProductCategory,
  ProductAttribute,
  FilterState,
  ProductBadge,
  InventoryItem,
  Customer,
} from '../types';
import { ProductFilters } from '../components/ProductFilters';
import { ProductBadgeList } from '../components/ProductBadge';
import { ProductVariantManager } from '../components/ProductVariantManager';

interface WebshopEnhancedProps {
  inventory: InventoryItem[];
  customers: Customer[];
  isAdmin: boolean;
  webshopProducts: WebshopProduct[];
  setWebshopProducts: React.Dispatch<React.SetStateAction<WebshopProduct[]>>;
}

type TabType = 'products' | 'categories' | 'attributes';
type SortOption = 'featured' | 'newest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export const WebshopEnhanced: React.FC<WebshopEnhancedProps> = ({
  inventory,
  customers,
  isAdmin,
  webshopProducts,
  setWebshopProducts,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('products');

  // Products state
  const [products, setProducts] = useState<WebshopProduct[]>(webshopProducts);

  // Sync with props
  React.useEffect(() => {
    setProducts(webshopProducts);
  }, [webshopProducts]);

  const updateProducts = (newProducts: WebshopProduct[]) => {
    setProducts(newProducts);
    setWebshopProducts(newProducts);
  };

  // Categories state
  const [categories, setCategories] = useState<ProductCategory[]>([
    // Demo categories (BESA-geïnspireerd)
    {
      id: '1',
      name: 'Sloten & Beveiliging',
      slug: 'sloten-beveiliging',
      icon: '🔒',
      description: 'Cilinders, sloten en beveiligingsproducten',
      order: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Cilinders',
      slug: 'cilinders',
      icon: '🔑',
      parentId: '1',
      description: 'Profielcilinders in verschillende maten',
      order: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Meerpuntsloten',
      slug: 'meerpuntsloten',
      icon: '🚪',
      parentId: '1',
      description: 'Voor voordeur en achterdeur',
      order: 1,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Deurtechniek',
      slug: 'deurtechniek',
      icon: '🚪',
      description: 'Beslag, scharnieren en deurtoebehoren',
      order: 1,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Attributes state (BESA-style filtering)
  const [attributes, setAttributes] = useState<ProductAttribute[]>([
    {
      id: 'backset',
      name: 'Backset',
      slug: 'backset',
      type: 'multiselect',
      unit: 'mm',
      categoryIds: ['2', '3'],
      required: false,
      showInFilters: true,
      showInProductList: true,
      order: 1,
      options: [
        { id: 'b25', label: '25mm', value: '25', order: 0 },
        { id: 'b30', label: '30mm', value: '30', order: 1 },
        { id: 'b35', label: '35mm', value: '35', order: 2 },
        { id: 'b40', label: '40mm', value: '40', order: 3 },
        { id: 'b50', label: '50mm', value: '50', order: 4 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'material',
      name: 'Materiaal',
      slug: 'material',
      type: 'multiselect',
      categoryIds: undefined, // Applies to all
      required: false,
      showInFilters: true,
      showInProductList: true,
      order: 2,
      options: [
        { id: 'mat1', label: 'Roestvrij Staal', value: 'stainless_steel', order: 0 },
        { id: 'mat2', label: 'Messing', value: 'brass', order: 1 },
        { id: 'mat3', label: 'Gegalvaniseerd', value: 'galvanized', order: 2 },
        { id: 'mat4', label: 'Aluminium', value: 'aluminum', order: 3 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'length',
      name: 'Lengte',
      slug: 'length',
      type: 'range',
      unit: 'mm',
      categoryIds: ['2'],
      required: false,
      showInFilters: true,
      showInProductList: true,
      order: 3,
      min: 20,
      max: 150,
      step: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    attributes: {},
  });

  // Sort state
  const [sortOption, setSortOption] = useState<SortOption>('featured');

  // View modes
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WebshopProduct | null>(null);

  // Calculate price range for filters
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 1000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Category filter
      if (filterState.categoryId && !product.categoryIds.includes(filterState.categoryId)) {
        return false;
      }

      // Price filter
      if (filterState.priceRange) {
        if (
          product.price < filterState.priceRange.min ||
          product.price > filterState.priceRange.max
        ) {
          return false;
        }
      }

      // Stock filter
      if (filterState.inStock && product.stockQuantity <= 0) {
        return false;
      }

      // Badge filter
      if (filterState.badges && filterState.badges.length > 0) {
        const productBadgeTypes = product.badges?.map(b => b.type) || [];
        if (!filterState.badges.some(badge => productBadgeTypes.includes(badge))) {
          return false;
        }
      }

      // Attribute filters
      for (const [attrId, filterValue] of Object.entries(filterState.attributes)) {
        const productAttr = product.attributes?.find(a => a.attributeId === attrId);
        if (!productAttr) return false;

        const attr = attributes.find(a => a.id === attrId);
        if (!attr) continue;

        // Handle different attribute types
        if (attr.type === 'multiselect' || attr.type === 'checkbox') {
          const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];
          const productValues = Array.isArray(productAttr.value)
            ? productAttr.value
            : [productAttr.value];
          if (!filterValues.some(fv => productValues.includes(fv))) {
            return false;
          }
        } else if (attr.type === 'range') {
          const rangeFilter = filterValue as { min?: number; max?: number };
          const productValue = Number(productAttr.value);
          if (rangeFilter.min !== undefined && productValue < rangeFilter.min) return false;
          if (rangeFilter.max !== undefined && productValue > rangeFilter.max) return false;
        } else if (attr.type === 'select') {
          if (productAttr.value !== filterValue) return false;
        }
      }

      return true;
    });

    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        // Featured products first, then by name
        filtered.sort((a, b) => {
          const aFeatured = a.badges?.some(badge => badge.type === 'featured') ? 1 : 0;
          const bFeatured = b.badges?.some(badge => badge.type === 'featured') ? 1 : 0;
          if (aFeatured !== bFeatured) return bFeatured - aFeatured;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return filtered;
  }, [products, filterState, sortOption, attributes]);

  // Statistics
  const stats = useMemo(() => {
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(
      p => p.trackInventory && p.stockQuantity <= (p.lowStockThreshold || 5)
    ).length;

    return {
      totalProducts: products.length,
      activeProducts,
      lowStockProducts,
      categories: categories.length,
    };
  }, [products, categories]);

  // Auto-generate badges based on product data
  const autoGenerateBadges = (product: WebshopProduct): ProductBadge[] => {
    const badges: ProductBadge[] = [];

    // NEW badge - created in last 30 days
    const daysSinceCreation =
      (new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation <= 30) {
      badges.push({ type: 'new', priority: 3 });
    }

    // SALE badge - has compareAtPrice
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      badges.push({ type: 'sale', priority: 5 });
    }

    // LOW STOCK badge
    if (product.trackInventory && product.stockQuantity <= (product.lowStockThreshold || 5) && product.stockQuantity > 0) {
      badges.push({ type: 'lowstock', priority: 4 });
    }

    // Merge with manual badges
    const manualBadges = product.badges || [];
    return [...badges, ...manualBadges];
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral">
            🛒 Webshop Beheer (BESA-Style)
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Geavanceerde filtering en productbeheer geïnspireerd door BESA
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Totaal Producten</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Actieve Producten</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
          <p className="text-sm text-gray-600 mb-1">Weinig Voorraad</p>
          <p className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Categorieën</p>
          <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
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
          onClick={() => setActiveTab('attributes')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'attributes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 Attributen ({attributes.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <ProductFilters
                categories={categories}
                attributes={attributes}
                filterState={filterState}
                onFilterChange={setFilterState}
                priceRange={priceRange}
                showCategoryFilter={true}
                showPriceFilter={true}
                showBadgeFilter={true}
                showStockFilter={true}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors lg:hidden"
                >
                  {showFilters ? '✕ Verberg Filters' : '🔍 Toon Filters'}
                </button>

                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as SortOption)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="featured">🌟 Uitgelicht</option>
                  <option value="newest">🆕 Nieuwste eerst</option>
                  <option value="name-asc">🔤 Naam (A-Z)</option>
                  <option value="name-desc">🔤 Naam (Z-A)</option>
                  <option value="price-asc">💰 Prijs (Laag-Hoog)</option>
                  <option value="price-desc">💰 Prijs (Hoog-Laag)</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 rounded-lg ${
                      viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    title="Grid weergave"
                  >
                    ▦
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg ${
                      viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                    title="Lijst weergave"
                  >
                    ☰
                  </button>
                </div>

                <span className="text-sm text-gray-600">
                  {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'producten'}
                </span>
              </div>

              {isAdmin && (
                <button
                  onClick={() => alert('Product toevoegen functionaliteit - zie originele Webshop.tsx')}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium whitespace-nowrap"
                >
                  + Product Toevoegen
                </button>
              )}
            </div>

            {/* Products Grid/List */}
            {filteredAndSortedProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredAndSortedProducts.map(product => {
                  const badges = autoGenerateBadges(product);

                  return (
                    <div
                      key={product.id}
                      className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Product Image */}
                      <div className={`${viewMode === 'list' ? 'w-48' : 'aspect-square'} bg-gray-100 relative`}>
                        {product.featuredImage ? (
                          <img
                            src={product.featuredImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                            📦
                          </div>
                        )}
                        {/* Badges */}
                        {badges.length > 0 && (
                          <div className="absolute top-2 left-2">
                            <ProductBadgeList badges={badges} maxBadges={2} size="sm" />
                          </div>
                        )}
                        {/* Stock indicator */}
                        {product.stockQuantity === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">UITVERKOCHT</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.shortDescription || product.description}
                        </p>

                        {/* Categories */}
                        {product.categoryIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {product.categoryIds.slice(0, 2).map(catId => {
                              const cat = categories.find(c => c.id === catId);
                              return cat ? (
                                <span
                                  key={catId}
                                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                                >
                                  {cat.icon} {cat.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-bold text-primary">
                            €{product.price.toFixed(2)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              €{product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Stock */}
                        <div className="text-sm text-gray-600 mb-3">
                          {product.trackInventory && (
                            <span>
                              Voorraad: <strong>{product.stockQuantity}</strong>
                            </span>
                          )}
                          {!product.trackInventory && <span>Voorraad niet bijgehouden</span>}
                        </div>

                        {/* Actions */}
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => alert('Bewerk functionaliteit - zie originele Webshop.tsx')}
                              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                              ✏️ Bewerken
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Weet u zeker dat u "${product.name}" wilt verwijderen?`)) {
                                  updateProducts(products.filter(p => p.id !== product.id));
                                }
                              }}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg mb-2">🔍 Geen producten gevonden</p>
                <p className="text-sm">Pas uw filters aan of probeer een andere zoekopdracht.</p>
                {Object.keys(filterState.attributes).length > 0 && (
                  <button
                    onClick={() => setFilterState({ attributes: {} })}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                  >
                    Wis alle filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Categorieën Beheer</h2>
          <p className="text-gray-600 mb-4">
            Hiërarchische categoriestructuur zoals bij BESA. Deze demo toont de basisstructuur.
          </p>
          <div className="space-y-2">
            {categories
              .filter(c => !c.parentId)
              .map(category => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  {/* Subcategories */}
                  <div className="ml-12 mt-2 space-y-1">
                    {categories
                      .filter(c => c.parentId === category.id)
                      .map(subCat => (
                        <div
                          key={subCat.id}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <span>{subCat.icon}</span>
                          <span>{subCat.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Attributes Tab */}
      {activeTab === 'attributes' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Product Attributen (BESA-Style Filters)</h2>
          <p className="text-gray-600 mb-4">
            Geavanceerde attributen voor filtering, zoals backset, materiaal, afmetingen, etc.
          </p>
          <div className="space-y-4">
            {attributes.map(attr => (
              <div key={attr.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {attr.name}
                      {attr.unit && <span className="text-gray-500 ml-1">({attr.unit})</span>}
                    </h3>
                    <p className="text-sm text-gray-600">Type: {attr.type}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {attr.showInFilters && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        In Filters
                      </span>
                    )}
                    {attr.required && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Verplicht</span>
                    )}
                  </div>
                </div>

                {/* Options for select/multiselect */}
                {attr.options && attr.options.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Opties:</p>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map(option => (
                        <span
                          key={option.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {option.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Range info */}
                {attr.type === 'range' && (
                  <p className="text-sm text-gray-600 mt-2">
                    Bereik: {attr.min} - {attr.max} {attr.unit}
                    {attr.step && ` (stap: ${attr.step})`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
