import { supabase } from './supabase';
import { getStoredSession } from './supabase';
import type { 
  Cattle, MilkProduction, Customer, Product, Delivery, Invoice, 
  Employee, Expense, HealthRecord, BreedingRecord, InventoryItem,
  Equipment, Route, BottleTransaction, Profile, AuditLog
} from '@shared/types';

const isDemo = () => getStoredSession()?.startsWith('demo-');

export const DEMO_CATTLE: Cattle[] = [
  { id: '1', tag_number: 'AWD-001', name: 'Lakshmi', breed: 'Gir', date_of_birth: '2020-03-15', gender: 'female', category: 'milking', status: 'active', weight_kg: 450, created_at: new Date().toISOString() },
  { id: '2', tag_number: 'AWD-002', name: 'Ganga', breed: 'Sahiwal', date_of_birth: '2019-08-20', gender: 'female', category: 'milking', status: 'active', weight_kg: 480, created_at: new Date().toISOString() },
  { id: '3', tag_number: 'AWD-003', name: 'Nandi', breed: 'Gir', date_of_birth: '2018-12-10', gender: 'male', category: 'bull', status: 'active', weight_kg: 650, created_at: new Date().toISOString() },
  { id: '4', tag_number: 'AWD-004', name: 'Radha', breed: 'Jersey Cross', date_of_birth: '2021-05-22', gender: 'female', category: 'heifer', status: 'active', weight_kg: 320, created_at: new Date().toISOString() },
  { id: '5', tag_number: 'AWD-005', name: 'Saraswati', breed: 'Sahiwal', date_of_birth: '2020-11-08', gender: 'female', category: 'milking', status: 'active', weight_kg: 460, created_at: new Date().toISOString() },
  { id: '6', tag_number: 'AWD-006', name: 'Gauri', breed: 'Holstein', date_of_birth: '2019-04-18', gender: 'female', category: 'dry', status: 'active', weight_kg: 520, created_at: new Date().toISOString() },
  { id: '7', tag_number: 'AWD-007', name: 'Chotu', breed: 'Gir', date_of_birth: '2023-09-01', gender: 'male', category: 'calf', status: 'active', weight_kg: 85, created_at: new Date().toISOString() },
  { id: '8', tag_number: 'AWD-008', name: 'Parvati', breed: 'Red Sindhi', date_of_birth: '2020-07-12', gender: 'female', category: 'milking', status: 'active', weight_kg: 410, created_at: new Date().toISOString() },
];

export const DEMO_PRODUCTION: MilkProduction[] = [
  { id: '1', cattle_id: '1', collection_date: new Date().toISOString().split('T')[0], shift: 'morning', quantity_liters: 12.5, fat_percentage: 4.2, snf_percentage: 8.5, quality_grade: 'A', created_at: new Date().toISOString() },
  { id: '2', cattle_id: '2', collection_date: new Date().toISOString().split('T')[0], shift: 'morning', quantity_liters: 14.2, fat_percentage: 4.5, snf_percentage: 8.8, quality_grade: 'A', created_at: new Date().toISOString() },
  { id: '3', cattle_id: '5', collection_date: new Date().toISOString().split('T')[0], shift: 'morning', quantity_liters: 11.8, fat_percentage: 4.0, snf_percentage: 8.3, quality_grade: 'A', created_at: new Date().toISOString() },
  { id: '4', cattle_id: '8', collection_date: new Date().toISOString().split('T')[0], shift: 'morning', quantity_liters: 10.5, fat_percentage: 4.3, snf_percentage: 8.6, quality_grade: 'A', created_at: new Date().toISOString() },
  { id: '5', cattle_id: '1', collection_date: new Date().toISOString().split('T')[0], shift: 'evening', quantity_liters: 10.2, fat_percentage: 4.4, snf_percentage: 8.7, quality_grade: 'A', created_at: new Date().toISOString() },
  { id: '6', cattle_id: '2', collection_date: new Date().toISOString().split('T')[0], shift: 'evening', quantity_liters: 12.0, fat_percentage: 4.6, snf_percentage: 8.9, quality_grade: 'A', created_at: new Date().toISOString() },
];

