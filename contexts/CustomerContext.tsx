import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Customer, Lead, Interaction } from '../types';
import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_INTERACTIONS } from '../data/mockData';

interface CustomerContextType {
  customers: Customer[];
  leads: Lead[];
  interactions: Interaction[];
  setCustomers: (customers: Customer[]) => void;
  setLeads: (leads: Lead[]) => void;
  setInteractions: (interactions: Interaction[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addInteraction: (interaction: Interaction) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [interactions, setInteractions] = useState<Interaction[]>(MOCK_INTERACTIONS);

  const addCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer =>
      customer.id === id ? { ...customer, ...updates } : customer
    ));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  }, []);

  const addLead = useCallback((lead: Lead) => {
    setLeads(prev => [...prev, lead]);
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead =>
      lead.id === id ? { ...lead, ...updates } : lead
    ));
  }, []);

  const addInteraction = useCallback((interaction: Interaction) => {
    setInteractions(prev => [...prev, interaction]);
  }, []);

  const value = {
    customers,
    leads,
    interactions,
    setCustomers,
    setLeads,
    setInteractions,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addLead,
    updateLead,
    addInteraction,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within CustomerProvider');
  }
  return context;
};
