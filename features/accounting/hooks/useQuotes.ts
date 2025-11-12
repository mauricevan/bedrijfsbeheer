import { useState, useCallback } from "react";
import type {
  Quote,
  Customer,
  Employee,
  User,
  WorkOrder,
  InventoryItem,
  ModuleKey,
} from "../../../types";
import { trackAction } from "../../../utils/analytics";
import { useQuoteForm } from "./useQuoteForm";
import {
  createQuote,
  updateQuote,
  updateQuoteStatus as updateQuoteStatusService,
  deleteQuote as deleteQuoteService,
  cloneQuote,
  syncQuoteToWorkOrder as syncQuoteToWorkOrderService,
} from "../services/quoteService";

/**
 * Hook for managing quotes state and operations
 * @param initialQuotes - Initial quotes array
 * @param inventory - Array of inventory items (for quote form)
 * @param customers - Array of customers
 * @param employees - Array of employees
 * @param currentUser - Current user
 * @param workOrders - Array of work orders (for syncing)
 * @param setWorkOrders - Function to update work orders
 * @returns Quotes state and handlers
 */
export const useQuotes = (
  quotes: Quote[],
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>,
  inventory: InventoryItem[],
  customers: Customer[],
  employees: Employee[],
  currentUser: User,
  workOrders: WorkOrder[],
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>
) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showCloneQuoteModal, setShowCloneQuoteModal] = useState(false);
  const [showAcceptQuoteModal, setShowAcceptQuoteModal] = useState(false);
  const [quoteToAccept, setQuoteToAccept] = useState<string | null>(null);
  const [cloneOnAccept, setCloneOnAccept] = useState(false);

  // Use quote form hook
  const quoteForm = useQuoteForm(inventory);

  /**
   * Create a new quote
   */
  const createQuoteHandler = useCallback(() => {
    try {
      // Validate form
      if (!quoteForm.validate()) {
        alert(quoteForm.errors._form || "Vul alle verplichte velden in!");
        return;
      }

      // If editing, update existing quote
      if (quoteForm.editingQuoteId) {
        const existingQuote = quotes.find(
          (q) => q.id === quoteForm.editingQuoteId
        );
        if (!existingQuote) return;

        const updatedQuote = updateQuote(
          quoteForm.editingQuoteId,
          {
            customerId: quoteForm.formData.customerId,
            items: quoteForm.formData.items,
            labor: quoteForm.formData.labor,
            vatRate: quoteForm.formData.vatRate,
            notes: quoteForm.formData.notes,
            validUntil: quoteForm.formData.validUntil,
          },
          existingQuote,
          currentUser,
          employees
        );

        setQuotes(
          quotes.map((q) =>
            q.id === quoteForm.editingQuoteId ? updatedQuote : q
          )
        );

        // Sync to workorder if exists
        if (updatedQuote.workOrderId) {
          const workOrder = workOrders.find(
            (wo) => wo.id === updatedQuote.workOrderId
          );
          if (workOrder) {
            const synced = syncQuoteToWorkOrderService(updatedQuote, workOrder);
            if (synced) {
              setWorkOrders(
                workOrders.map((wo) => (wo.id === workOrder.id ? synced : wo))
              );
              alert("✅ Offerte en werkorder succesvol gesynchroniseerd!");
            }
          }
        }

        quoteForm.reset();
        setShowQuoteForm(false);
        alert(`✅ Offerte ${updatedQuote.id} succesvol bijgewerkt!`);
        return;
      }

      // Create new quote
      const quote = createQuote(
        {
          customerId: quoteForm.formData.customerId,
          items: quoteForm.formData.items,
          labor: quoteForm.formData.labor,
          vatRate: quoteForm.formData.vatRate,
          notes: quoteForm.formData.notes,
          validUntil: quoteForm.formData.validUntil,
        },
        currentUser,
        employees,
        customers,
        quotes
      );

      setQuotes([...quotes, quote]);
      quoteForm.reset();
      setShowQuoteForm(false);

      // Track analytics
      trackAction(
        currentUser.employeeId,
        currentUser.role,
        ModuleKey.ACCOUNTING,
        "create_quote",
        "create",
        {
          quoteId: quote.id,
          customerId: quote.customerId,
          total: quote.total,
          itemsCount: quote.items.length,
          laborCount: quote.labor?.length || 0,
        }
      );
      alert(`✅ Offerte ${quote.id} succesvol aangemaakt!`);
    } catch (error) {
      alert((error as Error).message || "Er is een fout opgetreden!");
    }
  }, [
    quoteForm,
    quotes,
    customers,
    employees,
    currentUser,
    workOrders,
    setWorkOrders,
  ]);

  /**
   * Edit a quote
   */
  const editQuote = useCallback(
    (quoteId: string) => {
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      // Pre-fill form with quote data using hook
      quoteForm.loadQuoteForEditing({
        customerId: quote.customerId,
        items: quote.items,
        labor: quote.labor || [],
        vatRate: quote.vatRate,
        notes: quote.notes || "",
        validUntil: quote.validUntil,
      });

      // Store editing quote ID
      quoteForm.setEditingQuoteId(quoteId);

      // Open form
      setShowQuoteForm(true);
    },
    [quotes, quoteForm]
  );

  /**
   * Update quote status
   */
  const updateQuoteStatus = useCallback(
    (quoteId: string, newStatus: Quote["status"]) => {
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      const updatedQuote = updateQuoteStatusService(
        quote,
        newStatus,
        currentUser,
        employees
      );

      setQuotes(quotes.map((q) => (q.id === quoteId ? updatedQuote : q)));
    },
    [quotes, currentUser, employees]
  );

  /**
   * Delete a quote
   */
  const deleteQuote = useCallback(
    (quoteId: string) => {
      if (confirm("Weet je zeker dat je deze offerte wilt verwijderen?")) {
        const filteredQuotes = deleteQuoteService(quoteId, quotes);
        setQuotes(filteredQuotes);
      }
    },
    [quotes]
  );

  /**
   * Clone a quote
   */
  const cloneQuoteHandler = useCallback(
    (quoteId: string) => {
      const quote = quotes.find((q) => q.id === quoteId);
      if (!quote) return;

      // Prepare clone data with new ID and reset fields using hook
      quoteForm.setFields({
        customerId: quote.customerId,
        items: quote.items,
        labor: quote.labor || [],
        vatRate: quote.vatRate,
        notes: quote.notes || "",
        validUntil: "", // User should set new date
      });
      setShowCloneQuoteModal(true);
    },
    [quotes, quoteForm]
  );

  /**
   * Save cloned quote
   */
  const saveClonedQuote = useCallback(() => {
    // Find the original quote being cloned
    const originalQuoteId = quotes.find(
      (q) =>
        q.customerId === quoteForm.formData.customerId &&
        JSON.stringify(q.items) === JSON.stringify(quoteForm.formData.items)
    )?.id;

    if (!originalQuoteId) {
      // If no original found, create as new quote
      createQuoteHandler();
      return;
    }

    const originalQuote = quotes.find((q) => q.id === originalQuoteId);
    if (!originalQuote) {
      createQuoteHandler();
      return;
    }

    try {
      const clonedQuote = cloneQuote(
        originalQuote,
        currentUser,
        employees,
        customers
      );

      // Override with form data
      clonedQuote.validUntil = quoteForm.formData.validUntil;
      clonedQuote.notes = quoteForm.formData.notes;

      setQuotes([...quotes, clonedQuote]);
      quoteForm.reset();
      setShowCloneQuoteModal(false);
      alert(`✅ Offerte ${clonedQuote.id} succesvol gecloneerd!`);

      // Scroll to the new quote
      setTimeout(() => {
        const element = document.getElementById(clonedQuote.id);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } catch (error) {
      alert((error as Error).message || "Er is een fout opgetreden!");
    }
  }, [quotes, quoteForm, currentUser, employees, customers, createQuoteHandler]);

  /**
   * Accept quote with optional clone
   */
  const acceptQuote = useCallback(() => {
    if (!quoteToAccept) return;

    const quote = quotes.find((q) => q.id === quoteToAccept);
    if (!quote) return;

    // Update quote status to approved
    updateQuoteStatus(quoteToAccept, "approved");

    // If clone is requested, create a cloned quote for next period
    if (cloneOnAccept) {
      // Calculate next period date
      let nextPeriodDate: Date;
      if (quote.validUntil) {
        const validUntilDate = new Date(quote.validUntil);
        nextPeriodDate = new Date(validUntilDate);
        nextPeriodDate.setDate(nextPeriodDate.getDate() + 30); // +30 days
      } else {
        nextPeriodDate = new Date();
        nextPeriodDate.setDate(nextPeriodDate.getDate() + 30);
      }

      try {
        const clonedQuote = cloneQuote(
          quote,
          currentUser,
          employees,
          customers
        );
        clonedQuote.validUntil = nextPeriodDate.toISOString().split("T")[0];
        clonedQuote.status = "draft";
        clonedQuote.notes = `Gekloond van ${
          quote.id
        } (geaccepteerd op ${new Date().toLocaleDateString(
          "nl-NL"
        )}) voor volgende periode${
          quote.notes ? `\n\nOriginele notitie: ${quote.notes}` : ""
        }`;

        setQuotes([...quotes, clonedQuote]);
        alert(
          `✅ Offerte geaccepteerd!\n\n📋 Nieuwe offerte ${
            clonedQuote.id
          } aangemaakt voor volgende periode (geldig tot ${nextPeriodDate.toLocaleDateString(
            "nl-NL"
          )}).`
        );
      } catch (error) {
        alert((error as Error).message || "Er is een fout opgetreden!");
      }
    } else {
      alert(`✅ Offerte ${quote.id} succesvol geaccepteerd!`);
    }

    setShowAcceptQuoteModal(false);
    setQuoteToAccept(null);
    setCloneOnAccept(false);
  }, [
    quoteToAccept,
    cloneOnAccept,
    quotes,
    updateQuoteStatus,
    currentUser,
    employees,
    customers,
  ]);

  return {
    // Modal state
    showQuoteForm,
    setShowQuoteForm,
    showCloneQuoteModal,
    setShowCloneQuoteModal,
    showAcceptQuoteModal,
    setShowAcceptQuoteModal,
    quoteToAccept,
    setQuoteToAccept,
    cloneOnAccept,
    setCloneOnAccept,

    // Form (from useQuoteForm)
    quoteForm,

    // Handlers
    createQuote: createQuoteHandler,
    editQuote,
    updateQuoteStatus,
    deleteQuote,
    cloneQuote: cloneQuoteHandler,
    saveClonedQuote,
    acceptQuote,
  };
};

