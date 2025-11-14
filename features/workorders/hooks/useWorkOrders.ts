/**
 * WorkOrders Hook - Work Order Operations
 * Hook for managing work order CRUD operations
 */

import { useCallback } from "react";
import {
  WorkOrder,
  WorkOrderStatus,
  Employee,
  InventoryItem,
  User,
  Quote,
  Invoice,
} from "../../../types";
import {
  createWorkOrder as createWorkOrderService,
  updateWorkOrder as updateWorkOrderService,
  updateWorkOrderStatus as updateWorkOrderStatusService,
  updateWorkOrderHours,
  deleteWorkOrder as deleteWorkOrderService,
  trackStatusChange,
  trackWorkOrderCompletion,
  deductInventory,
} from "../services/workOrderOperations";
import {
  validateAllRequiredMaterials,
  addMaterialToList,
  removeMaterialFromList,
  addMaterialToWorkOrder as addMaterialToWorkOrderService,
  removeMaterialFromWorkOrder as removeMaterialFromWorkOrderService,
} from "../services/materialService";
import {
  convertWorkOrderToInvoice,
  convertQuoteToWorkOrder as convertQuoteToWorkOrderService,
  convertInvoiceToWorkOrder as convertInvoiceToWorkOrderService,
} from "../services/conversionService";

export interface UseWorkOrdersParams {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  employees: Employee[];
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  currentUser: User;
  quotes: Quote[];
  invoices: Invoice[];
  setInvoices?: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: any[];
}

export interface UseWorkOrdersReturn {
  handleAddOrder: (
    newOrder: any,
    requiredMaterials: { itemId: string; quantity: number }[],
    showPendingReason: boolean
  ) => boolean;
  handleSaveEdit: (editingOrder: WorkOrder) => boolean;
  handleUpdateStatus: (id: string, status: WorkOrderStatus) => void;
  handleUpdateHours: (id: string, hours: number) => void;
  handleDeleteOrder: (id: string) => void;
  handleAddMaterial: (
    materialId: string,
    quantity: number,
    currentMaterials: { itemId: string; quantity: number }[]
  ) => { itemId: string; quantity: number }[] | null;
  handleRemoveMaterial: (
    materialId: string,
    currentMaterials: { itemId: string; quantity: number }[]
  ) => { itemId: string; quantity: number }[];
  handleAddMaterialToEdit: (
    editingOrder: WorkOrder,
    materialId: string,
    quantity: number
  ) => WorkOrder | null;
  handleRemoveMaterialFromEdit: (
    editingOrder: WorkOrder,
    materialId: string
  ) => WorkOrder;
  handleConvertQuoteToWorkOrder: (
    quote: Quote,
    assignedTo: string
  ) => WorkOrder;
  handleConvertInvoiceToWorkOrder: (
    invoice: Invoice,
    assignedTo: string
  ) => WorkOrder;
}

/**
 * Custom hook for work order operations
 */
