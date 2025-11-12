import React, { useState, useMemo, useEffect } from "react";
import {
  InventoryItem,
  InventoryCategory,
  Supplier,
  WebshopProduct,
} from "../types";
import { CSVUpload } from "../components/common";
import { parseCSV, CSVColumnMapping, CSVParseResult, csvValidators, csvTransformers } from "../utils/csvParser";
import { downloadInventoryExampleCSV } from "../utils/csvExamples";

interface InventoryProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  isAdmin: boolean;
  webshopProducts?: WebshopProduct[]; // Voor sync functionaliteit
  setWebshopProducts?: React.Dispatch<React.SetStateAction<WebshopProduct[]>>;
  categories?: InventoryCategory[]; // 🆕 V5.7: Categories prop
  setCategories?: React.Dispatch<React.SetStateAction<InventoryCategory[]>>; // 🆕 V5.7: Set categories prop
}

export const Inventory: React.FC<InventoryProps> = ({
  inventory,
  setInventory,
  isAdmin,
  webshopProducts = [],
  setWebshopProducts,
  categories: externalCategories = [],
  setCategories: setExternalCategories,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "items" | "suppliers" | "reports" | "categories"
  >("items");

  // 🆕 CSV Import State
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvImportResult, setCSVImportResult] = useState<CSVParseResult<any> | null>(null);
  const [showImportResultsModal, setShowImportResultsModal] = useState(false);

  // 🆕 V5.7: Category filter state
  const [categoryFilter, setCategoryFilter] = useState<string>(""); // Selected category ID
  const [categorySearchTerm, setCategorySearchTerm] = useState(""); // Search term for category dropdown
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // 🆕 V5.6: Categories state (use external if provided, otherwise local)
  const [localCategories, setLocalCategories] = useState<InventoryCategory[]>(
    []
  );
  const categories =
    externalCategories.length > 0 ? externalCategories : localCategories;
  const setCategories = setExternalCategories || setLocalCategories;
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<InventoryCategory | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<InventoryCategory>>({
    name: "",
    description: "",
    color: "#3B82F6",
  });
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false); // Voor nieuwe categorie tijdens item toevoegen

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    averageLeadTime: 7,
    notes: "",
  });

  // New item state met alle nieuwe velden
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    sku: "", // Legacy
    quantity: 0,
    reorderLevel: 0,
    supplierId: undefined,
    supplier: "",
    purchasePrice: 0,
    salePrice: 0,
    margin: 0,
    vatRate: "21",
    customVatRate: undefined,
    syncEnabled: false,
    webshopId: undefined,
    webshopProductId: undefined,
    unit: "stuk",
    price: 0, // Legacy
    posAlertNote: undefined,
    // 🆕 V5.6: 3 SKU types
    supplierSku: "",
    autoSku: "", // Wordt automatisch gegenereerd
    customSku: "",
    categoryId: undefined,
  });

  // Helper functies
  const calculateMargin = (
    purchasePrice: number,
    salePrice: number
  ): number => {
    if (!purchasePrice || purchasePrice === 0) return 0;
    return (
      Math.round(((salePrice - purchasePrice) / purchasePrice) * 100 * 10) / 10
    );
  };

  const calculateVatInclusive = (
    priceExcl: number,
    vatRate: "21" | "9" | "0" | "custom",
    customRate?: number
  ): number => {
    const rate = vatRate === "custom" ? customRate || 0 : parseFloat(vatRate);
    return priceExcl * (1 + rate / 100);
  };

  const getVatRateValue = (item: InventoryItem): number => {
    if (item.vatRate === "custom") return item.customVatRate || 0;
    return parseFloat(item.vatRate);
  };

  // 🆕 V5.6: Automatische SKU generatie (INV-0001, INV-0002, etc.)
  const generateAutoSku = (): string => {
    const maxSku = inventory.reduce((max, item) => {
      const sku = item.autoSku || item.sku;
      if (sku && sku.startsWith("INV-")) {
        const num = parseInt(sku.replace("INV-", "")) || 0;
        return Math.max(max, num);
      }
      return max;
    }, 0);
    const nextNum = maxSku + 1;
    return `INV-${nextNum.toString().padStart(4, "0")}`;
  };

  // 🆕 CSV Import Column Mappings
  const inventoryCSVMappings: CSVColumnMapping[] = [
    { csvHeader: 'Naam', dataKey: 'name', required: true },
    { csvHeader: 'SKU Leverancier', dataKey: 'supplierSku', required: false },
    { csvHeader: 'Aangepaste SKU', dataKey: 'customSku', required: false },
    { csvHeader: 'Locatie', dataKey: 'location', required: false },
    { csvHeader: 'Hoeveelheid', dataKey: 'quantity', required: true, validator: csvValidators.isPositiveNumber, transformer: csvTransformers.toNumber },
    { csvHeader: 'Eenheid', dataKey: 'unit', required: true },
    { csvHeader: 'Minimum Voorraad', dataKey: 'reorderLevel', required: false, validator: csvValidators.isPositiveNumber, transformer: csvTransformers.toNumber },
    { csvHeader: 'Leverancier', dataKey: 'supplier', required: false },
    { csvHeader: 'Categorie', dataKey: 'categoryName', required: false },
    { csvHeader: 'Verkoopprijs (€)', dataKey: 'salePrice', required: false, validator: csvValidators.isPositiveNumber, transformer: csvTransformers.toNumber },
    { csvHeader: 'Inkoopprijs (€)', dataKey: 'purchasePrice', required: false, validator: csvValidators.isPositiveNumber, transformer: csvTransformers.toNumber },
    { csvHeader: 'Notities', dataKey: 'notes', required: false },
  ];

  // 🆕 CSV Import Handler
  const handleCSVDataParsed = (result: CSVParseResult<any>) => {
    // Verwerk geïmporteerde items
    const newItems: InventoryItem[] = result.data.map((csvItem, index) => {
      // Zoek categorie ID op basis van naam
      let categoryId: string | undefined;
      if (csvItem.categoryName) {
        const category = categories.find(c => 
          c.name.toLowerCase() === csvItem.categoryName.toLowerCase()
        );
        categoryId = category?.id;
      }

      // Bereken marge
      const margin = csvItem.purchasePrice && csvItem.salePrice && csvItem.purchasePrice > 0
        ? calculateMargin(csvItem.purchasePrice, csvItem.salePrice)
        : 0;

      return {
        id: `${Date.now()}-${index}`,
        name: csvItem.name,
        supplierSku: csvItem.supplierSku || '',
        customSku: csvItem.customSku || '',
        autoSku: generateAutoSku(), // Genereer automatische SKU
        sku: generateAutoSku(), // Legacy support
        location: csvItem.location,
        quantity: csvItem.quantity || 0,
        unit: csvItem.unit || 'stuk',
        reorderLevel: csvItem.reorderLevel || 0,
        supplier: csvItem.supplier || '',
        categoryId,
        salePrice: csvItem.salePrice || 0,
        purchasePrice: csvItem.purchasePrice || 0,
        price: csvItem.salePrice || 0, // Legacy support
        margin,
        vatRate: '21' as any,
        syncEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Voeg items toe aan inventory
    if (newItems.length > 0) {
      setInventory(prev => [...prev, ...newItems]);
    }

    // Toon resultaten
    setCSVImportResult(result);
    setShowImportResultsModal(true);
    setShowCSVImport(false);
  };

  // 🆕 V5.6: Uitgebreide filtering - zoek in alle velden + categorie filter
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // 🆕 V5.7: Filter op categorie eerst
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.categoryId === categoryFilter);
    }

    // Filter op zoekterm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        // Zoek in naam
        if (item.name.toLowerCase().includes(searchLower)) return true;

        // Zoek in alle SKU types
        if (item.sku?.toLowerCase().includes(searchLower)) return true;
        if (item.supplierSku?.toLowerCase().includes(searchLower)) return true;
        if (item.autoSku?.toLowerCase().includes(searchLower)) return true;
        if (item.customSku?.toLowerCase().includes(searchLower)) return true;

        // Zoek in locatie
        if (item.location?.toLowerCase().includes(searchLower)) return true;

        // Zoek in unit
        if (item.unit?.toLowerCase().includes(searchLower)) return true;

        // Zoek in supplier naam
        if (item.supplier?.toLowerCase().includes(searchLower)) return true;
        if (
          item.supplierId &&
          suppliers
            .find((s) => s.id === item.supplierId)
            ?.name.toLowerCase()
            .includes(searchLower)
        )
          return true;

        // Zoek in categorie naam
        if (
          item.categoryId &&
          categories
            .find((c) => c.id === item.categoryId)
            ?.name.toLowerCase()
            .includes(searchLower)
        )
          return true;

        // Zoek in prijzen (als getal)
        if (item.purchasePrice?.toString().includes(searchLower)) return true;
        if (item.salePrice?.toString().includes(searchLower)) return true;

        // Zoek in POS alert note
        if (item.posAlertNote?.toLowerCase().includes(searchLower)) return true;

        return false;
      });
    }

    return filtered;
  }, [inventory, searchTerm, categoryFilter, suppliers, categories]);

  // 🆕 V5.7: Filtered categories for dropdown search
  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm) return categories;
    const searchLower = categorySearchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
    );
  }, [categories, categorySearchTerm]);

  // BTW berekeningen voor rapportages
  const vatReport = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // In een echte implementatie zou je deze data uit transacties halen
    // Voor nu gebruiken we de inventory items als basis
    const vat21Total = inventory
      .filter((item) => item.vatRate === "21" && item.salePrice)
      .reduce((sum, item) => {
        const vatAmount = item.salePrice! * 0.21;
        return sum + vatAmount;
      }, 0);

    const vat9Total = inventory
      .filter((item) => item.vatRate === "9" && item.salePrice)
      .reduce((sum, item) => {
        const vatAmount = item.salePrice! * 0.09;
        return sum + vatAmount;
      }, 0);

    const vat0Total = inventory
      .filter((item) => item.vatRate === "0" && item.salePrice)
      .reduce((sum, item) => item.salePrice! || 0, 0);

    return {
      vat21: Math.round(vat21Total * 100) / 100,
      vat9: Math.round(vat9Total * 100) / 100,
      vat0: Math.round(vat0Total * 100) / 100,
      total: Math.round((vat21Total + vat9Total) * 100) / 100,
    };
  }, [inventory]);

  // Webshop sync handler
  const syncInventoryToWebshop = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item || !setWebshopProducts || !webshopProducts) {
      alert(
        "⚠️ Webshop sync is niet beschikbaar (webshop module niet geladen)"
      );
      return;
    }

    // Zoek of er al een webshop product is voor dit item
    const existingProduct = webshopProducts.find(
      (p) => p.inventoryItemId === itemId || p.sku === item.sku
    );

    if (existingProduct) {
      // Update bestaand product
      const updatedProducts = webshopProducts.map((p) => {
        if (p.id === existingProduct.id) {
          return {
            ...p,
            stockQuantity: item.quantity,
            price: calculateVatInclusive(
              item.salePrice,
              item.vatRate,
              item.customVatRate
            ),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      setWebshopProducts(updatedProducts);

      // Update inventory item met webshop koppeling
      setInventory(
        inventory.map((i) =>
          i.id === itemId
            ? {
                ...i,
                webshopProductId: existingProduct.id,
                webshopId: existingProduct.id,
                syncEnabled: true,
              }
            : i
        )
      );

      alert(
        `✅ Webshop product "${existingProduct.name}" bijgewerkt met nieuwe voorraad: ${item.quantity} stuks`
      );
    } else {
      // Maak nieuw webshop product aan
      const newWebshopProduct: WebshopProduct = {
        id: Date.now().toString(),
        name: item.name,
        slug: item.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        description: `${item.name} - ${item.unit || "stuk"}`,
        shortDescription: item.name,
        sku: item.sku,
        price: calculateVatInclusive(
          item.salePrice,
          item.vatRate,
          item.customVatRate
        ),
        stockQuantity: item.quantity,
        lowStockThreshold: item.reorderLevel || 5,
        trackInventory: true,
        inventoryItemId: itemId,
        categoryIds: [],
        hasVariants: false,
        variants: [],
        images: [],
        status: "draft",
        visibility: "public",
        tags: [],
        shippingRequired: true,
        requireShipping: true,
        digitalProduct: false,
        allowReviews: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setWebshopProducts([...webshopProducts, newWebshopProduct]);

      // Update inventory item
      setInventory(
        inventory.map((i) =>
          i.id === itemId
            ? {
                ...i,
                webshopProductId: newWebshopProduct.id,
                webshopId: newWebshopProduct.id,
                syncEnabled: true,
              }
            : i
        )
      );

      alert(
        `✅ Nieuw webshop product aangemaakt: "${item.name}" met voorraad: ${item.quantity} stuks`
      );
    }
  };

  // Auto-sync enabled items naar webshop (bij voorraad wijzigingen)
  useEffect(() => {
    if (!setWebshopProducts || !webshopProducts) return;

    const syncedItems = inventory.filter(
      (item) => item.syncEnabled && item.webshopProductId
    );
    syncedItems.forEach((item) => {
      const webshopProduct = webshopProducts.find(
        (p) => p.id === item.webshopProductId
      );
      if (webshopProduct) {
        setWebshopProducts(
          webshopProducts.map((p) =>
            p.id === item.webshopProductId
              ? {
                  ...p,
                  stockQuantity: item.quantity,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
      }
    });
  }, [
    inventory
      .filter((item) => item.syncEnabled)
      .map((i) => i.quantity)
      .join(","),
  ]);

  // 🆕 V5.6: Category handlers
  const handleAddCategory = () => {
    if (!newCategory.name) {
      alert("⚠️ Vul ten minste een categorienaam in.");
      return;
    }

    const category: InventoryCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color || "#3B82F6",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const wasFromItemForm = showNewCategoryForm;

    setCategories([...categories, category]);

    // 🆕 V5.6: Als categorie wordt aangemaakt vanuit item formulier, selecteer deze direct
    if (wasFromItemForm) {
      setNewItem({ ...newItem, categoryId: category.id });
    }

    setNewCategory({ name: "", description: "", color: "#3B82F6" });
    setShowCategoryForm(false);
    setShowNewCategoryForm(false);
    alert(
      `✅ Categorie "${category.name}" toegevoegd!${
        wasFromItemForm
          ? " Categorie is automatisch geselecteerd voor dit item."
          : ""
      }`
    );
  };

  const handleEditCategory = () => {
    if (!editingCategory || !editingCategory.name) {
      alert("⚠️ Vul ten minste een categorienaam in.");
      return;
    }

    setCategories(
      categories.map((c) =>
        c.id === editingCategory.id
          ? { ...editingCategory, updatedAt: new Date().toISOString() }
          : c
      )
    );
    setEditingCategory(null);
    setShowCategoryForm(false);
    alert(`✅ Categorie bijgewerkt!`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    // Check of er items zijn die deze categorie gebruiken
    const itemsWithCategory = inventory.filter(
      (item) => item.categoryId === categoryId
    );
    if (itemsWithCategory.length > 0) {
      const confirm = window.confirm(
        `⚠️ Deze categorie wordt gebruikt door ${itemsWithCategory.length} item(s). ` +
          `Wil je de categorie toch verwijderen? De items verliezen hun categorie koppeling.`
      );
      if (!confirm) return;

      // Remove category from items
      setInventory(
        inventory.map((item) =>
          item.categoryId === categoryId
            ? { ...item, categoryId: undefined }
            : item
        )
      );
    }

    setCategories(categories.filter((c) => c.id !== categoryId));
    alert(`✅ Categorie "${category.name}" verwijderd!`);
  };

  // Handlers
  const handleAddItem = () => {
    if (!newItem.name || !newItem.salePrice) {
      alert("⚠️ Vul ten minste naam en verkoopprijs in.");
      return;
    }

    // 🆕 V5.6: Genereer automatische SKU als deze nog niet bestaat
    const autoSku = newItem.autoSku || generateAutoSku();

    // Bereken marge
    const margin =
      newItem.purchasePrice && newItem.purchasePrice > 0
        ? calculateMargin(newItem.purchasePrice, newItem.salePrice)
        : 0;

    const item: InventoryItem = {
      ...newItem,
      id: Date.now().toString(),
      sku: autoSku, // Legacy support - gebruik autoSku
      autoSku, // 🆕 V5.6: Automatisch gegenereerde SKU
      salePrice: newItem.salePrice || 0,
      margin,
      vatRate: (newItem.vatRate || "21") as "21" | "9" | "0" | "custom",
      syncEnabled: newItem.syncEnabled || false,
      quantity: newItem.quantity || 0,
      reorderLevel: newItem.reorderLevel || 0,
      unit: newItem.unit || "stuk",
      price: newItem.salePrice, // Legacy support
      supplier: newItem.supplier || "",
      posAlertNote: newItem.posAlertNote || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInventory([...inventory, item]);
    setNewItem({
      name: "",
      sku: "", // Legacy
      quantity: 0,
      reorderLevel: 0,
      salePrice: 0,
      purchasePrice: 0,
      vatRate: "21",
      syncEnabled: false,
      unit: "stuk",
      posAlertNote: undefined,
      // 🆕 V5.6: Reset nieuwe velden
      supplierSku: "",
      autoSku: "", // Wordt automatisch gegenereerd bij volgende item
      customSku: "",
      categoryId: undefined,
    });
    setShowAddForm(false);
    setShowNewCategoryForm(false);
    alert(`✅ Item "${item.name}" succesvol toegevoegd!`);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({
      ...item,
      purchasePrice: item.purchasePrice || 0,
      salePrice: item.salePrice || item.price || 0,
      // 🆕 V5.6: Zorg dat nieuwe velden ook worden ingevuld
      supplierSku: item.supplierSku || "",
      autoSku: item.autoSku || item.sku || generateAutoSku(),
      customSku: item.customSku || "",
      categoryId: item.categoryId || undefined,
    });
    setShowAddForm(true);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !newItem.name || !newItem.salePrice) {
      alert("⚠️ Vul ten minste naam en verkoopprijs in.");
      return;
    }

    const margin =
      newItem.purchasePrice && newItem.purchasePrice > 0
        ? calculateMargin(newItem.purchasePrice, newItem.salePrice)
        : 0;

    const updatedItem: InventoryItem = {
      ...editingItem,
      ...newItem,
      salePrice: newItem.salePrice || 0,
      margin,
      price: newItem.salePrice, // Legacy support
      updatedAt: new Date().toISOString(),
    };

    setInventory(
      inventory.map((item) => (item.id === editingItem.id ? updatedItem : item))
    );
    setEditingItem(null);
    setShowAddForm(false);
    setNewItem({
      name: "",
      sku: "", // Legacy
      quantity: 0,
      reorderLevel: 0,
      salePrice: 0,
      purchasePrice: 0,
      vatRate: "21",
      syncEnabled: false,
      unit: "stuk",
      posAlertNote: undefined,
      // 🆕 V5.6: Reset nieuwe velden
      supplierSku: "",
      autoSku: "",
      customSku: "",
      categoryId: undefined,
    });
    alert(`✅ Item "${updatedItem.name}" succesvol bijgewerkt!`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setInventory(
      inventory.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + delta),
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    const item = inventory.find((i) => i.id === id);
    if (
      item &&
      confirm(`Weet u zeker dat u "${item.name}" wilt verwijderen?`)
    ) {
      setInventory(inventory.filter((item) => item.id !== id));
      alert("✅ Item verwijderd.");
    }
  };

  // Supplier handlers
  const handleCreateSupplier = () => {
    if (!newSupplier.name) {
      alert("⚠️ Vul ten minste de naam in.");
      return;
    }

    const supplier: Supplier = {
      id: Date.now().toString(),
      name: newSupplier.name!,
      contactPerson: newSupplier.contactPerson,
      email: newSupplier.email,
      phone: newSupplier.phone,
      address: newSupplier.address,
      averageLeadTime: newSupplier.averageLeadTime || 7,
      notes: newSupplier.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSuppliers([...suppliers, supplier]);
    setNewSupplier({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      averageLeadTime: 7,
      notes: "",
    });
    setShowSupplierForm(false);
    alert(`✅ Leverancier "${supplier.name}" toegevoegd!`);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({ ...supplier });
    setShowSupplierForm(true);
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier || !newSupplier.name) {
      alert("⚠️ Vul ten minste de naam in.");
      return;
    }

    const updatedSupplier: Supplier = {
      ...editingSupplier,
      ...newSupplier,
      updatedAt: new Date().toISOString(),
    };

    setSuppliers(
      suppliers.map((s) => (s.id === editingSupplier.id ? updatedSupplier : s))
    );
    setEditingSupplier(null);
    setShowSupplierForm(false);
    setNewSupplier({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      averageLeadTime: 7,
      notes: "",
    });
    alert(`✅ Leverancier "${updatedSupplier.name}" bijgewerkt!`);
  };

  const handleDeleteSupplier = (id: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (supplier) {
      const itemsUsingSupplier = inventory.filter(
        (i) => i.supplierId === id || i.supplier === supplier.name
      );
      if (itemsUsingSupplier.length > 0) {
        alert(
          `⚠️ Deze leverancier wordt gebruikt door ${itemsUsingSupplier.length} item(s). Verwijder eerst de koppelingen.`
        );
        return;
      }

      if (confirm(`Weet u zeker dat u "${supplier.name}" wilt verwijderen?`)) {
        setSuppliers(suppliers.filter((s) => s.id !== id));
        alert("✅ Leverancier verwijderd.");
      }
    }
  };

  // Get supplier name
  const getSupplierName = (supplierId?: string, supplierName?: string) => {
    if (supplierId) {
      const supplier = suppliers.find((s) => s.id === supplierId);
      return supplier?.name || "Onbekend";
    }
    return supplierName || "Geen leverancier";
  };

  // Low stock items voor bestel suggesties
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.reorderLevel);
  }, [inventory]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral">
            Voorraadbeheer
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            NL-Compliant voorraadbeheer met BTW-instellingen en webshop sync
          </p>
        </div>
        {isAdmin && activeTab === "items" && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowCSVImport(!showCSVImport)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap flex items-center gap-2"
              title="CSV Importeren"
            >
              📄 CSV Import
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setNewItem({
                  name: "",
                  sku: "", // Legacy
                  quantity: 0,
                  reorderLevel: 0,
                  salePrice: 0,
                  purchasePrice: 0,
                  vatRate: "21",
                  syncEnabled: false,
                  unit: "stuk",
                  posAlertNote: undefined,
                  // 🆕 V5.6: Reset nieuwe velden
                  supplierSku: "",
                  autoSku: "", // Wordt automatisch gegenereerd
                  customSku: "",
                  categoryId: undefined,
                });
                setShowAddForm(!showAddForm);
                setShowNewCategoryForm(false);
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors whitespace-nowrap"
            >
              + Nieuw Item
            </button>
          </div>
        )}
      </div>

      {/* BTW Alert Banner */}
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 mb-1">
              💰 BTW Overzicht Deze Maand
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              <div>
                <p className="text-xs text-green-600">BTW 21%</p>
                <p className="text-lg font-bold text-green-700">
                  €{vatReport.vat21.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600">BTW 9%</p>
                <p className="text-lg font-bold text-green-700">
                  €{vatReport.vat9.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600">BTW Vrij</p>
                <p className="text-lg font-bold text-green-700">
                  €{vatReport.vat0.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-600">Totaal BTW</p>
                <p className="text-lg font-bold text-green-800">
                  €{vatReport.total.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">
              ✅ Klaar voor BTW-aangifte - Alle bedragen zijn berekend conform
              NL-regels
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "items"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📦 Items ({inventory.length})
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "suppliers"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🏢 Leveranciers ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "reports"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📊 Rapportages
        </button>
        {/* 🆕 V5.6: Categorieën Tab */}
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === "categories"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🏷️ Categorieën ({categories.length})
        </button>
      </div>

      {/* Items Tab */}
      {activeTab === "items" && (
        <>
          {/* 🆕 CSV Import Sectie */}
          {showCSVImport && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4 flex items-center gap-2">
                📄 CSV Import - Voorraad Items
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload een CSV bestand om meerdere voorraad items in één keer te importeren.
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('/CSV_UPLOAD_HANDLEIDING.md', '_blank');
                  }}
                  className="text-primary hover:underline ml-2"
                >
                  Bekijk handleiding →
                </a>
              </p>

              {/* Download Voorbeeld Button */}
              <div className="mb-4">
                <button
                  onClick={downloadInventoryExampleCSV}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  📅 Download Voorbeeld CSV
                </button>
              </div>

              {/* CSV Upload Component */}
              <CSVUpload
                onDataParsed={handleCSVDataParsed}
                columnMappings={inventoryCSVMappings}
                title="Upload Voorraad CSV"
                description="Sleep een CSV bestand hierheen of klik om te selecteren"
              />

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setShowCSVImport(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* 🆕 V5.7: Category Filter Dropdown + Search */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            {/* Category Filter Dropdown */}
            <div
              className="relative flex-shrink-0"
              style={{ minWidth: "200px", maxWidth: "300px" }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setCategorySearchTerm("");
                }}
                className={`w-full px-4 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                  categoryFilter
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {categoryFilter
                      ? categories.find((c) => c.id === categoryFilter)?.name ||
                        "Categorie"
                      : "🏷️ Filter op categorie..."}
                  </span>
                  <span className="text-xs">▼</span>
                </div>
              </button>

              {showCategoryDropdown && (
                <>
                  {/* Overlay om dropdown te sluiten */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  {/* Dropdown */}
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    {/* Search input in dropdown */}
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Zoek categorie..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    </div>

                    {/* Category list */}
                    <div className="overflow-y-auto max-h-48">
                      {/* "Alle categorieën" option */}
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryFilter("");
                          setShowCategoryDropdown(false);
                          setCategorySearchTerm("");
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                          !categoryFilter ? "bg-blue-50 font-semibold" : ""
                        }`}
                      >
                        <span className="text-gray-600">Alle categorieën</span>
                      </button>

                      {/* Filtered categories */}
                      {filteredCategories.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Geen categorieën gevonden
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(category.id);
                              setShowCategoryDropdown(false);
                              setCategorySearchTerm("");
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                              categoryFilter === category.id
                                ? "bg-blue-50 font-semibold"
                                : ""
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                              style={{
                                backgroundColor: category.color || "#3B82F6",
                              }}
                            />
                            <span>{category.name}</span>
                            <span className="ml-auto text-xs text-gray-500">
                              (
                              {
                                inventory.filter(
                                  (i) => i.categoryId === category.id
                                ).length
                              }
                              )
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Clear filter button */}
            {categoryFilter && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("");
                  setCategorySearchTerm("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ✕ Wis filter
              </button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Zoek op naam, SKU, locatie, leverancier, categorie, prijs, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    ⚠️ {lowStockItems.length} Item(s) met Lage Voorraad
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lowStockItems.slice(0, 5).map((item) => (
                      <span
                        key={item.id}
                        className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded"
                      >
                        {item.name} ({item.quantity} {item.unit})
                      </span>
                    ))}
                    {lowStockItems.length > 5 && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        +{lowStockItems.length - 5} meer...
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      // Generate order suggestion PDF (mock voor nu)
                      const itemsList = lowStockItems
                        .map(
                          (item) =>
                            `${item.name}: ${item.reorderLevel * 2} ${
                              item.unit
                            } nodig, leverancier: ${getSupplierName(
                              item.supplierId,
                              item.supplier
                            )}`
                        )
                        .join("\n");
                      alert(
                        `📋 Bestel Suggestie:\n\n${itemsList}\n\n(In productie: PDF export functionaliteit)`
                      );
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    📋 Bestel Suggestie
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Add/Edit Form */}
          {(showAddForm || editingItem) && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral mb-4">
                {editingItem ? "✏️ Item Bewerken" : "➕ Nieuw Item Toevoegen"}
              </h2>

              <div className="space-y-6">
                {/* Basis Informatie */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                    📝 Basis Informatie
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Naam <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newItem.name || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Bijv. Staal plaat 10mm"
                      />
                    </div>
                    {/* 🆕 V5.6: 3 SKU Types */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU Leverancier
                      </label>
                      <input
                        type="text"
                        value={newItem.supplierSku || ""}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            supplierSku: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="SKU van leverancier (optioneel)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        SKU zoals leverancier deze gebruikt
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automatische SKU (Project)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItem.autoSku || generateAutoSku()}
                          onChange={(e) =>
                            setNewItem({ ...newItem, autoSku: e.target.value })
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                          placeholder="INV-0001"
                          readOnly={!editingItem}
                        />
                        {!editingItem && (
                          <button
                            type="button"
                            onClick={() =>
                              setNewItem({
                                ...newItem,
                                autoSku: generateAutoSku(),
                              })
                            }
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                          >
                            🔄 Genereer
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Automatisch gegenereerde SKU (INV-XXXX)
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aangepaste SKU
                      </label>
                      <input
                        type="text"
                        value={newItem.customSku || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, customSku: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Vrij invulbare SKU (optioneel)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Extra SKU voor eigen gebruik
                      </p>
                    </div>
                    {/* 🆕 V5.6: Categorie */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categorie
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={newItem.categoryId || ""}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              categoryId: e.target.value || undefined,
                            })
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Geen categorie</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategoryForm(true);
                            setNewCategory({
                              name: "",
                              description: "",
                              color: "#3B82F6",
                            });
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary text-sm whitespace-nowrap"
                        >
                          + Nieuwe Categorie
                        </button>
                      </div>
                      {showNewCategoryForm && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-sm mb-3">
                            Nieuwe Categorie Aanmaken
                          </h4>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Categorienaam *"
                              value={newCategory.name || ""}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Beschrijving (optioneel)"
                              value={newCategory.description || ""}
                              onChange={(e) =>
                                setNewCategory({
                                  ...newCategory,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            />
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={newCategory.color || "#3B82F6"}
                                onChange={(e) =>
                                  setNewCategory({
                                    ...newCategory,
                                    color: e.target.value,
                                  })
                                }
                                className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const categoryName = newCategory.name;
                                  if (!categoryName) {
                                    alert("⚠️ Vul een categorienaam in.");
                                    return;
                                  }

                                  const category: InventoryCategory = {
                                    id: Date.now().toString(),
                                    name: categoryName,
                                    description: newCategory.description,
                                    color: newCategory.color || "#3B82F6",
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                  };

                                  setCategories([...categories, category]);
                                  // Direct selecteren in item formulier
                                  setNewItem({
                                    ...newItem,
                                    categoryId: category.id,
                                  });
                                  setNewCategory({
                                    name: "",
                                    description: "",
                                    color: "#3B82F6",
                                  });
                                  setShowNewCategoryForm(false);
                                  alert(
                                    `✅ Categorie "${category.name}" toegevoegd en geselecteerd!`
                                  );
                                }}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                              >
                                ✅ Toevoegen
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNewCategoryForm(false);
                                  setNewCategory({
                                    name: "",
                                    description: "",
                                    color: "#3B82F6",
                                  });
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                              >
                                Annuleren
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Eenheid
                      </label>
                      <select
                        value={newItem.unit || "stuk"}
                        onChange={(e) =>
                          setNewItem({ ...newItem, unit: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="stuk">Stuk</option>
                        <option value="meter">Meter</option>
                        <option value="kg">Kilogram</option>
                        <option value="liter">Liter</option>
                        <option value="m2">Vierkante meter</option>
                        <option value="doos">Doos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Locatie
                      </label>
                      <input
                        type="text"
                        value={newItem.location || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, location: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="A1, B2, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Prijsstructuur */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                    💰 Prijsstructuur (NL-Compliant)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aankoopprijs (€ excl. BTW)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.purchasePrice || 0}
                        onChange={(e) => {
                          const purchasePrice = parseFloat(e.target.value) || 0;
                          const salePrice = newItem.salePrice || 0;
                          const margin =
                            purchasePrice > 0
                              ? calculateMargin(purchasePrice, salePrice)
                              : 0;
                          setNewItem({ ...newItem, purchasePrice, margin });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Inkoopprijs van leverancier
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verkoopprijs (€ excl. BTW){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.salePrice || 0}
                        onChange={(e) => {
                          const salePrice = parseFloat(e.target.value) || 0;
                          const purchasePrice = newItem.purchasePrice || 0;
                          const margin =
                            purchasePrice > 0
                              ? calculateMargin(purchasePrice, salePrice)
                              : 0;
                          setNewItem({ ...newItem, salePrice, margin });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Verkoopprijs exclusief BTW
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marge (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newItem.margin || 0}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newItem.margin && newItem.margin > 0
                          ? `Automatisch berekend: ${newItem.margin}%`
                          : "Bereken automatisch uit aankoop/verkoop"}
                      </p>
                    </div>
                    {newItem.salePrice && newItem.vatRate && (
                      <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          💡 Prijs Inclusief BTW:
                          <span className="text-lg font-bold text-green-600 ml-2">
                            €
                            {calculateVatInclusive(
                              newItem.salePrice,
                              newItem.vatRate as any,
                              newItem.customVatRate
                            ).toFixed(2)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          BTW (
                          {getVatRateValue({
                            ...newItem,
                            vatRate: newItem.vatRate || "21",
                            customVatRate: newItem.customVatRate,
                          } as InventoryItem)}
                          %): €
                          {(
                            calculateVatInclusive(
                              newItem.salePrice,
                              newItem.vatRate as any,
                              newItem.customVatRate
                            ) - newItem.salePrice
                          ).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* BTW-instellingen */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                    🧾 BTW-instellingen (NL-Compliant)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        BTW-tarief <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newItem.vatRate || "21"}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            vatRate: e.target.value as any,
                            customVatRate:
                              e.target.value === "custom"
                                ? newItem.customVatRate
                                : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="21">Standaard 21%</option>
                        <option value="9">Verlaagd 9%</option>
                        <option value="0">Vrij 0% (Export)</option>
                        <option value="custom">Custom percentage</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Volgt Belastingdienst-regels
                      </p>
                    </div>
                    {newItem.vatRate === "custom" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom BTW-percentage (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={newItem.customVatRate || 0}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              customVatRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Voorraad */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                    📦 Voorraad
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aantal
                      </label>
                      <input
                        type="number"
                        value={newItem.quantity || 0}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Herbestel Niveau
                      </label>
                      <input
                        type="number"
                        value={newItem.reorderLevel || 0}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            reorderLevel: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Waarschuwing bij deze hoeveelheid
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leverancier & Webshop Sync */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                    🔗 Koppelingen
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leverancier
                      </label>
                      {suppliers.length > 0 ? (
                        <select
                          value={newItem.supplierId || ""}
                          onChange={(e) => {
                            const supplier = suppliers.find(
                              (s) => s.id === e.target.value
                            );
                            setNewItem({
                              ...newItem,
                              supplierId: e.target.value || undefined,
                              supplier: supplier?.name || "",
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Geen leverancier</option>
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newItem.supplier || ""}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                supplier: e.target.value,
                              })
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Naam leverancier"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("suppliers");
                              setShowSupplierForm(true);
                            }}
                            className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                            title="Maak nieuwe leverancier"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={newItem.syncEnabled || false}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            syncEnabled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary"
                        id="syncEnabled"
                      />
                      <label
                        htmlFor="syncEnabled"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Automatisch sync met Webshop
                      </label>
                    </div>
                    {newItem.syncEnabled && webshopProducts && (
                      <div className="sm:col-span-2 bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">
                          ✅ Voorraad wordt automatisch gesynchroniseerd met
                          webshop. Bij wijzigingen wordt het webshop product
                          bijgewerkt.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* POS Alert Notitie */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral mb-4 flex items-center gap-2">
                    📢 Kassa/Pakbon Alert Notitie
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert Notitie (optioneel)
                    </label>
                    <textarea
                      value={newItem.posAlertNote || ""}
                      onChange={(e) =>
                        setNewItem({ ...newItem, posAlertNote: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Bijv. Vergeet verzendkosten niet! Of: Controleer garantievoorwaarden."
                      rows={3}
                    />
                    <p className="text-xs text-orange-700 mt-2">
                      💡 Deze notitie verschijnt als alert wanneer dit product
                      wordt toegevoegd aan de winkelwagen in de kassa/pakbon.
                      Het product krijgt een licht oranje kleur in de kassa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                {editingItem ? (
                  <button
                    onClick={handleUpdateItem}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    💾 Bijwerken
                  </button>
                ) : (
                  <button
                    onClick={handleAddItem}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    ✅ Toevoegen
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setNewItem({
                      name: "",
                      sku: "",
                      quantity: 0,
                      reorderLevel: 0,
                      salePrice: 0,
                      purchasePrice: 0,
                      vatRate: "21",
                      syncEnabled: false,
                      unit: "stuk",
                    });
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Naam
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    SKU (Auto)
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    SKU (Leverancier)
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    SKU (Aangepast)
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Categorie
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Voorraad
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Aankoop €
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Verkoop €
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Marge %
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    BTW
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Incl. BTW
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Leverancier
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sync
                  </th>
                  {isAdmin && (
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Acties
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 15 : 14}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Geen items gevonden
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const vatRate = getVatRateValue(item);
                    const priceInclVat = calculateVatInclusive(
                      item.salePrice,
                      item.vatRate,
                      item.customVatRate
                    );
                    const isLowStock = item.quantity <= item.reorderLevel;
                    const itemCategory = item.categoryId
                      ? categories.find((c) => c.id === item.categoryId)
                      : null;
                    const displaySku = item.autoSku || item.sku; // Toon autoSku als primaire SKU

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 ${
                          isLowStock ? "bg-red-50" : ""
                        } ${isAdmin ? "cursor-pointer" : ""}`}
                        onDoubleClick={() => {
                          if (isAdmin) {
                            handleEditItem(item);
                          }
                        }}
                        title={isAdmin ? "Dubbelklik om te bewerken" : ""}
                      >
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-neutral">
                          {item.name}
                        </td>
                        {/* 🆕 V5.6: 3 SKU Types */}
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 font-mono">
                          {displaySku || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                          {item.supplierSku || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                          {item.customSku || "-"}
                        </td>
                        {/* 🆕 V5.6: Categorie */}
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {itemCategory ? (
                            <span
                              className="px-2 py-1 text-xs font-semibold rounded text-white"
                              style={{
                                backgroundColor:
                                  itemCategory.color || "#3B82F6",
                              }}
                            >
                              {itemCategory.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                          {item.purchasePrice
                            ? `€${item.purchasePrice.toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-700">
                          €{item.salePrice.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          {item.margin && item.margin > 0 ? (
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                item.margin >= 30
                                  ? "bg-green-100 text-green-800"
                                  : item.margin >= 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.margin}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              item.vatRate === "21"
                                ? "bg-blue-100 text-blue-800"
                                : item.vatRate === "9"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {vatRate}%
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-green-600">
                          €{priceInclVat.toFixed(2)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                          {getSupplierName(item.supplierId, item.supplier)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {isLowStock ? (
                            <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                              ⚠️ Laag
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                              ✓ OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          {item.syncEnabled ? (
                            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                              🔗 Sync
                            </span>
                          ) : (
                            <button
                              onClick={() => syncInventoryToWebshop(item.id)}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                              title="Sync naar webshop"
                            >
                              Sync
                            </button>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="px-4 sm:px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                                title="Bewerken"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, 10)
                                }
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                title="+10"
                              >
                                +10
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, -10)
                                }
                                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs"
                                title="-10"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                title="Verwijderen"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Suppliers Tab */}
      {activeTab === "suppliers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral">
              Leveranciers Beheer
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingSupplier(null);
                  setNewSupplier({
                    name: "",
                    contactPerson: "",
                    email: "",
                    phone: "",
                    address: "",
                    averageLeadTime: 7,
                    notes: "",
                  });
                  setShowSupplierForm(true);
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Leverancier
              </button>
            )}
          </div>

          {/* Supplier Form */}
          {(showSupplierForm || editingSupplier) && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-neutral mb-4">
                {editingSupplier
                  ? "✏️ Leverancier Bewerken"
                  : "➕ Nieuwe Leverancier"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSupplier.name || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Bijv. Metaalhandel BV"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contactpersoon
                  </label>
                  <input
                    type="text"
                    value={newSupplier.contactPerson || ""}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        contactPerson: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newSupplier.email || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    value={newSupplier.phone || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <input
                    type="text"
                    value={newSupplier.address || ""}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gem. Levertijd (dagen)
                  </label>
                  <input
                    type="number"
                    value={newSupplier.averageLeadTime || 7}
                    onChange={(e) =>
                      setNewSupplier({
                        ...newSupplier,
                        averageLeadTime: parseInt(e.target.value) || 7,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notities
                  </label>
                  <textarea
                    value={newSupplier.notes || ""}
                    onChange={(e) =>
                      setNewSupplier({ ...newSupplier, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                {editingSupplier ? (
                  <button
                    onClick={handleUpdateSupplier}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    💾 Bijwerken
                  </button>
                ) : (
                  <button
                    onClick={handleCreateSupplier}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    ✅ Toevoegen
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSupplierForm(false);
                    setEditingSupplier(null);
                    setNewSupplier({
                      name: "",
                      contactPerson: "",
                      email: "",
                      phone: "",
                      address: "",
                      averageLeadTime: 7,
                      notes: "",
                    });
                  }}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Suppliers List */}
          {suppliers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">
                🏢 Nog geen leveranciers
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Voeg leveranciers toe om items te koppelen en bestel suggesties
                te genereren.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Naam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Gem. Levertijd
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Items
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Acties
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suppliers.map((supplier) => {
                    const itemsCount = inventory.filter(
                      (i) =>
                        i.supplierId === supplier.id ||
                        i.supplier === supplier.name
                    ).length;
                    return (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-neutral">
                          {supplier.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {supplier.contactPerson && (
                            <p>{supplier.contactPerson}</p>
                          )}
                          {supplier.email && (
                            <p className="text-xs text-gray-500">
                              {supplier.email}
                            </p>
                          )}
                          {supplier.phone && (
                            <p className="text-xs text-gray-500">
                              {supplier.phone}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {supplier.averageLeadTime || 7} dagen
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditSupplier(supplier)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSupplier(supplier.id)
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 🆕 V5.6: Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral">
              Categorieën Beheer
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({
                    name: "",
                    description: "",
                    color: "#3B82F6",
                  });
                  setShowCategoryForm(true);
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
              >
                + Nieuwe Categorie
              </button>
            )}
          </div>

          {/* Category Form */}
          {(showCategoryForm || editingCategory) && isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-neutral mb-4">
                {editingCategory
                  ? "✏️ Categorie Bewerken"
                  : "➕ Nieuwe Categorie"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={
                      editingCategory
                        ? editingCategory.name
                        : newCategory.name || ""
                    }
                    onChange={(e) => {
                      if (editingCategory) {
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        });
                      } else {
                        setNewCategory({
                          ...newCategory,
                          name: e.target.value,
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Bijv. Metaal, Hout, Elektronica"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschrijving
                  </label>
                  <textarea
                    value={
                      editingCategory
                        ? editingCategory.description || ""
                        : newCategory.description || ""
                    }
                    onChange={(e) => {
                      if (editingCategory) {
                        setEditingCategory({
                          ...editingCategory,
                          description: e.target.value,
                        });
                      } else {
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Optionele beschrijving van de categorie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kleur
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={
                        editingCategory
                          ? editingCategory.color || "#3B82F6"
                          : newCategory.color || "#3B82F6"
                      }
                      onChange={(e) => {
                        if (editingCategory) {
                          setEditingCategory({
                            ...editingCategory,
                            color: e.target.value,
                          });
                        } else {
                          setNewCategory({
                            ...newCategory,
                            color: e.target.value,
                          });
                        }
                      }}
                      className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={
                        editingCategory
                          ? editingCategory.color || "#3B82F6"
                          : newCategory.color || "#3B82F6"
                      }
                      onChange={(e) => {
                        if (editingCategory) {
                          setEditingCategory({
                            ...editingCategory,
                            color: e.target.value,
                          });
                        } else {
                          setNewCategory({
                            ...newCategory,
                            color: e.target.value,
                          });
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {editingCategory ? (
                  <button
                    onClick={handleEditCategory}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    ✅ Bijwerken
                  </button>
                ) : (
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  >
                    ✅ Toevoegen
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setNewCategory({
                      name: "",
                      description: "",
                      color: "#3B82F6",
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
              <p className="text-gray-500 text-lg mb-4">
                🏷️ Nog geen categorieën
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Voeg categorieën toe om je voorraad te organiseren en
                makkelijker te vinden.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Kleur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Naam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Beschrijving
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Items
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Acties
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => {
                    const itemsCount = inventory.filter(
                      (i) => i.categoryId === category.id
                    ).length;
                    return (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{
                              backgroundColor: category.color || "#3B82F6",
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-neutral">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {category.description || (
                            <span className="text-gray-400 italic">
                              Geen beschrijving
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category);
                                  setShowCategoryForm(true);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-neutral">
            Voorraad Rapportages
          </h2>

          {/* BTW Rapport */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-4">
              🧾 BTW Rapport
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">BTW 21%</p>
                <p className="text-2xl font-bold text-blue-600">
                  €{vatReport.vat21.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">BTW 9%</p>
                <p className="text-2xl font-bold text-purple-600">
                  €{vatReport.vat9.toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">BTW Vrij</p>
                <p className="text-2xl font-bold text-gray-600">
                  €{vatReport.vat0.toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Totaal BTW</p>
                <p className="text-2xl font-bold text-green-600">
                  €{vatReport.total.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  const csv = `BTW Rapport - ${new Date().toLocaleDateString(
                    "nl-NL"
                  )}\n\nBTW 21%,€${vatReport.vat21.toFixed(
                    2
                  )}\nBTW 9%,€${vatReport.vat9.toFixed(
                    2
                  )}\nBTW Vrij,€${vatReport.vat0.toFixed(
                    2
                  )}\nTotaal BTW,€${vatReport.total.toFixed(2)}`;
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `btw-rapport-${
                    new Date().toISOString().split("T")[0]
                  }.csv`;
                  a.click();
                  alert("✅ CSV bestand gedownload!");
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          {/* Voorraad Waarde */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral mb-4">
              💰 Voorraad Waarde
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Totale Waarde (excl. BTW)
                </p>
                <p className="text-2xl font-bold text-green-600">
                  €
                  {inventory
                    .reduce(
                      (sum, item) => sum + item.salePrice * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Totale Waarde (incl. BTW)
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  €
                  {inventory
                    .reduce((sum, item) => {
                      const inclVat = calculateVatInclusive(
                        item.salePrice,
                        item.vatRate,
                        item.customVatRate
                      );
                      return sum + inclVat * item.quantity;
                    }, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Lage Voorraad Items
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {lowStockItems.length}
                </p>
              </div>
            </div>
          </div>

          {/* Marges Overzicht */}
          {inventory.filter((i) => i.margin && i.margin > 0).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-neutral mb-4">
                📊 Marge Overzicht
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                        Item
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                        Aankoop
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                        Verkoop
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">
                        Marge
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventory
                      .filter((i) => i.margin && i.margin > 0)
                      .sort((a, b) => (b.margin || 0) - (a.margin || 0))
                      .slice(0, 10)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-neutral">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600">
                            €{(item.purchasePrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600">
                            €{item.salePrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                (item.margin || 0) >= 30
                                  ? "bg-green-100 text-green-800"
                                  : (item.margin || 0) >= 20
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.margin}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🆕 CSV Import Resultaten Modal */}
      {showImportResultsModal && csvImportResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              csvImportResult.errors.length === 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <h2 className="text-xl font-semibold text-neutral flex items-center gap-2">
                {csvImportResult.errors.length === 0 ? '✅ Import Succesvol!' : '⚠️ Import met Fouten'}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Totaal Rijen</p>
                  <p className="text-2xl font-bold text-gray-800">{csvImportResult.totalRows}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Succesvol</p>
                  <p className="text-2xl font-bold text-green-600">{csvImportResult.successRows}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Fouten</p>
                  <p className="text-2xl font-bold text-red-600">{csvImportResult.errors.length}</p>
                </div>
              </div>

              {/* Success Message */}
              {csvImportResult.successRows > 0 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✅ {csvImportResult.successRows} item{csvImportResult.successRows !== 1 ? 's' : ''} succesvol geïmporteerd!
                  </p>
                </div>
              )}

              {/* Errors List */}
              {csvImportResult.errors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral mb-3 flex items-center gap-2">
                    🚨 Fouten Details:
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                      {csvImportResult.errors.map((error, index) => (
                        <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                          <span className="text-red-500 font-bold flex-shrink-0">•</span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 Tip: Corrigeer de fouten in je CSV bestand en probeer het opnieuw.
                  </p>
                </div>
              )}

              {/* Warnings List */}
              {csvImportResult.warnings && csvImportResult.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-neutral mb-3 flex items-center gap-2">
                    ⚠️ Waarschuwingen:
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <ul className="space-y-2">
                      {csvImportResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-yellow-500 font-bold flex-shrink-0">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportResultsModal(false);
                  setCSVImportResult(null);
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
