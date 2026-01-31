import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import crypto from "crypto";

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + 'awadh_dairy_salt').digest('hex');
}

export const storage = {
  async getProfile(id: string) {
    const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.id, id));
    return profile;
  },

  async getProfileByPhone(phone: string) {
    const [profile] = await db.select().from(schema.profiles).where(eq(schema.profiles.phone, phone));
    return profile;
  },

  async createProfile(data: schema.InsertProfile) {
    const pinHash = hashPin(data.pin_hash);
    const [profile] = await db.insert(schema.profiles).values({ ...data, pin_hash: pinHash }).returning();
    return profile;
  },

  async staffLogin(phone: string, pin: string) {
    const profile = await this.getProfileByPhone(phone);
    if (!profile || !profile.is_active) {
      return { success: false, message: 'User not found' };
    }
    if (profile.pin_hash !== hashPin(pin)) {
      return { success: false, message: 'Invalid PIN' };
    }
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.insert(schema.userSessions).values({
      user_id: profile.id,
      session_token: sessionToken,
      expires_at: expiresAt,
    });
    const { pin_hash, ...user } = profile;
    return { success: true, session_token: sessionToken, user };
  },

  async validateSession(sessionToken: string) {
    const [session] = await db.select().from(schema.userSessions)
      .where(and(eq(schema.userSessions.session_token, sessionToken), sql`expires_at > NOW()`));
    if (!session) {
      return { success: false, message: 'Invalid or expired session' };
    }
    const profile = await this.getProfile(session.user_id!);
    if (!profile) {
      return { success: false, message: 'User not found' };
    }
    const { pin_hash, ...user } = profile;
    return { success: true, user };
  },

  async logoutSession(sessionToken: string) {
    await db.delete(schema.userSessions).where(eq(schema.userSessions.session_token, sessionToken));
    return { success: true };
  },

  async getCattle() {
    return db.select().from(schema.cattle).orderBy(desc(schema.cattle.created_at));
  },

  async getCattleById(id: string) {
    const [c] = await db.select().from(schema.cattle).where(eq(schema.cattle.id, id));
    return c;
  },

  async createCattle(data: schema.InsertCattle) {
    const [c] = await db.insert(schema.cattle).values(data).returning();
    return c;
  },

  async updateCattle(id: string, data: Partial<schema.InsertCattle>) {
    const [c] = await db.update(schema.cattle).set({ ...data, updated_at: new Date() }).where(eq(schema.cattle.id, id)).returning();
    return c;
  },

  async deleteCattle(id: string) {
    await db.delete(schema.cattle).where(eq(schema.cattle.id, id));
    return { success: true };
  },

  async getMilkProduction() {
    return db.select().from(schema.milkProduction).orderBy(desc(schema.milkProduction.created_at));
  },

  async createMilkProduction(data: schema.InsertMilkProduction) {
    const [p] = await db.insert(schema.milkProduction).values(data).returning();
    return p;
  },

  async getCustomers() {
    return db.select().from(schema.customers).orderBy(desc(schema.customers.created_at));
  },

  async getCustomerById(id: string) {
    const [c] = await db.select().from(schema.customers).where(eq(schema.customers.id, id));
    return c;
  },

  async createCustomer(data: schema.InsertCustomer) {
    const [c] = await db.insert(schema.customers).values(data).returning();
    return c;
  },

  async updateCustomer(id: string, data: Partial<schema.InsertCustomer>) {
    const [c] = await db.update(schema.customers).set({ ...data, updated_at: new Date() }).where(eq(schema.customers.id, id)).returning();
    return c;
  },

  async deleteCustomer(id: string) {
    await db.delete(schema.customers).where(eq(schema.customers.id, id));
    return { success: true };
  },

  async getProducts() {
    return db.select().from(schema.products).orderBy(desc(schema.products.created_at));
  },

  async createProduct(data: schema.InsertProduct) {
    const [p] = await db.insert(schema.products).values(data).returning();
    return p;
  },

  async getRoutes() {
    return db.select().from(schema.routes).orderBy(desc(schema.routes.created_at));
  },

  async createRoute(data: schema.InsertRoute) {
    const [r] = await db.insert(schema.routes).values(data).returning();
    return r;
  },

  async getDeliveries() {
    return db.select().from(schema.deliveries).orderBy(desc(schema.deliveries.created_at));
  },

  async createDelivery(data: schema.InsertDelivery) {
    const [d] = await db.insert(schema.deliveries).values(data).returning();
    return d;
  },

  async updateDelivery(id: string, data: Partial<schema.InsertDelivery>) {
    const [d] = await db.update(schema.deliveries).set({ ...data, updated_at: new Date() }).where(eq(schema.deliveries.id, id)).returning();
    return d;
  },

  async getInvoices() {
    return db.select().from(schema.invoices).orderBy(desc(schema.invoices.created_at));
  },

  async createInvoice(data: schema.InsertInvoice) {
    const [i] = await db.insert(schema.invoices).values(data).returning();
    return i;
  },

  async updateInvoice(id: string, data: Partial<schema.InsertInvoice>) {
    const [i] = await db.update(schema.invoices).set({ ...data, updated_at: new Date() }).where(eq(schema.invoices.id, id)).returning();
    return i;
  },

  async getEmployees() {
    return db.select().from(schema.employees).orderBy(desc(schema.employees.created_at));
  },

  async createEmployee(data: schema.InsertEmployee) {
    const [e] = await db.insert(schema.employees).values(data).returning();
    return e;
  },

  async getExpenses() {
    return db.select().from(schema.expenses).orderBy(desc(schema.expenses.created_at));
  },

  async createExpense(data: schema.InsertExpense) {
    const [e] = await db.insert(schema.expenses).values(data).returning();
    return e;
  },

  async updateExpense(id: string, data: Partial<schema.InsertExpense>) {
    const [e] = await db.update(schema.expenses).set({ ...data, updated_at: new Date() }).where(eq(schema.expenses.id, id)).returning();
    return e;
  },

  async deleteExpense(id: string) {
    await db.delete(schema.expenses).where(eq(schema.expenses.id, id));
    return { success: true };
  },

  async getHealthRecords() {
    return db.select().from(schema.healthRecords).orderBy(desc(schema.healthRecords.created_at));
  },

  async createHealthRecord(data: schema.InsertHealthRecord) {
    const [h] = await db.insert(schema.healthRecords).values(data).returning();
    return h;
  },

  async getBreedingRecords() {
    return db.select().from(schema.breedingRecords).orderBy(desc(schema.breedingRecords.created_at));
  },

  async createBreedingRecord(data: schema.InsertBreedingRecord) {
    const [b] = await db.insert(schema.breedingRecords).values(data).returning();
    return b;
  },

  async getInventory() {
    return db.select().from(schema.inventoryItems).orderBy(desc(schema.inventoryItems.created_at));
  },

  async createInventoryItem(data: schema.InsertInventoryItem) {
    const [i] = await db.insert(schema.inventoryItems).values(data).returning();
    return i;
  },

  async getEquipment() {
    return db.select().from(schema.equipment).orderBy(desc(schema.equipment.created_at));
  },

  async createEquipment(data: schema.InsertEquipment) {
    const [e] = await db.insert(schema.equipment).values(data).returning();
    return e;
  },

  async getVendors() {
    return db.select().from(schema.milkVendors).orderBy(desc(schema.milkVendors.created_at));
  },

  async createVendor(data: schema.InsertMilkVendor) {
    const [v] = await db.insert(schema.milkVendors).values(data).returning();
    return v;
  },

  async updateVendor(id: string, data: Partial<schema.InsertMilkVendor>) {
    const [v] = await db.update(schema.milkVendors).set({ ...data, updated_at: new Date() }).where(eq(schema.milkVendors.id, id)).returning();
    return v;
  },

  async deleteVendor(id: string) {
    await db.delete(schema.milkVendors).where(eq(schema.milkVendors.id, id));
    return { success: true };
  },

  async getVendorPayments() {
    return db.select().from(schema.vendorPayments).orderBy(desc(schema.vendorPayments.created_at));
  },

  async createVendorPayment(data: schema.InsertVendorPayment) {
    const [p] = await db.insert(schema.vendorPayments).values(data).returning();
    if (data.vendor_id) {
      const vendor = await db.select().from(schema.milkVendors).where(eq(schema.milkVendors.id, data.vendor_id));
      if (vendor[0]) {
        const currentBalance = parseFloat(vendor[0].current_balance || '0');
        const totalPaid = parseFloat(vendor[0].total_paid || '0');
        const amount = parseFloat(data.amount as string);
        await db.update(schema.milkVendors).set({
          current_balance: String(currentBalance - amount),
          total_paid: String(totalPaid + amount),
          updated_at: new Date()
        }).where(eq(schema.milkVendors.id, data.vendor_id));
      }
    }
    return p;
  },

  async createBulkVendorPayments(payments: schema.InsertVendorPayment[]) {
    const results = [];
    for (const payment of payments) {
      const result = await this.createVendorPayment(payment);
      results.push(result);
    }
    return results;
  },

  async getProcurement() {
    return db.select().from(schema.milkProcurement).orderBy(desc(schema.milkProcurement.created_at));
  },

  async createProcurement(data: schema.InsertMilkProcurement) {
    const [p] = await db.insert(schema.milkProcurement).values(data).returning();
    if (data.vendor_id && data.total_amount) {
      const vendor = await db.select().from(schema.milkVendors).where(eq(schema.milkVendors.id, data.vendor_id));
      if (vendor[0]) {
        const currentBalance = parseFloat(vendor[0].current_balance || '0');
        const totalProcurement = parseFloat(vendor[0].total_procurement || '0');
        const amount = parseFloat(data.total_amount as string);
        await db.update(schema.milkVendors).set({
          current_balance: String(currentBalance + amount),
          total_procurement: String(totalProcurement + amount),
          updated_at: new Date()
        }).where(eq(schema.milkVendors.id, data.vendor_id));
      }
    }
    return p;
  },

  async updateProcurement(id: string, data: Partial<schema.InsertMilkProcurement>) {
    const [p] = await db.update(schema.milkProcurement).set(data).where(eq(schema.milkProcurement.id, id)).returning();
    return p;
  },

  async deleteProcurement(id: string) {
    const [item] = await db.select().from(schema.milkProcurement).where(eq(schema.milkProcurement.id, id));
    if (item && item.vendor_id && item.total_amount) {
      const vendor = await db.select().from(schema.milkVendors).where(eq(schema.milkVendors.id, item.vendor_id));
      if (vendor[0]) {
        const currentBalance = parseFloat(vendor[0].current_balance || '0');
        const totalProcurement = parseFloat(vendor[0].total_procurement || '0');
        const amount = parseFloat(item.total_amount);
        await db.update(schema.milkVendors).set({
          current_balance: String(currentBalance - amount),
          total_procurement: String(totalProcurement - amount),
          updated_at: new Date()
        }).where(eq(schema.milkVendors.id, item.vendor_id));
      }
    }
    await db.delete(schema.milkProcurement).where(eq(schema.milkProcurement.id, id));
    return { success: true };
  },

  async seedDefaultData() {
    const existingProfiles = await db.select().from(schema.profiles);
    if (existingProfiles.length === 0) {
      await db.insert(schema.profiles).values({
        full_name: 'Admin User',
        phone: '9876543210',
        pin_hash: hashPin('123456'),
        role: 'super_admin',
        is_active: true,
      });
      await db.insert(schema.profiles).values({
        full_name: 'Awadh Dairy Admin',
        phone: '7897716792',
        pin_hash: hashPin('101101'),
        role: 'super_admin',
        is_active: true,
      });
    }
    const existingCategories = await db.select().from(schema.expenseCategories);
    if (existingCategories.length === 0) {
      await db.insert(schema.expenseCategories).values([
        { name: 'Feed & Fodder', description: 'Animal feed, hay, silage, and other fodder' },
        { name: 'Veterinary', description: 'Medical expenses, vaccinations, treatments' },
        { name: 'Equipment', description: 'Machinery, tools, and equipment maintenance' },
        { name: 'Fuel & Transport', description: 'Vehicle fuel, transport costs' },
        { name: 'Electricity', description: 'Power and electricity bills' },
        { name: 'Salaries', description: 'Employee wages and salaries' },
        { name: 'Packaging', description: 'Bottles, packets, containers' },
        { name: 'Maintenance', description: 'Repairs and facility maintenance' },
        { name: 'Miscellaneous', description: 'Other general expenses' },
      ]);
    }
    const existingSettings = await db.select().from(schema.settings);
    if (existingSettings.length === 0) {
      await db.insert(schema.settings).values([
        { key: 'dairy_name', value: '"Awadh Dairy"', description: 'Name of the dairy farm' },
        { key: 'currency', value: '"INR"', description: 'Currency code' },
        { key: 'date_format', value: '"DD/MM/YYYY"', description: 'Date display format' },
        { key: 'milk_price_per_liter', value: '60', description: 'Default milk price per liter' },
        { key: 'bottle_deposit', value: '20', description: 'Bottle deposit amount' },
        { key: 'invoice_prefix', value: '"AWD"', description: 'Invoice number prefix' },
        { key: 'gst_rate', value: '5', description: 'GST percentage' },
      ]);
    }
  }
};
