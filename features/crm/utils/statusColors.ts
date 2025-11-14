/**
 * CRM Status Color Utilities
 *
 * Tailwind color class mappings for various CRM entity statuses.
 * Pure functions with no side effects.
 */

import type { LeadStatus } from '../../../types';

/**
 * Returns Tailwind color classes for lead status badges
 */
export const getLeadStatusColor = (status: LeadStatus): string => {
  switch (status) {
    case 'new':
      return 'bg-gray-100 text-gray-800 border-gray-400';
    case 'contacted':
      return 'bg-blue-100 text-blue-800 border-blue-400';
    case 'qualified':
      return 'bg-indigo-100 text-indigo-800 border-indigo-400';
    case 'proposal':
      return 'bg-purple-100 text-purple-800 border-purple-400';
    case 'negotiation':
      return 'bg-yellow-100 text-yellow-800 border-yellow-400';
    case 'won':
      return 'bg-green-100 text-green-800 border-green-400';
    case 'lost':
      return 'bg-red-100 text-red-800 border-red-400';
  }
};

/**
 * Returns Dutch label for lead status
 */
export const getLeadStatusLabel = (status: LeadStatus): string => {
  switch (status) {
    case 'new':
      return 'Nieuw';
    case 'contacted':
      return 'Contact gemaakt';
    case 'qualified':
      return 'Gekwalificeerd';
    case 'proposal':
      return 'Voorstel gedaan';
    case 'negotiation':
      return 'Onderhandeling';
    case 'won':
      return 'Gewonnen';
    case 'lost':
      return 'Verloren';
  }
};

/**
 * Returns Tailwind color classes for task priority badges
 */
export const getTaskPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Returns Tailwind color classes for task status badges
 */
export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Returns Tailwind color classes for invoice status badges
 */
export const getInvoiceStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Returns Tailwind color classes for quote status badges
 */
export const getQuoteStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
