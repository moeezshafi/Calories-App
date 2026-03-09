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

const PAGER_COUNT = 3;
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

    try {
      const [analyticsRes, foodRes, stepsRes, waterRes] =
        await Promise.allSettled([
          getDailyAnalytics(date),
          getFoodLogs(date),
          getDailyStepTotal(date),
          getDailyWaterTotal(date),
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
    } catch {
      // Silently handle -- individual settled promises are handled above
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
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.headerSubtitle}>{motivationalSubtitle}</Text>
          </View>
          <StreakBadge count={streak} />
        </View>

        {/* Quick Action Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScroll}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.chip}
              activeOpacity={0.7}
              onPress={() => handleQuickAction(action.key)}
            >
              <Ionicons
                name={action.icon}
                size={16}
                color={colors.primary}
                style={styles.chipIcon}
              />
              <Text style={styles.chipLabel}>
                {t(action.labelKey, { defaultValue: action.key })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Week Day Selector */}
        <WeekDaySelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Pager View: Calories / Steps / Water */}
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

            {/* Page 2: Water */}
            <View key="water" style={styles.pagerPage}>
              <WaterCard
                waterMl={waterData.total_ml}
                onLogWater={handleLogWater}
              />
            </View>
          </PagerView>
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <PaginationDots count={PAGER_COUNT} activeIndex={pageIndex} />
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
    paddingBottom: spacing['3xl'],
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
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chipsScroll: {
    marginTop: spacing.xs,
  },
  chipsContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  pagerWrapper: {
    marginTop: spacing.sm,
  },
  pagerView: {
    height: 280,
  },
  pagerPage: {
    flex: 1,
  },
  paginationContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
    paddingBottom: spacing.base,
  },
});
