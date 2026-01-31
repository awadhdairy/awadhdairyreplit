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
  const data = encoder.encode(salt + pin);
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
      const { data, error } = await supabase.from('deliveries').select('*, customers(name), routes(name)').order('delivery_date', { ascending: false });
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
      const { data, error } = await supabase.from('employees').select('*').order('name');
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
  }
};
