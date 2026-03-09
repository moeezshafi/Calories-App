# Cal AI - Complete Task Tracker

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Completed

---

## PHASE 1: Backend Bug Fixes & Hardening (29 tasks)

### Bug Fixes
- [x] 1.1 Fix routes/auth.py - Delete orphaned unreachable code (lines 162-197)
- [x] 1.2 Fix routes/food.py - Add missing `sanitize_input` import
- [x] 1.3 Fix services/gemini_service.py - Make model name configurable via env
- [x] 1.4 Fix middleware/rate_limiter.py - Use Redis URL from config instead of memory
- [x] 1.5 Fix routes/analytics.py - Replace N+1 streak query with single query
- [x] 1.6 Fix app.py - Enforce explicit CORS origins in production
- [~] 1.7 Standardize ALL API responses to use envelope format (water/weight/steps/preferences done; auth/food/analytics still use raw jsonify)
- [ ] 1.8 Register v1 blueprint in app.py for API versioning

### New Models
- [x] 1.9 Create models/water_log.py (WaterLog)
- [x] 1.10 Create models/weight_log.py (WeightLog)
- [x] 1.11 Create models/step_log.py (StepLog)
- [x] 1.12 Create models/user_preference.py (UserPreference)
- [x] 1.13 Create models/badge.py (Badge + UserBadge)
- [x] 1.14 Create models/meal_reminder.py (MealReminder)
- [x] 1.15 Create models/progress_photo.py (ProgressPhoto)
- [x] 1.16 Create models/saved_food.py (SavedFood)

### New Endpoints
- [x] 1.17 Create routes/water.py (POST/GET/DELETE water logs)
- [x] 1.18 Create routes/weight.py (POST/GET/DELETE weight logs + progress)
- [x] 1.19 Create routes/steps.py (POST/GET steps logs)
- [x] 1.20 Create routes/preferences.py (GET/PUT preferences + reminders)
- [x] 1.21 Create routes/badges.py (GET badges, earned, check)
- [x] 1.22 Create routes/progress_photos.py (POST/GET/DELETE photos)
- [x] 1.23 Create routes/search.py (food search, suggestions, barcode)
- [x] 1.24 Enhance routes/food.py (voice-log, saved foods, enhanced analyze-image)
- [x] 1.25 Enhance routes/analytics.py (BMI, expenditure, energy endpoints)

### Service Enhancements
- [x] 1.26 Enhance gemini_service.py (health score, fiber, sugar, sodium, ingredients)
- [x] 1.27 Update config.py (GEMINI_MODEL, FCM, storage folders, OpenFoodFacts)
- [x] 1.28 Update models/__init__.py to register all new models
- [x] 1.29 Create database migration for new models

---

## PHASE 2: Frontend Foundation (27 tasks)

### Setup
- [x] 2.1 Delete all existing code in CalorieMobileApp/src/
- [x] 2.2 Install new dependencies (zustand, react-query, pager-view, victory-native, etc.)
- [x] 2.3 Create new directory structure (components/, screens/, services/, etc.)

### Theme System
- [x] 2.4 Create src/theme/colors.ts (Cream/Ivory + Emerald Green + Gold palette)
- [x] 2.5 Create src/theme/typography.ts (font sizes, weights)
- [x] 2.6 Create src/theme/spacing.ts (spacing scale)
- [x] 2.7 Create src/theme/shadows.ts (shadow presets)
- [x] 2.8 Create dark mode colors (merged into colors.ts as darkColors)
- [x] 2.9 Create src/theme/index.ts (combined theme export)

### i18n
- [x] 2.10 Create src/i18n/index.ts (i18next config with RTL)
- [x] 2.11 Create src/i18n/locales/en.json (complete English translations)
- [x] 2.12 Create src/i18n/locales/ar.json (complete Arabic translations)

### State Management
- [x] 2.13 Create src/store/authStore.ts (Zustand)
- [x] 2.14 Create src/store/appStore.ts (language, theme)
- [x] 2.15 Create src/store/foodStore.ts (current scan result)

### API Layer
- [x] 2.16 Create src/services/api.ts (axios instance + interceptors)
- [x] 2.17 Create src/services/auth.ts
- [x] 2.18 Create src/services/food.ts
- [x] 2.19 Create src/services/analytics.ts
- [x] 2.20 Create src/services/water.ts
- [x] 2.21 Create src/services/weight.ts
- [x] 2.22 Create src/services/steps.ts
- [x] 2.23 Create src/services/preferences.ts

