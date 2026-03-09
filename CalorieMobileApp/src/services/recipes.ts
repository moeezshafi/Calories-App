import api from './api';

export interface RecipeIngredient {
  id?: number;
  recipe_id?: number;
  food_name: string;
  amount?: string;
  amount_g?: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Recipe {
  id?: number;
  user_id?: number;
  name: string;
  servings: number;
  notes?: string;
  ingredients: RecipeIngredient[];
  total_nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  per_serving?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  created_at?: string;
  updated_at?: string;
}

export const createRecipe = async (recipe: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  const { data } = await api.post('/api/recipes/', recipe);
  return data;
};

export const getRecipes = async () => {
  const { data } = await api.get('/api/recipes/');
  return data;
};

export const getRecipe = async (recipeId: number) => {
  const { data } = await api.get(`/api/recipes/${recipeId}`);
  return data;
};

export const updateRecipe = async (recipeId: number, recipe: Partial<Recipe>) => {
  const { data } = await api.put(`/api/recipes/${recipeId}`, recipe);
  return data;
};

export const deleteRecipe = async (recipeId: number) => {
  const { data } = await api.delete(`/api/recipes/${recipeId}`);
  return data;
};
