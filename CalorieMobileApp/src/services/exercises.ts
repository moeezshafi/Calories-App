import api from './api';

export const logExercise = async (exerciseData: {
  exercise_type: string;
  duration_minutes: number;
  calories_burned: number;
  date?: string;
}) => {
  const { data } = await api.post('/api/exercises/log', exerciseData);
  return data;
};

export const getExerciseLogs = async (date: string) => {
  const { data } = await api.get('/api/exercises/logs', { params: { date } });
  return data;
};

export const getDailyExerciseTotal = async (date: string) => {
  // The /logs endpoint returns total_calories_burned in the response
  const { data } = await api.get('/api/exercises/logs', { params: { date } });
  return {
    total_calories_burned: data?.data?.total_calories_burned || 0,
    total_duration_minutes: data?.data?.total_duration_minutes || 0,
    count: data?.data?.count || 0,
  };
};

export const deleteExerciseLog = async (id: number) => {
  const { data } = await api.delete(`/api/exercises/${id}`);
  return data;
};
