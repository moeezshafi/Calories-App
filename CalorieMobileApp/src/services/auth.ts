import api from './api';
import { User } from '../types/user';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data.data || data;
};

export const register = async (userData: any) => {
  const { data } = await api.post('/api/auth/register', userData);
  return data.data || data;
};

export const getProfile = async (token?: string) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const { data } = await api.get('/api/user/profile', config);
  const profile = data.data?.user || data.data?.profile || data.user || data;
  return profile as User;
};

export const updateProfile = async (userData: Partial<User>) => {
  const { data } = await api.put('/api/user/profile', userData);
  return data.data?.user || data.user || data;
};

export const completeOnboarding = async (onboardingData: any) => {
  const { data } = await api.post('/api/auth/complete-onboarding', onboardingData);
  return data.data || data;
};

export const getRecommendations = async () => {
  const { data } = await api.get('/api/user/recommendations');
  return data.data || data;
};
