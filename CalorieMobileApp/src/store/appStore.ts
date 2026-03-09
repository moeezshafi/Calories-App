import { create } from 'zustand';

interface AppState {
  theme: 'system' | 'light' | 'dark';
  language: 'en' | 'ar';
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setLanguage: (language: 'en' | 'ar') => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  language: 'en',
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));
