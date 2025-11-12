import React, { useState, useMemo, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Login } from "./components/Login";
import { AdminSettings } from "./components/AdminSettings";
import { AnalyticsTracker } from "./components/AnalyticsTracker";
import { ALL_MODULES } from "./constants";
import {
  ModuleKey,
  InventoryItem,
  InventoryCategory,
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
  WebshopProduct,
  Email,
  EmailTemplate,
} from "./types";
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
  MOCK_EMAILS,
  MOCK_EMAIL_TEMPLATES,
} from "./data/mockData";

// Import functional pages
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { POS } from "./pages/POS";
import { WorkOrders } from "./pages/WorkOrders";
import { Accounting } from "./pages/Accounting";
import Bookkeeping from "./pages/Bookkeeping";
import { CRM } from "./pages/CRM";
import { HRM } from "./pages/HRM";
import { Reports } from "./pages/Reports";
import { Planning } from "./pages/Planning";
import { Webshop } from "./pages/Webshop";
import { trackNavigation, trackAction } from "./utils/analytics";

// Default all modules to active
const initialModulesState = ALL_MODULES.reduce((acc, module) => {
  acc[module.id] = true;
  return acc;
}, {} as Record<ModuleKey, boolean>);

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [activeModules, setActiveModules] =
    useState<Record<ModuleKey, boolean>>(initialModulesState);

  // Centralized State Management for all modules
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [categories, setCategories] = useState<InventoryCategory[]>([]); // 🆕 V5.7: Categories state
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [transactions, setTransactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [calendarEvents, setCalendarEvents] =
    useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [interactions, setInteractions] =
    useState<Interaction[]>(MOCK_INTERACTIONS);
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(MOCK_EMAIL_TEMPLATES);
  const [webshopProducts, setWebshopProducts] = useState<WebshopProduct[]>([]);

  // IMPORTANT: useMemo must be called unconditionally (before any early returns)
  const visibleModules = useMemo(() => {
    return ALL_MODULES.filter((module) => activeModules[module.id]);
  }, [activeModules]);

  // Handle login
  const handleLogin = (employee: Employee) => {
    // Determine if user is admin (Manager Productie OR has full_admin permission OR isAdmin flag)
    const hasFullAdmin =
      employee.isAdmin ||
      employee.permissions?.includes("full_admin") ||
      employee.role === "Manager Productie";

    // Get permissions from employee
    const permissions = hasFullAdmin
      ? ["full_admin"]
      : employee.permissions || [];

    const user: User = {
      id: `user_${employee.id}`,
      employeeId: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      isAdmin: hasFullAdmin,
      permissions: permissions.length > 0 ? permissions : undefined,
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

  // Navigation handler for unified search
  const handleNavigate = (module: ModuleKey, id: string) => {
    // Navigate to the module first
    navigate(`/${module}`);

    // Then scroll to or highlight the item (could be enhanced with state management)
    // For now, we'll just navigate - the modules can handle highlighting via URL params or state
    setTimeout(() => {
      // Could emit an event or use state to highlight the item
      window.dispatchEvent(
        new CustomEvent("highlight-item", { detail: { id, type: module } })
      );
    }, 100);
  };

  const moduleRoutes = {
    [ModuleKey.DASHBOARD]: (
      <Dashboard
        inventory={inventory}
        sales={sales}
        workOrders={workOrders}
        notifications={notifications}
        setNotifications={setNotifications}
        customers={customers}
        onNavigateToAccounting={() => navigate(`/${ModuleKey.ACCOUNTING}`)}
        employees={employees}
        onWorkOrderCreated={(workOrder) => setWorkOrders([...workOrders, workOrder])}
        onQuoteCreated={(quote) => setQuotes([...quotes, quote])}
      />
    ),
    [ModuleKey.INVENTORY]: (
      <Inventory
        inventory={inventory}
        setInventory={setInventory}
        isAdmin={currentUser.isAdmin}
        webshopProducts={webshopProducts}
        setWebshopProducts={setWebshopProducts}
        categories={categories}
        setCategories={setCategories}
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
        categories={categories}
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
        categories={categories}
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
        categories={categories}
      />
    ),
    [ModuleKey.BOOKKEEPING]: (
      <Bookkeeping
        invoices={invoices}
        setInvoices={setInvoices}
        quotes={quotes}
        setQuotes={setQuotes}
        customers={customers}
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
        invoices={invoices}
        setInvoices={setInvoices}
        quotes={quotes}
        setQuotes={setQuotes}
        workOrders={workOrders}
        setWorkOrders={setWorkOrders}
        inventory={inventory}
        emails={emails}
        setEmails={setEmails}
        emailTemplates={emailTemplates}
        setEmailTemplates={setEmailTemplates}
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
      <AnalyticsTracker
        userId={currentUser.employeeId}
        userRole={currentUser.role}
      />
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
          onMobileMenuToggle={() =>
            setIsMobileSidebarOpen(!isMobileSidebarOpen)
          }
          quotes={quotes}
          invoices={invoices}
          workOrders={workOrders}
          customers={customers}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={<Navigate to={`/${ModuleKey.DASHBOARD}`} replace />}
            />

            {visibleModules.map((module) => (
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
            <Route
              path="*"
              element={<Navigate to={`/${ModuleKey.DASHBOARD}`} replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