### Types
- [x] 2.24 Create src/types/api.ts
- [x] 2.25 Create src/types/food.ts
- [x] 2.26 Create src/types/user.ts
- [x] 2.27 Create src/types/navigation.ts

---

## PHASE 3: Frontend Common Components (15 tasks)

- [x] 3.1 Create Button.tsx (primary emerald, secondary outlined, text variants)
- [x] 3.2 Create Card.tsx (warm white with subtle border, rounded 16px)
- [x] 3.3 Create CircularProgress.tsx (emerald ring, Cal AI style)
- [x] 3.4 Create Header.tsx (screen header with back/actions)
- [x] 3.5 Create Toggle.tsx (emerald ON, gray OFF)
- [x] 3.6 Create SearchBar.tsx (search input with icon)
- [x] 3.7 Create PaginationDots.tsx (page indicators)
- [x] 3.8 Create Avatar.tsx (user avatar circle)
- [x] 3.9 Create LoadingOverlay.tsx (full-screen loading)
- [x] 3.10 Create BottomSheet.tsx (modal bottom sheet)
- [x] 3.11 Create MacroBar.tsx (horizontal macro indicator)
- [x] 3.12 Create BadgeIcon.tsx (achievement badge display)
- [x] 3.13 Create EmptyState.tsx (empty state illustrations)
- [x] 3.14 Create WeekDaySelector.tsx (Sun-Sat day picker)
- [x] 3.15 Create FoodLogItem.tsx (food card with image, name, time, calories)

---

## PHASE 4: Frontend Navigation (4 tasks)

- [x] 4.1 Create src/navigation/AuthNavigator.tsx (Login/Register stack)
- [x] 4.2 Create src/navigation/TabNavigator.tsx (4 tabs + center emerald FAB)
- [x] 4.3 Create src/navigation/MainNavigator.tsx (main stack wrapping tabs + modals)
- [x] 4.4 Rewrite App.js as entry point with new navigation

---

## PHASE 5: Frontend Auth Screens (2 tasks)

- [x] 5.1 Create screens/auth/LoginScreen.tsx (email/password, language switch)
- [x] 5.2 Create screens/auth/RegisterScreen.tsx (full registration form)

---

## PHASE 6: Frontend Home Screen (6 tasks)

- [x] 6.1 Create HomeScreen.tsx (main dashboard layout)
- [x] 6.2 Create CalorieSummaryCard.tsx (calories + circular progress + macro circles)
- [x] 6.3 Create StepsCard.tsx (steps progress + calories burned)
- [x] 6.4 Create WaterCard.tsx (water intake + log button)
- [x] 6.5 Create StreakBadge.tsx (fire icon + number)
- [x] 6.6 Wire up PagerView with 3 swipeable cards + pagination dots

---

## PHASE 7: Frontend Food Screens (6 tasks)

- [x] 7.1 Create CameraCaptureScreen.tsx (full-screen camera + capture)
- [x] 7.2 Create NutritionDetailScreen.tsx (food photo + 2-page nutrition cards + feedback)
- [x] 7.3 Create LogFoodScreen.tsx (search + tabs + suggestions list)
- [x] 7.4 Create FoodSearchItem.tsx (search result row with + button)
- [x] 7.5 Create FoodTabBar.tsx (All | My foods | My meals | Saved foods)
- [x] 7.6 Create NutritionCard.tsx + DetailedNutritionCard.tsx

---

## PHASE 8: Frontend Progress Screen (4 tasks)

- [x] 8.1 Create ProgressScreen.tsx (main scrollable layout)
- [x] 8.2 Create StreakCard.tsx (day streak with fire + weekday dots)
- [x] 8.3 Create BMIIndicator.tsx (BMI number + colored bar)
- [ ] 8.4 Create additional chart components (WeightChart, CalorieBarChart, etc. — requires victory-native setup)

---

## PHASE 9: Frontend Profile & Settings (5 tasks)

- [x] 9.1 Create ProfileScreen.tsx (avatar, menu items, sign out)
- [x] 9.2 Create PersonalDetailsScreen.tsx (goal weight, stats, all editable)
- [x] 9.3 Create PreferencesScreen.tsx (appearance, toggles for all options)
- [x] 9.4 Create TrackingRemindersScreen.tsx (meal reminders + end of day)
- [x] 9.5 Create GroupsScreen.tsx (placeholder for groups feature)

---

## PHASE 10: Bilingual & RTL (3 tasks)

- [x] 10.1 Complete all English translations (en.json)
- [x] 10.2 Complete all Arabic translations (ar.json)
- [ ] 10.3 Test every screen in Arabic mode + verify RTL layout

