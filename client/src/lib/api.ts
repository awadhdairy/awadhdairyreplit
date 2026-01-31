import { api, getStoredSession } from './supabase';
import type { 
  Cattle, MilkProduction, Customer, Product, Delivery, Invoice, 
  Employee, Expense, HealthRecord, BreedingRecord, InventoryItem,
  Equipment, Route, MilkVendor, VendorPayment, MilkProcurement
} from '@shared/types';

export const isDemo = () => false;

export async function fetchCattle(): Promise<Cattle[]> {
  const data = await api.cattle.getAll();
  return data.map((c: any) => ({
    ...c,
    weight: c.weight ? parseFloat(c.weight) : undefined,
  }));
}

export async function fetchProduction(): Promise<MilkProduction[]> {
  const data = await api.production.getAll();
  return data.map((p: any) => ({
    ...p,
    production_date: p.production_date || p.collection_date,
    session: p.session || p.shift,
    quantity_liters: parseFloat(p.quantity_liters),
    fat_percentage: p.fat_percentage ? parseFloat(p.fat_percentage) : undefined,
    snf_percentage: p.snf_percentage ? parseFloat(p.snf_percentage) : undefined,
  }));
}

export async function fetchCustomers(): Promise<Customer[]> {
  const data = await api.customers.getAll();
  return data.map((c: any) => ({
    ...c,
    credit_balance: c.credit_balance ? parseFloat(c.credit_balance) : 0,
    advance_balance: c.advance_balance ? parseFloat(c.advance_balance) : 0,
  }));
}

export async function fetchProducts(): Promise<Product[]> {
  const data = await api.products.getAll();
  return data.map((p: any) => ({
    ...p,
    base_price: p.base_price ? parseFloat(p.base_price) : p.price_per_unit ? parseFloat(p.price_per_unit) : 0,
    tax_percentage: p.tax_percentage ? parseFloat(p.tax_percentage) : 0,
  }));
}

export async function fetchRoutes(): Promise<Route[]> {
  return api.routes.getAll();
}

export async function fetchDeliveries(): Promise<Delivery[]> {
  return api.deliveries.getAll();
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const data = await api.invoices.getAll();
  return data.map((i: any) => ({
    ...i,
    total_amount: i.total_amount ? parseFloat(i.total_amount) : 0,
    tax_amount: i.tax_amount ? parseFloat(i.tax_amount) : 0,
    discount_amount: i.discount_amount ? parseFloat(i.discount_amount) : 0,
    final_amount: i.final_amount ? parseFloat(i.final_amount) : i.total_amount ? parseFloat(i.total_amount) : 0,
    paid_amount: i.paid_amount ? parseFloat(i.paid_amount) : 0,
  }));
}

export async function fetchExpenses(): Promise<Expense[]> {
  const data = await api.expenses.getAll();
  return data.map((e: any) => ({
    ...e,
    amount: e.amount ? parseFloat(e.amount) : 0,
  }));
}

export async function fetchEmployees(): Promise<Employee[]> {
  const data = await api.employees.getAll();
  return data.map((e: any) => ({
    ...e,
    salary: e.salary ? parseFloat(e.salary) : undefined,
  }));
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const data = await api.inventory.getAll();
  return data.map((i: any) => ({
    ...i,
    quantity: i.quantity ? parseFloat(i.quantity) : 0,
    min_stock_level: i.min_stock_level ? parseFloat(i.min_stock_level) : 0,
    unit_price: i.unit_price ? parseFloat(i.unit_price) : undefined,
  }));
}

export async function fetchEquipment(): Promise<Equipment[]> {
  return api.equipment.getAll();
}

export async function fetchHealthRecords(): Promise<HealthRecord[]> {
  const data = await api.health.getAll();
  return data.map((h: any) => ({
    ...h,
    cost: h.cost ? parseFloat(h.cost) : undefined,
  }));
}

export async function fetchBreedingRecords(): Promise<BreedingRecord[]> {
  return api.breeding.getAll();
}

export async function fetchVendors(): Promise<MilkVendor[]> {
  const data = await api.vendors.getAll();
  return data.map((v: any) => ({
    ...v,
    default_rate: v.default_rate ? parseFloat(v.default_rate) : undefined,
    current_balance: v.current_balance ? parseFloat(v.current_balance) : 0,
    total_procurement: v.total_procurement ? parseFloat(v.total_procurement) : 0,
    total_paid: v.total_paid ? parseFloat(v.total_paid) : 0,
  }));
}

export async function fetchVendorPayments(): Promise<VendorPayment[]> {
  const data = await api.vendorPayments.getAll();
  return data.map((p: any) => ({
    ...p,
    amount: p.amount ? parseFloat(p.amount) : 0,
  }));
}

export async function fetchProcurement(): Promise<MilkProcurement[]> {
  const data = await api.procurement.getAll();
  return data.map((p: any) => ({
    ...p,
    quantity_liters: p.quantity_liters ? parseFloat(p.quantity_liters) : 0,
    fat_percentage: p.fat_percentage ? parseFloat(p.fat_percentage) : undefined,
    snf_percentage: p.snf_percentage ? parseFloat(p.snf_percentage) : undefined,
    rate_per_liter: p.rate_per_liter ? parseFloat(p.rate_per_liter) : undefined,
    total_amount: p.total_amount ? parseFloat(p.total_amount) : undefined,
  }));
}

export async function getDashboardStats() {
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
}

export { api };
