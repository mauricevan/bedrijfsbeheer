import { useMemo } from "react";
import type { Lead, Customer, Interaction, LeadStatus } from "../../../types";
import {
  createLead,
  convertLeadToCustomer as convertLeadToCustomerService,
  updateLeadStatus as updateLeadStatusService,
  deleteLead as deleteLeadService,
} from "../services/leadService";
import { transferLeadInteractionsToCustomer } from "../services/customerService";
import type { LeadFormData } from "./useCRMState";

/**
 * Props for useLeads hook
 */
interface UseLeadsProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
}

/**
 * Lead management hook
 * Handles lead CRUD operations, conversions, and statistics
 */
export const useLeads = ({
  leads,
  setLeads,
  customers,
  setCustomers,
  interactions,
  setInteractions,
}: UseLeadsProps) => {
  /**
   * Add a new lead
   */
  const handleAddLead = (formData: LeadFormData) => {
    try {
      const lead = createLead(formData);
      setLeads([...leads, lead]);
      return lead;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
      return null;
    }
  };

  /**
   * Update lead status
   */
  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads(
      leads.map((lead) => {
        if (lead.id === leadId) {
          const updates: Partial<Lead> = { status: newStatus };
          if (newStatus === "won" || newStatus === "lost") {
            updates.lastContactDate = new Date().toISOString().split("T")[0];
          }
          return { ...lead, ...updates };
        }
        return lead;
      })
    );
  };

  /**
   * Convert lead to customer
   */
  const convertLeadToCustomer = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) {
      alert("Lead niet gevonden!");
      return null;
    }

    const customer = convertLeadToCustomerService(lead);
    setCustomers([...customers, customer]);
    updateLeadStatus(leadId, "won");

    // Transfer lead interactions to customer
    const updatedInteractions = transferLeadInteractionsToCustomer(
      leadId,
      customer.id,
      interactions
    );
    setInteractions(updatedInteractions);

    alert(`Lead "${lead.name}" succesvol geconverteerd naar klant!`);
    return customer;
  };

  /**
   * Delete a lead
   */
  const handleDeleteLead = (leadId: string) => {
    if (confirm("Weet je zeker dat je deze lead wilt verwijderen?")) {
      const updatedLeads = deleteLeadService(leadId, leads);
      setLeads(updatedLeads);
      return true;
    }
    return false;
  };

  /**
   * Get lead name by ID
   */
  const getLeadName = (leadId?: string): string => {
    const lead = leads.find((l) => l.id === leadId);
    return lead?.name || "Onbekend";
  };

  /**
   * Get leads by status
   */
  const getLeadsByStatus = (status: LeadStatus): Lead[] => {
    return leads.filter((l) => l.status === status);
  };

  /**
   * Calculate lead statistics
   */
  const leadStats = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(
      (l) => !["won", "lost"].includes(l.status)
    ).length;
    const wonLeads = leads.filter((l) => l.status === "won").length;
    const lostLeads = leads.filter((l) => l.status === "lost").length;
    const conversionRate =
      totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

    const totalValue = leads.reduce(
      (sum, lead) => sum + (lead.estimatedValue || 0),
      0
    );
    const wonValue = leads
      .filter((l) => l.status === "won")
      .reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

    return {
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      totalValue,
      wonValue,
    };
  }, [leads]);

  return {
    handleAddLead,
    updateLeadStatus,
    convertLeadToCustomer,
    handleDeleteLead,
    getLeadName,
    getLeadsByStatus,
    leadStats,
  };
};
