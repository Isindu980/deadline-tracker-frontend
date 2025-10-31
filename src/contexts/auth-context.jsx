'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        // Get user profile
        const result = await authService.getProfile();
        if (result.success) {
          setUser(result.user);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.login({ email, password });
      
      if (result.success) {
        // Store token
        localStorage.setItem('token', result.token);
        setToken(result.token);
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      
      if (result.success) {
        // Store token
        localStorage.setItem('token', result.token);
        setToken(result.token);
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      // Only call if we have a token
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      // Ignore 401 errors on logout as token might already be expired
      if (error.response?.status !== 401) {
        console.error('Logout error:', error);
      }
    } finally {
      // Clear local state regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
      setToken(null);
      setUser(null);
      router.push('/');
    }
  };

  const getProfile = async () => {
    try {
      const result = await authService.getProfile();
      if (result.success) {
        setUser(result.user);
        return result.user;
      } else {
        // Profile fetch failed, token might be invalid
        logout();
        return null;
      }
    } catch (error) {
      console.error('Get profile error:', error);
      logout();
      return null;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const result = await authService.changePassword({
        currentPassword: oldPassword,
        newPassword
      });
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Password change failed'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    setUser,
    setToken,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}