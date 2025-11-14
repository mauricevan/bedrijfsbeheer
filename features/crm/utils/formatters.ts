/**
 * CRM Data Formatters
 *
 * Helper functions to format and retrieve display data.
 * Pure functions with no side effects.
 */

import type { Customer, Lead, Employee } from '../../../types';

/**
 * Retrieves customer name by ID
 */
export const getCustomerName = (
  customerId: string,
  customers: Customer[]
): string => {
  const customer = customers.find((c) => c.id === customerId);
  return customer?.name || 'Onbekende klant';
};

/**
 * Retrieves lead name by ID
 */
export const getLeadName = (leadId: string, leads: Lead[]): string => {
  const lead = leads.find((l) => l.id === leadId);
  return lead?.name || 'Onbekende lead';
};

/**
 * Retrieves employee name by ID
 */
export const getEmployeeName = (
  employeeId: string,
  employees: Employee[]
): string => {
  const employee = employees.find((e) => e.id === employeeId);
  return employee?.name || 'Onbekende medewerker';
};
