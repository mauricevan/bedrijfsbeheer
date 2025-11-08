/**
 * Email to Customer Mapping Utility
 * 
 * Beheert de koppeling tussen email adressen en klanten.
 * Slaat mappings op in localStorage voor persistentie.
 */

const STORAGE_KEY = "email_customer_mappings";

export interface EmailCustomerMapping {
  email: string;
  customerId: string;
  createdAt: string;
}

/**
 * Laad alle email-customer mappings uit localStorage
 */
export function loadEmailMappings(): EmailCustomerMapping[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading email mappings:", error);
  }
  return [];
}

/**
 * Sla email-customer mapping op
 */
export function saveEmailMapping(email: string, customerId: string): void {
  try {
    const mappings = loadEmailMappings();
    // Verwijder bestaande mapping voor dit email adres (als aanwezig)
    const filtered = mappings.filter((m) => m.email.toLowerCase() !== email.toLowerCase());
    // Voeg nieuwe mapping toe
    filtered.push({
      email: email.toLowerCase(),
      customerId,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error saving email mapping:", error);
  }
}

/**
 * Vind customer ID voor een email adres
 */
export function findCustomerByEmail(email: string): string | null {
  const mappings = loadEmailMappings();
  const mapping = mappings.find(
    (m) => m.email.toLowerCase() === email.toLowerCase()
  );
  return mapping ? mapping.customerId : null;
}

/**
 * Verwijder email-customer mapping
 */
export function removeEmailMapping(email: string): void {
  try {
    const mappings = loadEmailMappings();
    const filtered = mappings.filter(
      (m) => m.email.toLowerCase() !== email.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing email mapping:", error);
  }
}

/**
 * Haal alle emails op voor een specifieke klant
 */
export function getEmailsForCustomer(customerId: string): string[] {
  const mappings = loadEmailMappings();
  return mappings
    .filter((m) => m.customerId === customerId)
    .map((m) => m.email);
}



