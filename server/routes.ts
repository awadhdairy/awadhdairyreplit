import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await storage.seedDefaultData();

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, pin } = req.body;
      const result = await storage.staffLogin(phone, pin);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/auth/validate", async (req, res) => {
    try {
      const { session_token } = req.body;
      const result = await storage.validateSession(session_token);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const { session_token } = req.body;
      const result = await storage.logoutSession(session_token);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.get("/api/cattle", async (req, res) => {
    try {
      const cattle = await storage.getCattle();
      res.json(cattle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cattle", async (req, res) => {
    try {
      const cattle = await storage.createCattle(req.body);
      res.json(cattle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/cattle/:id", async (req, res) => {
    try {
      const cattle = await storage.updateCattle(req.params.id, req.body);
      res.json(cattle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cattle/:id", async (req, res) => {
    try {
      const result = await storage.deleteCattle(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/production", async (req, res) => {
    try {
      const production = await storage.getMilkProduction();
      res.json(production);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/production", async (req, res) => {
    try {
      const production = await storage.createMilkProduction(req.body);
      res.json(production);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.updateCustomer(req.params.id, req.body);
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const result = await storage.deleteCustomer(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const route = await storage.createRoute(req.body);
      res.json(route);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deliveries", async (req, res) => {
    try {
      const deliveries = await storage.getDeliveries();
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const delivery = await storage.createDelivery(req.body);
      res.json(delivery);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/deliveries/:id", async (req, res) => {
    try {
      const delivery = await storage.updateDelivery(req.params.id, req.body);
      res.json(delivery);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employee = await storage.createEmployee(req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = await storage.createExpense(req.body);
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.updateExpense(req.params.id, req.body);
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const result = await storage.deleteExpense(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health", async (req, res) => {
    try {
      const records = await storage.getHealthRecords();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/health", async (req, res) => {
    try {
      const record = await storage.createHealthRecord(req.body);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/breeding", async (req, res) => {
    try {
      const records = await storage.getBreedingRecords();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/breeding", async (req, res) => {
    try {
      const record = await storage.createBreedingRecord(req.body);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventory();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const item = await storage.createInventoryItem(req.body);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.getEquipment();
      res.json(equipment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/equipment", async (req, res) => {
    try {
      const equipment = await storage.createEquipment(req.body);
      res.json(equipment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendor = await storage.createVendor(req.body);
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/vendors/:id", async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    try {
      const result = await storage.deleteVendor(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor-payments", async (req, res) => {
    try {
      const payments = await storage.getVendorPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendor-payments", async (req, res) => {
    try {
      const payment = await storage.createVendorPayment(req.body);
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendor-payments/bulk", async (req, res) => {
    try {
      const payments = await storage.createBulkVendorPayments(req.body);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/procurement", async (req, res) => {
    try {
      const procurement = await storage.getProcurement();
      res.json(procurement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/procurement", async (req, res) => {
    try {
      const item = await storage.createProcurement(req.body);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/procurement/:id", async (req, res) => {
    try {
      const item = await storage.updateProcurement(req.params.id, req.body);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/procurement/:id", async (req, res) => {
    try {
      const result = await storage.deleteProcurement(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
