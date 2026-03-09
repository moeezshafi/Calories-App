import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingGoalScreen from '../screens/onboarding/OnboardingGoalScreen';
import OnboardingGenderScreen from '../screens/onboarding/OnboardingGenderScreen';
import OnboardingAgeScreen from '../screens/onboarding/OnboardingAgeScreen';
import OnboardingHeightScreen from '../screens/onboarding/OnboardingHeightScreen';
import OnboardingWeightScreen from '../screens/onboarding/OnboardingWeightScreen';
import OnboardingTargetWeightScreen from '../screens/onboarding/OnboardingTargetWeightScreen';
import OnboardingActivityScreen from '../screens/onboarding/OnboardingActivityScreen';
import OnboardingDietScreen from '../screens/onboarding/OnboardingDietScreen';
import OnboardingWorkoutScreen from '../screens/onboarding/OnboardingWorkoutScreen';
import OnboardingSummaryScreen from '../screens/onboarding/OnboardingSummaryScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
      <Stack.Screen name="OnboardingGender" component={OnboardingGenderScreen} />
      <Stack.Screen name="OnboardingAge" component={OnboardingAgeScreen} />
      <Stack.Screen name="OnboardingHeight" component={OnboardingHeightScreen} />
      <Stack.Screen name="OnboardingWeight" component={OnboardingWeightScreen} />
      <Stack.Screen name="OnboardingTargetWeight" component={OnboardingTargetWeightScreen} />
      <Stack.Screen name="OnboardingActivity" component={OnboardingActivityScreen} />
      <Stack.Screen name="OnboardingDiet" component={OnboardingDietScreen} />
      <Stack.Screen name="OnboardingWorkout" component={OnboardingWorkoutScreen} />
      <Stack.Screen name="OnboardingSummary" component={OnboardingSummaryScreen} />
    </Stack.Navigator>
  );
}
