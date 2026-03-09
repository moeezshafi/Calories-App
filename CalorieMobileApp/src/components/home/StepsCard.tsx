import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import CircularProgress from '../common/CircularProgress';
import Card from '../common/Card';

interface Props {
  steps: number;
  goal?: number;
  caloriesBurned: number;
}

export default function StepsCard({ steps, goal = 10000, caloriesBurned }: Props) {
  const { t } = useTranslation();
  const progress = goal > 0 ? steps / goal : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {/* Left: circular progress with walking icon */}
        <CircularProgress
          progress={Math.min(progress, 1)}
          size={64}
          strokeWidth={5}
          color={colors.primary}
        >
          <Ionicons name="walk-outline" size={22} color={colors.textPrimary} />
        </CircularProgress>

        {/* Center: steps count */}
        <View style={styles.textSection}>
          <Text style={styles.label}>
            {t('home.steps', { defaultValue: 'Steps' })}
          </Text>
          <Text style={styles.stepsValue}>
            {steps.toLocaleString()}
            <Text style={styles.stepsGoal}> /{goal.toLocaleString()}</Text>
          </Text>
        </View>

        {/* Right: calories burned */}
        <View style={styles.burnedSection}>
          <Ionicons name="flame-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.burnedValue}>{caloriesBurned}</Text>
          <Text style={styles.burnedUnit}>
            {t('home.kcal', { defaultValue: 'kcal' })}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    marginLeft: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  stepsValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  stepsGoal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  burnedSection: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  burnedValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  burnedUnit: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
});
