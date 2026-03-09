import api from './api';

export const getPreferences = async () => {
  const { data } = await api.get('/api/preferences/');
  return data;
};

export const updatePreferences = async (prefs: any) => {
  const { data } = await api.put('/api/preferences/', prefs);
  return data;
};

export const getReminders = async () => {
  const { data } = await api.get('/api/preferences/reminders');
  return data;
};

export const updateReminders = async (reminders: any[]) => {
  const { data } = await api.put('/api/preferences/reminders', { reminders });
  return data;
};