export const useWorkOrders = (
  params: UseWorkOrdersParams
): UseWorkOrdersReturn => {
  const {
    workOrders,
    setWorkOrders,
    employees,
    inventory,
    setInventory,
    currentUser,
    quotes,
    invoices,
    setInvoices,
    customers,
  } = params;

  /**
   * Create a new work order
   */
  const handleAddOrder = useCallback(
    (
      newOrder: any,
      requiredMaterials: { itemId: string; quantity: number }[],
      showPendingReason: boolean
    ): boolean => {
      if (!newOrder.title || !newOrder.assignedTo) {
        alert("Vul alle verplichte velden in!");
        return false;
      }

      // Check if materials are available
      const validation = validateAllRequiredMaterials(
        requiredMaterials,
        inventory
      );
      if (!validation.valid) {
        alert(validation.message);
        return false;
      }

      const { workOrder } = createWorkOrderService({
        ...newOrder,
        requiredMaterials,
        showPendingReason,
        currentUser,
        employees,
        workOrders,
      });

      setWorkOrders([...workOrders, workOrder]);
      return true;
    },
    [workOrders, setWorkOrders, employees, inventory, currentUser]
  );

  /**
   * Update an existing work order
   */
  const handleSaveEdit = useCallback(
    (editingOrder: WorkOrder): boolean => {
      if (!editingOrder || !editingOrder.title || !editingOrder.assignedTo) {
        alert("Vul alle verplichte velden in!");
        return false;
      }

      // Check if materials are available
      const validation = validateAllRequiredMaterials(
        editingOrder.requiredInventory,
        inventory
      );
      if (!validation.valid) {
        alert(validation.message);
        return false;
      }

      const { updatedWorkOrder, conflictingWorkOrder } =
        updateWorkOrderService({
          workOrder: editingOrder,
          currentUser,
          employees,
          workOrders,
        });

      // Apply updates
      const updatedWorkOrders = workOrders.map((order) =>
        order.id === updatedWorkOrder.id ? updatedWorkOrder : order
      );

      // Update conflicting work order if exists
      if (conflictingWorkOrder) {
        const finalUpdates = updatedWorkOrders.map((order) =>
          order.id === conflictingWorkOrder.id ? conflictingWorkOrder : order
        );
        setWorkOrders(finalUpdates);
      } else {
        setWorkOrders(updatedWorkOrders);
      }

      return true;
    },
    [workOrders, setWorkOrders, employees, inventory, currentUser]
  );

  /**
   * Update work order status
   */
  const handleUpdateStatus = useCallback(
    (id: string, status: WorkOrderStatus) => {
      const order = workOrders.find((o) => o.id === id);
      if (!order) return;

      const updatedOrder = updateWorkOrderStatusService(
        order,
        status,
        currentUser,
        employees
      );

      setWorkOrders(
        workOrders.map((o) => (o.id === id ? updatedOrder : o))
      );

      // Handle completion
      if (status === "Completed") {
        // Track completion
        trackWorkOrderCompletion(order, currentUser);

        // Deduct inventory
        const updatedInventory = deductInventory(order, inventory);
        setInventory(updatedInventory);

        // Convert to invoice
        if (setInvoices) {
          const result = convertWorkOrderToInvoice({
            workOrder: order,
            quotes,
            invoices,
            inventory,
            currentUser,
            employees,
            customers,
          });

          if (result) {
            setInvoices([...invoices, result.invoice]);
            setWorkOrders(
              workOrders.map((wo) =>
                wo.id === order.id ? result.updatedWorkOrder : wo
              )
            );
            alert(
              `✅ Factuur ${result.invoice.invoiceNumber} automatisch aangemaakt voor voltooide werkorder ${order.id}!\n\nBekijk de factuur in de Boekhouding module.`
            );
          }
        }
      } else {
        // Track status change
        trackStatusChange(order, order.status, status, currentUser);
      }
    },
    [
      workOrders,
      setWorkOrders,
      inventory,
      setInventory,
      currentUser,
      employees,
      quotes,
      invoices,
      setInvoices,
      customers,
    ]
  );

  /**
   * Update work order hours
   */
  const handleUpdateHours = useCallback(
    (id: string, hours: number) => {
      setWorkOrders(
        workOrders.map((order) =>
          order.id === id ? updateWorkOrderHours(order, hours) : order
        )
      );
    },
    [workOrders, setWorkOrders]
  );

  /**
   * Delete work order
   */
  const handleDeleteOrder = useCallback(
    (id: string) => {
      if (deleteWorkOrderService()) {
        setWorkOrders(workOrders.filter((order) => order.id !== id));
      }
    },
    [workOrders, setWorkOrders]
  );

  /**
   * Add material to list
   */
  const handleAddMaterial = useCallback(
    (
      materialId: string,
      quantity: number,
      currentMaterials: { itemId: string; quantity: number }[]
    ): { itemId: string; quantity: number }[] | null => {
      if (!materialId || quantity <= 0) {
        alert("Selecteer een materiaal en voer een geldig aantal in!");
        return null;
      }

      const item = inventory.find((i) => i.id === materialId);
      if (!item) return null;

      if (item.quantity < quantity) {
        alert(`Niet genoeg voorraad. Beschikbaar: ${item.quantity}`);
        return null;
      }

      return addMaterialToList(materialId, quantity, currentMaterials);
    },
    [inventory]
  );

  /**
   * Remove material from list
   */
  const handleRemoveMaterial = useCallback(
    (
      materialId: string,
      currentMaterials: { itemId: string; quantity: number }[]
    ): { itemId: string; quantity: number }[] => {
      return removeMaterialFromList(materialId, currentMaterials);
    },
    []
  );

  /**
   * Add material to editing work order
   */
  const handleAddMaterialToEdit = useCallback(
    (
      editingOrder: WorkOrder,
      materialId: string,
      quantity: number
    ): WorkOrder | null => {
      if (!editingOrder || !materialId || quantity <= 0) {
        alert("Selecteer een materiaal en voer een geldig aantal in!");
        return null;
      }

      const item = inventory.find((i) => i.id === materialId);
      if (!item) return null;

      if (item.quantity < quantity) {
        alert(`Niet genoeg voorraad. Beschikbaar: ${item.quantity}`);
        return null;
      }

      return addMaterialToWorkOrderService(editingOrder, materialId, quantity);
    },
    [inventory]
  );

  /**
   * Remove material from editing work order
   */
  const handleRemoveMaterialFromEdit = useCallback(
    (editingOrder: WorkOrder, materialId: string): WorkOrder => {
      return removeMaterialFromWorkOrderService(editingOrder, materialId);
    },
    []
  );

  /**
   * Convert quote to work order
   */
  const handleConvertQuoteToWorkOrder = useCallback(
    (quote: Quote, assignedTo: string): WorkOrder => {
      return convertQuoteToWorkOrderService(
        quote,
        assignedTo,
        currentUser,
        employees,
        customers
      );
    },
    [currentUser, employees, customers]
  );

  /**
   * Convert invoice to work order
   */
  const handleConvertInvoiceToWorkOrder = useCallback(
    (invoice: Invoice, assignedTo: string): WorkOrder => {
      return convertInvoiceToWorkOrderService(
        invoice,
        assignedTo,
        currentUser,
        employees,
        customers
      );
    },
    [currentUser, employees, customers]
  );

  return {
    handleAddOrder,
    handleSaveEdit,
    handleUpdateStatus,
    handleUpdateHours,
    handleDeleteOrder,
    handleAddMaterial,
    handleRemoveMaterial,
    handleAddMaterialToEdit,
    handleRemoveMaterialFromEdit,
    handleConvertQuoteToWorkOrder,
    handleConvertInvoiceToWorkOrder,
  };
};
