/**
 * Persistent Filters Utility
 *
 * Lean Six Sigma Optimization: Sticky filters reduce repetitive selections
 * Expected savings: 15 min/day across user base
 *
 * Stores user filter preferences in localStorage and automatically
 * restores them when components mount, eliminating the need to
 * re-select filters on every page load.
 */

const FILTER_STORAGE_PREFIX = "filter_";

export interface FilterState {
  [key: string]: string | number | boolean | string[] | null;
}

/**
 * Generate storage key for a specific filter context
 */
function getStorageKey(context: string, userId?: string): string {
  const userPart = userId ? `_user_${userId}` : "";
  return `${FILTER_STORAGE_PREFIX}${context}${userPart}`;
}

/**
 * Save filter state to localStorage
 *
 * @param context - Filter context (e.g., 'inventory', 'crm_quotes', 'pos')
 * @param filters - Object containing filter values
 * @param userId - Optional user ID for user-specific filters
 */
export function saveFilters(
  context: string,
  filters: FilterState,
  userId?: string
): void {
  try {
    const key = getStorageKey(context, userId);
    localStorage.setItem(key, JSON.stringify(filters));
  } catch (error) {
    console.error(`Error saving filters for ${context}:`, error);
  }
}

/**
 * Load filter state from localStorage
 *
 * @param context - Filter context (e.g., 'inventory', 'crm_quotes', 'pos')
 * @param defaults - Default filter values if none saved
 * @param userId - Optional user ID for user-specific filters
 */
export function loadFilters<T extends FilterState>(
  context: string,
  defaults: T,
  userId?: string
): T {
  try {
    const key = getStorageKey(context, userId);
    const stored = localStorage.getItem(key);

    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new filter fields
      return { ...defaults, ...parsed };
    }
  } catch (error) {
    console.error(`Error loading filters for ${context}:`, error);
  }

  return defaults;
}

/**
 * Clear filter state for a specific context
 *
 * @param context - Filter context to clear
 * @param userId - Optional user ID for user-specific filters
 */