export const DEMO_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Sharma Sweets', phone: '9876541001', customer_type: 'shop', address: '123 Main Market', city: 'Lucknow', is_active: true, outstanding_balance: 2500, credit_limit: 10000, created_at: new Date().toISOString() },
  { id: '2', name: 'Rajesh Kumar', phone: '9876541002', customer_type: 'individual', address: '45 Civil Lines', city: 'Lucknow', is_active: true, outstanding_balance: 450, credit_limit: 2000, created_at: new Date().toISOString() },
  { id: '3', name: 'Hotel Grand Palace', phone: '9876541003', customer_type: 'hotel', address: '78 Hazratganj', city: 'Lucknow', is_active: true, outstanding_balance: 15000, credit_limit: 50000, created_at: new Date().toISOString() },
  { id: '4', name: 'Gupta Restaurant', phone: '9876541004', customer_type: 'restaurant', address: '22 Aminabad', city: 'Lucknow', is_active: true, outstanding_balance: 3200, credit_limit: 15000, created_at: new Date().toISOString() },
  { id: '5', name: 'City School', phone: '9876541005', customer_type: 'institution', address: '90 Gomti Nagar', city: 'Lucknow', is_active: true, outstanding_balance: 8500, credit_limit: 25000, created_at: new Date().toISOString() },
  { id: '6', name: 'Anita Devi', phone: '9876541006', customer_type: 'individual', address: '15 Indira Nagar', city: 'Lucknow', is_active: true, outstanding_balance: 0, credit_limit: 1000, created_at: new Date().toISOString() },
  { id: '7', name: 'Milk Point Store', phone: '9876541007', customer_type: 'distributor', address: '33 Aliganj', city: 'Lucknow', is_active: true, outstanding_balance: 25000, credit_limit: 100000, created_at: new Date().toISOString() },
];

export const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Fresh Cow Milk', sku: 'MLK-001', category: 'raw_milk', unit: 'liters', price_per_unit: 60, cost_per_unit: 45, stock_quantity: 150, min_stock_level: 50, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Pasteurized Milk', sku: 'MLK-002', category: 'pasteurized_milk', unit: 'liters', price_per_unit: 65, cost_per_unit: 50, stock_quantity: 80, min_stock_level: 30, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Fresh Curd', sku: 'CRD-001', category: 'curd', unit: 'kg', price_per_unit: 80, cost_per_unit: 55, stock_quantity: 40, min_stock_level: 15, is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Pure Desi Ghee', sku: 'GHE-001', category: 'ghee', unit: 'kg', price_per_unit: 550, cost_per_unit: 400, stock_quantity: 25, min_stock_level: 10, is_active: true, created_at: new Date().toISOString() },
  { id: '5', name: 'Fresh Paneer', sku: 'PNR-001', category: 'paneer', unit: 'kg', price_per_unit: 320, cost_per_unit: 220, stock_quantity: 15, min_stock_level: 5, is_active: true, created_at: new Date().toISOString() },
  { id: '6', name: 'Buttermilk', sku: 'BTM-001', category: 'buttermilk', unit: 'liters', price_per_unit: 30, cost_per_unit: 18, stock_quantity: 60, min_stock_level: 20, is_active: true, created_at: new Date().toISOString() },
  { id: '7', name: 'Fresh Butter', sku: 'BTR-001', category: 'butter', unit: 'kg', price_per_unit: 480, cost_per_unit: 350, stock_quantity: 12, min_stock_level: 5, is_active: true, created_at: new Date().toISOString() },
  { id: '8', name: 'Fresh Cream', sku: 'CRM-001', category: 'cream', unit: 'kg', price_per_unit: 280, cost_per_unit: 180, stock_quantity: 8, min_stock_level: 3, is_active: true, created_at: new Date().toISOString() },
];

