import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getStoredSession, storeSession, clearSession, getStoredUser } from '@/lib/supabase';
import type { LoginResponse } from '@shared/types';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  email?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, pin: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const token = getStoredSession();
    const storedUser = getStoredUser();
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await api.auth.validate(token);
      if (!result.success) {
        clearSession();
        setUser(null);
        setSessionToken(null);
      } else {
        setSessionToken(token);
        setUser(storedUser || result.user);
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
    try {
      const result = await api.auth.login(phone, pin);

      if (!result.success) {
        return { success: false, message: 'Login failed' };
      }

      const userProfile: UserProfile = {
        id: result.user.id,
        full_name: result.user.full_name,
        phone: result.user.phone,
        role: result.user.role,
        is_active: result.user.is_active,
      };

      storeSession(result.session_token, userProfile);
      setSessionToken(result.session_token);
      setUser(userProfile);

      return {
        success: true,
        session_token: result.session_token,
        user: userProfile as any
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await api.auth.logout(sessionToken);
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
