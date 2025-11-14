import type { Customer, Interaction } from "../../../types";

/**
 * Customer form data interface
 */
export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  type: "business" | "private";
  address: string;
  source: string;
  company: string;
  notes: string;
}

/**
 * Create a new customer from form data
 * @param formData - Customer form data
 * @returns New customer object
 * @throws Error if required fields are missing
 */
export const createCustomer = (formData: CustomerFormData): Customer => {
  if (!formData.name || !formData.email) {
    throw new Error("Naam en email zijn verplicht!");
  }

  const customer: Customer = {
    id: `c${Date.now()}`,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    type: formData.type,
    address: formData.address,
    source: formData.source,
    company: formData.company,
    notes: formData.notes,
    since: new Date().toISOString().split("T")[0],
  };

  return customer;
};

/**
 * Update an existing customer with new data
 * @param customerId - Customer ID to update
 * @param formData - Updated customer form data
 * @param existingCustomer - Existing customer object
 * @returns Updated customer object
 * @throws Error if required fields are missing
 */
export const updateCustomer = (
  customerId: string,
  formData: CustomerFormData,
  existingCustomer: Customer
): Customer => {
  if (!formData.name || !formData.email) {
    throw new Error("Naam en email zijn verplicht!");
  }

  return {
    ...existingCustomer,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    type: formData.type,
    address: formData.address,
    source: formData.source,
    company: formData.company,
    notes: formData.notes,
  };
};

/**
 * Delete a customer from the list
 * @param customerId - Customer ID to delete
 * @param customers - Array of customers
 * @returns Filtered array without the deleted customer
 */
export const deleteCustomer = (
  customerId: string,
  customers: Customer[]
): Customer[] => {
  return customers.filter((c) => c.id !== customerId);
};

/**
 * Transfer interactions from lead to customer
 * Used when converting a lead to a customer
 * @param leadId - Lead ID to transfer from
 * @param customerId - Customer ID to transfer to
 * @param interactions - Array of all interactions
 * @returns Updated interactions array with transferred interactions
 */
export const transferLeadInteractionsToCustomer = (
  leadId: string,
  customerId: string,
  interactions: Interaction[]
): Interaction[] => {
  return interactions.map((int) => {
    if (int.leadId === leadId) {
      return { ...int, customerId: customerId, leadId: undefined };
    }
    return int;
  });
};
