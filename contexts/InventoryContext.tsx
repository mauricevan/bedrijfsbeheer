import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { InventoryItem, InventoryCategory } from '../types';
import { MOCK_INVENTORY } from '../data/mockData';

interface InventoryContextType {
  inventory: InventoryItem[];
  categories: InventoryCategory[];
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  setInventory: (items: InventoryItem[]) => void;
  setCategories: (categories: InventoryCategory[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);

  const addInventoryItem = useCallback((item: InventoryItem) => {
    setInventory(prev => [...prev, item]);
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  }, []);

  const value = {
    inventory,
    categories,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    setInventory,
    setCategories,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};
