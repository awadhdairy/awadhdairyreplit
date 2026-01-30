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
-- Procurement
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

-- ============================================
-- Insert Default Data
-- ============================================

-- Insert default admin user (PIN: 123456)
INSERT INTO profiles (full_name, phone, pin_hash, role, is_active)
VALUES ('Admin User', '9876543210', hash_pin('123456'), 'super_admin', true)
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

COMMIT;