export const DEMO_ROUTES: Route[] = [
  { id: '1', name: 'Gomti Nagar Route', code: 'R-001', area: 'Gomti Nagar', total_customers: 25, estimated_time_minutes: 120, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Hazratganj Route', code: 'R-002', area: 'Hazratganj', total_customers: 18, estimated_time_minutes: 90, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Aliganj Route', code: 'R-003', area: 'Aliganj', total_customers: 30, estimated_time_minutes: 150, is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Indira Nagar Route', code: 'R-004', area: 'Indira Nagar', total_customers: 22, estimated_time_minutes: 100, is_active: true, created_at: new Date().toISOString() },
];

export const DEMO_DELIVERIES: Delivery[] = [
  { id: '1', delivery_date: new Date().toISOString().split('T')[0], customer_id: '1', route_id: '1', status: 'completed', total_amount: 3600, created_at: new Date().toISOString() },
  { id: '2', delivery_date: new Date().toISOString().split('T')[0], customer_id: '2', route_id: '1', status: 'completed', total_amount: 480, created_at: new Date().toISOString() },
  { id: '3', delivery_date: new Date().toISOString().split('T')[0], customer_id: '3', route_id: '2', status: 'in_progress', total_amount: 12500, created_at: new Date().toISOString() },
  { id: '4', delivery_date: new Date().toISOString().split('T')[0], customer_id: '4', route_id: '2', status: 'pending', total_amount: 2800, created_at: new Date().toISOString() },
  { id: '5', delivery_date: new Date().toISOString().split('T')[0], customer_id: '5', route_id: '3', status: 'pending', total_amount: 5400, created_at: new Date().toISOString() },
];

export const DEMO_INVOICES: Invoice[] = [
  { id: '1', invoice_number: 'AWD-2024-001', customer_id: '1', invoice_date: new Date().toISOString().split('T')[0], subtotal: 18000, tax_amount: 900, total_amount: 18900, paid_amount: 16400, status: 'partial', created_at: new Date().toISOString() },
  { id: '2', invoice_number: 'AWD-2024-002', customer_id: '3', invoice_date: new Date().toISOString().split('T')[0], subtotal: 45000, tax_amount: 2250, total_amount: 47250, paid_amount: 47250, status: 'paid', created_at: new Date().toISOString() },
  { id: '3', invoice_number: 'AWD-2024-003', customer_id: '7', invoice_date: new Date().toISOString().split('T')[0], subtotal: 85000, tax_amount: 4250, total_amount: 89250, paid_amount: 64250, status: 'partial', created_at: new Date().toISOString() },
  { id: '4', invoice_number: 'AWD-2024-004', customer_id: '4', invoice_date: new Date().toISOString().split('T')[0], subtotal: 12000, tax_amount: 600, total_amount: 12600, paid_amount: 0, status: 'sent', created_at: new Date().toISOString() },
];

export const DEMO_EXPENSES: Expense[] = [
  { id: '1', expense_date: new Date().toISOString().split('T')[0], amount: 25000, description: 'Monthly feed purchase', vendor_name: 'Agro Feed Store', status: 'approved', created_at: new Date().toISOString() },
  { id: '2', expense_date: new Date().toISOString().split('T')[0], amount: 5500, description: 'Veterinary checkup', vendor_name: 'Dr. Patel Clinic', status: 'approved', created_at: new Date().toISOString() },
  { id: '3', expense_date: new Date().toISOString().split('T')[0], amount: 8200, description: 'Electricity bill', vendor_name: 'UPPCL', status: 'pending', created_at: new Date().toISOString() },
  { id: '4', expense_date: new Date().toISOString().split('T')[0], amount: 3500, description: 'Vehicle fuel', vendor_name: 'Indian Oil', status: 'approved', created_at: new Date().toISOString() },
  { id: '5', expense_date: new Date().toISOString().split('T')[0], amount: 12000, description: 'Equipment repair', vendor_name: 'Dairy Solutions', status: 'pending', created_at: new Date().toISOString() },
];

export const DEMO_EMPLOYEES: Employee[] = [
  { id: '1', employee_code: 'EMP-001', department: 'Production', designation: 'Farm Supervisor', joining_date: '2022-01-15', salary: 28000, is_active: true, created_at: new Date().toISOString() },
  { id: '2', employee_code: 'EMP-002', department: 'Delivery', designation: 'Delivery Driver', joining_date: '2022-03-20', salary: 18000, is_active: true, created_at: new Date().toISOString() },
  { id: '3', employee_code: 'EMP-003', department: 'Production', designation: 'Milking Staff', joining_date: '2021-08-10', salary: 15000, is_active: true, created_at: new Date().toISOString() },
  { id: '4', employee_code: 'EMP-004', department: 'Accounts', designation: 'Accountant', joining_date: '2023-02-01', salary: 25000, is_active: true, created_at: new Date().toISOString() },
  { id: '5', employee_code: 'EMP-005', department: 'Veterinary', designation: 'Animal Caretaker', joining_date: '2022-06-15', salary: 16000, is_active: true, created_at: new Date().toISOString() },
];

export const DEMO_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Cattle Feed Premium', category: 'feed', sku: 'FD-001', unit: 'kg', quantity: 500, min_stock_level: 100, unit_price: 35, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Green Fodder', category: 'feed', sku: 'FD-002', unit: 'kg', quantity: 1200, min_stock_level: 300, unit_price: 8, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Mineral Mixture', category: 'feed', sku: 'FD-003', unit: 'kg', quantity: 50, min_stock_level: 20, unit_price: 120, is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Vaccination Doses', category: 'medicine', sku: 'MD-001', unit: 'pieces', quantity: 100, min_stock_level: 30, unit_price: 85, is_active: true, created_at: new Date().toISOString() },
  { id: '5', name: 'Milk Bottles 500ml', category: 'packaging', sku: 'PK-001', unit: 'pieces', quantity: 250, min_stock_level: 100, unit_price: 15, is_active: true, created_at: new Date().toISOString() },
  { id: '6', name: 'Cleaning Solution', category: 'cleaning', sku: 'CL-001', unit: 'liters', quantity: 25, min_stock_level: 10, unit_price: 180, is_active: true, created_at: new Date().toISOString() },
];

