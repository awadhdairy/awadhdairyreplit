import { supabase } from './supabase';
import { getStoredSession } from './supabase';
import type { 
  Cattle, MilkProduction, Customer, Product, Delivery, Invoice, 
  Employee, Expense, HealthRecord, BreedingRecord, InventoryItem,
  Equipment, Route, MilkVendor, VendorPayment, MilkProcurement
} from '@shared/types';

export const isDemo = () => getStoredSession()?.startsWith('demo-');

// Mutable demo data store for in-session persistence
class DemoDataStore {
  private invoices: Invoice[] = [];
  private customers: Customer[] = [];
  private expenses: Expense[] = [];
  private vendors: MilkVendor[] = [];
  private vendorPayments: VendorPayment[] = [];
  private procurement: MilkProcurement[] = [];
  private initialized = false;
  private expensesInitialized = false;
  private vendorsInitialized = false;
  private paymentsInitialized = false;
  private procurementInitialized = false;

  initialize(invoices: Invoice[], customers: Customer[]) {
    if (!this.initialized) {
      this.invoices = [...invoices];
      this.customers = [...customers];
      this.initialized = true;
    }
  }

  initializeExpenses(expenses: Expense[]) {
    if (!this.expensesInitialized) {
      this.expenses = [...expenses];
      this.expensesInitialized = true;
    }
  }

  initializeVendors(vendors: MilkVendor[]) {
    if (!this.vendorsInitialized) {
      this.vendors = [...vendors];
      this.vendorsInitialized = true;
    }
  }

  initializePayments(payments: VendorPayment[]) {
    if (!this.paymentsInitialized) {
      this.vendorPayments = [...payments];
      this.paymentsInitialized = true;
    }
  }

  initializeProcurement(items: MilkProcurement[]) {
    if (!this.procurementInitialized) {
      this.procurement = [...items];
      this.procurementInitialized = true;
    }
  }

  getInvoices(): Invoice[] {
    return this.invoices;
  }

  addInvoice(invoice: Invoice) {
    this.invoices = [...this.invoices, invoice];
  }

  updateInvoice(id: string, updates: Partial<Invoice>) {
    this.invoices = this.invoices.map(inv => 
      inv.id === id ? { ...inv, ...updates } : inv
    );
  }

  getCustomers(): Customer[] {
    return this.customers;
  }

  addCustomer(customer: Customer) {
    this.customers = [...this.customers, customer];
  }

  updateCustomer(id: string, updates: Partial<Customer>) {
    this.customers = this.customers.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
  }

  getExpenses(): Expense[] {
    return this.expenses;
  }

  addExpense(expense: Expense) {
    this.expenses = [...this.expenses, expense];
  }

  updateExpense(id: string, updates: Partial<Expense>) {
    this.expenses = this.expenses.map(e => 
      e.id === id ? { ...e, ...updates } : e
    );
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter(e => e.id !== id);
  }

  // Vendor methods
  getVendors(): MilkVendor[] {
    return this.vendors;
  }

  addVendor(vendor: MilkVendor) {
    this.vendors = [...this.vendors, vendor];
  }

  updateVendor(id: string, updates: Partial<MilkVendor>) {
    this.vendors = this.vendors.map(v => 
      v.id === id ? { ...v, ...updates } : v
    );
  }

  deleteVendor(id: string) {
    this.vendors = this.vendors.filter(v => v.id !== id);
  }

  // Vendor Payment methods
  getVendorPayments(): VendorPayment[] {
    return this.vendorPayments;
  }

  addVendorPayment(payment: VendorPayment) {
    this.vendorPayments = [...this.vendorPayments, payment];
    // Update vendor balance
    const vendor = this.vendors.find(v => v.id === payment.vendor_id);
    if (vendor) {
      this.updateVendor(vendor.id, { 
        current_balance: vendor.current_balance - payment.amount,
        total_paid: (vendor.total_paid || 0) + payment.amount
      });
    }
  }

  // Procurement methods
  getProcurement(): MilkProcurement[] {
    return this.procurement;
  }

