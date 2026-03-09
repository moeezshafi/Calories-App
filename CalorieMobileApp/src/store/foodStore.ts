import { create } from 'zustand';
import { FoodAnalysis } from '../types/food';

interface FoodState {
  currentAnalysis: FoodAnalysis | null;
  currentImageUri: string | null;
  setAnalysis: (analysis: FoodAnalysis, imageUri?: string) => void;
  clearAnalysis: () => void;
}

export const useFoodStore = create<FoodState>((set) => ({
  currentAnalysis: null,
  currentImageUri: null,
  setAnalysis: (analysis, imageUri) => set({ currentAnalysis: analysis, currentImageUri: imageUri || null }),
  clearAnalysis: () => set({ currentAnalysis: null, currentImageUri: null }),
}));
