import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getStoredSession } from '@/lib/supabase';
import {
  fetchCattle, fetchProduction, fetchCustomers, fetchProducts,
  fetchRoutes, fetchDeliveries, fetchInvoices, fetchExpenses,
  fetchEmployees, fetchInventory, fetchEquipment, fetchHealthRecords,
  fetchBreedingRecords, getDashboardStats,
  DEMO_CATTLE, DEMO_CUSTOMERS, DEMO_PRODUCTS, DEMO_ROUTES
} from '@/lib/api';
import type { Cattle, Customer, Product, MilkProduction, Delivery, Invoice, HealthRecord, BreedingRecord } from '@shared/types';

const isDemo = () => getStoredSession()?.startsWith('demo-');

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
    queryFn: async () => {
      if (isDemo()) {
        return getDashboardStats();
      }
      const [cattle, production, customers, deliveries, invoices, inventory, expenses] = await Promise.all([
        fetchCattle(),
        fetchProduction(),
        fetchCustomers(),
        fetchDeliveries(),
        fetchInvoices(),
        fetchInventory(),
        fetchExpenses(),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayProduction = production.filter(p => p.production_date === today);
      const totalMilk = todayProduction.reduce((sum, p) => sum + (p.quantity_liters || 0), 0);
      const activeCattle = cattle.filter(c => c.status === 'active' && c.lactation_status === 'lactating').length;
      
      return {
        todayProduction: totalMilk,
        activeCattle,
        milkingCattle: activeCattle,
        totalCattle: cattle.length,
        activeCustomers: customers.filter(c => c.is_active).length,
        pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
        completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
        monthlyRevenue: invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0),
        outstandingAmount: customers.reduce((sum, c) => sum + (c.credit_balance || 0), 0),
        lowStockItems: inventory.filter(i => i.quantity <= i.min_stock_level).length,
        pendingExpenses: expenses.length,
        avgFatContent: todayProduction.length > 0 
          ? todayProduction.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) / todayProduction.length 
          : 0,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddCattle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cattle: Partial<Cattle>) => {
      if (isDemo()) {
        const newCattle = { id: `demo-${Date.now()}`, created_at: new Date().toISOString(), ...cattle } as Cattle;
        return newCattle;
      }
      const { data, error } = await supabase.from('cattle').insert(cattle).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (isDemo() && data) {
        queryClient.setQueryData(['cattle'], (old: Cattle[] | undefined) => [...(old || []), data]);
      } else {
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateCattle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cattle> & { id: string }) => {
      if (isDemo()) return { id, ...updates } as Cattle;
      const { data, error } = await supabase.from('cattle').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (isDemo() && data) {
        queryClient.setQueryData(['cattle'], (old: Cattle[] | undefined) => 
          (old || []).map(c => c.id === data.id ? { ...c, ...data } : c)
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useDeleteCattle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo()) return { id, success: true };
      const { error } = await supabase.from('cattle').delete().eq('id', id);
      if (error) throw error;
      return { id, success: true };
    },
    onSuccess: (data) => {
      if (isDemo() && data?.id) {
        queryClient.setQueryData(['cattle'], (old: Cattle[] | undefined) => 
          (old || []).filter(c => c.id !== data.id)
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['cattle'] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddProduction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (production: Partial<MilkProduction>) => {
      if (isDemo()) return { id: `demo-${Date.now()}`, ...production };
      const { data, error } = await supabase.from('milk_production').insert(production).select().single();
      if (error) throw error;
      return data;
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
      if (isDemo()) {
        const newCustomer = { id: `demo-${Date.now()}`, created_at: new Date().toISOString(), ...customer } as Customer;
        return newCustomer;
      }
      const { data, error } = await supabase.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (isDemo() && data) {
        queryClient.setQueryData(['customers'], (old: Customer[] | undefined) => [...(old || []), data]);
      } else {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      if (isDemo()) return { id, ...updates } as Customer;
      const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (isDemo() && data) {
        queryClient.setQueryData(['customers'], (old: Customer[] | undefined) => 
          (old || []).map(c => c.id === data.id ? { ...c, ...data } : c)
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemo()) return { id, success: true };
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      return { id, success: true };
    },
    onSuccess: (data) => {
      if (isDemo() && data?.id) {
        queryClient.setQueryData(['customers'], (old: Customer[] | undefined) => 
          (old || []).filter(c => c.id !== data.id)
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (delivery: Partial<Delivery>) => {
      if (isDemo()) return { id: `demo-${Date.now()}`, ...delivery };
      const { data, error } = await supabase.from('deliveries').insert(delivery).select().single();
      if (error) throw error;
      return data;
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
      if (isDemo()) return { id, ...updates };
      const { data, error } = await supabase.from('deliveries').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
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
      if (isDemo()) return { id: `demo-${Date.now()}`, invoice_number: `AWD-${Date.now()}`, ...invoice };
      const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAddHealthRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: Partial<HealthRecord>) => {
      if (isDemo()) return { id: `demo-${Date.now()}`, ...record };
      const { data, error } = await supabase.from('health_records').insert(record).select().single();
      if (error) throw error;
      return data;
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
      if (isDemo()) return { id: `demo-${Date.now()}`, ...record };
      const { data, error } = await supabase.from('breeding_records').insert(record).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding'] });
    },
  });
}

export function getLookups() {
  return {
    cattle: isDemo() ? DEMO_CATTLE : [],
    customers: isDemo() ? DEMO_CUSTOMERS : [],
    products: isDemo() ? DEMO_PRODUCTS : [],
    routes: isDemo() ? DEMO_ROUTES : [],
  };
}
