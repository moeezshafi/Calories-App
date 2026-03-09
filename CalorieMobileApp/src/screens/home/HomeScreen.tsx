import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';
import { getDailyAnalytics } from '../../services/analytics';
import { getFoodLogs } from '../../services/food';
import { getDailyStepTotal } from '../../services/steps';
import { getDailyWaterTotal, logWater } from '../../services/water';
import { getDailyExerciseTotal } from '../../services/exercises';
import { formatDate } from '../../utils/date';
import { formatTime } from '../../utils/date';
import { colors, typography, spacing, borderRadius } from '../../theme';
import WeekDaySelector from '../../components/home/WeekDaySelector';
import CalorieSummaryCard from '../../components/home/CalorieSummaryCard';
import StepsCard from '../../components/home/StepsCard';
import WaterCard from '../../components/home/WaterCard';
import StreakBadge from '../../components/home/StreakBadge';
import FoodLogItem from '../../components/home/FoodLogItem';
import PaginationDots from '../../components/common/PaginationDots';
import EmptyState from '../../components/common/EmptyState';
import { FoodLog, DailyAnalytics } from '../../types/food';
import { DEFAULT_CALORIE_GOAL, DEFAULT_STEP_GOAL } from '../../config/constants';

const MOTIVATIONAL_SUBTITLES = [
  'Every meal is a chance to nourish yourself.',
  'Small steps lead to big results.',
  'You are what you eat — make it count!',
  'Consistency beats perfection.',
  'Fuel your body, feed your goals.',
];

const PAGER_COUNT = 2;
const WATER_INCREMENT_ML = 250;

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

