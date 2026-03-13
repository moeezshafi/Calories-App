import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import * as authService from '../services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const user = await authService.getProfile(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // Token is invalid or server is unreachable, clear it
          console.log('Failed to load profile, clearing token:', error);
          await AsyncStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('Error in loadAuth:', error);
      await AsyncStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const { access_token, user } = await authService.login(email, password);
    await AsyncStorage.setItem('token', access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  register: async (data) => {
    const { access_token, user } = await authService.register(data);
    await AsyncStorage.setItem('token', access_token);
    set({ user, token: access_token, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...data } });
    }
  },
}));
