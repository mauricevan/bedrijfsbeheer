import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Employee, User } from '../types';
import { MOCK_EMPLOYEES } from '../data/mockData';

interface EmployeeContextType {
  employees: Employee[];
  currentUser: User;
  setEmployees: (employees: Employee[]) => void;
  setCurrentUser: (user: User) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Default user for initial state
const defaultUser: User = {
  id: "1",
  username: "admin",
  name: "Admin User",
  isAdmin: true,
  permissions: [],
  employeeId: "1"
};

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  const addEmployee = useCallback((employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(employee =>
      employee.id === id ? { ...employee, ...updates } : employee
    ));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(employee => employee.id !== id));
  }, []);

  const value = {
    employees,
    currentUser,
    setEmployees,
    setCurrentUser,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within EmployeeProvider');
  }
  return context;
};
