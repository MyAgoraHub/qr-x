import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types/actionHub';
import { actionHubApi } from '../services/api';

const AUTH_TOKEN_KEY = '@qrx_action_hub_token';
const AUTH_USER_KEY = '@qrx_action_hub_user';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  // Load stored auth on mount
  useEffect(() => {
    console.log('[AuthContext] Mounting, loading stored auth...');
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    console.log('[AuthContext] loadStoredAuth started');
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);

      console.log('[AuthContext] Stored token exists:', !!token);
      console.log('[AuthContext] Stored user exists:', !!userJson);

      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        actionHubApi.setToken(token);
        
        // Verify token is still valid
        console.log('[AuthContext] Verifying stored token...');
        try {
          const response = await actionHubApi.getMe();
          console.log('[AuthContext] Token valid, user:', response.user.email);
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: response.user,
            token,
          });
        } catch (error: any) {
          // Token invalid, clear storage
          console.log('[AuthContext] Token invalid:', error.message);
          await clearStorage();
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
          });
        }
      } else {
        console.log('[AuthContext] No stored auth, showing login');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[AuthContext] Error loading auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const clearStorage = async () => {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
    actionHubApi.setToken(null);
  };

  const saveAuth = async (token: string, user: User) => {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    actionHubApi.setToken(token);
  };

  const login = useCallback(async (email: string, password: string) => {
    console.log('[AuthContext] Login attempt for:', email);
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await actionHubApi.login(email, password);
      console.log('[AuthContext] Login successful');
      await saveAuth(response.token, response.user);
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        token: response.token,
      });
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error.message);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    console.log('[AuthContext] Register attempt for:', email, username);
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await actionHubApi.register(email, username, password);
      console.log('[AuthContext] Registration successful');
      await saveAuth(response.token, response.user);
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        token: response.token,
      });
    } catch (error: any) {
      console.error('[AuthContext] Registration failed:', error.message);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await clearStorage();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.token) return;
    
    try {
      const response = await actionHubApi.getMe();
      setState(prev => ({ ...prev, user: response.user }));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
