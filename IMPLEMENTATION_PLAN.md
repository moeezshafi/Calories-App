# Cal AI - Complete Rebuild Implementation Plan

## Project Overview

**Goal:** Rebuild the calorie tracking mobile app to match Cal AI (https://www.calai.app/) exactly - same UI/UX, color scheme, and functionality. Fix backend issues and make the entire system enterprise-level and production-ready. Full bilingual support (English + Arabic with RTL).

**Tech Stack:**
- Backend: Flask Python + SQLAlchemy + PostgreSQL
- Frontend: React Native + Expo (complete rebuild)
- AI: Google Gemini API (primary)
- State: Zustand + React Query
- i18n: i18next with RTL support

---

## PHASE 1: Backend Bug Fixes & Hardening (Priority: Critical)

### 1.1 Fix Critical Bugs

| Bug | File | Line | Fix |
|-----|------|------|-----|
| Orphaned unreachable code causes import error | routes/auth.py | 162-197 | Delete lines 162-197, logic already exists in routes/user.py |
| `sanitize_input()` called but never imported | routes/food.py | 90 | Add `from utils.validators import sanitize_input` |
| Hardcoded AI model name | services/gemini_service.py | 13 | Use config: `GEMINI_MODEL` env var |
| Rate limiter uses in-memory storage | middleware/rate_limiter.py | 27 | Read from `app.config['REDIS_URL']` |
| Streak calculation N+1 query (365 individual queries) | routes/analytics.py | 326-336 | Single query for all dates, iterate in Python |
| CORS defaults to wildcard "*" | app.py | 41 | Enforce explicit origins in production |

### 1.2 Standardize API Response Format

All endpoints must use consistent envelope format:
```python
# Success: {"success": true, "message": "...", "data": {...}}
# Error:   {"success": false, "error": "...", "details": "..."}
```

**Files to update:** routes/food.py, routes/analytics.py, routes/user.py, routes/token.py

### 1.3 Enable API Versioning

- Register existing `v1_bp` blueprint in app.py (currently unused)
- Keep `/api/` routes as backward-compatible aliases
- All new endpoints use `/api/v1/` prefix

### 1.4 New Database Models

| Model | File | Fields |
|-------|------|--------|
| WaterLog | models/water_log.py | id, user_id, amount_ml, logged_at, created_at |
| WeightLog | models/weight_log.py | id, user_id, weight_kg, notes, photo_path, logged_at |
| StepLog | models/step_log.py | id, user_id, steps, calories_burned, logged_at, source |
| UserPreference | models/user_preference.py | id, user_id, theme, language, badge_celebrations, live_activity, add_burned_calories, rollover_calories, auto_adjust_macros, protein_goal_g, carbs_goal_g, fat_goal_g, daily_step_goal, goal_weight_kg, date_of_birth |
| Badge + UserBadge | models/badge.py | Badge: id, name, description, icon, requirement_type, requirement_value; UserBadge: id, user_id, badge_id, earned_at |
| MealReminder | models/meal_reminder.py | id, user_id, meal_type, time, enabled |
| ProgressPhoto | models/progress_photo.py | id, user_id, photo_path, weight_at_time, notes, taken_at |
| SavedFood | models/saved_food.py | id, user_id, food_name, calories, proteins, carbs, fats, fiber, sodium, sugars, serving_size |

### 1.5 New API Endpoints

**Water Tracking:** `/api/v1/water`
- POST /log, GET /logs?date, GET /daily-total?date, DELETE /logs/<id>

**Weight Tracking:** `/api/v1/weight`
- POST /log, GET /logs?period, GET /latest, GET /progress, DELETE /logs/<id>

**Steps Tracking:** `/api/v1/steps`
- POST /log, GET /logs?date, GET /daily-total?date

**Preferences:** `/api/v1/preferences`
- GET /, PUT /, GET /reminders, PUT /reminders

**Badges:** `/api/v1/badges`
- GET /, GET /earned, POST /check

**Progress Photos:** `/api/v1/progress-photos`
- POST /upload, GET /, DELETE /<id>

**Food Search:** `/api/v1/search`
- GET /food?q=<query> (Gemini-powered), GET /suggestions, GET /barcode/<code>

**Enhanced Food Endpoints:**
- POST /api/v1/food/voice-log (text transcription -> structured food data via Gemini)
- Enhanced /api/v1/food/analyze-image (add health score, fiber, sugar, sodium)
- POST/GET/DELETE /api/v1/food/saved (bookmarked foods)

**Enhanced Analytics:**
- GET /api/v1/analytics/bmi
- GET /api/v1/analytics/expenditure?period=7d|14d|30d
- GET /api/v1/analytics/energy?period=week

### 1.6 Gemini Service Enhancement

Enhanced response format from food image analysis:
```json
{
  "food_name": "Blueberry Pancakes With Syrup",
  "total_calories": 940,
  "total_protein": 18,
  "total_carbs": 162,
  "total_fats": 20,
  "fiber": 4,
  "sugar": 58,
  "sodium": 1200,
  "health_score": 3,
  "health_score_reasons": ["High sugar", "High sodium", "Low fiber"],
  "serving_count": 1,
  "is_food": true,
  "ingredients": ["pancakes", "blueberries", "maple syrup", "butter"]
}
```

### 1.7 Config Enhancements

Add to config.py:
- GEMINI_MODEL (configurable model name)
- FCM_SERVER_KEY (push notifications)
- PROGRESS_PHOTOS_FOLDER, FOOD_IMAGES_FOLDER
- OPENFOODFACTS_API_URL (barcode lookup)

---

## PHASE 2: Frontend - Complete Rebuild (Foundation)

### 2.1 Delete & Restructure

**Delete:** Everything inside `CalorieMobileApp/src/`
**Keep:** package.json, app.json, App.js (rewrite), babel.config.js, eas.json, assets/

### 2.2 New Dependencies

```
zustand (state management - replaces Context)
@tanstack/react-query (server state caching)
react-native-pager-view (swipeable cards)
react-native-reanimated (animations)
react-native-gesture-handler (gestures)
victory-native (charts)
expo-haptics (haptic feedback)
expo-notifications (push notifications)
date-fns (date formatting)
react-native-mmkv (fast storage)
```

### 2.3 New Directory Structure

```
CalorieMobileApp/src/
  components/
    common/          # Button, Card, CircularProgress, Header, Toggle, SearchBar, etc.
    home/            # CalorieSummaryCard, StepsCard, WaterCard, WeekDaySelector, etc.
    progress/        # WeightChart, CalorieBarChart, BMIIndicator, etc.
    nutrition/       # NutritionCard, DetailedNutritionCard, IngredientsList, etc.
    food/            # FoodSearchItem, FoodTabBar
  config/            # api.ts, constants.ts
  hooks/             # useAuth, useFoodLogs, useAnalytics, useWater, useWeight, etc.
  i18n/              # index.ts, locales/en.json, locales/ar.json
  navigation/        # TabNavigator, AuthNavigator, MainNavigator
  screens/
    auth/            # LoginScreen, RegisterScreen, OnboardingScreen
    home/            # HomeScreen
    progress/        # ProgressScreen
    food/            # LogFoodScreen, NutritionDetailScreen, CameraCaptureScreen, etc.
    profile/         # ProfileScreen, PersonalDetailsScreen, PreferencesScreen, etc.
    groups/          # GroupsScreen (placeholder)
  services/          # api.ts, auth.ts, food.ts, analytics.ts, water.ts, etc.
  store/             # authStore.ts, appStore.ts, foodStore.ts
  theme/             # colors.ts, typography.ts, spacing.ts, shadows.ts, dark.ts
  types/             # api.ts, food.ts, user.ts, navigation.ts
  utils/             # date.ts, format.ts, rtl.ts, validation.ts
```

### 2.4 Cal AI Theme System

**Color Palette (matching Cal AI exactly):**
```
Background:      #F5F5F5 (light gray)
Surface:         #FFFFFF (white cards)
Surface Border:  #E5E7EB (subtle gray border)
Text Primary:    #000000 (black)
Text Secondary:  #6B7280 (gray)
Text Tertiary:   #9CA3AF (light gray)
Primary Action:  #000000 (dark buttons - "Log", "Done")
FAB:             #1F2937 (dark gray/black)
Accent:          #F59E0B (streak fire, amber)
Protein:         #FF6B6B (red/coral)
Carbs:           #F59E0B (orange/amber)
Fats:            #3B82F6 (blue)
Health Bad:      #EF4444 (red)
Health Medium:   #F59E0B (amber)
Health Good:     #22C55E (green)
Toggle ON:       #000000 (black)
Toggle OFF:      #D1D5DB (gray)
Tab Active:      #000000 (black)
Tab Inactive:    #9CA3AF (gray)
```

**Typography:** System font (SF Pro iOS, Roboto Android)
**Corners:** 16-20px radius on cards
**Shadows:** Very subtle, minimal design

### 2.5 Navigation Structure (Matching Cal AI)

**Bottom Tab Bar (4 tabs + center FAB):**
1. Home (house icon)
2. Progress (bar chart icon)
3. [+ FAB] (dark circle, center) -> opens bottom sheet: Scan Food / Search Food / Manual Entry
4. Groups (people icon) - placeholder
5. Profile (person circle icon)

**Active tab:** Dark filled circle behind icon
**FAB:** Dark (#1F2937) circle with white + icon, slightly raised

---

## PHASE 3: Frontend - Core Screens

### 3.1 Home Screen (Matches Cal AI Dashboard)

**Layout:**
1. Header: "Cal AI" + apple icon (left), fire streak badge (right)
2. Week day selector: Sun-Sat circles, active day = black border
3. Swipeable cards (PagerView, 3 pages):
   - Page 1: Calories left/over (big number) + circular progress (black ring) + 3 macro mini-circles (Protein/Carbs/Fats)
   - Page 2: Steps (X/10,000) + circular progress + calories burned
   - Page 3: Water (X ml) + "Log Water" button
4. 3-dot pagination
5. "Recently uploaded" section: food cards with image, name, time, calories, macros

### 3.2 Nutrition Detail Screen (After Food Scan)

**Layout:**
1. Food photo (top half, blurred background)
2. Header: back, "Nutrition", share, more icons
3. Bookmark + timestamp
4. Food name + serving editor (1 with edit icon)
5. Swipeable cards (2 pages):
   - Page 1: Calories (big) + Protein/Carbs/Fats
   - Page 2: Fiber/Sugar/Sodium + Health Score (X/10 with colored bar)
6. Ingredients section (+ Add)
7. Feedback: "How did Cal AI do?" with thumbs up/down
8. Bottom: "Fix Issue" (outlined) + "Done" (dark filled)

### 3.3 Log Food Screen (Search)

**Layout:**
1. Header: "Log Food" with back arrow
2. Tab bar: All | My foods | My meals | Saved foods
3. Search: "Describe what you ate"
4. Suggestions list with food name, calories, serving, + button
5. Bottom: "Manual Add" | "Voice Log" buttons

### 3.4 Camera/Scanner Screen

- Full-screen camera
- Capture button, flash toggle, gallery picker
- Loading overlay during AI analysis
- Navigate to NutritionDetailScreen with results

### 3.5 Selected Food Screen

- "Selected food" header
- Bookmark + time + food name + serving editor
- Calories card + Protein/Carbs/Fats
- Ingredients section
- "Log" button (dark, bottom)

---

## PHASE 4: Frontend - Progress & Profile

### 4.1 Progress Screen

**Scrollable sections:**
1. "Progress" header
2. Day Streak card + Badges Earned card (side by side)
3. Current Weight card (weight, start/goal, "At your goal by...")
4. Weight Progress line chart (0% of goal flag)
5. Weight Changes table (3d, 7d, 14d, 30d, 90d, All Time)
6. Progress Photos (horizontal scroll + Upload)
7. Daily Average Calories + bar chart
8. Macros stacked bar chart (Protein/Carbs/Fats)
9. Weekly Energy (Burned vs Consumed bar chart)
10. Expenditure Changes table (3d, 7d, 14d, 30d, 90d)
11. BMI card (number + colored indicator bar)
12. Time filter: "This wk" | "Last wk" | "2 wk ago" | "3 wk ago"

### 4.2 Profile Screen

- User avatar + name
- Menu: Personal Details, Preferences, Tracking Reminders
- Account: Sign Out, Delete Account
- App version

### 4.3 Personal Details Screen

- Goal Weight (Change Goal button)
- Current Weight, Height, Date of Birth, Gender, Daily Step Goal (all editable)

### 4.4 Preferences Screen

- Appearance: System / Light / Dark (visual preview cards)
- Toggles: Badge celebrations, Live activity, Add burned calories, Rollover calories, Auto adjust macros

### 4.5 Tracking Reminders Screen

- Notification status banner
- Meal reminders: Breakfast (8:30 AM), Lunch (11:30 AM), Snack (4:00 PM), Dinner (6:00 PM) with toggles
- End of Day (9:00 PM) reminder

---

## PHASE 5: Bilingual Support (Arabic + English)

### 5.1 i18n Architecture

- i18next with react-i18next
- Custom language detector using MMKV storage
- RTL auto-management with I18nManager
- Language switch from Profile screen (instant, no restart needed)

### 5.2 Translation Coverage

Every screen, every component, every label, every error message, every placeholder must have both English and Arabic translations. Structure:

```json
{
  "common": { "save", "cancel", "delete", "done", "log", "back", "search", ... },
  "home": { "caloriesLeft", "caloriesOver", "proteinLeft", "carbsOver", "fatLeft", "stepsOf", "caloriesBurned", "logWater", "recentlyUploaded", "tapToAdd", ... },
  "progress": { "dayStreak", "badgesEarned", "currentWeight", "goalWeight", "atGoalBy", "weightProgress", "weightChanges", "noChange", "increase", "decrease", "progressPhotos", "uploadPhoto", "dailyAvgCalories", "weeklyEnergy", "burned", "consumed", "energy", "expenditureChanges", "yourBMI", "underweight", "healthy", "overweight", "obese", ... },
  "nutrition": { "calories", "protein", "carbs", "fats", "fiber", "sugar", "sodium", "healthScore", "ingredients", "ingredientsHidden", "learnWhy", "howDidCalAIDo", "fixIssue", ... },
  "logFood": { "logFood", "all", "myFoods", "myMeals", "savedFoods", "describeWhatYouAte", "suggestions", "manualAdd", "voiceLog", "cal", "serving", ... },
  "profile": { "personalDetails", "preferences", "trackingReminders", "signOut", "deleteAccount", ... },
  "personalDetails": { "goalWeight", "changeGoal", "currentWeight", "height", "dateOfBirth", "gender", "male", "female", "dailyStepGoal", ... },
  "preferences": { "appearance", "system", "light", "dark", "badgeCelebrations", "badgeCelebrationsDesc", "liveActivity", "liveActivityDesc", "addBurnedCalories", "addBurnedCaloriesDesc", "rolloverCalories", "rolloverCaloriesDesc", "autoAdjustMacros", "autoAdjustMacrosDesc", ... },
  "reminders": { "trackingReminders", "notificationsDisabled", "openSettings", "breakfast", "lunch", "snack", "dinner", "endOfDay", "endOfDayDesc", ... },
  "auth": { "login", "register", "email", "password", "name", ... },
  "days": { "sun", "mon", "tue", "wed", "thu", "fri", "sat" },
  "errors": { "networkError", "serverError", "notFood", "analysisError", ... }
}
```

### 5.3 RTL Considerations

- All flex layouts use `start`/`end` instead of `left`/`right`
- Charts flip axis labels in RTL mode
- Tab bar reads right-to-left in Arabic
- Text alignment auto-flips
- Back arrow flips direction
- Progress bars fill from right in RTL

---

## PHASE 6: Testing & Polish

### 6.1 Error Boundaries
- Wrap each screen in ErrorBoundary component
- "Something went wrong" screen with retry

### 6.2 Performance
- React.memo on list items
- useCallback for handlers
- FlatList optimization (windowSize)
- Image caching
- MMKV for fast storage

### 6.3 RTL Testing
- Every screen tested in Arabic
- Charts, navigation, text all verified

### 6.4 Offline Support
- React Query offline persistence
- Queue submissions when offline
- Offline indicator

---

## Implementation Order

| Step | Task | Phase |
|------|------|-------|
| 1 | Fix backend bugs (auth.py, food.py, analytics.py, rate_limiter.py) | 1 |
| 2 | Standardize API responses | 1 |
| 3 | Create new models (water, weight, steps, preferences, badges) | 1 |
| 4 | Create new API endpoints | 1 |
| 5 | Enhance Gemini service (health score, extended nutrition) | 1 |
| 6 | Enable API versioning | 1 |
| 7 | Delete frontend src/, install deps, create structure | 2 |
| 8 | Build theme system + i18n with full translations | 2 |
| 9 | Build common components (Button, Card, CircularProgress, etc.) | 2 |
| 10 | Build navigation (TabNavigator + FAB) | 2 |
| 11 | Build auth screens (Login, Register) | 3 |
| 12 | Build Home screen with 3 swipeable cards | 3 |
| 13 | Build camera/scanner + NutritionDetail screen | 3 |
| 14 | Build LogFood screen with search | 3 |
| 15 | Build Progress screen with charts | 4 |
| 16 | Build Profile + Settings screens | 4 |
| 17 | Complete Arabic translations + RTL testing | 5 |
| 18 | Error boundaries + performance optimization | 6 |
