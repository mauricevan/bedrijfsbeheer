import { useMemo } from "react";
import type { Interaction, Employee, User } from "../../../types";
import type { InteractionFormData } from "./useCRMState";

/**
 * Props for useInteractions hook
 */
interface UseInteractionsProps {
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
  employees: Employee[];
  currentUser: User;
}

/**
 * Interaction management hook
 * Handles interaction CRUD operations and statistics
 */
export const useInteractions = ({
  interactions,
  setInteractions,
  employees,
  currentUser,
}: UseInteractionsProps) => {
  /**
   * Add a new interaction
   */
  const handleAddInteraction = (formData: InteractionFormData) => {
    if (!formData.subject || !formData.relatedTo) {
      alert("Vul onderwerp en gekoppelde entiteit in!");
      return null;
    }

    const interaction: Interaction = {
      id: `int${Date.now()}`,
      type: formData.type,
      subject: formData.subject,
      description: formData.description,
      date: new Date().toISOString(),
      employeeId: currentUser.employeeId,
      followUpRequired: formData.followUpRequired,
      followUpDate: formData.followUpDate || undefined,
      [formData.relatedType === "lead" ? "leadId" : "customerId"]:
        formData.relatedTo,
    };

    setInteractions([...interactions, interaction]);
    return interaction;
  };

  /**
   * Get employee name by ID
   */
  const getEmployeeName = (employeeId?: string): string => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Onbekend";
  };

  /**
   * Calculate interaction statistics
   */
  const interactionStats = useMemo(() => {
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

    return {
      totalInteractions,
      thisMonthInteractions,
      pendingFollowUps,
    };
  }, [interactions]);

  return {
    handleAddInteraction,
    getEmployeeName,
    interactionStats,
  };
};
