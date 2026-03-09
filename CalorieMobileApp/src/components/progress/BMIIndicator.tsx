import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Card from '../common/Card';

interface Props {
  bmi: number;
  category: string;
}

const BMI_COLORS = {
  underweight: colors.info,
  normal: colors.success,
  overweight: colors.warning,
  obese: colors.error,
};

const BMI_RANGES = [
  { max: 18.5, key: 'underweight', color: colors.info },
  { max: 25, key: 'normal', color: colors.success },
  { max: 30, key: 'overweight', color: colors.warning },
  { max: 50, key: 'obese', color: colors.error },
];

export default function BMIIndicator({ bmi, category }: Props) {
  const { t } = useTranslation();

  // Compute marker position as percentage (BMI 10-50 range)
  const minBmi = 10;
  const maxBmi = 50;
  const clampedBmi = Math.min(Math.max(bmi, minBmi), maxBmi);
  const markerPercent = ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100;

  const categoryKey = category.toLowerCase().replace(/\s+/g, '');
  const categoryColor =
    BMI_COLORS[categoryKey as keyof typeof BMI_COLORS] || colors.textSecondary;

  return (
    <Card style={styles.card}>
      {/* Header */}
      <Text style={styles.header}>
        {t('progress.yourBmi', { defaultValue: 'Your BMI' })}
      </Text>

      {/* Big BMI number */}
      <Text style={styles.bmiNumber}>{bmi.toFixed(1)}</Text>

      {/* Category label */}
      <Text style={[styles.categoryLabel, { color: categoryColor }]}>
        {t('progress.weightIs', { defaultValue: 'Your weight is' })}{' '}
        <Text style={styles.categoryValue}>
          {t(`progress.bmiCategory.${categoryKey}`, { defaultValue: category })}
        </Text>
      </Text>

      {/* Gradient bar */}
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          {BMI_RANGES.map((range, index) => (
            <View
              key={index}
              style={[styles.barSegment, { backgroundColor: range.color }]}
            />
          ))}
        </View>

        {/* Marker */}
        <View style={[styles.markerContainer, { left: `${markerPercent}%` }]}>
          <View style={styles.markerTriangle} />
          <View style={styles.markerDot} />
        </View>
      </View>

      {/* Range labels */}
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeText}>18.5</Text>
        <Text style={styles.rangeText}>25</Text>
        <Text style={styles.rangeText}>30</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  header: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  bmiNumber: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  categoryValue: {
    fontWeight: typography.weights.semibold,
  },
  barContainer: {
    height: 20,
    position: 'relative',
    marginBottom: spacing.xs,
  },
  barTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
  },
  barSegment: {
    flex: 1,
  },
  markerContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    marginLeft: -6,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.textPrimary,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.surface,
    marginTop: -2,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '16%',
  },
  rangeText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
  },
});
