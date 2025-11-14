/**
 * WorkOrders Hook - State Management
 * Consolidated state management for work orders
 */

import { useState } from "react";
import {
  WorkOrder,
  WorkOrderStatus,
  Quote,
  Invoice,
  QuoteItem,
  QuoteLabor,
  User,
} from "../../../types";

export interface NewOrderFormData {
  title: string;
  description: string;
  assignedTo: string;
  customerId: string;
  location: string;
  scheduledDate: string;
  pendingReason: string;
  sortIndex: number | undefined;
}

export interface EditFormData {
  customerId: string;
  items: QuoteItem[];
  labor: QuoteLabor[];
  vatRate: number;
  notes: string;
  validUntil?: string;
  paymentTerms?: string;
  issueDate?: string;
  dueDate?: string;
}

export interface MaterialState {
  selectedMaterialId: string;
  setSelectedMaterialId: (id: string) => void;
  selectedMaterialQty: number;
  setSelectedMaterialQty: (qty: number) => void;
  requiredMaterials: { itemId: string; quantity: number }[];
  setRequiredMaterials: (materials: { itemId: string; quantity: number }[]) => void;
  materialSearchTerm: string;
  setMaterialSearchTerm: (term: string) => void;
  materialCategoryFilter: string;
  setMaterialCategoryFilter: (filter: string) => void;
  materialCategorySearchTerm: string;
  setMaterialCategorySearchTerm: (term: string) => void;
  showMaterialCategoryDropdown: boolean;
  setShowMaterialCategoryDropdown: (show: boolean) => void;
}

export interface EditMaterialState {
  editSelectedMaterialId: string;
  setEditSelectedMaterialId: (id: string) => void;
  editSelectedMaterialQty: number;
  setEditSelectedMaterialQty: (qty: number) => void;
  editMaterialSearchTerm: string;
  setEditMaterialSearchTerm: (term: string) => void;
  editMaterialCategoryFilter: string;
  setEditMaterialCategoryFilter: (filter: string) => void;
  editMaterialCategorySearchTerm: string;
  setEditMaterialCategorySearchTerm: (term: string) => void;
  showEditMaterialCategoryDropdown: boolean;
  setShowEditMaterialCategoryDropdown: (show: boolean) => void;
}

export interface WorkOrderState {
  // UI States
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  editingOrder: WorkOrder | null;
  setEditingOrder: (order: WorkOrder | null) => void;
  viewingUserId: string;
  setViewingUserId: (id: string) => void;
  statusFilter: WorkOrderStatus | null;
  setStatusFilter: (status: WorkOrderStatus | null) => void;
  compactView: boolean;
  setCompactView: (compact: boolean) => void;

  // Detail Modal States
  showDetailModal: boolean;
  setShowDetailModal: (show: boolean) => void;
  detailType: "quote" | "invoice" | null;
  setDetailType: (type: "quote" | "invoice" | null) => void;
  detailItem: Quote | Invoice | null;
  setDetailItem: (item: Quote | Invoice | null) => void;
  showWorkOrderDetailModal: boolean;
  setShowWorkOrderDetailModal: (show: boolean) => void;
  selectedWorkOrderForDetail: WorkOrder | null;
  setSelectedWorkOrderForDetail: (order: WorkOrder | null) => void;

  // Edit/Clone Modal States
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  showCloneModal: boolean;
  setShowCloneModal: (show: boolean) => void;
  showUserSelectionModal: boolean;
  setShowUserSelectionModal: (show: boolean) => void;
  selectedUserIdForWorkOrder: string;
  setSelectedUserIdForWorkOrder: (id: string) => void;
  clonedItemForWorkOrder: Quote | Invoice | null;
  setClonedItemForWorkOrder: (item: Quote | Invoice | null) => void;

  // Form Data
  editFormData: EditFormData | null;
  setEditFormData: (data: EditFormData | null) => void;
  newOrder: NewOrderFormData;
  setNewOrder: (order: NewOrderFormData) => void;
  showPendingReason: boolean;
  setShowPendingReason: (show: boolean) => void;

  // Material States
  materialState: MaterialState;
  editMaterialState: EditMaterialState;
}

/**
 * Custom hook for managing work order state
 */
