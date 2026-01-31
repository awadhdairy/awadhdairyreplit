import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SESSION_TOKEN_KEY = 'awadh_session_token';
export const USER_DATA_KEY = 'awadh_user_data';

export function getStoredSession(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function storeSession(token: string, userData: any) {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

export function clearSession() {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
}

export function getStoredUser(): any | null {
  const data = localStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

async function hashPin(pin: string): Promise<string> {
  const salt = 'awadh_dairy_salt';
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const api = {
  auth: {
    login: async (phone: string, pin: string) => {
      const pinHash = await hashPin(pin);

      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .eq('pin_hash', pinHash)
        .eq('is_active', true)
        .single();

      if (userError || !user) {
        throw new Error('Invalid phone number or PIN');
      }

      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt
        });

      if (sessionError) {
        throw new Error('Failed to create session');
      }

      return {
        success: true,
        session_token: sessionToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active
        }
      };
    },

    validate: async (sessionToken: string) => {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('*, profiles(*)')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return { success: false, message: 'Invalid or expired session' };
      }

      return {
        success: true,
        user: session.profiles
      };
    },

    logout: async (sessionToken: string) => {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return { success: true };
    }
  },

  cattle: {
    getAll: async () => {
      const { data, error } = await supabase.from('cattle').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('cattle').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('cattle').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('cattle').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  production: {
    getAll: async () => {
      const { data, error } = await supabase.from('milk_production').select('*, cattle(tag_number, name)').order('collection_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('milk_production').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('milk_production').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('milk_production').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  customers: {
    getAll: async () => {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('customers').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('customers').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  products: {
    getAll: async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('products').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('products').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  routes: {
    getAll: async () => {
      const { data, error } = await supabase.from('routes').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('routes').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('routes').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  deliveries: {
    getAll: async () => {
      const { data, error } = await supabase.from('deliveries').select('*, customers(name), routes(name), delivery_items(*, products(name))').order('delivery_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('deliveries').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('deliveries').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('deliveries').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  deliveryItems: {
    getAll: async (deliveryId?: string) => {
      let query = supabase.from('delivery_items').select('*, products(name)');
      if (deliveryId) query = query.eq('delivery_id', deliveryId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('delivery_items').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('delivery_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  invoices: {
    getAll: async () => {
      const { data, error } = await supabase.from('invoices').select('*, customers(name)').order('invoice_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('invoices').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('invoices').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  invoiceItems: {
    getAll: async (invoiceId?: string) => {
      let query = supabase.from('invoice_items').select('*, products(name)');
      if (invoiceId) query = query.eq('invoice_id', invoiceId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('invoice_items').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('invoice_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  payments: {
    getAll: async () => {
      const { data, error } = await supabase.from('payments').select('*, customers(name), invoices(invoice_number)').order('payment_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('payments').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  bottles: {
    getAll: async () => {
      const { data, error } = await supabase.from('bottles').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('bottles').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('bottles').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('bottles').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  bottleTransactions: {
    getAll: async () => {
      const { data, error } = await supabase.from('bottle_transactions').select('*, customers(name)').order('transaction_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('bottle_transactions').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  employees: {
    getAll: async () => {
      const { data, error } = await supabase.from('employees').select('*, profiles(full_name, phone)').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('employees').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('employees').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  attendance: {
    getAll: async () => {
      const { data, error } = await supabase.from('attendance').select('*, employees(name)').order('date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('attendance').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('attendance').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  payroll: {
    getAll: async () => {
      const { data, error } = await supabase.from('payroll').select('*, employees(name)').order('year', { ascending: false }).order('month', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('payroll').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('payroll').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  expenseCategories: {
    getAll: async () => {
      const { data, error } = await supabase.from('expense_categories').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('expense_categories').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  expenses: {
    getAll: async () => {
      const { data, error } = await supabase.from('expenses').select('*, expense_categories(name)').order('expense_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('expenses').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('expenses').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  health: {
    getAll: async () => {
      const { data, error } = await supabase.from('health_records').select('*, cattle(tag_number, name)').order('record_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('health_records').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('health_records').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('health_records').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  breeding: {
    getAll: async () => {
      const { data, error } = await supabase.from('breeding_records').select('*, cattle(tag_number, name)').order('breeding_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('breeding_records').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('breeding_records').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('breeding_records').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  inventory: {
    getAll: async () => {
      const { data, error } = await supabase.from('inventory_items').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('inventory_items').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('inventory_items').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  inventoryTransactions: {
    getAll: async () => {
      const { data, error } = await supabase.from('inventory_transactions').select('*, inventory_items(name)').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('inventory_transactions').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  equipment: {
    getAll: async () => {
      const { data, error } = await supabase.from('equipment').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('equipment').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('equipment').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  equipmentMaintenance: {
    getAll: async () => {
      const { data, error } = await supabase.from('equipment_maintenance').select('*, equipment(name)').order('maintenance_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('equipment_maintenance').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  suppliers: {
    getAll: async () => {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('suppliers').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('suppliers').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  purchaseOrders: {
    getAll: async () => {
      const { data, error } = await supabase.from('purchase_orders').select('*, suppliers(name)').order('order_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('purchase_orders').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('purchase_orders').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  vendors: {
    getAll: async () => {
      const { data, error } = await supabase.from('milk_vendors').select('*').order('name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('milk_vendors').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('milk_vendors').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('milk_vendors').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  vendorPayments: {
    getAll: async () => {
      const { data, error } = await supabase.from('vendor_payments').select('*, milk_vendors(name)').order('payment_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('vendor_payments').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    createBulk: async (data: any[]) => {
      const { data: result, error } = await supabase.from('vendor_payments').insert(data).select();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  procurement: {
    getAll: async () => {
      const { data, error } = await supabase.from('milk_procurement').select('*, milk_vendors(name)').order('procurement_date', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('milk_procurement').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      const { data: result, error } = await supabase.from('milk_procurement').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('milk_procurement').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  profiles: {
    getAll: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      if (data.pin) {
        data.pin_hash = await hashPin(data.pin);
        delete data.pin;
      }
      const { data: result, error } = await supabase.from('profiles').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    update: async (id: string, data: any) => {
      if (data.pin) {
        data.pin_hash = await hashPin(data.pin);
        delete data.pin;
      }
      const { data: result, error } = await supabase.from('profiles').update(data).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return { success: true };
    }
  },

  settings: {
    getAll: async () => {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
    get: async (key: string) => {
      const { data, error } = await supabase.from('settings').select('*').eq('key', key).single();
      if (error) throw new Error(error.message);
      return data;
    },
    upsert: async (key: string, value: any, description?: string) => {
      const { data, error } = await supabase.from('settings').upsert({ key, value, description }).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
  },

  auditLogs: {
    getAll: async () => {
      const { data, error } = await supabase.from('audit_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(100);
      if (error) throw new Error(error.message);
      return data;
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase.from('audit_logs').insert(data).select().single();
      if (error) throw new Error(error.message);
      return result;
    }
  },

  seedDemoData: async () => {
    const results: { module: string; success: boolean; count: number; error?: string }[] = [];

    try {
      const { data: cattleData, error: cattleError } = await supabase.from('cattle').insert([
        { tag_number: 'COW-D01', name: 'Lakshmi', breed: 'Gir', date_of_birth: '2020-03-15', gender: 'female', category: 'milking', status: 'active', weight_kg: 450, purchase_price: 85000, notes: 'High milk yield cow' },
        { tag_number: 'COW-D02', name: 'Ganga', breed: 'Sahiwal', date_of_birth: '2019-08-22', gender: 'female', category: 'milking', status: 'active', weight_kg: 420, purchase_price: 75000, notes: 'Excellent fat content' },
        { tag_number: 'COW-D03', name: 'Kamadhenu', breed: 'Gir', date_of_birth: '2021-01-10', gender: 'female', category: 'milking', status: 'active', weight_kg: 380, purchase_price: 90000, notes: 'Premium quality milk' },
        { tag_number: 'COW-D04', name: 'Nandini', breed: 'HF Cross', date_of_birth: '2020-06-05', gender: 'female', category: 'milking', status: 'active', weight_kg: 500, purchase_price: 65000, notes: 'Good health record' },
        { tag_number: 'COW-D05', name: 'Surabhi', breed: 'Sahiwal', date_of_birth: '2022-02-18', gender: 'female', category: 'heifer', status: 'active', weight_kg: 280, purchase_price: 55000, notes: 'Ready for first calving' },
      ]).select();
      results.push({ module: 'Cattle', success: !cattleError, count: cattleData?.length || 0, error: cattleError?.message });
    } catch (e: any) {
      results.push({ module: 'Cattle', success: false, count: 0, error: e.message });
    }

    try {
      const { data: productsData, error: productsError } = await supabase.from('products').insert([
        { name: 'Fresh Cow Milk', sku: 'MILK-D01', category: 'raw_milk', unit: 'liters', price_per_unit: 60, cost_per_unit: 45, stock_quantity: 500, min_stock_level: 100, description: 'Fresh raw cow milk - daily collection', is_active: true },
        { name: 'Pasteurized Milk', sku: 'MILK-D02', category: 'pasteurized_milk', unit: 'liters', price_per_unit: 65, cost_per_unit: 50, stock_quantity: 200, min_stock_level: 50, description: 'Pasteurized and packaged milk', is_active: true },
        { name: 'Fresh Curd', sku: 'CURD-D01', category: 'curd', unit: 'kg', price_per_unit: 80, cost_per_unit: 55, stock_quantity: 100, min_stock_level: 20, description: 'Homemade fresh curd', is_active: true },
        { name: 'Pure Ghee', sku: 'GHEE-D01', category: 'ghee', unit: 'kg', price_per_unit: 600, cost_per_unit: 450, stock_quantity: 50, min_stock_level: 10, description: 'Pure desi cow ghee', is_active: true },
        { name: 'Fresh Paneer', sku: 'PANR-D01', category: 'paneer', unit: 'kg', price_per_unit: 350, cost_per_unit: 250, stock_quantity: 30, min_stock_level: 5, description: 'Fresh cottage cheese', is_active: true },
      ]).select();
      results.push({ module: 'Products', success: !productsError, count: productsData?.length || 0, error: productsError?.message });
    } catch (e: any) {
      results.push({ module: 'Products', success: false, count: 0, error: e.message });
    }

    try {
      const { data: routesData, error: routesError } = await supabase.from('routes').insert([
        { name: 'Gomti Nagar Route', code: 'R-D01', description: 'Gomti Nagar and surrounding areas', area: 'Gomti Nagar, Vikas Nagar', vehicle_number: 'UP32-AB-1234', estimated_time_minutes: 120, total_customers: 45, is_active: true },
        { name: 'Hazratganj Route', code: 'R-D02', description: 'Central Lucknow commercial area', area: 'Hazratganj, Aminabad', vehicle_number: 'UP32-CD-5678', estimated_time_minutes: 90, total_customers: 35, is_active: true },
        { name: 'Indira Nagar Route', code: 'R-D03', description: 'Indira Nagar residential area', area: 'Indira Nagar, Faizabad Road', vehicle_number: 'UP32-EF-9012', estimated_time_minutes: 100, total_customers: 40, is_active: true },
      ]).select();
      results.push({ module: 'Routes', success: !routesError, count: routesData?.length || 0, error: routesError?.message });
    } catch (e: any) {
      results.push({ module: 'Routes', success: false, count: 0, error: e.message });
    }

    try {
      const { data: customersData, error: customersError } = await supabase.from('customers').insert([
        { name: 'Sharma Family', phone: '9876543101', email: 'sharma.family@email.com', customer_type: 'individual', address: '123 Gomti Nagar, Sector 12', city: 'Lucknow', pincode: '226010', delivery_priority: 1, credit_limit: 5000, outstanding_balance: 1200, is_active: true, notes: 'Regular daily delivery - 2L milk' },
        { name: 'Hotel Royal Palace', phone: '9876543102', email: 'royalpalace@hotel.com', customer_type: 'hotel', address: '456 Hazratganj Main Road', city: 'Lucknow', pincode: '226001', delivery_priority: 2, credit_limit: 50000, outstanding_balance: 15000, is_active: true, notes: 'Large hotel - bulk orders' },
        { name: 'Sagar Restaurant', phone: '9876543103', email: 'sagar@restaurant.com', customer_type: 'restaurant', address: '789 Aminabad', city: 'Lucknow', pincode: '226018', delivery_priority: 1, credit_limit: 20000, outstanding_balance: 5500, is_active: true, notes: 'Daily paneer and curd orders' },
        { name: 'Gupta General Store', phone: '9876543104', email: 'guptastore@email.com', customer_type: 'shop', address: '321 Indira Nagar', city: 'Lucknow', pincode: '226016', delivery_priority: 3, credit_limit: 30000, outstanding_balance: 8000, is_active: true, notes: 'Retail store - weekly bulk' },
        { name: 'St. Mary School', phone: '9876543105', email: 'stmary@school.edu', customer_type: 'institution', address: '654 Mahanagar Colony', city: 'Lucknow', pincode: '226006', delivery_priority: 2, credit_limit: 40000, outstanding_balance: 12000, is_active: true, notes: 'School canteen supply' },
      ]).select();
      results.push({ module: 'Customers', success: !customersError, count: customersData?.length || 0, error: customersError?.message });
    } catch (e: any) {
      results.push({ module: 'Customers', success: false, count: 0, error: e.message });
    }

    try {
      const { data: employeesData, error: employeesError } = await supabase.from('employees').insert([
        { employee_code: 'EMP-D01', department: 'Production', designation: 'Farm Supervisor', joining_date: '2022-01-15', salary: 25000, bank_account: '9876543210123456', ifsc_code: 'SBIN0001234', emergency_contact: '9876500001', emergency_name: 'Sita Devi', is_active: true },
        { employee_code: 'EMP-D02', department: 'Delivery', designation: 'Delivery Driver', joining_date: '2022-03-20', salary: 18000, bank_account: '8765432109876543', ifsc_code: 'HDFC0002345', emergency_contact: '9876500002', emergency_name: 'Ram Kumar', is_active: true },
        { employee_code: 'EMP-D03', department: 'Production', designation: 'Milking Staff', joining_date: '2021-08-10', salary: 15000, bank_account: '7654321098765432', ifsc_code: 'ICIC0003456', emergency_contact: '9876500003', emergency_name: 'Geeta Devi', is_active: true },
        { employee_code: 'EMP-D04', department: 'Accounts', designation: 'Accountant', joining_date: '2020-05-01', salary: 30000, bank_account: '6543210987654321', ifsc_code: 'AXIS0004567', emergency_contact: '9876500004', emergency_name: 'Shyam Singh', is_active: true },
      ]).select();
      results.push({ module: 'Employees', success: !employeesError, count: employeesData?.length || 0, error: employeesError?.message });
    } catch (e: any) {
      results.push({ module: 'Employees', success: false, count: 0, error: e.message });
    }

    try {
      const { data: vendorsData, error: vendorsError } = await supabase.from('milk_vendors').insert([
        { name: 'Ramesh Kumar', phone: '9898765101', address: 'Village Bakshi Ka Talab', village: 'Bakshi Ka Talab', bank_account: '1234567890123456', ifsc_code: 'SBIN0001234', cattle_count: 8, is_active: true },
        { name: 'Suresh Yadav', phone: '9898765102', address: 'Village Mohanlalganj', village: 'Mohanlalganj', bank_account: '2345678901234567', ifsc_code: 'PUNB0002345', cattle_count: 12, is_active: true },
        { name: 'Mahesh Singh', phone: '9898765103', address: 'Village Malihabad', village: 'Malihabad', bank_account: '3456789012345678', ifsc_code: 'HDFC0003456', cattle_count: 6, is_active: true },
      ]).select();
      results.push({ module: 'Milk Vendors', success: !vendorsError, count: vendorsData?.length || 0, error: vendorsError?.message });
    } catch (e: any) {
      results.push({ module: 'Milk Vendors', success: false, count: 0, error: e.message });
    }

    try {
      const { data: inventoryData, error: inventoryError } = await supabase.from('inventory_items').insert([
        { name: 'Cattle Feed Premium', category: 'feed', sku: 'INV-D01', unit: 'bags', quantity: 50, min_stock_level: 20, unit_price: 1500, supplier_name: 'Pashudhan Feeds', storage_location: 'Godown A', is_active: true },
        { name: 'Green Fodder', category: 'feed', sku: 'INV-D02', unit: 'kg', quantity: 500, min_stock_level: 200, unit_price: 15, supplier_name: 'Local Farm', storage_location: 'Open Shed', is_active: true },
        { name: 'Ivermectin Injection', category: 'medicine', sku: 'INV-D03', unit: 'pieces', quantity: 20, min_stock_level: 10, unit_price: 85, supplier_name: 'Vet Pharma', storage_location: 'Medicine Cabinet', is_active: true },
        { name: 'Milk Cans 40L', category: 'equipment', sku: 'INV-D04', unit: 'pieces', quantity: 25, min_stock_level: 10, unit_price: 2500, supplier_name: 'Dairy Equipment Co.', storage_location: 'Equipment Shed', is_active: true },
      ]).select();
      results.push({ module: 'Inventory', success: !inventoryError, count: inventoryData?.length || 0, error: inventoryError?.message });
    } catch (e: any) {
      results.push({ module: 'Inventory', success: false, count: 0, error: e.message });
    }

    try {
      const { data: equipmentData, error: equipmentError } = await supabase.from('equipment').insert([
        { name: 'Automatic Milking Machine', equipment_type: 'Milking Equipment', serial_number: 'AMM-D01', purchase_date: '2022-06-15', purchase_price: 150000, warranty_until: '2025-06-15', status: 'operational', location: 'Milking Parlor', notes: 'DeLaval brand - 4 cluster' },
        { name: 'Milk Chiller 500L', equipment_type: 'Cooling Equipment', serial_number: 'MCH-D01', purchase_date: '2021-09-20', purchase_price: 85000, warranty_until: '2024-09-20', status: 'operational', location: 'Processing Unit', notes: 'Maintains 4C temperature' },
        { name: 'Delivery Van - Tata Ace', equipment_type: 'Vehicle', serial_number: 'VEH-D01', purchase_date: '2022-02-28', purchase_price: 450000, warranty_until: '2025-02-28', status: 'operational', location: 'Vehicle Shed', notes: 'Primary delivery vehicle' },
      ]).select();
      results.push({ module: 'Equipment', success: !equipmentError, count: equipmentData?.length || 0, error: equipmentError?.message });
    } catch (e: any) {
      results.push({ module: 'Equipment', success: false, count: 0, error: e.message });
    }

    try {
      const { data: suppliersData, error: suppliersError } = await supabase.from('suppliers').insert([
        { name: 'Pashudhan Feed Suppliers', contact_person: 'Rakesh Agarwal', phone: '9898123101', email: 'pashudhan@feeds.com', address: 'Industrial Area, Lucknow', gst_number: '09AABCP1234M1Z5', payment_terms: 'Net 30', is_active: true },
        { name: 'Vet Pharma Distributors', contact_person: 'Dr. Sanjay Mishra', phone: '9898123102', email: 'vetpharma@meds.com', address: 'Medical Market, Lucknow', gst_number: '09AABCV5678N2Z6', payment_terms: 'Net 15', is_active: true },
        { name: 'Dairy Equipment Co.', contact_person: 'Vinod Kumar', phone: '9898123103', email: 'dairyequip@mail.com', address: 'UPSIDC Industrial Area', gst_number: '09AABCD9012P3Z7', payment_terms: 'Net 45', is_active: true },
      ]).select();
      results.push({ module: 'Suppliers', success: !suppliersError, count: suppliersData?.length || 0, error: suppliersError?.message });
    } catch (e: any) {
      results.push({ module: 'Suppliers', success: false, count: 0, error: e.message });
    }

    return results;
  }
};
