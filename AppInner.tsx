import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminSettings } from './components/AdminSettings';
import { AnalyticsTracker } from './components/AnalyticsTracker';
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
  Interaction,
  WebshopProduct
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

// Import all page components
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { POS } from './pages/POS';
import { WorkOrders } from './pages/WorkOrders';
import { Accounting } from './pages/Accounting';
import { CRM } from './pages/CRM';
import { HRM } from './pages/HRM';
import { Planning } from './pages/Planning';
import { Reports } from './pages/Reports';
import { Webshop } from './pages/Webshop';

interface AppInnerProps {
  currentUser: User;
  setCurrentUser: (user: User | null) => void;
  activeModules: Record<ModuleKey, boolean>;
  setActiveModules: React.Dispatch<React.SetStateAction<Record<ModuleKey, boolean>>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  calendarEvents: CalendarEvent[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
  webshopProducts: WebshopProduct[];
  setWebshopProducts: React.Dispatch<React.SetStateAction<WebshopProduct[]>>;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
}

export const AppInner: React.FC<AppInnerProps> = ({
  currentUser,
  setCurrentUser,
  activeModules,
  setActiveModules,
  inventory,
  setInventory,
  products,
  setProducts,
  sales,
  setSales,
  workOrders,
  setWorkOrders,
  customers,
  setCustomers,
  employees,
  setEmployees,
  transactions,
  setTransactions,
  quotes,
  setQuotes,
  invoices,
  setInvoices,
  tasks,
  setTasks,
  calendarEvents,
  setCalendarEvents,
  notifications,
  setNotifications,
  leads,
  setLeads,
  interactions,
  setInteractions,
  webshopProducts,
  setWebshopProducts,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  handleLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // IMPORTANT: useMemo must be called unconditionally (before any early returns)
  const visibleModules = useMemo(() => {
    return ALL_MODULES.filter(module => activeModules[module.id]);
  }, [activeModules]);

  // Navigation handler for unified search
  const handleNavigate = (module: ModuleKey, id: string) => {
    // Navigate to the module first
    navigate(`/${module}`);
    
    // Then scroll to or highlight the item (could be enhanced with state management)
    // For now, we'll just navigate - the modules can handle highlighting via URL params or state
    setTimeout(() => {
      // Could emit an event or use state to highlight the item
      window.dispatchEvent(new CustomEvent('highlight-item', { detail: { id, type: module } }));
    }, 100);
  };

  // Module routes configuration
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
        webshopProducts={webshopProducts}
        setWebshopProducts={setWebshopProducts}
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
        invoices={invoices}
        setInvoices={setInvoices}
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
        setQuotes={setQuotes}
        invoices={invoices}
        setInvoices={setInvoices}
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
        notifications={notifications}
        setNotifications={setNotifications}
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
        invoices={invoices}
        setInvoices={setInvoices}
        quotes={quotes}
        setQuotes={setQuotes}
        workOrders={workOrders}
        setWorkOrders={setWorkOrders}
        inventory={inventory}
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
    [ModuleKey.WEBSHOP]: (
      <Webshop
        inventory={inventory}
        customers={customers}
        isAdmin={currentUser.isAdmin}
        webshopProducts={webshopProducts}
        setWebshopProducts={setWebshopProducts}
      />
    ),
  };

  return (
    <div className="flex h-screen bg-base-100">
      <AnalyticsTracker userId={currentUser.employeeId} userRole={currentUser.role} />
      <Sidebar 
        activeModules={activeModules} 
        isAdmin={currentUser.isAdmin} 
        setIsAdmin={() => {}} // Not needed anymore since admin is determined by role
        notifications={notifications}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          isAdmin={currentUser.isAdmin}
          notifications={notifications}
          setNotifications={setNotifications}
          currentUser={currentUser}
          onLogout={handleLogout}
          onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          quotes={quotes}
          invoices={invoices}
          workOrders={workOrders}
          customers={customers}
          onNavigate={handleNavigate}
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
};

