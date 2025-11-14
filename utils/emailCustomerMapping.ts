/**
 * Email Customer Mapping Utility
 * Persistent storage voor email → customer koppelingen
 */

export interface EmailCustomerMapping {
  email: string;
  customerId: string;
  mappedBy: string;
  mappedAt: string;
  lastUsed: string;
  usageCount: number;
  notes?: string;
}

const STORAGE_KEY = 'emailCustomerMappings';

/**
 * Opslaan email → customer mapping
 */
export const saveEmailCustomerMapping = (
  email: string,
  customerId: string,
  userId: string
): void => {
  try {
    const mappings = getAllEmailMappings();
    const now = new Date().toISOString();

    const newMapping: EmailCustomerMapping = {
      email,
      customerId,
      mappedBy: userId,
      mappedAt: now,
      lastUsed: now,
      usageCount: 1,
    };

    mappings.push(newMapping);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.warn('[saveEmailCustomerMapping] Fout bij opslaan:', error);
  }
};

/**
 * Ophalen customerId op basis van email
 */
export const getCustomerByEmail = (email: string): string | null => {
  try {
    const mappings = getAllEmailMappings();
    const mapping = mappings.find((m) => m.email.toLowerCase() === email.toLowerCase());

    if (mapping) {
      // Update lastUsed en usageCount
      mapping.lastUsed = new Date().toISOString();
      mapping.usageCount += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
      return mapping.customerId;
    }

    return null;
  } catch (error) {
    console.warn('[getCustomerByEmail] Fout bij ophalen:', error);
    return null;
  }
};

/**
 * Update bestaande mapping naar nieuwe customer
 */
export const updateEmailCustomerMapping = (
  email: string,
  newCustomerId: string,
  userId: string
): void => {
  try {
    const mappings = getAllEmailMappings();
    const index = mappings.findIndex((m) => m.email.toLowerCase() === email.toLowerCase());

    if (index !== -1) {
      mappings[index].customerId = newCustomerId;
      mappings[index].mappedBy = userId;
      mappings[index].lastUsed = new Date().toISOString();
      mappings[index].usageCount += 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    }
  } catch (error) {
    console.warn('[updateEmailCustomerMapping] Fout bij updaten:', error);
  }
};

/**
 * Alle mappings ophalen
 */
export const getAllEmailMappings = (): EmailCustomerMapping[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.warn('[getAllEmailMappings] Fout bij ophalen:', error);
    return [];
  }
};

/**
 * Verwijder mapping op basis van email
 */
export const deleteEmailMapping = (email: string): void => {
  try {
    const mappings = getAllEmailMappings();
    const filtered = mappings.filter((m) => m.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('[deleteEmailMapping] Fout bij verwijderen:', error);
  }
};

/**
 * Statistieken over mappings
 */
export const getMappingStats = () => {
  try {
    const mappings = getAllEmailMappings();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalCount: mappings.length,
      addedThisMonth: mappings.filter((m) => new Date(m.mappedAt) >= thisMonthStart).length,
      unusedOver30Days: mappings.filter((m) => new Date(m.lastUsed) < thirtyDaysAgo).length,
      mostUsed: mappings.sort((a, b) => b.usageCount - a.usageCount)[0] || null,
    };

    return stats;
  } catch (error) {
    console.warn('[getMappingStats] Fout bij berekenen stats:', error);
    return {
      totalCount: 0,
      addedThisMonth: 0,
      unusedOver30Days: 0,
      mostUsed: null,
    };
  }
};

// Backwards compatibility - behoud oude functienamen
export const loadEmailMappings = getAllEmailMappings;
export const saveEmailMapping = saveEmailCustomerMapping;
export const findCustomerByEmail = getCustomerByEmail;
export const removeEmailMapping = deleteEmailMapping;


