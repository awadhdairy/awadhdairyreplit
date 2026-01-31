// User Roles
export type UserRole = 
  | 'super_admin' 
  | 'manager' 
  | 'accountant' 
  | 'delivery_staff' 
  | 'farm_worker' 
  | 'vet_staff' 
  | 'auditor';

// Cattle Types
export type CattleStatus = 'active' | 'sold' | 'deceased' | 'dry';
export type LactationStatus = 'lactating' | 'dry' | 'pregnant' | 'calving';
export type CattleType = 'cow' | 'buffalo';

// Delivery Types
export type DeliveryStatus = 'pending' | 'delivered' | 'missed' | 'partial';

// Payment Types
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

// Bottle Types
export type BottleType = 'glass' | 'plastic';
export type BottleSize = '500ml' | '1l' | '2l';
export type BottleTransactionType = 'issued' | 'returned' | 'lost' | 'damaged';

// Health Record Types
export type HealthRecordType = 'vaccination' | 'treatment' | 'checkup' | 'disease';

// Breeding Record Types
export type BreedingRecordType = 'heat_detection' | 'artificial_insemination' | 'pregnancy_check' | 'calving';

// Expense Categories
export type ExpenseCategory = 'feed' | 'medicine' | 'salary' | 'transport' | 'electricity' | 'maintenance' | 'misc';

// Subscription Types
export type SubscriptionType = 'daily' | 'alternate' | 'weekly' | 'custom';

// Billing Cycle
export type BillingCycle = 'monthly' | 'weekly' | 'fortnightly';

// Session Type
export type SessionType = 'morning' | 'evening';

// Attendance Status
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave';

// Feed Categories
export type FeedCategory = 'green_fodder' | 'dry_fodder' | 'concentrate' | 'supplement' | 'medicine';

// Equipment Status
export type EquipmentStatus = 'active' | 'maintenance' | 'retired';

// Maintenance Types
export type MaintenanceType = 'scheduled' | 'repair' | 'inspection' | 'replacement';

// Interfaces

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  pin_hash?: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  id: string;
  user_id: string;
  session_token: string;
  user_type: 'staff' | 'customer';
  expires_at: string;
  last_activity: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface Cattle {
  id: string;
  tag_number: string;
  name?: string;
  breed: string;
  cattle_type: CattleType;
  gender?: 'male' | 'female';
  date_of_birth?: string;
  status: CattleStatus;
  lactation_status: LactationStatus;
  weight?: number;
  weight_kg?: number;
  category?: string;
  sire_id?: string;
  dam_id?: string;
  lactation_number: number;
  last_calving_date?: string;
  expected_calving_date?: string;
  purchase_date?: string;
  purchase_cost?: number;
  image_url?: string;
  notes?: string;
  created_at: string;
}

export interface MilkProduction {
  id: string;
  cattle_id: string;
  production_date: string;
  session: SessionType;
  quantity_liters: number;
  fat_percentage?: number;
  snf_percentage?: number;
  quality_notes?: string;
  recorded_by?: string;
  created_at: string;
  cattle?: Cattle;
}

export interface MilkVendor {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  area?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  upi_id?: string;
  default_rate?: number;
  is_active: boolean;
  current_balance: number;
  total_procurement?: number;
  total_paid?: number;
  notes?: string;
  created_at: string;
}

export interface VendorPayment {
  id: string;
  vendor_id: string;
  vendor_name?: string;
  payment_date: string;
  amount: number;
  payment_mode: 'cash' | 'bank_transfer' | 'upi' | 'cheque';
  reference_number?: string;
  notes?: string;
  created_at: string;
  vendor?: MilkVendor;
}

export interface MilkProcurement {
  id: string;
  vendor_id: string;
  vendor_name?: string;
  procurement_date: string;
  session: SessionType;
  quantity_liters: number;
  fat_percentage?: number;
  snf_percentage?: number;
  rate_per_liter?: number;
  total_amount?: number;
  payment_status: string;
  notes?: string;
  created_at: string;
  vendor?: MilkVendor;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  unit: string;
  tax_percentage: number;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  area?: string;
  subscription_type: SubscriptionType;
  billing_cycle: BillingCycle;
  credit_balance: number;
  advance_balance: number;
  is_active: boolean;
  route_id?: string;
  notes?: string;
  created_at: string;
}

export interface CustomerProduct {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  custom_price?: number;
  is_active: boolean;
  created_at: string;
  product?: Product;
}