  addProcurement(item: MilkProcurement) {
    this.procurement = [...this.procurement, item];
    // Update vendor balance
    const vendor = this.vendors.find(v => v.id === item.vendor_id);
    if (vendor && item.total_amount) {
      this.updateVendor(vendor.id, { 
        current_balance: vendor.current_balance + item.total_amount,
        total_procurement: (vendor.total_procurement || 0) + item.total_amount
      });
    }
  }

  updateProcurement(id: string, updates: Partial<MilkProcurement>) {
    this.procurement = this.procurement.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
  }

  deleteProcurement(id: string) {
    const item = this.procurement.find(p => p.id === id);
    if (item) {
      const vendor = this.vendors.find(v => v.id === item.vendor_id);
      if (vendor && item.total_amount) {
        this.updateVendor(vendor.id, { 
          current_balance: vendor.current_balance - item.total_amount,
          total_procurement: (vendor.total_procurement || 0) - item.total_amount
        });
      }
    }
    this.procurement = this.procurement.filter(p => p.id !== id);
  }
}

export const demoStore = new DemoDataStore();

export const DEMO_CATTLE: Cattle[] = [
  { id: '1', tag_number: 'AWD-001', name: 'Lakshmi', breed: 'Gir', date_of_birth: '2020-03-15', cattle_type: 'cow', status: 'active', lactation_status: 'lactating', weight: 450, lactation_number: 3, created_at: new Date().toISOString() },
  { id: '2', tag_number: 'AWD-002', name: 'Ganga', breed: 'Sahiwal', date_of_birth: '2019-08-20', cattle_type: 'cow', status: 'active', lactation_status: 'lactating', weight: 480, lactation_number: 4, created_at: new Date().toISOString() },
  { id: '3', tag_number: 'AWD-003', name: 'Nandi', breed: 'Gir', date_of_birth: '2018-12-10', cattle_type: 'buffalo', status: 'active', lactation_status: 'dry', weight: 650, lactation_number: 0, created_at: new Date().toISOString() },
  { id: '4', tag_number: 'AWD-004', name: 'Radha', breed: 'Jersey Cross', date_of_birth: '2021-05-22', cattle_type: 'cow', status: 'active', lactation_status: 'pregnant', weight: 320, lactation_number: 0, created_at: new Date().toISOString() },
  { id: '5', tag_number: 'AWD-005', name: 'Saraswati', breed: 'Sahiwal', date_of_birth: '2020-11-08', cattle_type: 'cow', status: 'active', lactation_status: 'lactating', weight: 460, lactation_number: 2, created_at: new Date().toISOString() },
  { id: '6', tag_number: 'AWD-006', name: 'Gauri', breed: 'Holstein', date_of_birth: '2019-04-18', cattle_type: 'cow', status: 'dry', lactation_status: 'dry', weight: 520, lactation_number: 3, created_at: new Date().toISOString() },
  { id: '7', tag_number: 'AWD-007', name: 'Chotu', breed: 'Gir', date_of_birth: '2023-09-01', cattle_type: 'buffalo', status: 'active', lactation_status: 'calving', weight: 85, lactation_number: 0, created_at: new Date().toISOString() },
  { id: '8', tag_number: 'AWD-008', name: 'Parvati', breed: 'Red Sindhi', date_of_birth: '2020-07-12', cattle_type: 'cow', status: 'active', lactation_status: 'lactating', weight: 410, lactation_number: 2, created_at: new Date().toISOString() },
];

export const DEMO_PRODUCTION: MilkProduction[] = [
  { id: '1', cattle_id: '1', production_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 12.5, fat_percentage: 4.2, snf_percentage: 8.5, created_at: new Date().toISOString() },
  { id: '2', cattle_id: '2', production_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 14.2, fat_percentage: 4.5, snf_percentage: 8.8, created_at: new Date().toISOString() },
  { id: '3', cattle_id: '5', production_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 11.8, fat_percentage: 4.0, snf_percentage: 8.3, created_at: new Date().toISOString() },
  { id: '4', cattle_id: '8', production_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 10.5, fat_percentage: 4.3, snf_percentage: 8.6, created_at: new Date().toISOString() },
  { id: '5', cattle_id: '1', production_date: new Date().toISOString().split('T')[0], session: 'evening', quantity_liters: 10.2, fat_percentage: 4.4, snf_percentage: 8.7, created_at: new Date().toISOString() },
  { id: '6', cattle_id: '2', production_date: new Date().toISOString().split('T')[0], session: 'evening', quantity_liters: 12.0, fat_percentage: 4.6, snf_percentage: 8.9, created_at: new Date().toISOString() },
];

