# Mobile Application Documentation

## Overview

The Calorie Tracker mobile application is built with React Native and Expo, providing a cross-platform solution for iOS and Android devices. The app offers an intuitive interface for tracking nutrition, monitoring progress, and achieving health goals.

## Technology Stack

### Core Technologies
- **React Native**: 0.74.5
- **Expo SDK**: 51.0.28
- **TypeScript**: 5.3.3
- **React Navigation**: 6.x

### Key Libraries
- **UI Components**: Custom component library
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Image Handling**: expo-image-picker, expo-camera
- **Notifications**: expo-notifications
- **Storage**: AsyncStorage
- **Charts**: react-native-chart-kit
- **Internationalization**: i18next

## Application Structure

```
CalorieMobileApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components
│   │   ├── food/            # Food-related components
│   │   ├── home/            # Home screen components
│   │   ├── nutrition/       # Nutrition components
│   │   └── progress/        # Progress tracking components
│   │
│   ├── screens/             # Application screens
│   │   ├── auth/            # Authentication screens
│   │   ├── onboarding/      # Onboarding flow
│   │   ├── home/            # Main dashboard
│   │   ├── food/            # Food logging
│   │   ├── progress/        # Progress tracking
│   │   ├── profile/         # User profile
│   │   ├── meals/           # Meal planning
│   │   ├── recipes/         # Recipe management
│   │   ├── exercise/        # Exercise tracking
│   │   ├── badges/          # Achievements
│   │   ├── insights/        # Analytics
│   │   └── groups/          # Social features (planned)
│   │
│   ├── navigation/          # Navigation configuration
│   │   ├── AuthNavigator.tsx
│   │   ├── OnboardingNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   ├── services/            # API service layer
│   │   ├── api.ts           # Base API configuration
│   │   ├── auth.ts          # Authentication services
│   │   ├── food.ts          # Food logging services
│   │   ├── analytics.ts     # Analytics services
│   │   ├── mealPlans.ts     # Meal planning services
│   │   └── recipes.ts       # Recipe services
│   │
│   ├── config/              # Configuration files
│   │   └── constants.ts     # App constants
│   │
│   ├── theme/               # Theme and styling
│   │   └── index.ts         # Theme configuration
│   │
│   └── i18n/                # Internationalization
│       ├── index.ts         # i18n configuration
│       └── locales/         # Translation files
│           ├── en.json      # English
│           └── ar.json      # Arabic
│
├── assets/                  # Static assets
│   ├── icon.png            # App icon
│   ├── splash.png          # Splash screen
│   └── adaptive-icon.png   # Android adaptive icon
│
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## Screen Descriptions

### Authentication Screens

#### LoginScreen
- Email and password authentication
- "Remember me" functionality
- Password reset link
- Social login (planned)

#### RegisterScreen
- User registration form
- Email validation
- Password strength indicator
- Terms and conditions acceptance

### Onboarding Screens

#### OnboardingGenderScreen
- Gender selection (Male, Female, Other)
- Skip option available

#### OnboardingAgeScreen
- Age input with validation
- Age range: 13-120 years

#### OnboardingHeightScreen
- Height input in cm or feet/inches
- Unit toggle (metric/imperial)

#### OnboardingWeightScreen
- Current weight input
- Unit toggle (kg/lbs)

#### OnboardingTargetWeightScreen
- Target weight goal
- Realistic goal validation

#### OnboardingActivityScreen
- Activity level selection
- Options: Sedentary, Light, Moderate, Very Active, Extra Active

#### OnboardingGoalScreen
- Goal selection
- Options: Lose Weight, Maintain Weight, Gain Weight

#### OnboardingWorkoutScreen
- Weekly workout frequency
- Exercise preferences

#### OnboardingDietScreen
- Dietary preferences
- Restrictions and allergies

#### OnboardingSummaryScreen
- Review all entered information
- Calculated daily calorie goal
- Macro distribution
- Confirmation and account creation

### Home Screen

#### HomeScreen
- Daily calorie summary card
- Macro breakdown (Protein, Carbs, Fats, Fiber, Sugar)
- Water intake tracker
- Step counter
- Recent food logs
- Quick action buttons
- Streak badge
- Calendar navigation for historical data

### Food Logging Screens

#### LogFoodScreen
- Three tabs: Camera, Search, My Foods
- Camera tab: Take photo or select from gallery
- Search tab: Search food database
- My Foods tab: Recently logged and custom foods
- AI-powered food recognition
- Manual nutritional data entry
- Meal type selection (Breakfast, Lunch, Dinner, Snack)

#### CameraCaptureScreen
- Camera interface
- Photo capture
- Gallery selection
- Image preview
- AI analysis loading state

#### NutritionDetailScreen
- Detailed nutritional information
- Serving size adjustment
- Macro and micro nutrients
- Edit and save options
- Add to meal plan

### Progress Tracking Screens

#### ProgressScreen
- Weight chart (line graph)
- BMI indicator
- Progress photos gallery
- Streak calendar
- Achievement badges
- Weekly/monthly statistics
- Goal progress visualization

### Profile Screens

#### ProfileScreen
- User information display
- Settings navigation
- Logout option
- Account statistics
- Premium upgrade (planned)

#### PersonalDetailsScreen
- Edit personal information
- Update goals
- Recalculate calorie targets

#### PreferencesScreen
- Language selection
- Theme toggle (Light/Dark)
- Unit system (Metric/Imperial)
- Notification settings

#### TrackingRemindersScreen
- Meal reminder times
- Water reminder toggle
- Weight tracking reminder
- Custom reminder creation

### Meal Planning Screens

#### MealPlanScreen
- Weekly meal plan view
- Drag-and-drop meal organization
- Copy meals between days
- Template creation and usage
- Nutritional summary per day

#### MealPlanTemplateModal
- Save current plan as template
- Load existing templates
- Share templates (planned)

#### CopyMealPlanModal
- Copy meals to other days
- Bulk meal duplication

### Recipe Screens

#### RecipeBuilderScreen
- Create custom recipes
- Add ingredients with quantities
- Nutritional calculation
- Cooking instructions
- Prep and cook time
- Servings adjustment
- Photo upload
- Save and share

### Exercise Screens

#### ExerciseScreen
- Log exercise activities
- Duration and intensity
- Calories burned calculation
- Exercise history
- Integration with step counter

### Badges Screen

#### BadgesScreen
- Achievement badge gallery
- Earned badges display
- Locked badges with requirements
- Progress indicators
- Badge categories

### Insights Screen

#### NutrientInsightsScreen
- Detailed nutritional analytics
- Vitamin and mineral tracking
- Trend analysis
- Recommendations
- Weekly/monthly comparisons

### Groups Screen (Planned)

#### GroupsScreen
- Social groups feature
- Challenges and competitions
- Leaderboards
- Group meal plans
- Motivation and support

## Component Library

### Common Components

#### Button
- Primary, secondary, outline variants
- Loading state
- Disabled state
- Icon support
- Custom styling

#### Card
- Container component
- Shadow and elevation
- Padding variants
- Pressable option

#### Header
- Navigation header
- Title and subtitle
- Back button
- Action buttons

#### SearchBar
- Text input with search icon
- Clear button
- Debounced search
- Loading indicator

#### EmptyState
- No data placeholder
- Custom icon and message
- Action button

#### LoadingOverlay
- Full-screen loading
- Spinner animation
- Optional message

#### CircularProgress
- Animated progress ring
- Percentage display
- Color customization
- Size variants

#### MacroBar
- Horizontal progress bar
- Multiple segments
- Label and value display
- Color-coded macros

#### Toggle
- Switch component
- On/off states
- Custom colors
- Disabled state

#### Avatar
- User profile image
- Initials fallback
- Size variants
- Border options

#### BadgeIcon
- Achievement badge display
- Locked/unlocked states
- Progress indicator
- Tooltip

#### BottomSheet
- Modal bottom sheet
- Swipe to dismiss
- Custom content
- Backdrop

#### PaginationDots
- Page indicator
- Active dot highlight
- Custom colors

### Food Components

#### FoodSearchItem
- Food item display
- Nutritional summary
- Thumbnail image
- Add button
- Swipe actions

#### FoodTabBar
- Tab navigation
- Active tab indicator
- Badge counts

### Home Components

#### CalorieSummaryCard
- Daily calorie progress
- Circular progress indicator
- Macro breakdown
- Remaining calories

#### FoodLogItem
- Food entry display
- Meal type badge
- Edit and delete actions
- Nutritional summary

#### WaterCard
- Water intake progress
- Glass icons
- Add water button
- Daily goal

#### StepsCard
- Step count display
- Progress bar
- Calories burned
- Distance walked

#### StreakBadge
- Consecutive days counter
- Flame icon
- Motivational message

#### WeekDaySelector
- Calendar week view
- Day selection
- Current day highlight
- Navigation arrows

### Nutrition Components

#### NutritionCard
- Macro summary
- Progress bars
- Color-coded nutrients

#### DetailedNutritionCard
- Complete nutritional breakdown
- Vitamins and minerals
- Daily value percentages

### Progress Components

#### BMIIndicator
- BMI value display
- Category indicator
- Color-coded ranges
- Healthy range visualization

#### StreakCard
- Streak statistics
- Calendar heatmap
- Longest streak
- Current streak

## Navigation Structure

```
App
├── AuthNavigator (Not logged in)
│   ├── LoginScreen
│   └── RegisterScreen
│
├── OnboardingNavigator (First time user)
│   ├── OnboardingGenderScreen
│   ├── OnboardingAgeScreen
│   ├── OnboardingHeightScreen
│   ├── OnboardingWeightScreen
│   ├── OnboardingTargetWeightScreen
│   ├── OnboardingActivityScreen
│   ├── OnboardingGoalScreen
│   ├── OnboardingWorkoutScreen
│   ├── OnboardingDietScreen
│   └── OnboardingSummaryScreen
│
└── MainNavigator (Logged in)
    └── TabNavigator
        ├── HomeTab
        │   └── HomeScreen
        │
        ├── FoodTab
        │   ├── LogFoodScreen
        │   ├── CameraCaptureScreen
        │   └── NutritionDetailScreen
        │
        ├── ProgressTab
        │   └── ProgressScreen
        │
        ├── MealsTab
        │   └── MealPlanScreen
        │
        └── ProfileTab
            ├── ProfileScreen
            ├── PersonalDetailsScreen
            ├── PreferencesScreen
            ├── TrackingRemindersScreen
            ├── BadgesScreen
            ├── RecipeBuilderScreen
            ├── ExerciseScreen
            └── NutrientInsightsScreen
