-- AWADH DAIRY ERP Database Schema
-- Apply this to your Supabase project via SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- User Profiles & Authentication
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'farm_worker' 
    CHECK (role IN ('super_admin', 'manager', 'accountant', 'delivery_staff', 'farm_worker', 'vet_staff', 'auditor')),
  is_active BOOLEAN DEFAULT true,
  email VARCHAR(255),
  avatar_url TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Cattle Management
-- ============================================
CREATE TABLE IF NOT EXISTS cattle (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  breed VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  category VARCHAR(50) CHECK (category IN ('milking', 'dry', 'heifer', 'calf', 'bull')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased', 'culled')),
  weight_kg DECIMAL(10,2),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  mother_id UUID REFERENCES cattle(id),
  father_id UUID REFERENCES cattle(id),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Milk Production
-- ============================================
CREATE TABLE IF NOT EXISTS milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  shift VARCHAR(20) CHECK (shift IN ('morning', 'evening')),
  quantity_liters DECIMAL(10,2) NOT NULL,
  fat_percentage DECIMAL(5,2),
  snf_percentage DECIMAL(5,2),
  quality_grade VARCHAR(20) DEFAULT 'A' CHECK (quality_grade IN ('A', 'B', 'C', 'rejected')),
  recorded_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  category VARCHAR(100) CHECK (category IN ('raw_milk', 'pasteurized_milk', 'curd', 'buttermilk', 'ghee', 'paneer', 'butter', 'cream', 'other')),
  unit VARCHAR(20) CHECK (unit IN ('liters', 'kg', 'pieces', 'packets')),
  price_per_unit DECIMAL(10,2) NOT NULL,
  cost_per_unit DECIMAL(10,2),
  stock_quantity DECIMAL(10,2) DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Customers
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(255),
  customer_type VARCHAR(50) CHECK (customer_type IN ('individual', 'restaurant', 'shop', 'hotel', 'institution', 'distributor')),
  address TEXT,
  city VARCHAR(100),
  pincode VARCHAR(10),
  route_id UUID,
  delivery_priority INTEGER DEFAULT 0,
  credit_limit DECIMAL(10,2) DEFAULT 0,
  outstanding_balance DECIMAL(10,2) DEFAULT 0,
  gst_number VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Routes
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE,
  description TEXT,
  area VARCHAR(255),
  assigned_to UUID REFERENCES profiles(id),
  vehicle_number VARCHAR(50),
  estimated_time_minutes INTEGER,
  total_customers INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to customers
ALTER TABLE customers ADD CONSTRAINT fk_customer_route 
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL;

-- ============================================
-- Deliveries
-- ============================================
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_date DATE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  route_id UUID REFERENCES routes(id),
  delivery_person_id UUID REFERENCES profiles(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'failed')),
  scheduled_time TIME,
  delivered_at TIMESTAMPTZ,
  total_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Billing & Invoices
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  invoice_date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
  payment_method VARCHAR(50),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  description VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'card', 'credit')),
  reference_number VARCHAR(100),
  notes TEXT,
  received_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Bottles Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS bottle_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('issued', 'returned', 'damaged', 'lost')),
  quantity INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Employees & Payroll
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  employee_code VARCHAR(20) UNIQUE,
  department VARCHAR(100),
  designation VARCHAR(100),
  joining_date DATE,
  salary DECIMAL(10,2),
  bank_account VARCHAR(50),
  ifsc_code VARCHAR(20),
  emergency_contact VARCHAR(15),
  emergency_name VARCHAR(100),
  documents JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(20) CHECK (status IN ('present', 'absent', 'half_day', 'leave', 'holiday')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10,2),
  allowances DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid')),
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ============================================
-- Expenses
-- ============================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES expense_categories(id),
  expense_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  vendor_name VARCHAR(255),
  payment_method VARCHAR(50),
  receipt_url TEXT,
  approved_by UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Health & Veterinary
-- ============================================
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  record_type VARCHAR(50) CHECK (record_type IN ('checkup', 'vaccination', 'treatment', 'surgery', 'deworming')),
  record_date DATE NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  medication TEXT,
  dosage VARCHAR(100),
  veterinarian_name VARCHAR(255),
  cost DECIMAL(10,2),
  next_followup_date DATE,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Breeding
