import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, getStoredSession, storeSession, clearSession, getStoredUser } from '@/lib/supabase';
import type { Profile, LoginResponse } from '@shared/types';

const DEMO_USERS: Record<string, { pin: string; user: Profile }> = {
  "7897716792": {
    pin: "101101",
    user: {
      id: "admin-awadh-dairy",
      full_name: "Awadh Dairy Admin",
      phone: "7897716792",
      role: "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  "9876543210": {
    pin: "123456",
    user: {
      id: "demo-admin-1",
      full_name: "Admin User",
      phone: "9876543210",
      role: "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  "9876543211": {
    pin: "123456",
    user: {
      id: "demo-manager-1",
      full_name: "Priya Sharma",
      phone: "9876543211",
      role: "manager",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  "9876543212": {
    pin: "123456",
    user: {
      id: "demo-delivery-1",
      full_name: "Ramesh Kumar",
      phone: "9876543212",
      role: "delivery_staff",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
};

interface AuthContextType {
  user: Profile | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, pin: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const token = getStoredSession();
    const storedUser = getStoredUser();
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (token.startsWith('demo-')) {
      setSessionToken(token);
      setUser(storedUser);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('validate_session', {
        _session_token: token
      });

      if (error || !data?.success) {
        clearSession();
        setUser(null);
        setSessionToken(null);
      } else {
        setSessionToken(token);
        setUser(storedUser || data.user);
      }
    } catch (err) {
      if (storedUser) {
        setSessionToken(token);
        setUser(storedUser);
      } else {
        clearSession();
        setUser(null);
        setSessionToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (phone: string, pin: string): Promise<LoginResponse> => {
    const demoUser = DEMO_USERS[phone];
    if (demoUser && demoUser.pin === pin) {
      const demoToken = `demo-${Date.now()}`;
      storeSession(demoToken, demoUser.user);
      setSessionToken(demoToken);
      setUser(demoUser.user);
      return { success: true, session_token: demoToken, user: demoUser.user };
    }

    try {
      const { data, error } = await supabase.rpc('staff_login', {
        _phone: phone,
        _pin: pin
      });

      if (error) {
        if (error.message.includes('Could not find the function') || error.code === 'PGRST202') {
          return { success: false, message: 'Backend not configured. Use demo credentials: Phone 9876543210, PIN 123456' };
        }
        return { success: false, message: error.message };
      }

      if (!data?.success) {
        return { success: false, message: data?.message || 'Login failed' };
      }

      storeSession(data.session_token, data.user);
      setSessionToken(data.session_token);
      setUser(data.user);

      return {
        success: true,
        session_token: data.session_token,
        user: data.user
      };
    } catch (err: any) {
      return { success: false, message: 'Backend unavailable. Use demo: Phone 9876543210, PIN 123456' };
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await supabase.rpc('logout_session', { _session_token: sessionToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      setUser(null);
      setSessionToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    sessionToken,
    isLoading,
    isAuthenticated: !!user && !!sessionToken,
    login,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
