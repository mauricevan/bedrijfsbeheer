import type { Lead, Customer } from "../../../types";

/**
 * Lead form data interface
 */
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  estimatedValue: number;
  notes: string;
}

/**
 * Create a new lead from form data
 * @param formData - Lead form data
 * @returns New lead object
 * @throws Error if required fields are missing
 */
export const createLead = (formData: LeadFormData): Lead => {
  if (!formData.name || !formData.email) {
    throw new Error("Naam en email zijn verplicht!");
  }

  const lead: Lead = {
    id: `l${Date.now()}`,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    company: formData.company,
    source: formData.source,
    estimatedValue: formData.estimatedValue,
    notes: formData.notes,
    status: "new",
    createdDate: new Date().toISOString().split("T")[0],
  };

  return lead;
};

/**
 * Convert a lead to a customer
 * @param lead - Lead to convert
 * @returns New customer object created from lead data
 */
export const convertLeadToCustomer = (lead: Lead): Customer => {
  const customer: Customer = {
    id: `c${Date.now()}`,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    type: lead.company ? "business" : "private",
    company: lead.company,
    address: "",
    source: lead.source,
    since: new Date().toISOString().split("T")[0],
    notes: lead.notes,
  };

  return customer;
};

/**
 * Update lead status
 * @param leadId - Lead ID to update
 * @param newStatus - New status for the lead
 * @param leads - Array of all leads
 * @returns Updated leads array
 */
export const updateLeadStatus = (
  leadId: string,
  newStatus: Lead["status"],
  leads: Lead[]
): Lead[] => {
  return leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
};

/**
 * Delete a lead from the list
 * @param leadId - Lead ID to delete
 * @param leads - Array of leads
 * @returns Filtered array without the deleted lead
 */
export const deleteLead = (leadId: string, leads: Lead[]): Lead[] => {
  return leads.filter((l) => l.id !== leadId);
};