export const DEMO_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Sharma Sweets', phone: '9876541001', address: '123 Main Market', area: 'Main Market', subscription_type: 'daily', billing_cycle: 'monthly', is_active: true, credit_balance: 2500, advance_balance: 0, created_at: new Date().toISOString() },
  { id: '2', name: 'Rajesh Kumar', phone: '9876541002', address: '45 Civil Lines', area: 'Civil Lines', subscription_type: 'daily', billing_cycle: 'monthly', is_active: true, credit_balance: 450, advance_balance: 500, created_at: new Date().toISOString() },
  { id: '3', name: 'Hotel Grand Palace', phone: '9876541003', address: '78 Hazratganj', area: 'Hazratganj', subscription_type: 'daily', billing_cycle: 'weekly', is_active: true, credit_balance: 15000, advance_balance: 0, created_at: new Date().toISOString() },
  { id: '4', name: 'Gupta Restaurant', phone: '9876541004', address: '22 Aminabad', area: 'Aminabad', subscription_type: 'daily', billing_cycle: 'weekly', is_active: true, credit_balance: 3200, advance_balance: 0, created_at: new Date().toISOString() },
  { id: '5', name: 'City School', phone: '9876541005', address: '90 Gomti Nagar', area: 'Gomti Nagar', subscription_type: 'weekly', billing_cycle: 'monthly', is_active: true, credit_balance: 8500, advance_balance: 0, created_at: new Date().toISOString() },
  { id: '6', name: 'Anita Devi', phone: '9876541006', address: '15 Indira Nagar', area: 'Indira Nagar', subscription_type: 'alternate', billing_cycle: 'monthly', is_active: true, credit_balance: 0, advance_balance: 1000, created_at: new Date().toISOString() },
  { id: '7', name: 'Milk Point Store', phone: '9876541007', address: '33 Aliganj', area: 'Aliganj', subscription_type: 'daily', billing_cycle: 'weekly', is_active: true, credit_balance: 25000, advance_balance: 0, created_at: new Date().toISOString() },
];

export const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Fresh Cow Milk', description: 'Premium quality fresh cow milk', unit: 'liters', base_price: 60, tax_percentage: 0, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Pasteurized Milk', description: 'Pasteurized and packaged milk', unit: 'liters', base_price: 65, tax_percentage: 0, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Fresh Curd', description: 'Homemade fresh curd', unit: 'kg', base_price: 80, tax_percentage: 5, is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Pure Desi Ghee', description: 'Traditional desi ghee from cow milk', unit: 'kg', base_price: 550, tax_percentage: 5, is_active: true, created_at: new Date().toISOString() },
  { id: '5', name: 'Fresh Paneer', description: 'Soft and fresh paneer', unit: 'kg', base_price: 320, tax_percentage: 5, is_active: true, created_at: new Date().toISOString() },
  { id: '6', name: 'Buttermilk', description: 'Refreshing traditional buttermilk', unit: 'liters', base_price: 30, tax_percentage: 0, is_active: true, created_at: new Date().toISOString() },
  { id: '7', name: 'Fresh Butter', description: 'Homemade white butter', unit: 'kg', base_price: 480, tax_percentage: 5, is_active: true, created_at: new Date().toISOString() },
  { id: '8', name: 'Fresh Cream', description: 'Rich dairy cream', unit: 'kg', base_price: 280, tax_percentage: 5, is_active: true, created_at: new Date().toISOString() },
];

