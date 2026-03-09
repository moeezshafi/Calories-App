export interface User {
  id: number;
  email: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  activity_level?: string;
  goal_type?: string;
  daily_calorie_goal?: number;
  target_weight?: number;
  diet_type?: string;
  workout_frequency?: string;
  onboarding_completed?: boolean;
  created_at?: string;
}

export interface UserPreference {
  id: number;
  theme: 'system' | 'light' | 'dark';
  language: 'en' | 'ar';
  badge_celebrations: boolean;
  live_activity: boolean;
  add_burned_calories: boolean;
  rollover_calories: boolean;
  auto_adjust_macros: boolean;
  protein_goal_g?: number;
  carbs_goal_g?: number;
  fat_goal_g?: number;
  daily_step_goal: number;
  goal_weight_kg?: number;
  date_of_birth?: string;
}

export interface MealReminder {
  id: number;
  meal_type: string;
  reminder_time: string;
  enabled: boolean;
}
