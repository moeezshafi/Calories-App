import api from './api';

export const logWeight = async (weight_kg: number, notes?: string) => {
  const { data } = await api.post('/api/weight/log', { weight_kg, notes });
  return data;
};

export const getWeightLogs = async (period = 30) => {
  const { data } = await api.get('/api/weight/logs', { params: { period } });
  return data;
};

export const getLatestWeight = async () => {
  const { data } = await api.get('/api/weight/latest');
  return data;
};

export const getWeightProgress = async () => {
  const { data } = await api.get('/api/weight/progress');
  return data;
};