export const DEMO_ROUTES: Route[] = [
  { id: '1', name: 'Gomti Nagar Route', description: 'Gomti Nagar area delivery route', is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Hazratganj Route', description: 'Hazratganj area delivery route', is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Aliganj Route', description: 'Aliganj area delivery route', is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Indira Nagar Route', description: 'Indira Nagar area delivery route', is_active: true, created_at: new Date().toISOString() },
];

export const DEMO_DELIVERIES: Delivery[] = [
  { id: '1', delivery_date: new Date().toISOString().split('T')[0], customer_id: '1', status: 'delivered', delivery_time: '06:30:00', created_at: new Date().toISOString() },
  { id: '2', delivery_date: new Date().toISOString().split('T')[0], customer_id: '2', status: 'delivered', delivery_time: '06:45:00', created_at: new Date().toISOString() },
  { id: '3', delivery_date: new Date().toISOString().split('T')[0], customer_id: '3', status: 'partial', notes: 'Partial delivery - curd out of stock', created_at: new Date().toISOString() },
  { id: '4', delivery_date: new Date().toISOString().split('T')[0], customer_id: '4', status: 'pending', created_at: new Date().toISOString() },
  { id: '5', delivery_date: new Date().toISOString().split('T')[0], customer_id: '5', status: 'pending', created_at: new Date().toISOString() },
];

export const DEMO_INVOICES: Invoice[] = [
  { id: '1', invoice_number: 'AWD-2024-001', customer_id: '1', billing_period_start: '2024-01-01', billing_period_end: '2024-01-31', total_amount: 18000, tax_amount: 900, discount_amount: 0, final_amount: 18900, paid_amount: 16400, payment_status: 'partial', created_at: new Date().toISOString() },
  { id: '2', invoice_number: 'AWD-2024-002', customer_id: '3', billing_period_start: '2024-01-01', billing_period_end: '2024-01-31', total_amount: 45000, tax_amount: 2250, discount_amount: 0, final_amount: 47250, paid_amount: 47250, payment_status: 'paid', created_at: new Date().toISOString() },
  { id: '3', invoice_number: 'AWD-2024-003', customer_id: '7', billing_period_start: '2024-01-01', billing_period_end: '2024-01-31', total_amount: 85000, tax_amount: 4250, discount_amount: 0, final_amount: 89250, paid_amount: 64250, payment_status: 'partial', created_at: new Date().toISOString() },
  { id: '4', invoice_number: 'AWD-2024-004', customer_id: '4', billing_period_start: '2024-01-01', billing_period_end: '2024-01-31', total_amount: 12000, tax_amount: 600, discount_amount: 0, final_amount: 12600, paid_amount: 0, payment_status: 'pending', created_at: new Date().toISOString() },
];

export const DEMO_EXPENSES: Expense[] = [
  { id: '1', expense_date: new Date().toISOString().split('T')[0], amount: 25000, category: 'feed', title: 'Monthly feed purchase', notes: 'Purchased from Agro Feed Store', created_at: new Date().toISOString() },
  { id: '2', expense_date: new Date().toISOString().split('T')[0], amount: 5500, category: 'medicine', title: 'Veterinary checkup', notes: 'Dr. Patel Clinic visit', created_at: new Date().toISOString() },
  { id: '3', expense_date: new Date().toISOString().split('T')[0], amount: 8200, category: 'electricity', title: 'Electricity bill', notes: 'UPPCL monthly bill', created_at: new Date().toISOString() },
  { id: '4', expense_date: new Date().toISOString().split('T')[0], amount: 3500, category: 'transport', title: 'Vehicle fuel', notes: 'Indian Oil fuel', created_at: new Date().toISOString() },
  { id: '5', expense_date: new Date().toISOString().split('T')[0], amount: 12000, category: 'maintenance', title: 'Equipment repair', notes: 'Dairy Solutions service', created_at: new Date().toISOString() },
];

export const DEMO_VENDORS: MilkVendor[] = [
  { id: '1', name: 'Ramesh Kumar', phone: '9876541101', address: 'Village Kheri, Lucknow', area: 'Kheri', bank_name: 'State Bank of India', account_number: '32145698710', ifsc_code: 'SBIN0001234', default_rate: 45, is_active: true, current_balance: 12500, total_procurement: 87500, total_paid: 75000, created_at: new Date().toISOString() },
  { id: '2', name: 'Suresh Dairy Farm', phone: '9876541102', address: 'Mohanlalganj Road', area: 'Mohanlalganj', bank_name: 'Punjab National Bank', account_number: '45612398700', ifsc_code: 'PUNB0005678', upi_id: 'sureshdairy@upi', default_rate: 42, is_active: true, current_balance: 28000, total_procurement: 158000, total_paid: 130000, created_at: new Date().toISOString() },
  { id: '3', name: 'Gopal Singh', phone: '9876541103', address: 'Bakshi ka Talab', area: 'Bakshi ka Talab', default_rate: 50, is_active: true, current_balance: 8500, total_procurement: 48500, total_paid: 40000, created_at: new Date().toISOString() },
  { id: '4', name: 'Rajendra Yadav', phone: '9876541104', address: 'Sitapur Road, Lucknow', area: 'Sitapur Road', bank_name: 'Bank of Baroda', account_number: '78945612300', ifsc_code: 'BARB0009012', default_rate: 48, is_active: true, current_balance: 15800, total_procurement: 95800, total_paid: 80000, created_at: new Date().toISOString() },
  { id: '5', name: 'Kisan Dairy Cooperative', phone: '9876541105', address: 'Chinhat Industrial Area', area: 'Chinhat', bank_name: 'HDFC Bank', account_number: '12345678900', ifsc_code: 'HDFC0003456', upi_id: 'kisandairy@hdfc', default_rate: 40, is_active: true, current_balance: 45000, total_procurement: 245000, total_paid: 200000, created_at: new Date().toISOString() },
  { id: '6', name: 'Vijay Sharma', phone: '9876541106', address: 'Malihabad', area: 'Malihabad', default_rate: 44, is_active: false, current_balance: 0, total_procurement: 35000, total_paid: 35000, notes: 'Inactive - retired from dairy farming', created_at: new Date().toISOString() },
];

export const DEMO_VENDOR_PAYMENTS: VendorPayment[] = [
  { id: '1', vendor_id: '1', vendor_name: 'Ramesh Kumar', payment_date: '2024-01-25', amount: 25000, payment_mode: 'bank_transfer', reference_number: 'TXN-2024-001', notes: 'Weekly payment', created_at: new Date().toISOString() },
  { id: '2', vendor_id: '2', vendor_name: 'Suresh Dairy Farm', payment_date: '2024-01-25', amount: 40000, payment_mode: 'upi', reference_number: 'UPI-2024-001', notes: 'Weekly payment', created_at: new Date().toISOString() },
  { id: '3', vendor_id: '3', vendor_name: 'Gopal Singh', payment_date: '2024-01-20', amount: 15000, payment_mode: 'cash', notes: 'Bi-weekly payment', created_at: new Date().toISOString() },
  { id: '4', vendor_id: '4', vendor_name: 'Rajendra Yadav', payment_date: '2024-01-22', amount: 30000, payment_mode: 'bank_transfer', reference_number: 'TXN-2024-002', created_at: new Date().toISOString() },
  { id: '5', vendor_id: '5', vendor_name: 'Kisan Dairy Cooperative', payment_date: '2024-01-28', amount: 50000, payment_mode: 'bank_transfer', reference_number: 'TXN-2024-003', notes: 'Monthly payment', created_at: new Date().toISOString() },
  { id: '6', vendor_id: '1', vendor_name: 'Ramesh Kumar', payment_date: '2024-01-18', amount: 25000, payment_mode: 'bank_transfer', reference_number: 'TXN-2024-004', created_at: new Date().toISOString() },
  { id: '7', vendor_id: '2', vendor_name: 'Suresh Dairy Farm', payment_date: '2024-01-18', amount: 45000, payment_mode: 'cheque', reference_number: 'CHQ-2024-001', created_at: new Date().toISOString() },
];

export const DEMO_PROCUREMENT: MilkProcurement[] = [
  { id: '1', vendor_id: '1', vendor_name: 'Ramesh Kumar', procurement_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 50, fat_percentage: 4.5, snf_percentage: 8.5, rate_per_liter: 45, total_amount: 2250, payment_status: 'pending', created_at: new Date().toISOString() },
  { id: '2', vendor_id: '2', vendor_name: 'Suresh Dairy Farm', procurement_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 80, fat_percentage: 4.2, snf_percentage: 8.3, rate_per_liter: 42, total_amount: 3360, payment_status: 'pending', created_at: new Date().toISOString() },
  { id: '3', vendor_id: '1', vendor_name: 'Ramesh Kumar', procurement_date: new Date().toISOString().split('T')[0], session: 'evening', quantity_liters: 45, fat_percentage: 4.3, snf_percentage: 8.4, rate_per_liter: 45, total_amount: 2025, payment_status: 'pending', created_at: new Date().toISOString() },
  { id: '4', vendor_id: '3', vendor_name: 'Gopal Singh', procurement_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 60, fat_percentage: 5.0, snf_percentage: 8.8, rate_per_liter: 50, total_amount: 3000, payment_status: 'pending', created_at: new Date().toISOString() },
  { id: '5', vendor_id: '4', vendor_name: 'Rajendra Yadav', procurement_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 70, fat_percentage: 4.8, snf_percentage: 8.6, rate_per_liter: 48, total_amount: 3360, payment_status: 'pending', created_at: new Date().toISOString() },
  { id: '6', vendor_id: '5', vendor_name: 'Kisan Dairy Cooperative', procurement_date: new Date().toISOString().split('T')[0], session: 'morning', quantity_liters: 150, fat_percentage: 4.0, snf_percentage: 8.2, rate_per_liter: 40, total_amount: 6000, payment_status: 'pending', created_at: new Date().toISOString() },
  { id: '7', vendor_id: '2', vendor_name: 'Suresh Dairy Farm', procurement_date: new Date().toISOString().split('T')[0], session: 'evening', quantity_liters: 75, fat_percentage: 4.4, snf_percentage: 8.5, rate_per_liter: 42, total_amount: 3150, payment_status: 'pending', created_at: new Date().toISOString() },
  { id: '8', vendor_id: '5', vendor_name: 'Kisan Dairy Cooperative', procurement_date: new Date().toISOString().split('T')[0], session: 'evening', quantity_liters: 120, fat_percentage: 4.1, snf_percentage: 8.3, rate_per_liter: 40, total_amount: 4800, payment_status: 'pending', created_at: new Date().toISOString() },
];

export const DEMO_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ramesh Singh', phone: '9876540001', role: 'farm_worker', joining_date: '2022-01-15', salary: 28000, is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'Suresh Kumar', phone: '9876540002', role: 'delivery_staff', joining_date: '2022-03-20', salary: 18000, is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'Mohan Lal', phone: '9876540003', role: 'farm_worker', joining_date: '2021-08-10', salary: 15000, is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'Priya Sharma', phone: '9876540004', role: 'accountant', joining_date: '2023-02-01', salary: 25000, is_active: true, created_at: new Date().toISOString() },
  { id: '5', name: 'Amit Patel', phone: '9876540005', role: 'vet_staff', joining_date: '2022-06-15', salary: 16000, is_active: true, created_at: new Date().toISOString() },
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
  { id: '1', name: 'Milking Machine A1', category: 'Milking Equipment', serial_number: 'MM-2021-001', status: 'active', location: 'Milking Shed 1', created_at: new Date().toISOString() },
  { id: '2', name: 'Milk Chiller 500L', category: 'Cooling Equipment', serial_number: 'MC-2020-001', status: 'active', location: 'Processing Unit', created_at: new Date().toISOString() },
  { id: '3', name: 'Delivery Van 1', category: 'Vehicle', serial_number: 'UP32-AB-1234', status: 'active', location: 'Parking', created_at: new Date().toISOString() },
  { id: '4', name: 'Pasteurizer Unit', category: 'Processing Equipment', serial_number: 'PS-2019-001', status: 'maintenance', location: 'Processing Unit', created_at: new Date().toISOString() },
  { id: '5', name: 'Water Pump Motor', category: 'Utility', serial_number: 'WP-2022-001', status: 'active', location: 'Pump House', created_at: new Date().toISOString() },
];