export interface CustomerVacation {
  id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomerLedger {
  id: string;
  customer_id: string;
  transaction_date: string;
  transaction_type: 'invoice' | 'payment' | 'adjustment';
  description: string;
  debit_amount: number;
  credit_amount: number;
  running_balance: number;
  reference_id?: string;
  created_by?: string;
  created_at: string;
}

export interface Delivery {
  id: string;
  customer_id: string;
  delivery_date: string;
  status: DeliveryStatus;
  delivered_by?: string;
  delivery_time?: string;
  notes?: string;
  created_at: string;
  customer?: Customer;
  delivery_items?: DeliveryItem[];
}

export interface DeliveryItem {
  id: string;
  delivery_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  created_at: string;
  product?: Product;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  due_date?: string;
  payment_date?: string;
  upi_handle?: string;
  notes?: string;
  created_at: string;
  customer?: Customer;
}

export interface Payment {
  id: string;
  invoice_id: string;
  customer_id: string;
  amount: number;
  payment_mode?: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface Bottle {
  id: string;
  bottle_type: BottleType;
  size: BottleSize;
  total_quantity: number;
  available_quantity: number;
  deposit_amount: number;
  created_at: string;
}

export interface BottleTransaction {
  id: string;
  bottle_id: string;
  customer_id?: string;
  transaction_type: BottleTransactionType;
  quantity: number;
  transaction_date: string;
  staff_id?: string;
  notes?: string;
  created_at: string;
}

export interface CustomerBottle {
  id: string;
  customer_id: string;
  bottle_id: string;
  quantity_pending: number;
  last_issued_date?: string;
  last_returned_date?: string;
  created_at: string;
}

export interface CattleHealth {
  id: string;
  cattle_id: string;
  record_date: string;
  record_type: HealthRecordType;
  title: string;
  description?: string;
  vet_name?: string;
  cost?: number;
  next_due_date?: string;
  recorded_by?: string;
  created_at: string;
  cattle?: Cattle;
}

export interface BreedingRecord {
  id: string;
  cattle_id: string;
  record_type: BreedingRecordType;
  record_date: string;
  heat_cycle_day?: number;
  insemination_bull?: string;
  insemination_technician?: string;
  pregnancy_confirmed?: boolean;
  expected_calving_date?: string;
  actual_calving_date?: string;
  calf_details?: {
    gender?: string;
    weight?: number;
    tag_number?: string;
  };
  notes?: string;
  recorded_by?: string;
  created_at: string;
  cattle?: Cattle;
}

export interface FeedInventory {
  id: string;
  name: string;
  category: FeedCategory;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  cost_per_unit?: number;
  supplier?: string;
  created_at: string;
}

export interface FeedConsumption {
  id: string;
  feed_id: string;
  cattle_id?: string;
  consumption_date: string;
  quantity: number;
  recorded_by?: string;
  created_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_cost?: number;
  warranty_expiry?: string;
  status: EquipmentStatus;
  location?: string;
  notes?: string;
  created_at: string;
}

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  maintenance_date: string;
  maintenance_type: MaintenanceType;
  description?: string;
  cost: number;
  performed_by?: string;
  next_maintenance_date?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  expense_date: string;
  notes?: string;
  receipt_url?: string;
  cattle_id?: string;
  recorded_by?: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  phone?: string;
  role: UserRole;
  salary?: number;
  joining_date?: string;
  is_active: boolean;
  address?: string;
  user_id?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in?: string;
  check_out?: string;
  status: AttendanceStatus;
  notes?: string;
  created_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  base_salary: number;
  overtime_hours: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  payment_status: string;
  payment_date?: string;
  created_at: string;
  employee?: Employee;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  assigned_staff?: string;
  is_active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// Type aliases for backwards compatibility
export type HealthRecord = CattleHealth;
export type Route = DeliveryRoute;
export type AuditLog = ActivityLog;

// Inventory Item type
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku?: string;
  unit: string;
  quantity: number;
  min_stock_level: number;
  unit_price?: number;
  is_active: boolean;
  created_at: string;
}

export interface DairySettings {
  id: string;
  dairy_name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  invoice_prefix: string;
  currency: string;
  financial_year_start: number;
  upi_handle?: string;
  settings?: Record<string, any>;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  todayProduction: number;
  activeCattle: number;
  totalCustomers: number;
  monthlyRevenue: number;
  pendingDeliveries: number;
  lactatingCattle: number;
  pregnantCattle: number;
  pendingInvoices: number;
}

// Login Response
export interface LoginResponse {
  success: boolean;
  message?: string;
  session_token?: string;
  user?: Profile;
}