const QUICK_ACTIONS = [
  { key: 'logFood', icon: 'restaurant-outline' as const, labelKey: 'home.logFood' },
  { key: 'scanFood', icon: 'camera-outline' as const, labelKey: 'home.scanFood' },
  { key: 'logWater', icon: 'water-outline' as const, labelKey: 'home.logWater' },
  { key: 'logWeight', icon: 'scale-outline' as const, labelKey: 'home.logWeight' },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const pagerRef = useRef<PagerView>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pageIndex, setPageIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data state
  const [analytics, setAnalytics] = useState<DailyAnalytics | null>(null);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [stepsData, setStepsData] = useState<{
    total_steps: number;
    total_calories_burned: number;
  }>({ total_steps: 0, total_calories_burned: 0 });
  const [waterData, setWaterData] = useState<{ total_ml: number }>({
    total_ml: 0,
  });
  const [exerciseData, setExerciseData] = useState<{
    total_calories_burned: number;
  }>({ total_calories_burned: 0 });
  const [streak, setStreak] = useState(0);

  const dateStr = formatDate(selectedDate);

  // Greeting
  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const greetingPeriod = getGreeting(new Date().getHours());
  const greetingText = t(`home.greeting.${greetingPeriod}`, {
    defaultValue:
      greetingPeriod === 'morning'
        ? 'Good morning'
        : greetingPeriod === 'afternoon'
          ? 'Good afternoon'
          : 'Good evening',
  });
  const motivationalSubtitle = useMemo(
    () => MOTIVATIONAL_SUBTITLES[Math.floor(Math.random() * MOTIVATIONAL_SUBTITLES.length)],
    [],
  );

  const fetchData = useCallback(async () => {
    const date = formatDate(selectedDate);
    setLoading(true);

    try {
      const [analyticsRes, foodRes, stepsRes, waterRes, exerciseRes] =
        await Promise.allSettled([
          getDailyAnalytics(date),
          getFoodLogs(date),
          getDailyStepTotal(date),
          getDailyWaterTotal(date),
          getDailyExerciseTotal(date),
        ]);

      if (analyticsRes.status === 'fulfilled') {
        const data = analyticsRes.value.data || analyticsRes.value;
        setAnalytics(data);
        if (data.streak !== undefined) {
          setStreak(data.streak);
        }
      }

      if (foodRes.status === 'fulfilled') {
        const res = foodRes.value;
        const logs = res.food_logs || res.data?.food_logs || res.data?.logs || res.logs || res.data || res || [];
        setFoodLogs(Array.isArray(logs) ? logs : []);
      }

      if (stepsRes.status === 'fulfilled') {
        const data = stepsRes.value.data || stepsRes.value;
        setStepsData({
          total_steps: data.total_steps || data.steps || 0,
          total_calories_burned:
            data.total_calories_burned || data.calories_burned || 0,
        });
      }

      if (waterRes.status === 'fulfilled') {
        const data = waterRes.value.data || waterRes.value;
        setWaterData({
          total_ml: data.total_ml || data.total || 0,
        });
      }

      if (exerciseRes.status === 'fulfilled') {
        const data = exerciseRes.value.data || exerciseRes.value;
        setExerciseData({
          total_calories_burned:
            data.total_calories_burned || data.calories_burned || 0,
        });
      }
    } catch {
      // Silently handle -- individual settled promises are handled above
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleLogWater = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await logWater(WATER_INCREMENT_ML);
      setWaterData((prev) => ({
        total_ml: prev.total_ml + WATER_INCREMENT_ML,
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert(t('common.error'), t('common.retry'));
    }
  }, [t]);

  // Derived values from analytics
  const calorieGoal = user?.daily_calorie_goal || analytics?.calorie_progress?.goal || DEFAULT_CALORIE_GOAL;
  const consumed = analytics?.calorie_progress?.consumed || 0;
  const proteinConsumed = analytics?.totals?.proteins || 0;
  const carbsConsumed = analytics?.totals?.carbs || 0;
  const fatConsumed = analytics?.totals?.fats || 0;
  const fiberConsumed = analytics?.totals?.fiber || 0;
  const sugarConsumed = analytics?.totals?.sugars || analytics?.totals?.sugar || 0;

  // Macro goals derived from calorie goal (standard split: 30% P, 40% C, 30% F)
  const proteinGoal = analytics?.macro_breakdown?.proteins
    ? Math.round(analytics.macro_breakdown.proteins.calories / 4)
    : Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = analytics?.macro_breakdown?.carbs
    ? Math.round(analytics.macro_breakdown.carbs.calories / 4)
    : Math.round((calorieGoal * 0.4) / 4);
  const fatGoal = analytics?.macro_breakdown?.fats
    ? Math.round(analytics.macro_breakdown.fats.calories / 9)
    : Math.round((calorieGoal * 0.3) / 9);

  const stepGoal = DEFAULT_STEP_GOAL;

  const handleQuickAction = useCallback(
    (key: string) => {
      switch (key) {
        case 'logFood':
          navigation.navigate('LogFood');
          break;
        case 'scanFood':
          navigation.navigate('CameraCapture');
          break;
        case 'logWater':
          handleLogWater();
          break;
        case 'logWeight':
          navigation.navigate('Progress');
          break;
      }
    },
    [navigation, handleLogWater],
  );

  const renderFoodLogItem = useCallback(
    ({ item }: { item: FoodLog }) => (
      <FoodLogItem
        foodName={item.food_name}
        calories={item.total_calories || item.calories}
        protein={item.total_nutrients?.proteins || item.proteins}
        carbs={item.total_nutrients?.carbs || item.carbs}
        fats={item.total_nutrients?.fats || item.fats}
        time={formatTime(item.consumed_at || item.created_at)}
        imageUri={item.image_path}
      />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: FoodLog) => item.id.toString(),
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.textPrimary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {greetingText}
              {firstName ? `, ${firstName}` : ''}
            </Text>
            {/* Show selected date if not today */}
            {formatDate(selectedDate) !== formatDate(new Date()) && (
              <Text style={styles.selectedDateText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
            )}
          </View>
          <StreakBadge count={streak} />
        </View>

        {/* Week Day Selector */}
        <WeekDaySelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Pager View: Calories / Steps */}
        <View style={styles.pagerWrapper}>
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
          >
            {/* Page 0: Calorie Summary */}
            <View key="calories" style={styles.pagerPage}>
              <CalorieSummaryCard
                consumed={consumed}
                goal={calorieGoal}
                proteinConsumed={proteinConsumed}
                proteinGoal={proteinGoal}
                carbsConsumed={carbsConsumed}
                carbsGoal={carbsGoal}
                fatConsumed={fatConsumed}
                fatGoal={fatGoal}
                fiberConsumed={fiberConsumed}
                sugarConsumed={sugarConsumed}
                burnedCalories={stepsData.total_calories_burned + exerciseData.total_calories_burned}
              />
            </View>

            {/* Page 1: Steps */}
            <View key="steps" style={styles.pagerPage}>
              <StepsCard
                steps={stepsData.total_steps}
                goal={stepGoal}
                caloriesBurned={stepsData.total_calories_burned}
              />
            </View>
          </PagerView>
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <PaginationDots count={PAGER_COUNT} activeIndex={pageIndex} />
        </View>

        {/* Quick Action Buttons - Redesigned */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>
            {t('home.quickActions', { defaultValue: 'Quick Actions' })}
          </Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('LogFood')}
            >
              <View style={[styles.quickActionIconWrapper, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="restaurant" size={22} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>
                {t('home.logFood', { defaultValue: 'Log Food' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CameraCapture')}
            >
              <View style={[styles.quickActionIconWrapper, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="camera" size={22} color={colors.accent} />
              </View>
              <Text style={styles.quickActionLabel}>
                {t('home.scanFood', { defaultValue: 'Scan Food' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={handleLogWater}
            >
              <View style={[styles.quickActionIconWrapper, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="water" size={22} color={colors.info} />
              </View>
              <Text style={styles.quickActionLabel}>
                {t('home.logWater', { defaultValue: 'Log Water' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Progress')}
            >
              <View style={[styles.quickActionIconWrapper, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="scale" size={22} color={colors.success} />
              </View>
              <Text style={styles.quickActionLabel}>
                {t('home.logWeight', { defaultValue: 'Log Weight' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Exercise')}
            >
              <View style={[styles.quickActionIconWrapper, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="barbell" size={22} color={colors.warning} />
              </View>
              <Text style={styles.quickActionLabel}>
                {t('home.logExercise', { defaultValue: 'Exercise' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('RecipeBuilder')}
            >
              <View style={[styles.quickActionIconWrapper, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="book" size={22} color={colors.error} />
              </View>
              <Text style={styles.quickActionLabel}>
                {t('home.recipes', { defaultValue: 'Recipes' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recently Uploaded Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('home.recentlyUploaded')}
          </Text>
        </View>

        {/* Food Logs */}
        {foodLogs.length > 0 ? (
          <FlatList
            data={foodLogs}
            renderItem={renderFoodLogItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            contentContainerStyle={styles.foodListContent}
          />
        ) : (
          <EmptyState
            message={t('home.tapToAdd')}
            icon="restaurant-outline"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.heavy,
    color: colors.textPrimary,
  },
  pagerWrapper: {
    marginTop: spacing.xs,
    overflow: 'visible',
  },
  pagerView: {
    height: 480,
    overflow: 'visible',
  },
  pagerPage: {
    paddingBottom: spacing.base,
    overflow: 'visible',
  },
  paginationContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  quickActionsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.sm,
    alignItems: 'center',
  },
  quickActionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  foodListContent: {
    paddingBottom: 100,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.surface,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.lg,
  },
  selectedDateText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.accent,
    marginTop: spacing.xs,
  },
});
