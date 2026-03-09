export interface FoodLog {
  id: number;
  food_name: string;
  brand?: string;
  serving_size: number;
  servings_consumed: number;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  sugars: number;
  meal_type: string;
  confidence_score?: number;
  total_calories: number;
  total_nutrients: NutritionTotals;
  image_path?: string;
  consumed_at: string;
  created_at: string;
}

export interface NutritionTotals {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  sugars: number;
}

export interface FoodAnalysis {
  labels: string[];
  food_name: string;
  breakdown: { name: string; calories: number }[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  health_score: number;
  health_score_reasons: string[];
  ingredients: string[];
  serving_count: number;
  confidence: number;
  is_food: boolean;
}

export interface SavedFood {
  id: number;
  food_name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  sugars?: number;
  serving_size?: number;
  health_score?: number;
  created_at: string;
}

export interface WaterLog {
  id: number;
  amount_ml: number;
  logged_at: string;
}

export interface WeightLog {
  id: number;
  weight_kg: number;
  notes?: string;
  logged_at: string;
}

export interface StepLog {
  id: number;
  steps: number;
  calories_burned: number;
  logged_at: string;
  source: string;
}

export interface DailyAnalytics {
  date: string;
  calorie_progress: {
    consumed: number;
    goal: number;
    remaining: number;
    percentage: number;
  };
  totals: NutritionTotals;
  macro_breakdown: {
    proteins: { grams: number; calories: number; percentage: number };
    carbs: { grams: number; calories: number; percentage: number };
    fats: { grams: number; calories: number; percentage: number };
  };
  meal_breakdown: Record<string, { calories: number; count: number; foods: string[] }>;
  food_count: number;
}
