import api from './api';

export const logSteps = async (steps: number, calories_burned?: number) => {
  const { data } = await api.post('/api/steps/log', { steps, calories_burned });
  return data;
};

export const getStepLogs = async (date: string) => {
  const { data } = await api.get('/api/steps/logs', { params: { date } });
  return data;
};

export const getDailyStepTotal = async (date: string) => {
  const { data } = await api.get('/api/steps/daily-total', { params: { date } });
  return data;
};
