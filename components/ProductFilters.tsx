import React, { useState } from 'react';
import {
  ProductAttribute,
  ProductCategory,
  FilterState,
  ProductBadge,
} from '../types';

interface ProductFiltersProps {
  categories: ProductCategory[];
  attributes: ProductAttribute[];
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
  priceRange?: { min: number; max: number };
  showCategoryFilter?: boolean;
  showPriceFilter?: boolean;
  showBadgeFilter?: boolean;
  showStockFilter?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  attributes,
  filterState,
  onFilterChange,
  priceRange = { min: 0, max: 10000 },
  showCategoryFilter = true,
  showPriceFilter = true,
  showBadgeFilter = true,
  showStockFilter = true,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    stock: true,
    badges: true,
  });

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Handle category filter
  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({
      ...filterState,
      categoryId: filterState.categoryId === categoryId ? undefined : categoryId,
    });
  };

  // Handle attribute filter
  const handleAttributeChange = (attributeId: string, value: any) => {
    const newAttributes = { ...filterState.attributes };
    if (value === null || value === undefined || value === '') {
      delete newAttributes[attributeId];
    } else {
      newAttributes[attributeId] = value;
    }
    onFilterChange({
      ...filterState,
      attributes: newAttributes,
    });
  };

  // Handle attribute checkbox (multiselect)
  const handleAttributeCheckbox = (attributeId: string, optionValue: string, checked: boolean) => {
    const currentValues = (filterState.attributes[attributeId] || []) as string[];
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter(v => v !== optionValue);

    handleAttributeChange(attributeId, newValues.length > 0 ? newValues : null);
  };

  // Handle price range
  const handlePriceRangeChange = (min: number, max: number) => {
    onFilterChange({
      ...filterState,
      priceRange: { min, max },
    });
  };

  // Handle stock filter
  const handleStockFilterChange = (inStock: boolean) => {
    onFilterChange({
      ...filterState,
      inStock: filterState.inStock === inStock ? undefined : inStock,
    });
  };

  // Handle badge filter
  const handleBadgeFilterChange = (badgeType: ProductBadge['type']) => {
    const currentBadges = filterState.badges || [];
    const newBadges = currentBadges.includes(badgeType)
      ? currentBadges.filter(b => b !== badgeType)
      : [...currentBadges, badgeType];

    onFilterChange({
      ...filterState,
      badges: newBadges.length > 0 ? newBadges : undefined,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange({
      attributes: {},
      search: filterState.search, // Keep search term
    });
  };

  // Get active filter count
  const activeFilterCount =
    (filterState.categoryId ? 1 : 0) +
    Object.keys(filterState.attributes).length +
    (filterState.priceRange ? 1 : 0) +
    (filterState.inStock !== undefined ? 1 : 0) +
    (filterState.badges?.length || 0);

  // Get hierarchical categories
  const getRootCategories = () => categories.filter(c => !c.parentId && c.active);
  const getSubCategories = (parentId: string) =>
    categories.filter(c => c.parentId === parentId && c.active);

  // Render category tree
  const renderCategoryTree = (category: ProductCategory, level = 0) => {
    const subCategories = getSubCategories(category.id);
    const isSelected = filterState.categoryId === category.id;

    return (
      <div key={category.id} style={{ marginLeft: level * 16 }}>
        <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
          <input
            type="radio"
            name="category"
            checked={isSelected}
            onChange={() => handleCategoryChange(category.id)}
            className="text-primary focus:ring-primary"
          />
          <span className="text-sm">
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.name}
            {category.productCount !== undefined && (
              <span className="text-gray-500 ml-1">({category.productCount})</span>
            )}
          </span>
        </label>
        {subCategories.map(subCat => renderCategoryTree(subCat, level + 1))}
      </div>
    );
  };

  // Render attribute filter based on type
  const renderAttributeFilter = (attribute: ProductAttribute) => {
    const currentValue = filterState.attributes[attribute.id];

    switch (attribute.type) {
      case 'checkbox':
      case 'multiselect':
        return (
          <div key={attribute.id} className="mb-4">
            <button
              onClick={() => toggleSection(attribute.id)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-2"
            >
              <span>
                {attribute.name}
                {attribute.unit && <span className="text-gray-500 ml-1">({attribute.unit})</span>}
              </span>
              <span className="text-gray-500">
                {expandedSections[attribute.id] ? '−' : '+'}
              </span>
            </button>
            {expandedSections[attribute.id] && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {attribute.options?.map(option => {
                  const isChecked = Array.isArray(currentValue) && currentValue.includes(option.value);
                  return (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleAttributeCheckbox(attribute.id, option.value, e.target.checked)}
                        className="text-primary focus:ring-primary"
                      />
                      {option.colorHex && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: option.colorHex }}
                        />
                      )}
                      <span className="text-sm">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={attribute.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {attribute.name}
              {attribute.unit && <span className="text-gray-500 ml-1">({attribute.unit})</span>}
            </label>
            <select
              value={currentValue || ''}
              onChange={(e) => handleAttributeChange(attribute.id, e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Alle</option>
              {attribute.options?.map(option => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'range':
        return (
          <div key={attribute.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {attribute.name}
              {attribute.unit && <span className="text-gray-500 ml-1">({attribute.unit})</span>}
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                min={attribute.min}
                max={attribute.max}
                step={attribute.step || 1}
                value={currentValue?.min || ''}
                onChange={(e) => handleAttributeChange(attribute.id, {
                  ...currentValue,
                  min: e.target.value ? Number(e.target.value) : undefined,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                min={attribute.min}
                max={attribute.max}
                step={attribute.step || 1}
                value={currentValue?.max || ''}
                onChange={(e) => handleAttributeChange(attribute.id, {
                  ...currentValue,
                  max: e.target.value ? Number(e.target.value) : undefined,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={attribute.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {attribute.name}
              {attribute.unit && <span className="text-gray-500 ml-1">({attribute.unit})</span>}
            </label>
            <input
              type="number"
              value={currentValue || ''}
              onChange={(e) => handleAttributeChange(attribute.id, e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const filteredAttributes = attributes
    .filter(attr => attr.showInFilters)
    .filter(attr => {
      // Show only attributes relevant to selected category
      if (!attr.categoryIds || attr.categoryIds.length === 0) return true;
      if (!filterState.categoryId) return true;
      return attr.categoryIds.includes(filterState.categoryId);
    })
    .sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({activeFilterCount} actief)
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:text-secondary font-medium"
          >
            Wis alles
          </button>
        )}
      </div>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Categories */}
        {showCategoryFilter && categories.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('categories')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-2"
            >
              <span>Categorieën</span>
              <span className="text-gray-500">
                {expandedSections.categories ? '−' : '+'}
              </span>
            </button>
            {expandedSections.categories && (
              <div className="space-y-1">
                <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                  <input
                    type="radio"
                    name="category"
                    checked={!filterState.categoryId}
                    onChange={() => handleCategoryChange('')}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Alle Categorieën</span>
                </label>
                {getRootCategories().map(category => renderCategoryTree(category))}
              </div>
            )}
          </div>
        )}

        {/* Price Range */}
        {showPriceFilter && (
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-2"
            >
              <span>Prijs (€)</span>
              <span className="text-gray-500">
                {expandedSections.price ? '−' : '+'}
              </span>
            </button>
            {expandedSections.price && (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filterState.priceRange?.min || ''}
                  onChange={(e) => handlePriceRangeChange(
                    e.target.value ? Number(e.target.value) : priceRange.min,
                    filterState.priceRange?.max || priceRange.max
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={filterState.priceRange?.max || ''}
                  onChange={(e) => handlePriceRangeChange(
                    filterState.priceRange?.min || priceRange.min,
                    e.target.value ? Number(e.target.value) : priceRange.max
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Product Attributes */}
        {filteredAttributes.map(attr => renderAttributeFilter(attr))}

        {/* Stock Filter */}
        {showStockFilter && (
          <div>
            <button
              onClick={() => toggleSection('stock')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-2"
            >
              <span>Voorraad</span>
              <span className="text-gray-500">
                {expandedSections.stock ? '−' : '+'}
              </span>
            </button>
            {expandedSections.stock && (
              <div className="space-y-1">
                <label className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded">
                  <input
                    type="checkbox"
                    checked={filterState.inStock === true}
                    onChange={(e) => handleStockFilterChange(e.target.checked)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Alleen op voorraad</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Badge Filters */}
        {showBadgeFilter && (
          <div>
            <button
              onClick={() => toggleSection('badges')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 mb-2"
            >
              <span>Labels</span>
              <span className="text-gray-500">
                {expandedSections.badges ? '−' : '+'}
              </span>
            </button>
            {expandedSections.badges && (
              <div className="space-y-1">
                {['new', 'sale', 'featured', 'bestseller'].map(badgeType => (
                  <label
                    key={badgeType}
                    className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={filterState.badges?.includes(badgeType as any) || false}
                      onChange={() => handleBadgeFilterChange(badgeType as ProductBadge['type'])}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm capitalize">{badgeType === 'new' ? 'Nieuw' : badgeType === 'sale' ? 'Actie' : badgeType === 'featured' ? 'Uitgelicht' : 'Bestseller'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
