import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Card from '../../components/common/Card';
import * as analyticsService from '../../services/analytics';

const TIME_PERIODS = ['thisWeek', 'lastWeek', 'thisMonth'] as const;
type TimePeriod = typeof TIME_PERIODS[number];

interface DailyEntry {
  date: string;
  day_name?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface WeeklyData {
  weekly_averages?: {
    avg_calories?: number;
    avg_protein?: number;
    avg_carbs?: number;
    avg_fats?: number;
  };
  weekly_totals?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  daily_data?: DailyEntry[];
}

export default function NutrientInsightsScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('thisWeek');
  const [data, setData] = useState<WeeklyData | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      let result: WeeklyData | null = null;

      if (period === 'thisWeek') {
        result = await analyticsService.getWeeklyAnalytics();
      } else if (period === 'lastWeek') {
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7 - lastWeekStart.getDay());
        result = await analyticsService.getWeeklyAnalytics(
          lastWeekStart.toISOString().split('T')[0],
        );
      } else {
        result = await analyticsService.getMonthlyAnalytics();
      }

      setData(result);
    } catch (e) {
      console.log('Insights fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await analyticsService.getAIInsights(today);
      setAiInsights(result?.insights || null);
    } catch (e) {
      console.log('AI insights fetch error:', e);
      setAiInsights(null);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Derived data
  const averages = data?.weekly_averages || {};
  const avgCalories = Math.round(averages.avg_calories || 0);
  const avgProtein = Math.round(averages.avg_protein || 0);
  const avgCarbs = Math.round(averages.avg_carbs || 0);
  const avgFats = Math.round(averages.avg_fats || 0);

  // Macro distribution percentages
  const proteinCal = avgProtein * 4;
  const carbsCal = avgCarbs * 4;
  const fatsCal = avgFats * 9;
  const totalMacroCal = proteinCal + carbsCal + fatsCal || 1;
  const proteinPct = Math.round((proteinCal / totalMacroCal) * 100);
  const carbsPct = Math.round((carbsCal / totalMacroCal) * 100);
  const fatsPct = 100 - proteinPct - carbsPct;

  // Best & worst days
  const dailyData: DailyEntry[] = data?.daily_data || [];
  const activeDays = dailyData.filter((d) => d.calories > 0);
  const sortedByCalories = [...activeDays].sort((a, b) => b.calories - a.calories);
  const bestDay = sortedByCalories[0] || null;
  const worstDay = sortedByCalories[sortedByCalories.length - 1] || null;

  // Nutrition score (1-10) based on macro balance
  const computeScore = (): number => {
    if (avgCalories === 0) return 0;
    // Ideal ranges: Protein 25-35%, Carbs 40-55%, Fats 20-35%
    let score = 10;
    if (proteinPct < 15 || proteinPct > 45) score -= 3;
    else if (proteinPct < 20 || proteinPct > 40) score -= 1;
    if (carbsPct < 30 || carbsPct > 65) score -= 3;
    else if (carbsPct < 35 || carbsPct > 60) score -= 1;
    if (fatsPct < 10 || fatsPct > 45) score -= 3;
    else if (fatsPct < 15 || fatsPct > 40) score -= 1;
    // Consistency bonus: more active days = better
    if (activeDays.length >= 6) score = Math.min(score + 1, 10);
    return Math.max(score, 1);
  };
  const nutritionScore = computeScore();

  const scoreColor = nutritionScore >= 7
    ? colors.healthGood
    : nutritionScore >= 4
      ? colors.healthMedium
      : colors.healthBad;

  const periodLabels: Record<TimePeriod, string> = {
    thisWeek: t('insights.thisWeek', { defaultValue: 'This Week' }),
    lastWeek: t('insights.lastWeek', { defaultValue: 'Last Week' }),
    thisMonth: t('insights.thisMonth', { defaultValue: 'This Month' }),
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <Text style={styles.title}>
          {t('insights.title', { defaultValue: 'Nutrition Insights' })}
        </Text>

        {/* Time Period Toggle */}
        <View style={styles.filterRow}>
          {TIME_PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.filterChip, period === p && styles.filterChipActive]}
              onPress={() => { setLoading(true); setPeriod(p); }}
            >
              <Text style={[styles.filterChipText, period === p && styles.filterChipTextActive]}>
                {periodLabels[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Averages */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {t('insights.weeklyAverages', { defaultValue: 'Weekly Averages' })}
          </Text>
          <View style={styles.avgGrid}>
            <View style={styles.avgItem}>
              <Text style={styles.avgValue}>{avgCalories}</Text>
              <Text style={styles.avgLabel}>
                {t('insights.calories', { defaultValue: 'Calories' })}
              </Text>
            </View>
            <View style={styles.avgItem}>
              <Text style={[styles.avgValue, { color: colors.protein }]}>{avgProtein}g</Text>
              <Text style={styles.avgLabel}>
                {t('insights.protein', { defaultValue: 'Protein' })}
              </Text>
            </View>
            <View style={styles.avgItem}>
              <Text style={[styles.avgValue, { color: colors.carbs }]}>{avgCarbs}g</Text>
              <Text style={styles.avgLabel}>
                {t('insights.carbs', { defaultValue: 'Carbs' })}
              </Text>
            </View>
            <View style={styles.avgItem}>
              <Text style={[styles.avgValue, { color: colors.fats }]}>{avgFats}g</Text>
              <Text style={styles.avgLabel}>
                {t('insights.fats', { defaultValue: 'Fats' })}
              </Text>
            </View>
          </View>
        </Card>

        {/* Macro Distribution */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {t('insights.macroDistribution', { defaultValue: 'Macro Distribution' })}
          </Text>

          {/* Stacked bar */}
          <View style={styles.macroBar}>
            {proteinPct > 0 && (
              <View style={[styles.macroSegment, { flex: proteinPct, backgroundColor: colors.protein }]} />
            )}
            {carbsPct > 0 && (
              <View style={[styles.macroSegment, { flex: carbsPct, backgroundColor: colors.carbs }]} />
            )}
            {fatsPct > 0 && (
              <View style={[styles.macroSegment, { flex: fatsPct, backgroundColor: colors.fats }]} />
            )}
          </View>

          {/* Legend */}
          <View style={styles.macroLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.protein }]} />
              <Text style={styles.legendText}>
                {t('insights.protein', { defaultValue: 'Protein' })} {proteinPct}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.carbs }]} />
              <Text style={styles.legendText}>
                {t('insights.carbs', { defaultValue: 'Carbs' })} {carbsPct}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.fats }]} />
              <Text style={styles.legendText}>
                {t('insights.fats', { defaultValue: 'Fats' })} {fatsPct}%
              </Text>
            </View>
          </View>
        </Card>

        {/* Best & Worst Days */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {t('insights.bestWorstDays', { defaultValue: 'Best & Worst Days' })}
          </Text>

          {activeDays.length > 0 ? (
            <View>
              {bestDay && (
                <View style={styles.dayRow}>
                  <View style={[styles.dayIndicator, { backgroundColor: colors.healthGood }]} />
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayLabel}>
                      {t('insights.highestCalories', { defaultValue: 'Highest Calories' })}
                    </Text>
                    <Text style={styles.dayName}>
                      {bestDay.day_name || bestDay.date}
                    </Text>
                  </View>
                  <Text style={styles.dayCalories}>{Math.round(bestDay.calories)} cal</Text>
                </View>
              )}

              {worstDay && bestDay !== worstDay && (
                <View style={[styles.dayRow, { marginTop: spacing.sm }]}>
                  <View style={[styles.dayIndicator, { backgroundColor: colors.healthBad }]} />
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayLabel}>
                      {t('insights.lowestCalories', { defaultValue: 'Lowest Calories' })}
                    </Text>
                    <Text style={styles.dayName}>
                      {worstDay.day_name || worstDay.date}
                    </Text>
                  </View>
                  <Text style={styles.dayCalories}>{Math.round(worstDay.calories)} cal</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              {t('insights.noData', { defaultValue: 'No data available for this period.' })}
            </Text>
          )}
        </Card>

        {/* Nutrition Score */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            {t('insights.nutritionScore', { defaultValue: 'Nutrition Score' })}
          </Text>

          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {nutritionScore}
              </Text>
              <Text style={styles.scoreMax}>/10</Text>
            </View>
            <Text style={styles.scoreDescription}>
              {nutritionScore >= 7
                ? t('insights.scoreGreat', { defaultValue: 'Great balance! Keep it up.' })
                : nutritionScore >= 4
                  ? t('insights.scoreOk', { defaultValue: 'Decent balance. Room for improvement.' })
                  : t('insights.scoreLow', { defaultValue: 'Needs attention. Try to diversify your macros.' })}
            </Text>
          </View>
        </Card>

        {/* AI Insights */}
        <Card style={styles.sectionCard}>
          <View style={styles.aiInsightsHeader}>
            <Text style={styles.sectionTitle}>
              🤖 {t('insights.aiInsights', { defaultValue: 'AI Insights' })}
            </Text>
            <TouchableOpacity
              onPress={fetchAIInsights}
              disabled={loadingInsights}
              style={styles.refreshInsightsBtn}
            >
              <Text style={styles.refreshInsightsText}>
                {loadingInsights ? '⏳' : '🔄'}
              </Text>
            </TouchableOpacity>
          </View>

          {loadingInsights ? (
            <View style={styles.insightsLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.insightsLoadingText}>
                {t('insights.analyzingNutrition', { defaultValue: 'Analyzing your nutrition...' })}
              </Text>
            </View>
          ) : aiInsights ? (
            <Text style={styles.aiInsightsText}>{aiInsights}</Text>
          ) : (
            <TouchableOpacity
              style={styles.getInsightsBtn}
              onPress={fetchAIInsights}
              activeOpacity={0.7}
            >
              <Text style={styles.getInsightsBtnText}>
                {t('insights.getAIInsights', { defaultValue: 'Get AI-Powered Insights' })}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },

  // ---- Filter Chips ----
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: colors.surface,
    borderColor: colors.textPrimary,
    ...shadows.base,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },

  // ---- Section Cards ----
  sectionCard: {
    marginHorizontal: spacing.base,
    marginTop: spacing.md,
    padding: spacing.base,
    ...shadows.base,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // ---- Weekly Averages ----
  avgGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avgItem: {
    flex: 1,
    alignItems: 'center',
  },
  avgValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  avgLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ---- Macro Distribution ----
  macroBar: {
    flexDirection: 'row',
    height: 24,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  macroSegment: {
    height: 24,
  },
  macroLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },

  // ---- Best & Worst Days ----
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  dayName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  dayCalories: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },

  // ---- Nutrition Score ----
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  scoreValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
  },
  scoreMax: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: -4,
  },
  scoreDescription: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },

  // ---- Empty State ----
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // ---- AI Insights ----
  aiInsightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  refreshInsightsBtn: {
    padding: spacing.xs,
  },
  refreshInsightsText: {
    fontSize: typography.sizes.xl,
  },
  insightsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  insightsLoadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  aiInsightsText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  getInsightsBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  getInsightsBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textWhite,
  },
});