-- ============================================
CREATE TABLE IF NOT EXISTS breeding_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cattle_id UUID REFERENCES cattle(id) ON DELETE CASCADE,
  breeding_type VARCHAR(50) CHECK (breeding_type IN ('natural', 'artificial_insemination')),
  breeding_date DATE NOT NULL,
  bull_id UUID REFERENCES cattle(id),
  semen_straw_id VARCHAR(50),
  technician_name VARCHAR(255),
  expected_calving_date DATE,
  actual_calving_date DATE,
  pregnancy_status VARCHAR(50) DEFAULT 'pending' CHECK (pregnancy_status IN ('pending', 'confirmed', 'failed', 'delivered')),
  calf_id UUID REFERENCES cattle(id),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Inventory & Feed
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) CHECK (category IN ('feed', 'medicine', 'equipment', 'packaging', 'cleaning', 'other')),
  sku VARCHAR(50) UNIQUE,
  unit VARCHAR(20),
  quantity DECIMAL(10,2) DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 0,
  unit_price DECIMAL(10,2),
  supplier_name VARCHAR(255),
  storage_location VARCHAR(100),
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('purchase', 'consumption', 'adjustment', 'transfer')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  reference_number VARCHAR(100),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Equipment
-- ============================================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  warranty_until DATE,
  status VARCHAR(50) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'repair', 'retired')),
  location VARCHAR(255),
  assigned_to UUID REFERENCES profiles(id),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50) CHECK (maintenance_type IN ('preventive', 'corrective', 'emergency')),
  maintenance_date DATE NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  performed_by VARCHAR(255),
  next_scheduled_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Milk Procurement (Vendors)
