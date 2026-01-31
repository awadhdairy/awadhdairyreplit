import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, decimal, date, time, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  full_name: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }).unique().notNull(),
  pin_hash: varchar("pin_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("farm_worker"),
  is_active: boolean("is_active").default(true),
  email: varchar("email", { length: 255 }),
  avatar_url: text("avatar_url"),
  address: text("address"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => profiles.id),
  session_token: varchar("session_token", { length: 255 }).unique().notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const cattle = pgTable("cattle", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tag_number: varchar("tag_number", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }),
  breed: varchar("breed", { length: 100 }).notNull(),
  date_of_birth: date("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  cattle_type: varchar("cattle_type", { length: 50 }).default("cow"),
  category: varchar("category", { length: 50 }),
  status: varchar("status", { length: 50 }).default("active"),
  lactation_status: varchar("lactation_status", { length: 50 }).default("dry"),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  weight_kg: decimal("weight_kg", { precision: 10, scale: 2 }),
  purchase_date: date("purchase_date"),
  purchase_price: decimal("purchase_price", { precision: 10, scale: 2 }),
  mother_id: varchar("mother_id"),
  father_id: varchar("father_id"),
  lactation_number: integer("lactation_number").default(0),
  last_calving_date: date("last_calving_date"),
  expected_calving_date: date("expected_calving_date"),
  notes: text("notes"),
  photo_url: text("photo_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const milkProduction = pgTable("milk_production", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cattle_id: varchar("cattle_id").references(() => cattle.id),
  collection_date: date("collection_date"),
  production_date: date("production_date"),
  shift: varchar("shift", { length: 20 }),
  session: varchar("session", { length: 20 }),
  quantity_liters: decimal("quantity_liters", { precision: 10, scale: 2 }).notNull(),
  fat_percentage: decimal("fat_percentage", { precision: 5, scale: 2 }),
  snf_percentage: decimal("snf_percentage", { precision: 5, scale: 2 }),
  quality_grade: varchar("quality_grade", { length: 20 }).default("A"),
  recorded_by: varchar("recorded_by").references(() => profiles.id),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 50 }).unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 20 }),
  price_per_unit: decimal("price_per_unit", { precision: 10, scale: 2 }),
  base_price: decimal("base_price", { precision: 10, scale: 2 }),
  cost_per_unit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  tax_percentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default("0"),
  stock_quantity: decimal("stock_quantity", { precision: 10, scale: 2 }).default("0"),
  min_stock_level: decimal("min_stock_level", { precision: 10, scale: 2 }).default("0"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  customer_type: varchar("customer_type", { length: 50 }),
  subscription_type: varchar("subscription_type", { length: 50 }).default("daily"),
  billing_cycle: varchar("billing_cycle", { length: 50 }).default("monthly"),
  address: text("address"),
  area: varchar("area", { length: 255 }),
  city: varchar("city", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  route_id: varchar("route_id"),
  delivery_priority: integer("delivery_priority").default(0),
  credit_limit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
  credit_balance: decimal("credit_balance", { precision: 10, scale: 2 }).default("0"),
  advance_balance: decimal("advance_balance", { precision: 10, scale: 2 }).default("0"),
  outstanding_balance: decimal("outstanding_balance", { precision: 10, scale: 2 }).default("0"),
  gst_number: varchar("gst_number", { length: 20 }),
  is_active: boolean("is_active").default(true),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 20 }).unique(),
  description: text("description"),
  area: varchar("area", { length: 255 }),
  assigned_to: varchar("assigned_to").references(() => profiles.id),
  vehicle_number: varchar("vehicle_number", { length: 50 }),
  estimated_time_minutes: integer("estimated_time_minutes"),
  total_customers: integer("total_customers").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  delivery_date: date("delivery_date").notNull(),
  customer_id: varchar("customer_id").references(() => customers.id),
  route_id: varchar("route_id").references(() => routes.id),
  delivery_person_id: varchar("delivery_person_id").references(() => profiles.id),
  status: varchar("status", { length: 50 }).default("pending"),
  scheduled_time: time("scheduled_time"),
  delivery_time: varchar("delivery_time", { length: 50 }),
  delivered_at: timestamp("delivered_at"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const deliveryItems = pgTable("delivery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  delivery_id: varchar("delivery_id").references(() => deliveries.id),
  product_id: varchar("product_id").references(() => products.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoice_number: varchar("invoice_number", { length: 50 }).unique().notNull(),
  customer_id: varchar("customer_id").references(() => customers.id),
  invoice_date: date("invoice_date"),
  billing_period_start: date("billing_period_start"),
  billing_period_end: date("billing_period_end"),
  due_date: date("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  tax_amount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discount_amount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  final_amount: decimal("final_amount", { precision: 10, scale: 2 }),
  paid_amount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("draft"),
  payment_status: varchar("payment_status", { length: 50 }).default("pending"),
  payment_method: varchar("payment_method", { length: 50 }),
  payment_date: date("payment_date"),
  notes: text("notes"),
  created_by: varchar("created_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoice_id: varchar("invoice_id").references(() => invoices.id),
  product_id: varchar("product_id").references(() => products.id),
  description: varchar("description", { length: 255 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoice_id: varchar("invoice_id").references(() => invoices.id),
  customer_id: varchar("customer_id").references(() => customers.id),
  payment_date: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payment_method: varchar("payment_method", { length: 50 }),
  reference_number: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  received_by: varchar("received_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const bottleTransactions = pgTable("bottle_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customer_id: varchar("customer_id").references(() => customers.id),
  transaction_type: varchar("transaction_type", { length: 20 }),
  quantity: integer("quantity").notNull(),
  transaction_date: date("transaction_date").notNull(),
  notes: text("notes"),
  recorded_by: varchar("recorded_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profile_id: varchar("profile_id").references(() => profiles.id),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 15 }),
  employee_code: varchar("employee_code", { length: 20 }).unique(),
  department: varchar("department", { length: 100 }),
  designation: varchar("designation", { length: 100 }),
  role: varchar("role", { length: 50 }),
  joining_date: date("joining_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  bank_account: varchar("bank_account", { length: 50 }),
  ifsc_code: varchar("ifsc_code", { length: 20 }),
  emergency_contact: varchar("emergency_contact", { length: 15 }),
  emergency_name: varchar("emergency_name", { length: 100 }),
  address: text("address"),
  documents: jsonb("documents"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employee_id: varchar("employee_id").references(() => employees.id),
  date: date("date").notNull(),
  check_in: time("check_in"),
  check_out: time("check_out"),
  status: varchar("status", { length: 20 }),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

export const payroll = pgTable("payroll", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employee_id: varchar("employee_id").references(() => employees.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  basic_salary: decimal("basic_salary", { precision: 10, scale: 2 }),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  net_salary: decimal("net_salary", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending"),
  paid_date: date("paid_date"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

export const expenseCategories = pgTable("expense_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category_id: varchar("category_id").references(() => expenseCategories.id),
  category: varchar("category", { length: 100 }),
  title: varchar("title", { length: 255 }),
  expense_date: date("expense_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  vendor_name: varchar("vendor_name", { length: 255 }),
  payment_method: varchar("payment_method", { length: 50 }),
  receipt_url: text("receipt_url"),
  approved_by: varchar("approved_by").references(() => profiles.id),
  created_by: varchar("created_by").references(() => profiles.id),
  status: varchar("status", { length: 20 }).default("pending"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cattle_id: varchar("cattle_id").references(() => cattle.id),
  record_type: varchar("record_type", { length: 50 }),
  record_date: date("record_date").notNull(),
  title: varchar("title", { length: 255 }),
  diagnosis: text("diagnosis"),
  description: text("description"),
  treatment: text("treatment"),
  medication: text("medication"),
  dosage: varchar("dosage", { length: 100 }),
  veterinarian_name: varchar("veterinarian_name", { length: 255 }),
  vet_name: varchar("vet_name", { length: 255 }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  next_followup_date: date("next_followup_date"),
  notes: text("notes"),
  recorded_by: varchar("recorded_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const breedingRecords = pgTable("breeding_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cattle_id: varchar("cattle_id").references(() => cattle.id),
  breeding_type: varchar("breeding_type", { length: 50 }),
  record_type: varchar("record_type", { length: 50 }),
  breeding_date: date("breeding_date"),
  record_date: date("record_date"),
  bull_id: varchar("bull_id"),
  semen_straw_id: varchar("semen_straw_id", { length: 50 }),
  technician_name: varchar("technician_name", { length: 255 }),
  insemination_bull: varchar("insemination_bull", { length: 255 }),
  insemination_technician: varchar("insemination_technician", { length: 255 }),
  expected_calving_date: date("expected_calving_date"),
  actual_calving_date: date("actual_calving_date"),
  pregnancy_status: varchar("pregnancy_status", { length: 50 }).default("pending"),
  pregnancy_confirmed: boolean("pregnancy_confirmed"),
  calf_id: varchar("calf_id"),
  calf_details: jsonb("calf_details"),
  notes: text("notes"),
  recorded_by: varchar("recorded_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  sku: varchar("sku", { length: 50 }).unique(),
  unit: varchar("unit", { length: 20 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("0"),
  min_stock_level: decimal("min_stock_level", { precision: 10, scale: 2 }).default("0"),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }),
  supplier_name: varchar("supplier_name", { length: 255 }),
  storage_location: varchar("storage_location", { length: 100 }),
  expiry_date: date("expiry_date"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  item_id: varchar("item_id").references(() => inventoryItems.id),
  transaction_type: varchar("transaction_type", { length: 20 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }),
  reference_number: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  recorded_by: varchar("recorded_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  equipment_type: varchar("equipment_type", { length: 100 }),
  category: varchar("category", { length: 100 }),
  serial_number: varchar("serial_number", { length: 100 }).unique(),
  purchase_date: date("purchase_date"),
  purchase_price: decimal("purchase_price", { precision: 10, scale: 2 }),
  warranty_until: date("warranty_until"),
  status: varchar("status", { length: 50 }).default("operational"),
  location: varchar("location", { length: 255 }),
  assigned_to: varchar("assigned_to").references(() => profiles.id),
  last_maintenance_date: date("last_maintenance_date"),
  next_maintenance_date: date("next_maintenance_date"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const equipmentMaintenance = pgTable("equipment_maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  equipment_id: varchar("equipment_id").references(() => equipment.id),
  maintenance_type: varchar("maintenance_type", { length: 50 }),
  maintenance_date: date("maintenance_date").notNull(),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  performed_by: varchar("performed_by", { length: 255 }),
  next_scheduled_date: date("next_scheduled_date"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  contact_person: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  gst_number: varchar("gst_number", { length: 20 }),
  payment_terms: varchar("payment_terms", { length: 100 }),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  po_number: varchar("po_number", { length: 50 }).unique().notNull(),
  supplier_id: varchar("supplier_id").references(() => suppliers.id),
  order_date: date("order_date").notNull(),
  expected_delivery_date: date("expected_delivery_date"),
  status: varchar("status", { length: 50 }).default("draft"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  tax_amount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  created_by: varchar("created_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  po_id: varchar("po_id").references(() => purchaseOrders.id),
  item_id: varchar("item_id").references(() => inventoryItems.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  received_quantity: decimal("received_quantity", { precision: 10, scale: 2 }).default("0"),
  created_at: timestamp("created_at").defaultNow(),
});

export const milkVendors = pgTable("milk_vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 15 }),
  address: text("address"),
  area: varchar("area", { length: 255 }),
  bank_name: varchar("bank_name", { length: 255 }),
  account_number: varchar("account_number", { length: 50 }),
  ifsc_code: varchar("ifsc_code", { length: 20 }),
  upi_id: varchar("upi_id", { length: 100 }),
  default_rate: decimal("default_rate", { precision: 10, scale: 2 }),
  is_active: boolean("is_active").default(true),
  current_balance: decimal("current_balance", { precision: 10, scale: 2 }).default("0"),
  total_procurement: decimal("total_procurement", { precision: 10, scale: 2 }).default("0"),
  total_paid: decimal("total_paid", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const vendorPayments = pgTable("vendor_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendor_id: varchar("vendor_id").references(() => milkVendors.id),
  vendor_name: varchar("vendor_name", { length: 255 }),
  payment_date: date("payment_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payment_mode: varchar("payment_mode", { length: 50 }),
  reference_number: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

export const milkProcurement = pgTable("milk_procurement", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendor_id: varchar("vendor_id").references(() => milkVendors.id),
  vendor_name: varchar("vendor_name", { length: 255 }),
  procurement_date: date("procurement_date").notNull(),
  session: varchar("session", { length: 20 }),
  quantity_liters: decimal("quantity_liters", { precision: 10, scale: 2 }).notNull(),
  fat_percentage: decimal("fat_percentage", { precision: 5, scale: 2 }),
  snf_percentage: decimal("snf_percentage", { precision: 5, scale: 2 }),
  rate_per_liter: decimal("rate_per_liter", { precision: 10, scale: 2 }),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }),
  payment_status: varchar("payment_status", { length: 50 }).default("pending"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").references(() => profiles.id),
  action: varchar("action", { length: 50 }).notNull(),
  entity_type: varchar("entity_type", { length: 100 }),
  entity_id: varchar("entity_id"),
  old_values: jsonb("old_values"),
  new_values: jsonb("new_values"),
  ip_address: varchar("ip_address", { length: 50 }),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: jsonb("value"),
  description: text("description"),
  updated_by: varchar("updated_by").references(() => profiles.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, created_at: true, updated_at: true });
export const insertCattleSchema = createInsertSchema(cattle).omit({ id: true, created_at: true, updated_at: true });
export const insertMilkProductionSchema = createInsertSchema(milkProduction).omit({ id: true, created_at: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, created_at: true, updated_at: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, created_at: true, updated_at: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true, created_at: true, updated_at: true });
export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true, created_at: true, updated_at: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, created_at: true, updated_at: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, created_at: true, updated_at: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, created_at: true, updated_at: true });
export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({ id: true, created_at: true });
export const insertBreedingRecordSchema = createInsertSchema(breedingRecords).omit({ id: true, created_at: true });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, created_at: true, updated_at: true });
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true, created_at: true, updated_at: true });
export const insertMilkVendorSchema = createInsertSchema(milkVendors).omit({ id: true, created_at: true, updated_at: true });
export const insertVendorPaymentSchema = createInsertSchema(vendorPayments).omit({ id: true, created_at: true });
export const insertMilkProcurementSchema = createInsertSchema(milkProcurement).omit({ id: true, created_at: true });

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Cattle = typeof cattle.$inferSelect;
export type InsertCattle = z.infer<typeof insertCattleSchema>;
export type MilkProduction = typeof milkProduction.$inferSelect;
export type InsertMilkProduction = z.infer<typeof insertMilkProductionSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type BreedingRecord = typeof breedingRecords.$inferSelect;
export type InsertBreedingRecord = z.infer<typeof insertBreedingRecordSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type MilkVendor = typeof milkVendors.$inferSelect;
export type InsertMilkVendor = z.infer<typeof insertMilkVendorSchema>;
export type VendorPayment = typeof vendorPayments.$inferSelect;
export type InsertVendorPayment = z.infer<typeof insertVendorPaymentSchema>;
export type MilkProcurement = typeof milkProcurement.$inferSelect;
export type InsertMilkProcurement = z.infer<typeof insertMilkProcurementSchema>;
