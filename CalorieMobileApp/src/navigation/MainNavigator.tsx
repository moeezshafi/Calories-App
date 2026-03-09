import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LogFoodScreen from '../screens/food/LogFoodScreen';
import NutritionDetailScreen from '../screens/food/NutritionDetailScreen';
import CameraCaptureScreen from '../screens/food/CameraCaptureScreen';
import PersonalDetailsScreen from '../screens/profile/PersonalDetailsScreen';
import PreferencesScreen from '../screens/profile/PreferencesScreen';
import TrackingRemindersScreen from '../screens/profile/TrackingRemindersScreen';
import BadgesScreen from '../screens/badges/BadgesScreen';
import ExerciseScreen from '../screens/exercise/ExerciseScreen';
import NutrientInsightsScreen from '../screens/insights/NutrientInsightsScreen';
import MealPlanScreen from '../screens/meals/MealPlanScreen';
import RecipeBuilderScreen from '../screens/recipes/RecipeBuilderScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="LogFood" component={LogFoodScreen} />
      <Stack.Screen name="NutritionDetail" component={NutritionDetailScreen} />
      <Stack.Screen name="CameraCapture" component={CameraCaptureScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="TrackingReminders" component={TrackingRemindersScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Exercise" component={ExerciseScreen} />
      <Stack.Screen name="NutrientInsights" component={NutrientInsightsScreen} />
      <Stack.Screen name="MealPlan" component={MealPlanScreen} />
      <Stack.Screen name="RecipeBuilder" component={RecipeBuilderScreen} />
    </Stack.Navigator>
  );
}