```

## State Management

### Authentication State
- User token storage
- Auto-login on app launch
- Token refresh mechanism
- Logout and session cleanup

### App State
- User profile data
- Daily tracking data
- Cached food database
- Preferences and settings

### Local Storage
- AsyncStorage for persistence
- Secure token storage
- Offline data caching
- User preferences

## API Integration

### Service Layer Architecture
All API calls are centralized in service files:

```typescript
// services/api.ts
import axios from 'axios';
import { API_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      await refreshToken();
    }
    return Promise.reject(error);
  }
);
```

### Error Handling
- Network error detection
- Retry logic for failed requests
- User-friendly error messages
- Offline mode support (planned)

## Theme System

### Color Palette
```typescript
const colors = {
  primary: '#065F46',      // Green
  secondary: '#FFF8F0',    // Cream
  accent: '#F59E0B',       // Amber
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  
  border: '#E5E7EB',
};
```

### Typography
```typescript
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};
```

### Spacing
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

## Internationalization

### Supported Languages
- English (en)
- Arabic (ar)

### Translation Structure
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "auth": {
    "login": "Login",
    "register": "Register"
  },
  "food": {
    "logFood": "Log Food",
    "calories": "Calories"
  }
}
```

### RTL Support
- Automatic layout flip for Arabic
- RTL-aware components
- Mirrored icons and navigation

