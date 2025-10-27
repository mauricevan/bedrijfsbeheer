import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { AdminSettings } from './components/AdminSettings';
import { ALL_MODULES } from './constants';
import { 
  ModuleKey, 
  InventoryItem, 
  Product, 
  Sale, 
  WorkOrder, 
  Customer, 
  Employee, 
  Transaction,
  Quote,
  Invoice,
  Task,
  CalendarEvent,
  Notification,
  User,
  Lead,
  Interaction
} from './types';
import {
  MOCK_INVENTORY,
  MOCK_PRODUCTS,
  MOCK_SALES,
  MOCK_WORK_ORDERS,
  MOCK_CUSTOMERS,
  MOCK_EMPLOYEES,
  MOCK_TRANSACTIONS,
  MOCK_QUOTES,
  MOCK_INVOICES,
  MOCK_TASKS,
  MOCK_CALENDAR_EVENTS,
  MOCK_NOTIFICATIONS,
  MOCK_LEADS,
  MOCK_INTERACTIONS,
} from './data/mockData';

// Import functional pages
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { WorkOrders } from './pages/WorkOrders';
import { Accounting } from './pages/Accounting';
import { CRM } from './pages/CRM';
import { HRM } from './pages/HRM';
import { Reports } from './pages/Reports';
import { Planning } from './pages/Planning';

// Default all modules to active
const initialModulesState = ALL_MODULES.reduce((acc, module) => {
  acc[module.id] = true;
  return acc;
}, {} as Record<ModuleKey, boolean>);

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeModules, setActiveModules] = useState<Record<ModuleKey, boolean>>(initialModulesState);

  // Centralized State Management for all modules
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [interactions, setInteractions] = useState<Interaction[]>(MOCK_INTERACTIONS);

  // IMPORTANT: useMemo must be called unconditionally (before any early returns)
  const visibleModules = useMemo(() => {
    return ALL_MODULES.filter(module => activeModules[module.id]);
  }, [activeModules]);

  // Handle login
  const handleLogin = (employee: Employee) => {
    // Determine if user is admin (Manager Productie in this case)
    const isAdmin = employee.role === 'Manager Productie';
    
    const user: User = {
      id: `user_${employee.id}`,
      employeeId: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      isAdmin,
    };
    
    setCurrentUser(user);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If not logged in, show login screen
  if (!currentUser) {
    return <Login employees={employees} onLogin={handleLogin} />;
  }

  const moduleRoutes = {
    [ModuleKey.DASHBOARD]: (
      <Dashboard 
        inventory={inventory} 
        sales={sales} 
        workOrders={workOrders}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    ),
    [ModuleKey.INVENTORY]: (
      <Inventory 
        inventory={inventory} 
        setInventory={setInventory} 
        isAdmin={currentUser.isAdmin} 
      />
    ),
    [ModuleKey.POS]: (
      <POS 
        products={products} 
        inventory={inventory} 
        setInventory={setInventory} 
        sales={sales} 
        setSales={setSales} 
        setTransactions={setTransactions} 
        customers={customers} 
      />
    ),
    [ModuleKey.WORK_ORDERS]: (
      <WorkOrders 
        workOrders={workOrders} 
        setWorkOrders={setWorkOrders} 
        employees={employees}
        customers={customers}
        inventory={inventory} 
        setInventory={setInventory}
        currentUser={currentUser}
        isAdmin={currentUser.isAdmin}
        quotes={quotes}
        invoices={invoices}
      />
    ),
    [ModuleKey.ACCOUNTING]: (
      <Accounting 
        transactions={transactions}
        quotes={quotes}
        setQuotes={setQuotes}
        invoices={invoices}
        setInvoices={setInvoices}
        customers={customers}
        inventory={inventory}
        workOrders={workOrders}
        setWorkOrders={setWorkOrders}
        employees={employees}
        currentUser={currentUser}
        isAdmin={currentUser.isAdmin}
      />
    ),
    [ModuleKey.CRM]: (
      <CRM 
        customers={customers} 
        setCustomers={setCustomers} 
        sales={sales}
        tasks={tasks}
        setTasks={setTasks}
        leads={leads}
        setLeads={setLeads}
        interactions={interactions}
        setInteractions={setInteractions}
        employees={employees}
        currentUser={currentUser}
        isAdmin={currentUser.isAdmin} 
      />
    ),
    [ModuleKey.HRM]: (
      <HRM 
        employees={employees} 
        setEmployees={setEmployees} 
        isAdmin={currentUser.isAdmin} 
      />
    ),
    [ModuleKey.PLANNING]: (
      <Planning
        events={calendarEvents}
        setEvents={setCalendarEvents}
        employees={employees}
        customers={customers}
        workOrders={workOrders}
        isAdmin={currentUser.isAdmin}
      />
    ),
    [ModuleKey.REPORTS]: (
      <Reports 
        sales={sales} 
        inventory={inventory}
        quotes={quotes}
        workOrders={workOrders}
      />
    ),
  };

  return (
    <div className="flex h-screen bg-base-100">
      <Sidebar 
        activeModules={activeModules} 
        isAdmin={currentUser.isAdmin} 
        setIsAdmin={() => {}} // Not needed anymore since admin is determined by role
        notifications={notifications}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          isAdmin={currentUser.isAdmin}
          notifications={notifications}
          setNotifications={setNotifications}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to={`/${ModuleKey.DASHBOARD}`} replace />} />
            
            {visibleModules.map(module => (
              <Route 
                key={module.id}
                path={`/${module.id}`} 
                element={moduleRoutes[module.id as keyof typeof moduleRoutes]} 
              />
            ))}

            {currentUser.isAdmin && (
              <Route
                path={`/${ModuleKey.ADMIN_SETTINGS}`}
                element={
                  <AdminSettings
                    activeModules={activeModules}
                    setActiveModules={setActiveModules}
                  />
                }
              />
            )}

            {/* Fallback route to the dashboard if a module is disabled or path is invalid */}
            <Route path="*" element={<Navigate to={`/${ModuleKey.DASHBOARD}`} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;