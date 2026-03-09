import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import CircularProgress from '../common/CircularProgress';
import Card from '../common/Card';

interface Props {
  consumed: number;
  goal: number;
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
  fiberConsumed?: number;
  sugarConsumed?: number;
  burnedCalories?: number;
}

/**
 * Returns a dynamic ring color based on the percentage of goal consumed.
 *  0-50%  => info (blue)
 * 50-80%  => success (green)
 * 80-100% => accent (gold #C9A96E)
 * >100%   => error (red)
 */
function getRingColor(consumed: number, effectiveGoal: number): string {
  if (effectiveGoal <= 0) return colors.info;
  const pct = consumed / effectiveGoal;
  if (pct > 1) return colors.error;
  if (pct >= 0.8) return colors.accent;
  if (pct >= 0.5) return colors.success;
  return colors.info;
}

export default function CalorieSummaryCard({
  consumed,
  goal,
  proteinConsumed,
  proteinGoal,
  carbsConsumed,
  carbsGoal,
  fatConsumed,
  fatGoal,
  fiberConsumed = 0,
  sugarConsumed = 0,
  burnedCalories = 0,
}: Props) {
  const { t } = useTranslation();

  const effectiveGoal = goal + burnedCalories;
  const remaining = effectiveGoal - consumed;
  const isOver = remaining < 0;
  const calorieProgress = effectiveGoal > 0 ? consumed / effectiveGoal : 0;

  const ringColor = getRingColor(consumed, effectiveGoal);

  const proteinProgress = proteinGoal > 0 ? proteinConsumed / proteinGoal : 0;
  const carbsProgress = carbsGoal > 0 ? carbsConsumed / carbsGoal : 0;
  const fatProgress = fatGoal > 0 ? fatConsumed / fatGoal : 0;

  return (
    <Card style={styles.card}>
      {/* Top row: calorie text + circular progress */}
      <View style={styles.topRow}>
        <View style={styles.calorieTextSection}>
          <Text style={styles.calorieNumber}>
            {Math.abs(remaining).toLocaleString()}
          </Text>
          <Text style={styles.calorieLabel}>
            {t(isOver ? 'home.caloriesOver' : 'home.caloriesLeft', {
              defaultValue: isOver ? 'Calories over' : 'Calories left',
            })}
          </Text>
          {burnedCalories > 0 && (
            <View style={styles.burnedRow}>
              <Text style={styles.burnedText}>
                +{burnedCalories.toLocaleString()} {t('home.burned', { defaultValue: 'burned' })}
              </Text>
            </View>
          )}
        </View>

        <CircularProgress
          progress={Math.min(calorieProgress, 1)}
          size={100}
          strokeWidth={8}
          color={ringColor}
        >
          <Text style={styles.ringConsumed}>{consumed.toLocaleString()}</Text>
          <Text style={styles.ringGoalLabel}>
            / {effectiveGoal.toLocaleString()}
          </Text>
        </CircularProgress>
      </View>

      {/* Eaten / Left badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: ringColor + '18' }]}>
          <View style={[styles.badgeDot, { backgroundColor: ringColor }]} />
          <Text style={[styles.badgeText, { color: ringColor }]}>
            {t('home.eaten', { defaultValue: 'Eaten' })}:{' '}
            <Text style={styles.badgeValue}>{consumed.toLocaleString()} cal</Text>
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isOver
                ? colors.error + '18'
                : colors.textSecondary + '12',
            },
          ]}
        >
          <View
            style={[
              styles.badgeDot,
              {
                backgroundColor: isOver
                  ? colors.error
                  : colors.textSecondary,
              },
            ]}
          />
          <Text
            style={[
              styles.badgeText,
              { color: isOver ? colors.error : colors.textSecondary },
            ]}
          >
            {t(isOver ? 'home.over' : 'home.left', {
              defaultValue: isOver ? 'Over' : 'Left',
            })}
            :{' '}
            <Text style={styles.badgeValue}>
              {Math.abs(remaining).toLocaleString()} cal
            </Text>
          </Text>
        </View>
      </View>

      {/* Macro row */}
      <View style={styles.macroRow}>
        <MacroColumn
          label={t('nutrition.protein', { defaultValue: 'Protein' })}
          consumed={proteinConsumed}
          goal={proteinGoal}
          progress={proteinProgress}
          color={colors.protein}
        />
        <MacroColumn
          label={t('nutrition.carbs', { defaultValue: 'Carbs' })}
          consumed={carbsConsumed}
          goal={carbsGoal}
          progress={carbsProgress}
          color={colors.carbs}
        />
        <MacroColumn
          label={t('nutrition.fats', { defaultValue: 'Fats' })}
          consumed={fatConsumed}
          goal={fatGoal}
          progress={fatProgress}
          color={colors.fats}
        />
        <MacroColumn
          label={t('nutrition.fiber', { defaultValue: 'Fiber' })}
          consumed={fiberConsumed}
          goal={25}
          progress={fiberConsumed / 25}
          color={colors.fiber || '#8B5CF6'}
        />
        <MacroColumn
          label={t('nutrition.sugar', { defaultValue: 'Sugar' })}
          consumed={sugarConsumed}
          goal={50}
          progress={sugarConsumed / 50}
          color={colors.warning || '#F59E0B'}
        />
      </View>
    </Card>
  );
}

interface MacroColumnProps {
  label: string;
  consumed: number;
  goal: number;
  progress: number;
  color: string;
}

function MacroColumn({ label, consumed, goal, progress, color }: MacroColumnProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={styles.macroColumn}>
      <CircularProgress
        progress={Math.min(progress, 1)}
        size={40}
        strokeWidth={4}
        color={color}
      >
        <Text style={[styles.macroIcon, { color }]}>
          {label.charAt(0)}
        </Text>
      </CircularProgress>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {consumed}
        <Text style={styles.macroGoal}> / {goal}g</Text>
      </Text>
      {/* Linear progress bar */}
      <View style={styles.linearBarTrack}>
        <View
          style={[
            styles.linearBarFill,
            {
              backgroundColor: color,
              width: `${clampedProgress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calorieTextSection: {
    flex: 1,
    marginRight: spacing.base,
  },
  calorieNumber: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.sizes['3xl'] * typography.lineHeights.tight,
  },
  calorieLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  burnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  burnedText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.success,
  },
  ringConsumed: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  ringGoalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },

  /* ---- Eaten / Left badges ---- */
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  badgeValue: {
    fontWeight: typography.weights.bold,
  },

  /* ---- Macro row ---- */
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.base,
  },
  macroColumn: {
    alignItems: 'center',
    flex: 1,
  },
  macroIcon: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  macroLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  macroValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  macroGoal: {
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },

  /* ---- Linear progress bar for macros ---- */
  linearBarTrack: {
    width: '80%',
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  linearBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