## Performance Optimization

### Image Optimization
- Image compression before upload
- Thumbnail generation
- Lazy loading
- Caching strategy

### List Optimization
- FlatList with pagination
- Item key optimization
- Memoized components
- Virtual scrolling

### Bundle Optimization
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## Build Configuration

### Development Build
```json
{
  "developmentClient": true,
  "distribution": "internal"
}
```

### Preview Build (APK)
```json
{
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

### Production Build
```json
{
  "android": {
    "buildType": "apk"
  },
  "ios": {
    "autoIncrement": true
  }
}
```

## Testing Strategy

### Manual Testing
- Device testing on Android and iOS
- Different screen sizes
- Network conditions
- Edge cases

### Planned Automated Testing
- Unit tests with Jest
- Component tests with React Native Testing Library
- E2E tests with Detox
- API integration tests

## App Permissions

### Android
- CAMERA: Food photo capture
- READ_EXTERNAL_STORAGE: Gallery access
- WRITE_EXTERNAL_STORAGE: Save photos
- RECEIVE_BOOT_COMPLETED: Notifications
- VIBRATE: Notification alerts
- SCHEDULE_EXACT_ALARM: Reminder notifications

### iOS
- NSCameraUsageDescription: Camera access
- NSPhotoLibraryUsageDescription: Photo library access
- NSPhotoLibraryAddUsageDescription: Save photos

## App Store Metadata

### App Name
Calorie Tracker

### Package Identifier
- Android: com.calorietracker.app
- iOS: com.calorietracker.app

### Version
- Current: 1.0.1
- Version Code (Android): 3

### Category
Health & Fitness

### Target Audience
Adults 18+ interested in health and nutrition

---

For mobile app development questions or feature requests, please contact the development team.
