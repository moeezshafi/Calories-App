import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import { ThemeProvider, useThemeColors, useIsDarkTheme } from './src/theme/ThemeContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import { checkServerHealth } from './src/services/healthCheck';
import { API_URL } from './src/config/constants';
import './src/i18n';

function AppContent() {
  const { isAuthenticated, isLoading, loadAuth, user } = useAuthStore();
  const [serverStatus, setServerStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  useEffect(() => {
    const init = async () => {
      // Check server health first
      const isHealthy = await checkServerHealth();
      setServerStatus(isHealthy ? 'healthy' : 'unhealthy');
      
      // Load auth regardless of server status
      await loadAuth();
    };
    
    init();
  }, []);

  if (isLoading || serverStatus === 'checking') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.apiText}>API: {API_URL}</Text>
        {serverStatus === 'unhealthy' && (
          <Text style={styles.errorText}>Server unreachable</Text>
        )}
      </View>
    );
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  apiText: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 10,
  },
});

