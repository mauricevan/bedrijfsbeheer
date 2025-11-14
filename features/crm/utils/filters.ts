/**
 * CRM Data Filters
 *
 * Helper functions to filter CRM data by various criteria.
 * Pure functions with no side effects.
 */

import type { Lead, Sale, LeadStatus, Interaction } from '../../../types';

/**
 * Filters leads by status
 */
export const getLeadsByStatus = (
  leads: Lead[],
  status: LeadStatus
): Lead[] => {
  return leads.filter((lead) => lead.status === status);
};

/**
 * Filters sales for a specific customer
 */
export const getCustomerSales = (customerId: string, sales: Sale[]): Sale[] => {
  return sales.filter((sale) => sale.customerId === customerId);
};

/**
 * Calculates total sales amount for a customer
 */
export const getCustomerTotal = (customerId: string, sales: Sale[]): number => {
  return sales
    .filter((sale) => sale.customerId === customerId)
    .reduce((sum, sale) => sum + sale.total, 0);
};

/**
 * Filters interactions for a specific customer
 */
export const getCustomerInteractions = (
  customerId: string,
  interactions: Interaction[]
): Interaction[] => {
  return interactions.filter(
    (interaction) =>
      interaction.relatedType === 'customer' &&
      interaction.relatedTo === customerId
  );
};

/**
 * Filters interactions for a specific lead
 */
export const getLeadInteractions = (
  leadId: string,
  interactions: Interaction[]
): Interaction[] => {
  return interactions.filter(
    (interaction) =>
      interaction.relatedType === 'lead' && interaction.relatedTo === leadId
  );
};