-- ============================================
CREATE TABLE IF NOT EXISTS milk_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(255),
  address TEXT,
  village VARCHAR(100),
  bank_account VARCHAR(50),
  ifsc_code VARCHAR(20),
  cattle_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milk_procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES milk_vendors(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  shift VARCHAR(20) CHECK (shift IN ('morning', 'evening')),
  quantity_liters DECIMAL(10,2) NOT NULL,
  fat_percentage DECIMAL(5,2),
  snf_percentage DECIMAL(5,2),
  rate_per_liter DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  quality_grade VARCHAR(20) DEFAULT 'A' CHECK (quality_grade IN ('A', 'B', 'C', 'rejected')),
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES milk_vendors(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
  reference_number VARCHAR(100),
  period_from DATE,
  period_to DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Procurement (Suppliers)
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(15),
  email VARCHAR(255),
  address TEXT,
  gst_number VARCHAR(20),
  payment_terms VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'received', 'cancelled')),
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inventory_items(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  received_quantity DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Audit Logs
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Settings
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Authentication Functions
-- ============================================

-- Function to hash PIN
CREATE OR REPLACE FUNCTION hash_pin(pin TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(pin || 'awadh_dairy_salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff Login Function
CREATE OR REPLACE FUNCTION staff_login(_phone TEXT, _pin TEXT)
RETURNS JSONB AS $$
DECLARE
  _user profiles%ROWTYPE;
  _session_token TEXT;
  _expires_at TIMESTAMPTZ;
BEGIN
  -- Find user by phone
  SELECT * INTO _user FROM profiles 
  WHERE phone = _phone AND is_active = true;
  
  IF _user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Verify PIN
  IF _user.pin_hash != hash_pin(_pin) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid PIN');
  END IF;
  
  -- Create session
  _session_token := encode(gen_random_bytes(32), 'hex');
  _expires_at := NOW() + INTERVAL '24 hours';
  
  INSERT INTO user_sessions (user_id, session_token, expires_at)
  VALUES (_user.id, _session_token, _expires_at);
  
  -- Return success with user info
  RETURN jsonb_build_object(
    'success', true,
    'session_token', _session_token,
    'user', jsonb_build_object(
      'id', _user.id,
      'full_name', _user.full_name,
      'phone', _user.phone,
      'role', _user.role,
      'is_active', _user.is_active
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate Session Function
CREATE OR REPLACE FUNCTION validate_session(_session_token TEXT)
RETURNS JSONB AS $$
DECLARE
  _session user_sessions%ROWTYPE;
  _user profiles%ROWTYPE;
BEGIN
  SELECT * INTO _session FROM user_sessions 
  WHERE session_token = _session_token AND expires_at > NOW();
  
  IF _session.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired session');
  END IF;
  
  SELECT * INTO _user FROM profiles WHERE id = _session.user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'user', jsonb_build_object(
      'id', _user.id,
      'full_name', _user.full_name,
      'phone', _user.phone,
      'role', _user.role,
      'is_active', _user.is_active
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Logout Function
CREATE OR REPLACE FUNCTION logout_session(_session_token TEXT)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM user_sessions WHERE session_token = _session_token;
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_milk_production_date ON milk_production(collection_date);
CREATE INDEX IF NOT EXISTS idx_milk_production_cattle ON milk_production(cattle_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_health_records_cattle ON health_records(cattle_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_cattle ON breeding_records(cattle_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_milk_procurement_date ON milk_procurement(collection_date);
CREATE INDEX IF NOT EXISTS idx_milk_procurement_vendor ON milk_procurement(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_date ON vendor_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor ON vendor_payments(vendor_id);

-- ============================================
-- Insert Default Data
-- ============================================

-- Insert admin user
INSERT INTO profiles (full_name, phone, pin_hash, role, is_active)
VALUES ('Admin', '7897716792', hash_pin('101101'), 'super_admin', true)
ON CONFLICT (phone) DO NOTHING;

-- Insert expense categories
INSERT INTO expense_categories (name, description) VALUES
  ('Feed & Fodder', 'Animal feed, hay, silage, and other fodder'),
  ('Veterinary', 'Medical expenses, vaccinations, treatments'),
  ('Equipment', 'Machinery, tools, and equipment maintenance'),
  ('Fuel & Transport', 'Vehicle fuel, transport costs'),
  ('Electricity', 'Power and electricity bills'),
  ('Salaries', 'Employee wages and salaries'),
  ('Packaging', 'Bottles, packets, containers'),
  ('Maintenance', 'Repairs and facility maintenance'),
  ('Miscellaneous', 'Other general expenses')
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('dairy_name', '"Awadh Dairy"', 'Name of the dairy farm'),
  ('currency', '"INR"', 'Currency code'),
  ('date_format', '"DD/MM/YYYY"', 'Date display format'),
  ('milk_price_per_liter', '60', 'Default milk price per liter'),
  ('bottle_deposit', '20', 'Bottle deposit amount'),
  ('invoice_prefix', '"AWD"', 'Invoice number prefix'),
  ('gst_rate', '5', 'GST percentage')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Demo Data for Testing
-- ============================================

-- Demo Cattle
INSERT INTO cattle (tag_number, name, breed, date_of_birth, gender, category, status, weight_kg, purchase_price, notes) VALUES
  ('COW-001', 'Lakshmi', 'Gir', '2020-03-15', 'female', 'milking', 'active', 450.00, 85000.00, 'High milk yield cow'),
  ('COW-002', 'Ganga', 'Sahiwal', '2019-08-22', 'female', 'milking', 'active', 420.00, 75000.00, 'Excellent fat content'),
  ('COW-003', 'Kamadhenu', 'Gir', '2021-01-10', 'female', 'milking', 'active', 380.00, 90000.00, 'Premium quality milk'),
  ('COW-004', 'Nandini', 'HF Cross', '2020-06-05', 'female', 'milking', 'active', 500.00, 65000.00, 'Good health record'),
  ('COW-005', 'Surabhi', 'Sahiwal', '2022-02-18', 'female', 'heifer', 'active', 280.00, 55000.00, 'Ready for first calving'),
  ('COW-006', 'Gauri', 'Jersey Cross', '2018-11-30', 'female', 'dry', 'active', 440.00, 60000.00, 'Dry period - expected calving soon'),
  ('COW-007', 'Chandan', 'Gir', '2019-04-12', 'male', 'bull', 'active', 650.00, 120000.00, 'Breeding bull'),
  ('COW-008', 'Moti', 'Sahiwal', '2023-05-20', 'female', 'calf', 'active', 85.00, 25000.00, 'Female calf'),
  ('COW-009', 'Raja', 'HF Cross', '2023-07-08', 'male', 'calf', 'active', 95.00, 20000.00, 'Male calf'),
  ('COW-010', 'Sundari', 'Gir', '2021-09-14', 'female', 'milking', 'active', 410.00, 88000.00, 'Consistent producer')
ON CONFLICT (tag_number) DO NOTHING;

-- Demo Products
INSERT INTO products (name, sku, category, unit, price_per_unit, cost_per_unit, stock_quantity, min_stock_level, description, is_active) VALUES
  ('Fresh Cow Milk', 'MILK-001', 'raw_milk', 'liters', 60.00, 45.00, 500.00, 100.00, 'Fresh raw cow milk - daily collection', true),
  ('Pasteurized Milk', 'MILK-002', 'pasteurized_milk', 'liters', 65.00, 50.00, 200.00, 50.00, 'Pasteurized and packaged milk', true),
  ('Fresh Curd', 'CURD-001', 'curd', 'kg', 80.00, 55.00, 100.00, 20.00, 'Homemade fresh curd', true),
  ('Buttermilk', 'BMLK-001', 'buttermilk', 'liters', 30.00, 15.00, 150.00, 30.00, 'Traditional buttermilk (chaas)', true),
  ('Pure Ghee', 'GHEE-001', 'ghee', 'kg', 600.00, 450.00, 50.00, 10.00, 'Pure desi cow ghee', true),
  ('Fresh Paneer', 'PANR-001', 'paneer', 'kg', 350.00, 250.00, 30.00, 5.00, 'Fresh cottage cheese', true),
  ('Butter', 'BUTR-001', 'butter', 'kg', 450.00, 320.00, 25.00, 5.00, 'Fresh white butter', true),
  ('Cream', 'CREM-001', 'cream', 'kg', 200.00, 140.00, 20.00, 5.00, 'Fresh milk cream', true)
ON CONFLICT (sku) DO NOTHING;

-- Demo Routes
INSERT INTO routes (name, code, description, area, vehicle_number, estimated_time_minutes, total_customers, is_active) VALUES
  ('Gomti Nagar Route', 'R-01', 'Gomti Nagar and surrounding areas', 'Gomti Nagar, Vikas Nagar', 'UP32-AB-1234', 120, 45, true),
  ('Hazratganj Route', 'R-02', 'Central Lucknow commercial area', 'Hazratganj, Aminabad', 'UP32-CD-5678', 90, 35, true),
  ('Indira Nagar Route', 'R-03', 'Indira Nagar residential area', 'Indira Nagar, Faizabad Road', 'UP32-EF-9012', 100, 40, true),
  ('Aliganj Route', 'R-04', 'Aliganj and nearby localities', 'Aliganj, Kapoorthala', 'UP32-GH-3456', 80, 30, true),
  ('Mahanagar Route', 'R-05', 'Mahanagar colony deliveries', 'Mahanagar, Nirala Nagar', 'UP32-IJ-7890', 70, 25, true)
ON CONFLICT (code) DO NOTHING;

-- Demo Customers
INSERT INTO customers (name, phone, email, customer_type, address, city, pincode, delivery_priority, credit_limit, outstanding_balance, is_active, notes) VALUES
  ('Sharma Family', '9876543001', 'sharma.family@email.com', 'individual', '123 Gomti Nagar, Sector 12', 'Lucknow', '226010', 1, 5000.00, 1200.00, true, 'Regular daily delivery - 2L milk'),
  ('Hotel Royal Palace', '9876543002', 'royalpalace@hotel.com', 'hotel', '456 Hazratganj Main Road', 'Lucknow', '226001', 2, 50000.00, 15000.00, true, 'Large hotel - bulk orders'),
  ('Sagar Restaurant', '9876543003', 'sagar@restaurant.com', 'restaurant', '789 Aminabad', 'Lucknow', '226018', 1, 20000.00, 5500.00, true, 'Daily paneer and curd orders'),
  ('Gupta General Store', '9876543004', 'guptastore@email.com', 'shop', '321 Indira Nagar', 'Lucknow', '226016', 3, 30000.00, 8000.00, true, 'Retail store - weekly bulk'),
  ('St. Mary School', '9876543005', 'stmary@school.edu', 'institution', '654 Mahanagar Colony', 'Lucknow', '226006', 2, 40000.00, 12000.00, true, 'School canteen supply'),
  ('Verma Residence', '9876543006', 'verma.res@email.com', 'individual', '987 Aliganj', 'Lucknow', '226024', 1, 3000.00, 500.00, true, 'Daily 1L milk delivery'),
  ('Krishna Sweets', '9876543007', 'krishna@sweets.com', 'shop', '147 Chowk', 'Lucknow', '226003', 1, 25000.00, 9000.00, true, 'Sweet shop - ghee and milk'),
  ('The Grand Hotel', '9876543008', 'grand@hotel.com', 'hotel', '258 Vibhuti Khand', 'Lucknow', '226010', 2, 60000.00, 22000.00, true, '5-star hotel - premium products'),
  ('Mishra Dairy Distributor', '9876543009', 'mishra@distributor.com', 'distributor', '369 Alambagh', 'Lucknow', '226005', 3, 100000.00, 35000.00, true, 'Bulk distributor'),
  ('Patel Family', '9876543010', 'patel.fam@email.com', 'individual', '741 Jankipuram', 'Lucknow', '226021', 1, 4000.00, 800.00, true, 'Daily 1.5L milk')
ON CONFLICT DO NOTHING;

-- Demo Milk Vendors (farmers who supply milk)
INSERT INTO milk_vendors (name, phone, address, village, bank_account, ifsc_code, cattle_count, is_active) VALUES
  ('Ramesh Kumar', '9898765001', 'Village Bakshi Ka Talab', 'Bakshi Ka Talab', '1234567890123456', 'SBIN0001234', 8, true),
  ('Suresh Yadav', '9898765002', 'Village Mohanlalganj', 'Mohanlalganj', '2345678901234567', 'PUNB0002345', 12, true),
  ('Mahesh Singh', '9898765003', 'Village Malihabad', 'Malihabad', '3456789012345678', 'HDFC0003456', 6, true),
  ('Dinesh Patel', '9898765004', 'Village Kakori', 'Kakori', '4567890123456789', 'ICIC0004567', 10, true),
  ('Rajesh Verma', '9898765005', 'Village Itaunja', 'Itaunja', '5678901234567890', 'AXIS0005678', 15, true)
ON CONFLICT DO NOTHING;

-- Demo Milk Procurement (today's date references)
INSERT INTO milk_procurement (vendor_id, collection_date, shift, quantity_liters, fat_percentage, snf_percentage, rate_per_liter, total_amount, quality_grade, notes)
SELECT v.id, CURRENT_DATE, 'morning', 45.50, 4.2, 8.5, 42.00, 1911.00, 'A', 'Good quality morning collection'
FROM milk_vendors v WHERE v.name = 'Ramesh Kumar'
UNION ALL
SELECT v.id, CURRENT_DATE, 'morning', 65.00, 4.5, 8.8, 44.00, 2860.00, 'A', 'Premium quality'
FROM milk_vendors v WHERE v.name = 'Suresh Yadav'
UNION ALL
SELECT v.id, CURRENT_DATE, 'morning', 35.00, 3.8, 8.2, 40.00, 1400.00, 'B', 'Standard quality'
FROM milk_vendors v WHERE v.name = 'Mahesh Singh'
UNION ALL
SELECT v.id, CURRENT_DATE - 1, 'evening', 50.00, 4.0, 8.4, 41.00, 2050.00, 'A', 'Evening collection'
FROM milk_vendors v WHERE v.name = 'Dinesh Patel'
UNION ALL
SELECT v.id, CURRENT_DATE - 1, 'morning', 80.00, 4.3, 8.6, 43.00, 3440.00, 'A', 'Large farm supply'
FROM milk_vendors v WHERE v.name = 'Rajesh Verma';

-- Demo Milk Production (from own cattle)
INSERT INTO milk_production (cattle_id, collection_date, shift, quantity_liters, fat_percentage, snf_percentage, quality_grade, notes)
SELECT c.id, CURRENT_DATE, 'morning', 12.5, 4.5, 8.7, 'A', 'Excellent morning yield'
FROM cattle c WHERE c.tag_number = 'COW-001'
UNION ALL
SELECT c.id, CURRENT_DATE, 'morning', 10.0, 4.2, 8.5, 'A', 'Good production'
FROM cattle c WHERE c.tag_number = 'COW-002'
UNION ALL
SELECT c.id, CURRENT_DATE, 'morning', 14.0, 4.8, 8.9, 'A', 'Premium quality'
FROM cattle c WHERE c.tag_number = 'COW-003'
UNION ALL
SELECT c.id, CURRENT_DATE, 'morning', 18.0, 3.5, 8.2, 'A', 'High volume'
FROM cattle c WHERE c.tag_number = 'COW-004'
UNION ALL
SELECT c.id, CURRENT_DATE, 'evening', 11.0, 4.4, 8.6, 'A', 'Evening milking'
FROM cattle c WHERE c.tag_number = 'COW-001'
UNION ALL
SELECT c.id, CURRENT_DATE, 'evening', 9.5, 4.1, 8.4, 'A', 'Evening collection'
FROM cattle c WHERE c.tag_number = 'COW-002'
UNION ALL
SELECT c.id, CURRENT_DATE - 1, 'morning', 13.0, 4.6, 8.8, 'A', 'Yesterday morning'
FROM cattle c WHERE c.tag_number = 'COW-010';

-- Demo Employees
INSERT INTO employees (employee_code, department, designation, joining_date, salary, bank_account, ifsc_code, emergency_contact, emergency_name, is_active) VALUES
  ('EMP-001', 'Production', 'Farm Supervisor', '2022-01-15', 25000.00, '9876543210123456', 'SBIN0001234', '9876500001', 'Sita Devi', true),
  ('EMP-002', 'Delivery', 'Delivery Driver', '2022-03-20', 18000.00, '8765432109876543', 'HDFC0002345', '9876500002', 'Ram Kumar', true),
  ('EMP-003', 'Production', 'Milking Staff', '2021-08-10', 15000.00, '7654321098765432', 'ICIC0003456', '9876500003', 'Geeta Devi', true),
  ('EMP-004', 'Accounts', 'Accountant', '2020-05-01', 30000.00, '6543210987654321', 'AXIS0004567', '9876500004', 'Shyam Singh', true),
  ('EMP-005', 'Delivery', 'Delivery Helper', '2023-02-14', 12000.00, '5432109876543210', 'PUNB0005678', '9876500005', 'Radha Devi', true),
  ('EMP-006', 'Production', 'Cattle Caretaker', '2021-11-25', 14000.00, '4321098765432109', 'SBIN0006789', '9876500006', 'Mohan Lal', true)
ON CONFLICT (employee_code) DO NOTHING;

-- Demo Expenses
INSERT INTO expenses (category_id, expense_date, amount, description, vendor_name, payment_method, status)
SELECT ec.id, CURRENT_DATE, 15000.00, 'Cattle feed - 10 bags', 'Pashudhan Feed Suppliers', 'bank_transfer', 'approved'
FROM expense_categories ec WHERE ec.name = 'Feed & Fodder'
UNION ALL
SELECT ec.id, CURRENT_DATE - 2, 5500.00, 'Vaccination for 10 cattle', 'Dr. Veterinary Clinic', 'cash', 'approved'
FROM expense_categories ec WHERE ec.name = 'Veterinary'
UNION ALL
SELECT ec.id, CURRENT_DATE - 5, 3200.00, 'Diesel for delivery vehicles', 'Indian Oil Petrol Pump', 'upi', 'approved'
FROM expense_categories ec WHERE ec.name = 'Fuel & Transport'
UNION ALL
SELECT ec.id, CURRENT_DATE - 3, 8500.00, 'Electricity bill - January', 'LESCO', 'bank_transfer', 'approved'
FROM expense_categories ec WHERE ec.name = 'Electricity'
UNION ALL
SELECT ec.id, CURRENT_DATE - 7, 2000.00, 'Milk cans and bottles', 'Plastic Packaging Co.', 'cash', 'approved'
FROM expense_categories ec WHERE ec.name = 'Packaging'
UNION ALL
SELECT ec.id, CURRENT_DATE - 1, 4500.00, 'Milking machine repair', 'Dairy Equipment Services', 'upi', 'pending'
FROM expense_categories ec WHERE ec.name = 'Maintenance';

-- Demo Inventory Items
INSERT INTO inventory_items (name, category, sku, unit, quantity, min_stock_level, unit_price, supplier_name, storage_location, is_active) VALUES
  ('Cattle Feed Premium', 'feed', 'INV-FEED-001', 'bags', 50.00, 20.00, 1500.00, 'Pashudhan Feeds', 'Godown A', true),
  ('Green Fodder', 'feed', 'INV-FEED-002', 'kg', 500.00, 200.00, 15.00, 'Local Farm', 'Open Shed', true),
  ('Mineral Mixture', 'feed', 'INV-FEED-003', 'kg', 25.00, 10.00, 120.00, 'Nutrivet Supplies', 'Store Room', true),
  ('Ivermectin Injection', 'medicine', 'INV-MED-001', 'pieces', 20.00, 10.00, 85.00, 'Vet Pharma', 'Medicine Cabinet', true),
  ('Calcium Supplement', 'medicine', 'INV-MED-002', 'bottles', 15.00, 5.00, 250.00, 'Vet Pharma', 'Medicine Cabinet', true),
  ('Antiseptic Spray', 'medicine', 'INV-MED-003', 'pieces', 10.00, 5.00, 180.00, 'Vet Pharma', 'Medicine Cabinet', true),
  ('Milk Cans 40L', 'equipment', 'INV-EQP-001', 'pieces', 25.00, 10.00, 2500.00, 'Dairy Equipment Co.', 'Equipment Shed', true),
  ('Milk Bottles 500ml', 'packaging', 'INV-PKG-001', 'pieces', 500.00, 200.00, 12.00, 'Glass Works', 'Packaging Store', true),
  ('Milk Pouches 1L', 'packaging', 'INV-PKG-002', 'pieces', 1000.00, 500.00, 3.50, 'Plastic Packaging', 'Packaging Store', true),
  ('Cleaning Solution', 'cleaning', 'INV-CLN-001', 'liters', 50.00, 20.00, 80.00, 'Clean Chemicals', 'Cleaning Store', true)
ON CONFLICT (sku) DO NOTHING;

-- Demo Equipment
INSERT INTO equipment (name, equipment_type, serial_number, purchase_date, purchase_price, warranty_until, status, location, last_maintenance_date, next_maintenance_date, notes) VALUES
  ('Automatic Milking Machine', 'Milking Equipment', 'AMM-2022-001', '2022-06-15', 150000.00, '2025-06-15', 'operational', 'Milking Parlor', '2024-01-10', '2024-04-10', 'DeLaval brand - 4 cluster'),
  ('Milk Chiller 500L', 'Cooling Equipment', 'MCH-2021-002', '2021-09-20', 85000.00, '2024-09-20', 'operational', 'Processing Unit', '2024-01-05', '2024-03-05', 'Maintains 4C temperature'),
  ('Chaff Cutter', 'Feed Equipment', 'CHF-2020-003', '2020-03-10', 35000.00, '2023-03-10', 'operational', 'Feed Storage', '2023-12-20', '2024-03-20', 'Electric operated'),
  ('Delivery Van - Tata Ace', 'Vehicle', 'VEH-2022-001', '2022-02-28', 450000.00, '2025-02-28', 'operational', 'Vehicle Shed', '2024-01-15', '2024-02-15', 'Primary delivery vehicle'),
  ('Cream Separator', 'Processing Equipment', 'CRS-2021-004', '2021-11-05', 45000.00, '2024-11-05', 'operational', 'Processing Unit', '2023-11-05', '2024-02-05', 'Manual operated'),
  ('Water Pump 2HP', 'Utility Equipment', 'WPM-2019-005', '2019-07-12', 15000.00, '2022-07-12', 'operational', 'Water Tank Area', '2023-10-15', '2024-01-15', 'Submersible pump'),
  ('Weighing Scale 100kg', 'Measuring Equipment', 'WSC-2020-006', '2020-08-22', 8000.00, '2023-08-22', 'operational', 'Collection Center', '2023-08-22', '2024-02-22', 'Digital scale'),
  ('Generator 5KVA', 'Utility Equipment', 'GEN-2021-007', '2021-04-18', 75000.00, '2024-04-18', 'operational', 'Power Room', '2023-10-18', '2024-01-18', 'Backup power')
ON CONFLICT (serial_number) DO NOTHING;

-- Demo Suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address, gst_number, payment_terms, is_active) VALUES
  ('Pashudhan Feed Suppliers', 'Rakesh Agarwal', '9898123001', 'pashudhan@feeds.com', 'Industrial Area, Lucknow', '09AABCP1234M1Z5', 'Net 30', true),
  ('Vet Pharma Distributors', 'Dr. Sanjay Mishra', '9898123002', 'vetpharma@meds.com', 'Medical Market, Lucknow', '09AABCV5678N2Z6', 'Net 15', true),
  ('Dairy Equipment Co.', 'Vinod Kumar', '9898123003', 'dairyequip@mail.com', 'UPSIDC Industrial Area', '09AABCD9012P3Z7', 'Net 45', true),
  ('Clean Chemicals Ltd', 'Priya Singh', '9898123004', 'cleanchemicals@mail.com', 'Chemical Zone, Kanpur', '09AABCC3456Q4Z8', 'COD', true),
  ('Glass Works Industries', '9898123005', 'Amit Gupta', 'glassworks@mail.com', 'Glass Factory Road', '09AABCG7890R5Z9', 'Net 30', true)
ON CONFLICT DO NOTHING;

-- Demo Health Records
INSERT INTO health_records (cattle_id, record_type, record_date, diagnosis, treatment, medication, dosage, veterinarian_name, cost, next_followup_date, notes)
SELECT c.id, 'vaccination', CURRENT_DATE - 30, 'FMD Vaccination', 'FMD Vaccine administered', 'FMD Vaccine', '5ml', 'Dr. Rajesh Sharma', 150.00, CURRENT_DATE + 150, 'Routine vaccination'
FROM cattle c WHERE c.tag_number = 'COW-001'
UNION ALL
SELECT c.id, 'checkup', CURRENT_DATE - 15, 'Routine health checkup', 'General examination - healthy', 'Vitamin supplement', '10ml daily', 'Dr. Rajesh Sharma', 500.00, CURRENT_DATE + 75, 'All vitals normal'
FROM cattle c WHERE c.tag_number = 'COW-002'
UNION ALL
SELECT c.id, 'treatment', CURRENT_DATE - 7, 'Mild mastitis', 'Antibiotic treatment', 'Ceftriaxone', '2.5g twice daily', 'Dr. Sanjay Verma', 1200.00, CURRENT_DATE + 7, 'Responding well to treatment'
FROM cattle c WHERE c.tag_number = 'COW-003'
UNION ALL
SELECT c.id, 'deworming', CURRENT_DATE - 45, 'Routine deworming', 'Oral deworming medication', 'Albendazole', '10ml', 'Dr. Rajesh Sharma', 100.00, CURRENT_DATE + 45, 'Quarterly deworming'
FROM cattle c WHERE c.tag_number = 'COW-004';

-- Demo Breeding Records
INSERT INTO breeding_records (cattle_id, breeding_type, breeding_date, semen_straw_id, technician_name, expected_calving_date, pregnancy_status, notes)
SELECT c.id, 'artificial_insemination', CURRENT_DATE - 120, 'GIR-ELITE-2024-001', 'AI Technician Ram Singh', CURRENT_DATE + 160, 'confirmed', 'Confirmed pregnant at 60 days'
FROM cattle c WHERE c.tag_number = 'COW-005'
UNION ALL
SELECT c.id, 'artificial_insemination', CURRENT_DATE - 30, 'SAH-PREM-2024-002', 'AI Technician Ram Singh', CURRENT_DATE + 250, 'pending', 'Awaiting pregnancy confirmation'
FROM cattle c WHERE c.tag_number = 'COW-006';

COMMIT;
