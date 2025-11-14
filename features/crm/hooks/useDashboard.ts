import { useMemo } from "react";
import type { Lead, Customer, Interaction, Task } from "../../../types";

/**
 * Props for useDashboard hook
 */
interface UseDashboardProps {
  leads: Lead[];
  customers: Customer[];
  interactions: Interaction[];
  tasks: Task[];
}

/**
 * Dashboard statistics hook
 * Calculates and memoizes CRM dashboard statistics
 */
export const useDashboard = ({
  leads,
  customers,
  interactions,
  tasks,
}: UseDashboardProps) => {
  const dashboardStats = useMemo(() => {
    // Lead statistics
    const totalLeads = leads.length;
    const activeLeads = leads.filter(
      (l) => !["won", "lost"].includes(l.status)
    ).length;
    const wonLeads = leads.filter((l) => l.status === "won").length;
    const lostLeads = leads.filter((l) => l.status === "lost").length;
    const conversionRate =
      totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

    // Customer statistics
    const totalCustomers = customers.length;
    const businessCustomers = customers.filter(
      (c) => c.type === "business"
    ).length;
    const privateCustomers = customers.filter(
      (c) => c.type === "private"
    ).length;

    // Value statistics
    const totalValue = leads.reduce(
      (sum, lead) => sum + (lead.estimatedValue || 0),
      0
    );
    const wonValue = leads
      .filter((l) => l.status === "won")
      .reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);

    // Interaction statistics
    const totalInteractions = interactions.length;
    const thisMonthInteractions = interactions.filter((i) => {
      const interactionDate = new Date(i.date);
      const now = new Date();
      return (
        interactionDate.getMonth() === now.getMonth() &&
        interactionDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const pendingFollowUps = interactions.filter(
      (i) => i.followUpRequired && i.followUpDate
    ).length;

    // Task statistics
    const activeTasks = tasks.filter((t) => t.status !== "done").length;
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    return {
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      totalCustomers,
      businessCustomers,
      privateCustomers,
      totalValue,
      wonValue,
      totalInteractions,
      thisMonthInteractions,
      pendingFollowUps,
      activeTasks,
      overdueTasks,
    };
  }, [leads, customers, interactions, tasks]);

  return dashboardStats;
};