export const DEMO_HEALTH: HealthRecord[] = [
  { id: '1', cattle_id: '1', record_type: 'vaccination', record_date: '2024-01-15', title: 'FMD Vaccination', description: 'Annual FMD vaccination completed', vet_name: 'Dr. Amit Patel', cost: 350, created_at: new Date().toISOString() },
  { id: '2', cattle_id: '2', record_type: 'checkup', record_date: '2024-01-20', title: 'Routine Checkup', description: 'Healthy - no issues found', vet_name: 'Dr. Amit Patel', cost: 500, created_at: new Date().toISOString() },
  { id: '3', cattle_id: '6', record_type: 'treatment', record_date: '2024-01-18', title: 'Fever Treatment', description: 'Mild fever - antibiotics administered', vet_name: 'Dr. Priya Sharma', cost: 850, created_at: new Date().toISOString() },
  { id: '4', cattle_id: '3', record_type: 'disease', record_date: '2024-01-10', title: 'Deworming', description: 'Deworming medicine administered', vet_name: 'Dr. Amit Patel', cost: 200, created_at: new Date().toISOString() },
];

export const DEMO_BREEDING: BreedingRecord[] = [
  { id: '1', cattle_id: '1', record_type: 'artificial_insemination', record_date: '2024-01-05', insemination_bull: 'GIR-2024-001', expected_calving_date: '2024-10-12', pregnancy_confirmed: true, notes: 'Pregnancy confirmed', created_at: new Date().toISOString() },
  { id: '2', cattle_id: '2', record_type: 'heat_detection', record_date: '2023-12-20', insemination_bull: 'Natural mating with Bull #3', expected_calving_date: '2024-09-27', pregnancy_confirmed: true, notes: 'Natural breeding', created_at: new Date().toISOString() },
  { id: '3', cattle_id: '5', record_type: 'artificial_insemination', record_date: '2024-01-15', insemination_bull: 'SAH-2024-002', pregnancy_confirmed: false, notes: 'Awaiting confirmation', created_at: new Date().toISOString() },
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
  if (isDemo()) {
    demoStore.initialize(DEMO_INVOICES, DEMO_CUSTOMERS);
    return demoStore.getCustomers();
  }
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
  if (isDemo()) {
    demoStore.initialize(DEMO_INVOICES, DEMO_CUSTOMERS);
    return demoStore.getInvoices();
  }
  const { data, error } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchExpenses(): Promise<Expense[]> {
  if (isDemo()) {
    demoStore.initializeExpenses(DEMO_EXPENSES);
    return demoStore.getExpenses();
  }
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

export async function fetchVendors(): Promise<MilkVendor[]> {
  if (isDemo()) {
    demoStore.initializeVendors(DEMO_VENDORS);
    return demoStore.getVendors();
  }
  const { data, error } = await supabase.from('milk_vendors').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchVendorPayments(): Promise<VendorPayment[]> {
  if (isDemo()) {
    demoStore.initializePayments(DEMO_VENDOR_PAYMENTS);
    return demoStore.getVendorPayments();
  }
  const { data, error } = await supabase.from('vendor_payments').select('*').order('payment_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProcurement(): Promise<MilkProcurement[]> {
  if (isDemo()) {
    demoStore.initializeProcurement(DEMO_PROCUREMENT);
    return demoStore.getProcurement();
  }
  const { data, error } = await supabase.from('milk_procurement').select('*').order('procurement_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export const getDashboardStats = () => {
  const today = new Date().toISOString().split('T')[0];
  const todayProduction = DEMO_PRODUCTION.filter(p => p.production_date === today);
  const totalMilk = todayProduction.reduce((sum, p) => sum + (p.quantity_liters || 0), 0);
  const activeCattle = DEMO_CATTLE.filter(c => c.status === 'active' && c.lactation_status === 'lactating').length;
  const activeCustomers = DEMO_CUSTOMERS.filter(c => c.is_active).length;
  const pendingDeliveries = DEMO_DELIVERIES.filter(d => d.status === 'pending').length;
  const monthlyRevenue = DEMO_INVOICES.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  const outstandingAmount = DEMO_CUSTOMERS.reduce((sum, c) => sum + (c.credit_balance || 0), 0);
  
  return {
    todayProduction: totalMilk,
    activeCattle,
    milkingCattle: activeCattle,
    totalCattle: DEMO_CATTLE.length,
    activeCustomers,
    pendingDeliveries,
    completedDeliveries: DEMO_DELIVERIES.filter(d => d.status === 'delivered').length,
    monthlyRevenue,
    outstandingAmount,
    lowStockItems: DEMO_INVENTORY.filter(i => i.quantity <= i.min_stock_level).length,
    pendingExpenses: DEMO_EXPENSES.length,
    avgFatContent: todayProduction.length > 0 
      ? todayProduction.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) / todayProduction.length 
      : 0,
  };
};
