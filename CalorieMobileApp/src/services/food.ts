import api from './api';
import { IMAGE_ANALYSIS_TIMEOUT } from '../config/constants';

export const analyzeFoodImage = async (imageUri: string, language = 'en') => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  formData.append('image', { uri: imageUri, name: filename, type: 'image/jpeg' } as any);
  formData.append('language', language);

  const { data } = await api.post('/api/food/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: IMAGE_ANALYSIS_TIMEOUT,
  });
  return data;
};

export const logFood = async (foodData: any) => {
  const { data } = await api.post('/api/food/log', foodData);
  return data;
};

export const getFoodLogs = async (date?: string, limit = 50) => {
  const params: any = { limit };
  if (date) params.date = date;
  const { data } = await api.get('/api/food/logs', { params });
  return data;
};

export const deleteFoodLog = async (logId: number) => {
  const { data } = await api.delete(`/api/food/logs/${logId}`);
  return data;
};

export const searchFood = async (query: string) => {
  const { data } = await api.get('/api/search/food', { params: { q: query } });
  return data;
};

export const getSuggestions = async () => {
  const { data } = await api.get('/api/search/suggestions');
  return data;
};

export const saveFood = async (foodData: any) => {
  const { data } = await api.post('/api/food/saved', foodData);
  return data;
};

export const getSavedFoods = async () => {
  const { data } = await api.get('/api/food/saved');
  return data;
};

export const deleteSavedFood = async (id: number) => {
  const { data } = await api.delete(`/api/food/saved/${id}`);
  return data;
};

export const getCustomFoods = async () => {
  const { data } = await api.get('/api/user/custom-foods');
  return data;
};

export const createCustomFood = async (foodData: any) => {
  const { data } = await api.post('/api/food/custom', foodData);
  return data;
};