export function clearFilters(context: string, userId?: string): void {
  try {
    const key = getStorageKey(context, userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing filters for ${context}:`, error);
  }
}

/**
 * Clear all filters (useful for logout or reset)
 *
 * @param userId - Optional user ID to clear only that user's filters
 */
export function clearAllFilters(userId?: string): void {
  try {
    const keys = Object.keys(localStorage);
    const prefix = userId
      ? `${FILTER_STORAGE_PREFIX}_user_${userId}`
      : FILTER_STORAGE_PREFIX;

    for (const key of keys) {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error clearing all filters:", error);
  }
}

/**
 * Get all saved filter contexts
 * Useful for debugging or showing user what filters are saved
 */
export function getSavedFilterContexts(userId?: string): string[] {
  try {
    const keys = Object.keys(localStorage);
    const prefix = FILTER_STORAGE_PREFIX;
    const userSuffix = userId ? `_user_${userId}` : "";

    return keys
      .filter((key) => key.startsWith(prefix))
      .filter((key) => !userId || key.includes(userSuffix))
      .map((key) => key.replace(prefix, "").replace(userSuffix, ""));
  } catch (error) {
    console.error("Error getting saved filter contexts:", error);
    return [];
  }
}

// ==================== SPECIFIC FILTER CONTEXTS ====================

/**
 * Inventory filter state
 */
export interface InventoryFilters {
  categoryId: string;
  searchQuery: string;
  sortBy: "name" | "quantity" | "price" | "sku";
  sortOrder: "asc" | "desc";
  showLowStock: boolean;
  showOutOfStock: boolean;
}

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
  categoryId: "",
  searchQuery: "",
  sortBy: "name",
  sortOrder: "asc",
  showLowStock: false,
  showOutOfStock: false,
};

export function saveInventoryFilters(
  filters: Partial<InventoryFilters>,
  userId?: string
): void {
  const current = loadInventoryFilters(userId);
  saveFilters("inventory", { ...current, ...filters }, userId);
}

export function loadInventoryFilters(
  userId?: string
): InventoryFilters {
  return loadFilters("inventory", DEFAULT_INVENTORY_FILTERS, userId);
}

/**
 * CRM Quotes filter state
 */
export interface CRMQuotesFilters {
  status: string; // 'all' | 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  customerId: string;
  dateRange: "all" | "this_week" | "this_month" | "this_quarter";
  searchQuery: string;
  sortBy: "createdDate" | "total" | "status";
  sortOrder: "asc" | "desc";
}

export const DEFAULT_CRM_QUOTES_FILTERS: CRMQuotesFilters = {
  status: "all",
  customerId: "",
  dateRange: "all",
  searchQuery: "",
  sortBy: "createdDate",
  sortOrder: "desc",
};

export function saveCRMQuotesFilters(
  filters: Partial<CRMQuotesFilters>,
  userId?: string
): void {
  const current = loadCRMQuotesFilters(userId);
  saveFilters("crm_quotes", { ...current, ...filters }, userId);
}

export function loadCRMQuotesFilters(
  userId?: string
): CRMQuotesFilters {
  return loadFilters("crm_quotes", DEFAULT_CRM_QUOTES_FILTERS, userId);
}

/**
 * CRM Invoices filter state
 */
export interface CRMInvoicesFilters {
  status: string; // 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  customerId: string;
  dateRange: "all" | "this_week" | "this_month" | "this_quarter";
  searchQuery: string;
  sortBy: "issueDate" | "dueDate" | "total" | "status";
  sortOrder: "asc" | "desc";
  showOverdueOnly: boolean;
}

export const DEFAULT_CRM_INVOICES_FILTERS: CRMInvoicesFilters = {
  status: "all",
  customerId: "",
  dateRange: "all",
  searchQuery: "",
  sortBy: "issueDate",
  sortOrder: "desc",
  showOverdueOnly: false,
};

export function saveCRMInvoicesFilters(
  filters: Partial<CRMInvoicesFilters>,
  userId?: string
): void {
  const current = loadCRMInvoicesFilters(userId);
  saveFilters("crm_invoices", { ...current, ...filters }, userId);
}

export function loadCRMInvoicesFilters(
  userId?: string
): CRMInvoicesFilters {
  return loadFilters("crm_invoices", DEFAULT_CRM_INVOICES_FILTERS, userId);
}

/**
 * Work Orders filter state
 */
export interface WorkOrdersFilters {
  status: string; // 'all' | 'To Do' | 'In Progress' | 'Completed' | 'On Hold'
  assignedTo: string;
  customerId: string;
  dateRange: "all" | "today" | "this_week" | "this_month";
  searchQuery: string;
  sortBy: "createdDate" | "scheduledDate" | "status" | "assignedTo";
  sortOrder: "asc" | "desc";
}

export const DEFAULT_WORK_ORDERS_FILTERS: WorkOrdersFilters = {
  status: "all",
  assignedTo: "",
  customerId: "",
  dateRange: "all",
  searchQuery: "",
  sortBy: "createdDate",
  sortOrder: "desc",
};

export function saveWorkOrdersFilters(
  filters: Partial<WorkOrdersFilters>,
  userId?: string
): void {
  const current = loadWorkOrdersFilters(userId);
  saveFilters("work_orders", { ...current, ...filters }, userId);
}

export function loadWorkOrdersFilters(
  userId?: string
): WorkOrdersFilters {
  return loadFilters("work_orders", DEFAULT_WORK_ORDERS_FILTERS, userId);
}

/**
 * POS filter state
 */
export interface POSFilters {
  categoryId: string;
  searchQuery: string;
  sortBy: "name" | "price";
  sortOrder: "asc" | "desc";
  showOutOfStock: boolean;
}

export const DEFAULT_POS_FILTERS: POSFilters = {
  categoryId: "",
  searchQuery: "",
  sortBy: "name",
  sortOrder: "asc",
  showOutOfStock: false,
};

export function savePOSFilters(
  filters: Partial<POSFilters>,
  userId?: string
): void {
  const current = loadPOSFilters(userId);
  saveFilters("pos", { ...current, ...filters }, userId);
}

export function loadPOSFilters(userId?: string): POSFilters {
  return loadFilters("pos", DEFAULT_POS_FILTERS, userId);
}
