import api from './api';

export interface MealPlanEntry {
  id?: number;
  user_id?: number;
  plan_date?: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at?: string;
}

export interface MealPlanDay {
  date: string;
  meals: MealPlanEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface MealPlanTemplate {
  id: number;
  user_id: number;
  name: string;
  meals: MealPlanEntry[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at: string;
}

export const createMealPlan = async (date: string, meals: MealPlanEntry[]) => {
  const { data } = await api.post('/api/meal-plans/', { date, meals });
  return data;
};

export const getMealPlans = async (startDate?: string, endDate?: string) => {
  const params: any = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const { data } = await api.get('/api/meal-plans/', { params });
  return data;
};

export const deleteMealPlanEntry = async (entryId: number) => {
  const { data } = await api.delete(`/api/meal-plans/${entryId}`);
  return data;
};

export const getTemplates = async () => {
  const { data } = await api.get('/api/meal-plans/templates');
  return data;
};

export const saveTemplate = async (name: string, date: string) => {
  const { data } = await api.post('/api/meal-plans/templates', { name, date });
  return data;
};
