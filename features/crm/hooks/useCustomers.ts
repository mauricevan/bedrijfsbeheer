import type { Customer, Sale, Interaction } from "../../../types";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer as deleteCustomerService,
} from "../services/customerService";
import type { CustomerFormData } from "./useCRMState";

/**
 * Props for useCustomers hook
 */
interface UseCustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  sales: Sale[];
  interactions: Interaction[];
  setInteractions: React.Dispatch<React.SetStateAction<Interaction[]>>;
}

/**
 * Customer management hook
 * Handles customer CRUD operations and related business logic
 */
export const useCustomers = ({
  customers,
  setCustomers,
  sales,
  interactions,
  setInteractions,
}: UseCustomersProps) => {
  /**
   * Add a new customer
   */
  const handleAddCustomer = (formData: CustomerFormData) => {
    try {
      const customer = createCustomer(formData);
      setCustomers([...customers, customer]);
      return customer;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
      return null;
    }
  };

  /**
   * Update an existing customer
   */
  const handleEditCustomer = (
    customerId: string,
    formData: CustomerFormData
  ) => {
    try {
      const existingCustomer = customers.find((c) => c.id === customerId);
      if (!existingCustomer) {
        alert("Klant niet gevonden!");
        return null;
      }

      const updatedCustomer = updateCustomer(
        customerId,
        formData,
        existingCustomer
      );
      setCustomers(
        customers.map((c) => (c.id === customerId ? updatedCustomer : c))
      );
      return updatedCustomer;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
      return null;
    }
  };

  /**
   * Delete a customer
   */
  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("Weet je zeker dat je deze klant wilt verwijderen?")) {
      const updatedCustomers = deleteCustomerService(customerId, customers);
      setCustomers(updatedCustomers);
      return true;
    }
    return false;
  };

  /**
   * Get customer sales
   */
  const getCustomerSales = (customerId: string): Sale[] => {
    return sales.filter((sale) => sale.customerId === customerId);
  };

  /**
   * Get customer total sales value
   */
  const getCustomerTotal = (customerId: string): number => {
    return getCustomerSales(customerId).reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
  };

  /**
   * Get customer name by ID
   */
  const getCustomerName = (customerId?: string): string => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Onbekend";
  };

  /**
   * Get customer journey (all related interactions, sales, etc.)
   */
  const getCustomerJourney = (customerId: string) => {
    const customerSales = sales.filter((s) => s.customerId === customerId);
    const customerInteractions = interactions.filter(
      (i) => i.customerId === customerId
    );

    // Combine and sort by date
    const timeline = [
      ...customerSales.map((sale) => ({
        type: "sale" as const,
        date: sale.date,
        data: sale,
      })),
      ...customerInteractions.map((interaction) => ({
        type: "interaction" as const,
        date: interaction.date,
        data: interaction,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      customer: customers.find((c) => c.id === customerId),
      sales: customerSales,
      interactions: customerInteractions,
      timeline,
    };
  };

  /**
   * Get customer financial information
   */
  const getCustomerFinances = (customerId: string) => {
    const customerSales = sales.filter((s) => s.customerId === customerId);
    const totalRevenue = customerSales.reduce((sum, s) => sum + s.amount, 0);
    const averageOrderValue =
      customerSales.length > 0 ? totalRevenue / customerSales.length : 0;

    return {
      totalRevenue,
      totalOrders: customerSales.length,
      averageOrderValue,
      sales: customerSales,
    };
  };

  return {
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteCustomer,
    getCustomerSales,
    getCustomerTotal,
    getCustomerName,
    getCustomerJourney,
    getCustomerFinances,
  };
};
