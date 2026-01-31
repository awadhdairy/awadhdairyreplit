import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertCattleSchema,
  insertMilkProductionSchema,
  insertCustomerSchema,
  insertProductSchema,
  insertRouteSchema,
  insertDeliverySchema,
  insertInvoiceSchema,
  insertEmployeeSchema,
  insertExpenseSchema,
  insertHealthRecordSchema,
  insertBreedingRecordSchema,
  insertInventoryItemSchema,
  insertEquipmentSchema,
  insertMilkVendorSchema,
  insertVendorPaymentSchema,
  insertMilkProcurementSchema,
} from "@shared/schema";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.slice(7);
  const result = await storage.validateSession(token);
  
  if (!result.success) {
    return res.status(401).json({ error: "Unauthorized - Invalid or expired token" });
  }

  (req as any).user = result.user;
  next();
}

function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      return res.status(400).json({ error: "Invalid request body" });
    }
  };
}

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

  app.get("/api/cattle", authMiddleware, async (req, res) => {
    try {
      const cattle = await storage.getCattle();
      res.json(cattle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cattle", authMiddleware, validateBody(insertCattleSchema.partial()), async (req, res) => {
    try {
      const cattle = await storage.createCattle(req.body);
      res.json(cattle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/cattle/:id", authMiddleware, validateBody(insertCattleSchema.partial()), async (req, res) => {
    try {
      const cattle = await storage.updateCattle(req.params.id, req.body);
      res.json(cattle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cattle/:id", authMiddleware, async (req, res) => {
    try {
      const result = await storage.deleteCattle(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/production", authMiddleware, async (req, res) => {
    try {
      const production = await storage.getMilkProduction();
      res.json(production);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/production", authMiddleware, validateBody(insertMilkProductionSchema.partial()), async (req, res) => {
    try {
      const production = await storage.createMilkProduction(req.body);
      res.json(production);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers", authMiddleware, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", authMiddleware, validateBody(insertCustomerSchema.partial()), async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/customers/:id", authMiddleware, validateBody(insertCustomerSchema.partial()), async (req, res) => {
    try {
      const customer = await storage.updateCustomer(req.params.id, req.body);
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/customers/:id", authMiddleware, async (req, res) => {
    try {
      const result = await storage.deleteCustomer(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", authMiddleware, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", authMiddleware, validateBody(insertProductSchema.partial()), async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/routes", authMiddleware, async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/routes", authMiddleware, validateBody(insertRouteSchema.partial()), async (req, res) => {
    try {
      const route = await storage.createRoute(req.body);
      res.json(route);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deliveries", authMiddleware, async (req, res) => {
    try {
      const deliveries = await storage.getDeliveries();
      res.json(deliveries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/deliveries", authMiddleware, validateBody(insertDeliverySchema.partial()), async (req, res) => {
    try {
      const delivery = await storage.createDelivery(req.body);
      res.json(delivery);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/deliveries/:id", authMiddleware, validateBody(insertDeliverySchema.partial()), async (req, res) => {
    try {
      const delivery = await storage.updateDelivery(req.params.id, req.body);
      res.json(delivery);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/invoices", authMiddleware, async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invoices", authMiddleware, validateBody(insertInvoiceSchema.partial()), async (req, res) => {
    try {
      const invoice = await storage.createInvoice(req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/invoices/:id", authMiddleware, validateBody(insertInvoiceSchema.partial()), async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/employees", authMiddleware, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/employees", authMiddleware, validateBody(insertEmployeeSchema.partial()), async (req, res) => {
    try {
      const employee = await storage.createEmployee(req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/expenses", authMiddleware, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expenses", authMiddleware, validateBody(insertExpenseSchema.partial()), async (req, res) => {
    try {
      const expense = await storage.createExpense(req.body);
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/expenses/:id", authMiddleware, validateBody(insertExpenseSchema.partial()), async (req, res) => {
    try {
      const expense = await storage.updateExpense(req.params.id, req.body);
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/expenses/:id", authMiddleware, async (req, res) => {
    try {
      const result = await storage.deleteExpense(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/health", authMiddleware, async (req, res) => {
    try {
      const records = await storage.getHealthRecords();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/health", authMiddleware, validateBody(insertHealthRecordSchema.partial()), async (req, res) => {
    try {
      const record = await storage.createHealthRecord(req.body);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/breeding", authMiddleware, async (req, res) => {
    try {
      const records = await storage.getBreedingRecords();
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/breeding", authMiddleware, validateBody(insertBreedingRecordSchema.partial()), async (req, res) => {
    try {
      const record = await storage.createBreedingRecord(req.body);
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inventory", authMiddleware, async (req, res) => {
    try {
      const items = await storage.getInventory();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/inventory", authMiddleware, validateBody(insertInventoryItemSchema.partial()), async (req, res) => {
    try {
      const item = await storage.createInventoryItem(req.body);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/equipment", authMiddleware, async (req, res) => {
    try {
      const equipment = await storage.getEquipment();
      res.json(equipment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/equipment", authMiddleware, validateBody(insertEquipmentSchema.partial()), async (req, res) => {
    try {
      const equipment = await storage.createEquipment(req.body);
      res.json(equipment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendors", authMiddleware, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendors", authMiddleware, validateBody(insertMilkVendorSchema.partial()), async (req, res) => {
    try {
      const vendor = await storage.createVendor(req.body);
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/vendors/:id", authMiddleware, validateBody(insertMilkVendorSchema.partial()), async (req, res) => {
    try {
      const vendor = await storage.updateVendor(req.params.id, req.body);
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/vendors/:id", authMiddleware, async (req, res) => {
    try {
      const result = await storage.deleteVendor(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor-payments", authMiddleware, async (req, res) => {
    try {
      const payments = await storage.getVendorPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendor-payments", authMiddleware, validateBody(insertVendorPaymentSchema.partial()), async (req, res) => {
    try {
      const payment = await storage.createVendorPayment(req.body);
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendor-payments/bulk", authMiddleware, validateBody(z.array(insertVendorPaymentSchema.partial())), async (req, res) => {
    try {
      const payments = await storage.createBulkVendorPayments(req.body);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/procurement", authMiddleware, async (req, res) => {
    try {
      const procurement = await storage.getProcurement();
      res.json(procurement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/procurement", authMiddleware, validateBody(insertMilkProcurementSchema.partial()), async (req, res) => {
    try {
      const item = await storage.createProcurement(req.body);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/procurement/:id", authMiddleware, validateBody(insertMilkProcurementSchema.partial()), async (req, res) => {
    try {
      const item = await storage.updateProcurement(req.params.id, req.body);
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/procurement/:id", authMiddleware, async (req, res) => {
    try {
      const result = await storage.deleteProcurement(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
