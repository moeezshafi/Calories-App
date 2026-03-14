import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { ThemeProvider, useThemeColors, useIsDarkTheme } from './src/theme/ThemeContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import './src/i18n';

function AppContent() {
  const { isAuthenticated, isLoading, loadAuth, user } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  if (!user?.onboarding_completed) {
    return <OnboardingNavigator />;
  }

  return <MainNavigator />;
}

function ThemedStatusBar() {
  const isDark = useIsDarkTheme();
  const themeColors = useThemeColors();
  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={themeColors.background}
    />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <ThemedStatusBar />
            <AppContent />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

