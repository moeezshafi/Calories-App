import { Platform } from 'react-native';

// Production backend URL (Hetzner server)
const PRODUCTION_API_URL = 'http://46.62.254.185';

const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000',      // Android emulator
  default: 'http://192.168.100.47:5000', // iOS / physical devices
});

// Force production URL for release builds
export const API_URL = PRODUCTION_API_URL;

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealType = typeof MEAL_TYPES[number];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly Active' },
  { value: 'moderate', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
  { value: 'extra_active', label: 'Extra Active' },
] as const;

export const GOAL_TYPES = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'gain_weight', label: 'Gain Weight' },
] as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

export const DEFAULT_CALORIE_GOAL = 2000;
export const DEFAULT_STEP_GOAL = 10000;
export const IMAGE_ANALYSIS_TIMEOUT = 120000;