export const DEMO_EQUIPMENT: Equipment[] = [
  { id: '1', name: 'Milking Machine A1', equipment_type: 'Milking Equipment', serial_number: 'MM-2021-001', status: 'operational', location: 'Milking Shed 1', created_at: new Date().toISOString() },
  { id: '2', name: 'Milk Chiller 500L', equipment_type: 'Cooling Equipment', serial_number: 'MC-2020-001', status: 'operational', location: 'Processing Unit', created_at: new Date().toISOString() },
  { id: '3', name: 'Delivery Van 1', equipment_type: 'Vehicle', serial_number: 'UP32-AB-1234', status: 'operational', location: 'Parking', created_at: new Date().toISOString() },
  { id: '4', name: 'Pasteurizer Unit', equipment_type: 'Processing Equipment', serial_number: 'PS-2019-001', status: 'maintenance', location: 'Processing Unit', created_at: new Date().toISOString() },
  { id: '5', name: 'Water Pump Motor', equipment_type: 'Utility', serial_number: 'WP-2022-001', status: 'operational', location: 'Pump House', created_at: new Date().toISOString() },
];

export const DEMO_HEALTH: HealthRecord[] = [
  { id: '1', cattle_id: '1', record_type: 'vaccination', record_date: '2024-01-15', treatment: 'FMD Vaccination', veterinarian_name: 'Dr. Amit Patel', cost: 350, created_at: new Date().toISOString() },
  { id: '2', cattle_id: '2', record_type: 'checkup', record_date: '2024-01-20', diagnosis: 'Healthy', veterinarian_name: 'Dr. Amit Patel', cost: 500, created_at: new Date().toISOString() },
  { id: '3', cattle_id: '6', record_type: 'treatment', record_date: '2024-01-18', diagnosis: 'Mild fever', treatment: 'Antibiotics administered', veterinarian_name: 'Dr. Priya Sharma', cost: 850, created_at: new Date().toISOString() },
  { id: '4', cattle_id: '3', record_type: 'deworming', record_date: '2024-01-10', treatment: 'Deworming medicine', veterinarian_name: 'Dr. Amit Patel', cost: 200, created_at: new Date().toISOString() },
];

