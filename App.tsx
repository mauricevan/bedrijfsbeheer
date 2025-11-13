import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
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
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BottomNavigation } from "./components/BottomNavigation";
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
  MOCK_WEBSHOP_PRODUCTS,
} from "./data/mockData";

// Import functional pages with lazy loading
// Lazy load functional pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Inventory = lazy(() => import("./pages/Inventory").then(m => ({ default: m.Inventory })));
const POS = lazy(() => import("./pages/POS").then(m => ({ default: m.POS })));
const WorkOrders = lazy(() => import("./pages/WorkOrders").then(m => ({ default: m.WorkOrders })));
const Accounting = lazy(() => import("./pages/Accounting").then(m => ({ default: m.Accounting })));
const Bookkeeping = lazy(() => import("./pages/Bookkeeping"));
const CRM = lazy(() => import("./pages/CRM").then(m => ({ default: m.CRM })));
const HRM = lazy(() => import("./pages/HRM").then(m => ({ default: m.HRM })));
const Reports = lazy(() => import("./pages/Reports").then(m => ({ default: m.Reports })));
const Planning = lazy(() => import("./pages/Planning").then(m => ({ default: m.Planning })));
const Webshop = lazy(() => import("./pages/Webshop").then(m => ({ default: m.Webshop })));
import { trackNavigation, trackAction } from "./utils/analytics";

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-base-100">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="mt-4 text-neutral-600">Laden...</p>
    </div>
  </div>
);

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
  const [webshopProducts, setWebshopProducts] = useState<WebshopProduct[]>(MOCK_WEBSHOP_PRODUCTS);

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
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
          <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </ErrorBoundary>
            </Routes>
          </Suspense>
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}

export default App;
