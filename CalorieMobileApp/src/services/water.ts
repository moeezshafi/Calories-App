import api from './api';

export const logWater = async (amount_ml: number) => {
  const { data } = await api.post('/api/water/log', { amount_ml });
  return data;
};

export const getWaterLogs = async (date: string) => {
  const { data } = await api.get('/api/water/logs', { params: { date } });
  return data;
};

export const getDailyWaterTotal = async (date: string) => {
  const { data } = await api.get('/api/water/daily-total', { params: { date } });
  return data;
};

export const deleteWaterLog = async (id: number) => {
  const { data } = await api.delete(`/api/water/logs/${id}`);
  return data;
};
