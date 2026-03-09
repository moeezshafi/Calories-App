import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Card from '../common/Card';

interface Props {
  streak: number;
  weekdays: boolean[]; // 7 booleans, Sun-Sat, true = completed
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakCard({ streak, weekdays }: Props) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      {/* Streak header */}
      <View style={styles.headerRow}>
        <View style={styles.streakInfo}>
          <Text style={styles.fireIcon}>{'\uD83D\uDD25'}</Text>
          <Text style={styles.streakNumber}>{streak}</Text>
        </View>
        <Text style={styles.streakLabel}>
          {t('progress.dayStreak', { defaultValue: 'Day Streak' })}
        </Text>
      </View>

      {/* Weekday dots */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, index) => {
          const isCompleted = weekdays[index] ?? false;
          return (
            <View key={index} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{label}</Text>
              <View
                style={[
                  styles.dot,
                  isCompleted ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireIcon: {
    fontSize: typography.sizes.xl,
    marginRight: spacing.xs,
  },
  streakNumber: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  streakLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: colors.textPrimary,
  },
  dotInactive: {
    backgroundColor: colors.surfaceBorder,
  },
});