export const useWorkOrderState = (currentUser: User): WorkOrderState => {
  // UI States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string>(
    currentUser.employeeId
  );
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | null>(
    null
  );
  const [compactView, setCompactView] = useState<boolean>(false);

  // Detail Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailType, setDetailType] = useState<"quote" | "invoice" | null>(
    null
  );
  const [detailItem, setDetailItem] = useState<Quote | Invoice | null>(null);
  const [showWorkOrderDetailModal, setShowWorkOrderDetailModal] =
    useState(false);
  const [selectedWorkOrderForDetail, setSelectedWorkOrderForDetail] =
    useState<WorkOrder | null>(null);

  // Edit/Clone Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [selectedUserIdForWorkOrder, setSelectedUserIdForWorkOrder] =
    useState("");
  const [clonedItemForWorkOrder, setClonedItemForWorkOrder] = useState<
    Quote | Invoice | null
  >(null);

  // Form Data
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [newOrder, setNewOrder] = useState<NewOrderFormData>({
    title: "",
    description: "",
    assignedTo: currentUser.employeeId,
    customerId: "",
    location: "",
    scheduledDate: "",
    pendingReason: "",
    sortIndex: undefined,
  });
  const [showPendingReason, setShowPendingReason] = useState(false);

  // Material Selection States
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedMaterialQty, setSelectedMaterialQty] = useState(1);
  const [requiredMaterials, setRequiredMaterials] = useState<
    { itemId: string; quantity: number }[]
  >([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [materialCategoryFilter, setMaterialCategoryFilter] =
    useState<string>("");
  const [materialCategorySearchTerm, setMaterialCategorySearchTerm] =
    useState("");
  const [showMaterialCategoryDropdown, setShowMaterialCategoryDropdown] =
    useState(false);

  // Edit Material Selection States
  const [editSelectedMaterialId, setEditSelectedMaterialId] = useState("");
  const [editSelectedMaterialQty, setEditSelectedMaterialQty] = useState(1);
  const [editMaterialSearchTerm, setEditMaterialSearchTerm] = useState("");
  const [editMaterialCategoryFilter, setEditMaterialCategoryFilter] =
    useState<string>("");
  const [editMaterialCategorySearchTerm, setEditMaterialCategorySearchTerm] =
    useState("");
  const [
    showEditMaterialCategoryDropdown,
    setShowEditMaterialCategoryDropdown,
  ] = useState(false);

  return {
    // UI States
    showAddForm,
    setShowAddForm,
    editingOrder,
    setEditingOrder,
    viewingUserId,
    setViewingUserId,
    statusFilter,
    setStatusFilter,
    compactView,
    setCompactView,

    // Detail Modal States
    showDetailModal,
    setShowDetailModal,
    detailType,
    setDetailType,
    detailItem,
    setDetailItem,
    showWorkOrderDetailModal,
    setShowWorkOrderDetailModal,
    selectedWorkOrderForDetail,
    setSelectedWorkOrderForDetail,

    // Edit/Clone Modal States
    showEditModal,
    setShowEditModal,
    showCloneModal,
    setShowCloneModal,
    showUserSelectionModal,
    setShowUserSelectionModal,
    selectedUserIdForWorkOrder,
    setSelectedUserIdForWorkOrder,
    clonedItemForWorkOrder,
    setClonedItemForWorkOrder,

    // Form Data
    editFormData,
    setEditFormData,
    newOrder,
    setNewOrder,
    showPendingReason,
    setShowPendingReason,

    // Material States
    materialState: {
      selectedMaterialId,
      setSelectedMaterialId,
      selectedMaterialQty,
      setSelectedMaterialQty,
      requiredMaterials,
      setRequiredMaterials,
      materialSearchTerm,
      setMaterialSearchTerm,
      materialCategoryFilter,
      setMaterialCategoryFilter,
      materialCategorySearchTerm,
      setMaterialCategorySearchTerm,
      showMaterialCategoryDropdown,
      setShowMaterialCategoryDropdown,
    },
    editMaterialState: {
      editSelectedMaterialId,
      setEditSelectedMaterialId,
      editSelectedMaterialQty,
      setEditSelectedMaterialQty,
      editMaterialSearchTerm,
      setEditMaterialSearchTerm,
      editMaterialCategoryFilter,
      setEditMaterialCategoryFilter,
      editMaterialCategorySearchTerm,
      setEditMaterialCategorySearchTerm,
      showEditMaterialCategoryDropdown,
      setShowEditMaterialCategoryDropdown,
    },
  };
};
