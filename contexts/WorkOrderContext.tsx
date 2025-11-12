import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WorkOrder } from '../types';
import { MOCK_WORK_ORDERS } from '../data/mockData';

interface WorkOrderContextType {
  workOrders: WorkOrder[];
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  addWorkOrder: (workOrder: WorkOrder) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
}

const WorkOrderContext = createContext<WorkOrderContextType | undefined>(undefined);

export const WorkOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);

  const addWorkOrder = useCallback((workOrder: WorkOrder) => {
    setWorkOrders(prev => [...prev, workOrder]);
  }, []);

  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders(prev => prev.map(order =>
      order.id === id ? { ...order, ...updates } : order
    ));
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders(prev => prev.filter(order => order.id !== id));
  }, []);

  const value = {
    workOrders,
    setWorkOrders,
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  };

  return (
    <WorkOrderContext.Provider value={value}>
      {children}
    </WorkOrderContext.Provider>
  );
};

export const useWorkOrder = () => {
  const context = useContext(WorkOrderContext);
  if (!context) {
    throw new Error('useWorkOrder must be used within WorkOrderProvider');
  }
  return context;
};