---

## PHASE 11: Polish & Testing (4 tasks)

- [ ] 11.1 Add ErrorBoundary component wrapping each screen
- [ ] 11.2 Performance optimization (memo, useCallback, FlatList tuning)
- [ ] 11.3 Offline support (React Query persistence, queue, indicator)
- [ ] 11.4 Final end-to-end testing (auth flow, food scan, log, analytics, profile)

---

## TOTAL TASKS: 123

### Summary by Phase:
| Phase | Description | Tasks | Done |
|-------|-------------|-------|------|
| 1 | Backend Fixes & Enhancements | 29 | 27 |
| 2 | Frontend Foundation | 27 | 27 |
| 3 | Common Components | 15 | 15 |
| 4 | Navigation | 4 | 4 |
| 5 | Auth Screens | 2 | 2 |
| 6 | Home Screen | 6 | 6 |
| 7 | Food Screens | 6 | 6 |
| 8 | Progress Screen | 4 | 3 |
| 9 | Profile & Settings | 5 | 5 |
| 10 | Bilingual & RTL | 3 | 2 |
| 11 | Polish & Testing | 4 | 0 |
| 12 | Multi-Step Onboarding | 18 | 18 |
| **TOTAL** | | **123** | **115** |

### Remaining (8 tasks from previous phases):
1. 1.7 Standardize remaining API responses (auth, food, analytics routes)
2. 1.8 Register v1 blueprint in app.py
3. 8.4 Additional chart components (victory-native)
4. 10.3 RTL testing in Arabic mode
5. 11.1 ErrorBoundary component
6. 11.2 Performance optimization
7. 11.3 Offline support
8. 11.4 End-to-end testing

---

## PHASE 12: Multi-Step Onboarding Flow (NEW — Cal AI Style)

One-time step-by-step onboarding after new user registration.
Each step = one screen, one question. Clean, focused, premium feel.

### Backend (4 tasks)
- [x] 12.1 Add `onboarding_completed`, `diet_type`, `workout_frequency` to User model
- [x] 12.2 Create `POST /api/auth/complete-onboarding` endpoint
- [x] 12.3 Create `GET /api/user/recommendations` endpoint
- [x] 12.4 Update User.to_dict() to include new fields

### Frontend Screens (10 tasks)
- [x] 12.5 OnboardingGoalScreen — "What's your goal?" (Lose / Maintain / Gain)
- [x] 12.6 OnboardingGenderScreen — Gender selection visual cards
- [x] 12.7 OnboardingAgeScreen — Age number input
- [x] 12.8 OnboardingHeightScreen — Height input in cm
- [x] 12.9 OnboardingWeightScreen — Current weight input
- [x] 12.10 OnboardingTargetWeightScreen — Goal weight input
- [x] 12.11 OnboardingActivityScreen — Activity level cards (5 options)
- [x] 12.12 OnboardingDietScreen — Diet type cards (6 options)
- [x] 12.13 OnboardingWorkoutScreen — Workout frequency (4 options)
- [x] 12.14 OnboardingSummaryScreen — "Your Plan" with daily calories + macros

### Navigation & Wiring (3 tasks)
- [x] 12.15 Create OnboardingNavigator
- [x] 12.16 Update App.js routing: if !onboarding_completed → Onboarding
- [x] 12.17 Simplify RegisterScreen (only name, email, password)

### Translations (1 task)
- [x] 12.18 Add onboarding translations to en.json + ar.json

---

## Theme Color Scheme (CURRENT)

### Cream/Ivory + Deep Emerald Green + Gold/Champagne
Premium warm color palette replacing the old black/white/gray scheme:

| Role | Light Mode | Dark Mode |
|------|-----------|-----------|
| Background | `#FFF8F0` (cream) | `#1C1917` (warm black) |
| Surface | `#FFFFFF` (white) | `#292524` (warm dark) |
| Surface Border | `#E8E0D8` (warm gray) | `#44403C` |
| Primary (buttons, FAB) | `#065F46` (deep emerald) | `#10B981` (emerald) |
| Accent (streaks, highlights) | `#C9A96E` (gold) | `#D4A574` (champagne) |
| Text Primary | `#1C1917` (charcoal) | `#FAFAF9` |
| Text Secondary | `#78716C` (warm gray) | `#A8A29E` |
| Protein | `#FF6B6B` (coral) | `#FF6B6B` |
| Carbs | `#F59E0B` (amber) | `#F59E0B` |
| Fats | `#3B82F6` (blue) | `#3B82F6` |
