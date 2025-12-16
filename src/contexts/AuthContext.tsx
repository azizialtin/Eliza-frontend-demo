import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, User, setAuthToken, getAuthToken, setStoredUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, display_name: string, role: "STUDENT" | "PARENT") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        // Decode to check expiration before even trying
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000;
          if (Date.now() >= exp) {
            console.warn("Token expired, clearing session");
            setAuthToken(null);
            setUser(null);
            setStoredUser(null);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Invalid token format", e);
          setAuthToken(null);
          setUser(null);
          setStoredUser(null);
          setLoading(false);
          return;
        }

        try {
          const currentUser = apiClient.getCurrentUser();
          setUser(currentUser);
          // User is already stored in localStorage by getCurrentUser(), but ensure it's set
          if (currentUser) {
            setStoredUser(currentUser);
          }
        } catch (error) {
          console.warn('Failed to fetch user, checks failed:', error);
          // If 401, we should clear. `apiClient` throws "API Error: Unauthorized"
          if (error instanceof Error && (error.message.includes("Unauthorized") || error.message.includes("401"))) {
            setAuthToken(null);
            setUser(null);
            setStoredUser(null);
          } else {
            // Fallback decode if it was just a network error? No, if API fails we shouldn't trust the session fully?
            // Actually, if network error (offline), we might want to persist user.
            // But here we had a 401.
            // We can try decoding as fallback only if NOT 401.
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // Safety timeout: stop loading after 5 seconds even if API hangs
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    setAuthToken(response.access_token);
    if (response.user) {
      setUser(response.user);
      setStoredUser(response.user);
    } else {
      // Try to fetch user separately if not in login response
      try {
        const currentUser = apiClient.getCurrentUser();
        setUser(currentUser);
        setStoredUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
        // Set a minimal user object from token if possible
        setUser(null);
        setStoredUser(null);
      }
    }
  };

  const register = async (email: string, password: string, display_name: string, role: "STUDENT" | "PARENT") => {
    await apiClient.register({ email, password, display_name, role });
    // Auto-login after registration
    await login(email, password);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setStoredUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
