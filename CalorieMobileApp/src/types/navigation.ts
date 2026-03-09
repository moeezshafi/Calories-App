export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  AddPlaceholder: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  LogFood: undefined;
  NutritionDetail: { analysis?: any; imageUri?: string; fromScan?: boolean };
  SelectedFood: { food: any };
  CameraCapture: undefined;
  PersonalDetails: undefined;
  Preferences: undefined;
  TrackingReminders: undefined;
};
