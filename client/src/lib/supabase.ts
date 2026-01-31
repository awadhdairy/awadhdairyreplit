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

async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  auth: {
    login: (phone: string, pin: string) => 
      apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, pin }) }),
    validate: (session_token: string) => 
      apiRequest('/api/auth/validate', { method: 'POST', body: JSON.stringify({ session_token }) }),
    logout: (session_token: string) => 
      apiRequest('/api/auth/logout', { method: 'POST', body: JSON.stringify({ session_token }) }),
  },
  cattle: {
    getAll: () => apiRequest('/api/cattle'),
    create: (data: any) => apiRequest('/api/cattle', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/api/cattle/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/api/cattle/${id}`, { method: 'DELETE' }),
  },
  production: {
    getAll: () => apiRequest('/api/production'),
    create: (data: any) => apiRequest('/api/production', { method: 'POST', body: JSON.stringify(data) }),
  },
  customers: {
    getAll: () => apiRequest('/api/customers'),
    create: (data: any) => apiRequest('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/api/customers/${id}`, { method: 'DELETE' }),
  },
  products: {
    getAll: () => apiRequest('/api/products'),
    create: (data: any) => apiRequest('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  },
  routes: {
    getAll: () => apiRequest('/api/routes'),
    create: (data: any) => apiRequest('/api/routes', { method: 'POST', body: JSON.stringify(data) }),
  },
  deliveries: {
    getAll: () => apiRequest('/api/deliveries'),
    create: (data: any) => apiRequest('/api/deliveries', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/api/deliveries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  invoices: {
    getAll: () => apiRequest('/api/invoices'),
    create: (data: any) => apiRequest('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  employees: {
    getAll: () => apiRequest('/api/employees'),
    create: (data: any) => apiRequest('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  },
  expenses: {
    getAll: () => apiRequest('/api/expenses'),
    create: (data: any) => apiRequest('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/api/expenses/${id}`, { method: 'DELETE' }),
  },
  health: {
    getAll: () => apiRequest('/api/health'),
    create: (data: any) => apiRequest('/api/health', { method: 'POST', body: JSON.stringify(data) }),
  },
  breeding: {
    getAll: () => apiRequest('/api/breeding'),
    create: (data: any) => apiRequest('/api/breeding', { method: 'POST', body: JSON.stringify(data) }),
  },
  inventory: {
    getAll: () => apiRequest('/api/inventory'),
    create: (data: any) => apiRequest('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
  },
  equipment: {
    getAll: () => apiRequest('/api/equipment'),
    create: (data: any) => apiRequest('/api/equipment', { method: 'POST', body: JSON.stringify(data) }),
  },
  vendors: {
    getAll: () => apiRequest('/api/vendors'),
    create: (data: any) => apiRequest('/api/vendors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/api/vendors/${id}`, { method: 'DELETE' }),
  },
  vendorPayments: {
    getAll: () => apiRequest('/api/vendor-payments'),
    create: (data: any) => apiRequest('/api/vendor-payments', { method: 'POST', body: JSON.stringify(data) }),
    createBulk: (data: any[]) => apiRequest('/api/vendor-payments/bulk', { method: 'POST', body: JSON.stringify(data) }),
  },
  procurement: {
    getAll: () => apiRequest('/api/procurement'),
    create: (data: any) => apiRequest('/api/procurement', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/api/procurement/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/api/procurement/${id}`, { method: 'DELETE' }),
  },
};
