import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors, darkColors } from './colors';
import { useAppStore } from '../store/appStore';

type ThemeColors = typeof colors;

const ThemeContext = createContext<ThemeColors>(colors);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);
  const systemScheme = useColorScheme();

  const activeColors = useMemo(() => {
    if (theme === 'dark') return darkColors;
    if (theme === 'light') return colors;
    // system
    return systemScheme === 'dark' ? darkColors : colors;
  }, [theme, systemScheme]);

  return (
    <ThemeContext.Provider value={activeColors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext);
}

/**
 * Returns true when the active theme is dark.
 * Handy for StatusBar barStyle and similar one-off checks.
 */
export function useIsDarkTheme(): boolean {
  const theme = useAppStore((state) => state.theme);
  const systemScheme = useColorScheme();

  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return systemScheme === 'dark';
}
