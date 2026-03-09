import api from './api';

export const getDailyAnalytics = async (date: string) => {
  const { data } = await api.get(`/api/analytics/daily/${date}`);
  return data;
};

export const getWeeklyAnalytics = async (startDate?: string) => {
  const params = startDate ? { start_date: startDate } : {};
  const { data } = await api.get('/api/analytics/weekly', { params });
  return data;
};

export const getMonthlyAnalytics = async (month?: string) => {
  const params = month ? { month } : {};
  const { data } = await api.get('/api/analytics/monthly', { params });
  return data;
};

export const getStreak = async () => {
  const { data } = await api.get('/api/analytics/streak');
  return data;
};

export const getBMI = async () => {
  const { data } = await api.get('/api/analytics/bmi');
  return data;
};

export const getProgress = async (period = 30) => {
  const { data } = await api.get('/api/analytics/progress', { params: { period } });
  return data;
};

export const getSummary = async () => {
  const { data } = await api.get('/api/analytics/summary');
  return data;
};

export const getAIInsights = async (date: string) => {
  const { data } = await api.get(`/api/analytics/ai-insights/${date}`);
  return data;
};