export const DEMO_BREEDING: BreedingRecord[] = [
  { id: '1', cattle_id: '1', breeding_type: 'artificial_insemination', breeding_date: '2024-01-05', semen_straw_id: 'GIR-2024-001', expected_calving_date: '2024-10-12', pregnancy_status: 'confirmed', created_at: new Date().toISOString() },
  { id: '2', cattle_id: '2', breeding_type: 'natural', breeding_date: '2023-12-20', bull_id: '3', expected_calving_date: '2024-09-27', pregnancy_status: 'confirmed', created_at: new Date().toISOString() },
  { id: '3', cattle_id: '5', breeding_type: 'artificial_insemination', breeding_date: '2024-01-15', semen_straw_id: 'SAH-2024-002', pregnancy_status: 'pending', created_at: new Date().toISOString() },
];

export async function fetchCattle(): Promise<Cattle[]> {
  if (isDemo()) return DEMO_CATTLE;
  const { data, error } = await supabase.from('cattle').select('*').order('tag_number');
  if (error) throw error;
  return data || [];
}

export async function fetchProduction(): Promise<MilkProduction[]> {
  if (isDemo()) return DEMO_PRODUCTION;
  const { data, error } = await supabase.from('milk_production').select('*').order('collection_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchCustomers(): Promise<Customer[]> {
  if (isDemo()) return DEMO_CUSTOMERS;
  const { data, error } = await supabase.from('customers').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchProducts(): Promise<Product[]> {
  if (isDemo()) return DEMO_PRODUCTS;
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchRoutes(): Promise<Route[]> {
  if (isDemo()) return DEMO_ROUTES;
  const { data, error } = await supabase.from('routes').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchDeliveries(): Promise<Delivery[]> {
  if (isDemo()) return DEMO_DELIVERIES;
  const { data, error } = await supabase.from('deliveries').select('*').order('delivery_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchInvoices(): Promise<Invoice[]> {
  if (isDemo()) return DEMO_INVOICES;
  const { data, error } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchExpenses(): Promise<Expense[]> {
  if (isDemo()) return DEMO_EXPENSES;
  const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchEmployees(): Promise<Employee[]> {
  if (isDemo()) return DEMO_EMPLOYEES;
  const { data, error } = await supabase.from('employees').select('*').order('employee_code');
  if (error) throw error;
  return data || [];
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  if (isDemo()) return DEMO_INVENTORY;
  const { data, error } = await supabase.from('inventory_items').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchEquipment(): Promise<Equipment[]> {
  if (isDemo()) return DEMO_EQUIPMENT;
  const { data, error } = await supabase.from('equipment').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchHealthRecords(): Promise<HealthRecord[]> {
  if (isDemo()) return DEMO_HEALTH;
  const { data, error } = await supabase.from('health_records').select('*').order('record_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchBreedingRecords(): Promise<BreedingRecord[]> {
  if (isDemo()) return DEMO_BREEDING;
  const { data, error } = await supabase.from('breeding_records').select('*').order('breeding_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export const getDashboardStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayProduction = DEMO_PRODUCTION.filter(p => p.collection_date === today);
  const totalMilk = todayProduction.reduce((sum, p) => sum + (p.quantity_liters || 0), 0);
  const activeCattle = DEMO_CATTLE.filter(c => c.status === 'active' && c.category === 'milking').length;
  const activeCustomers = DEMO_CUSTOMERS.filter(c => c.is_active).length;
  const pendingDeliveries = DEMO_DELIVERIES.filter(d => d.status === 'pending').length;
  const monthlyRevenue = DEMO_INVOICES.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const outstandingAmount = DEMO_CUSTOMERS.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);
  
  return {
    todayProduction: totalMilk,
    activeCattle,
    milkingCattle: activeCattle,
    totalCattle: DEMO_CATTLE.length,
    activeCustomers,
    pendingDeliveries,
    completedDeliveries: DEMO_DELIVERIES.filter(d => d.status === 'completed').length,
    monthlyRevenue,
    outstandingAmount,
    lowStockItems: DEMO_INVENTORY.filter(i => i.quantity <= i.min_stock_level).length,
    pendingExpenses: DEMO_EXPENSES.filter(e => e.status === 'pending').length,
    avgFatContent: todayProduction.length > 0 
      ? todayProduction.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) / todayProduction.length 
      : 0,
  };
};
