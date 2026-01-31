import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/supabase';
import {
  fetchCattle, fetchProduction, fetchCustomers, fetchProducts,
  fetchRoutes, fetchDeliveries, fetchInvoices, fetchExpenses,
  fetchEmployees, fetchInventory, fetchEquipment, fetchHealthRecords,
  fetchBreedingRecords, fetchVendors, fetchVendorPayments, fetchProcurement, getDashboardStats
} from '@/lib/api';
import type { Cattle, Customer, Product, MilkProduction, Delivery, Invoice, HealthRecord, BreedingRecord, MilkVendor, VendorPayment, MilkProcurement } from '@shared/types';

export function useCattle() {
  return useQuery({
    queryKey: ['cattle'],
    queryFn: fetchCattle,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCattleById(id: string) {
  const { data: cattle } = useCattle();
  return cattle?.find(c => c.id === id);
}

export function useProduction() {
  return useQuery({
    queryKey: ['production'],
    queryFn: fetchProduction,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: fetchRoutes,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDeliveries() {
  return useQuery({
    queryKey: ['deliveries'],
    queryFn: fetchDeliveries,
    staleTime: 2 * 60 * 1000,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 10 * 60 * 1000,
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipment,
    staleTime: 10 * 60 * 1000,
  });
}

export function useHealthRecords() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealthRecords,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBreedingRecords() {
  return useQuery({
    queryKey: ['breeding'],
    queryFn: fetchBreedingRecords,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddCattle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cattle: Partial<Cattle>) => {
      return api.cattle.create(cattle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateCattle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cattle> & { id: string }) => {
      return api.cattle.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteCattle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.cattle.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddProduction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (production: Partial<MilkProduction>) => {
      return api.production.create(production);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      return api.customers.create(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      return api.customers.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.customers.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (delivery: Partial<Delivery>) => {
      return api.deliveries.create(delivery);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Delivery> & { id: string }) => {
      return api.deliveries.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoice: Partial<Invoice>) => {
      return api.invoices.create(invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Invoice>) => {
      return api.invoices.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useAddHealthRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: Partial<HealthRecord>) => {
      return api.health.create(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
}

export function useAddBreedingRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: Partial<BreedingRecord>) => {
      return api.breeding.create(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding'] });
    },
  });
}

export function useAddExpense() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expense: { category: string; title: string; amount: number; expense_date: string; notes?: string }) => {
      return api.expenses.create(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function getLookups() {
  return {
    cattle: [],
    customers: [],
    products: [],
    routes: [],
    vendors: [],
  };
}

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vendor: Omit<MilkVendor, 'id' | 'created_at'>) => {
      return api.vendors.create(vendor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MilkVendor> & { id: string }) => {
      return api.vendors.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.vendors.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useVendorPayments() {
  return useQuery({
    queryKey: ['vendor-payments'],
    queryFn: fetchVendorPayments,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddVendorPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payment: Omit<VendorPayment, 'id' | 'created_at'>) => {
      return api.vendorPayments.create(payment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useAddBulkVendorPayments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payments: Array<Omit<VendorPayment, 'id' | 'created_at'>>) => {
      return api.vendorPayments.createBulk(payments);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-payments'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useProcurement() {
  return useQuery({
    queryKey: ['procurement'],
    queryFn: fetchProcurement,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddProcurement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<MilkProcurement, 'id' | 'created_at'>) => {
      return api.procurement.create(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateProcurement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MilkProcurement> & { id: string }) => {
      return api.procurement.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useDeleteProcurement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return api.procurement.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
