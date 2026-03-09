import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Card from '../common/Card';

interface Props {
  fiber: number;
  sugar: number;
  sodium: number;
  healthScore: number; // 1-10
}

export default function DetailedNutritionCard({ fiber, sugar, sodium, healthScore }: Props) {
  const { t } = useTranslation();
  const clampedScore = Math.min(Math.max(healthScore, 1), 10);
  const scoreColor =
    clampedScore >= 7 ? colors.healthGood : clampedScore >= 4 ? colors.healthMedium : colors.healthBad;

  return (
    <Card style={styles.card}>
      {/* Micronutrient cards */}
      <View style={styles.microRow}>
        <MicroCard
          label={t('nutrition.fiber', { defaultValue: 'Fiber' })}
          value={fiber}
          unit="g"
          color={colors.fiber}
        />
        <MicroCard
          label={t('nutrition.sugar', { defaultValue: 'Sugar' })}
          value={sugar}
          unit="g"
          color={colors.sugar}
        />
        <MicroCard
          label={t('nutrition.sodium', { defaultValue: 'Sodium' })}
          value={sodium}
          unit="mg"
          color={colors.sodium}
        />
      </View>

      {/* Health Score */}
      <View style={styles.healthSection}>
        <View style={styles.healthHeader}>
          <Ionicons name="heart" size={18} color={scoreColor} />
          <Text style={styles.healthLabel}>
            {t('nutrition.healthScore', { defaultValue: 'Health Score' })}
          </Text>
          <Text style={[styles.healthValue, { color: scoreColor }]}>
            {clampedScore}/10
          </Text>
        </View>

        {/* Score bar */}
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${(clampedScore / 10) * 100}%`,
                backgroundColor: scoreColor,
              },
            ]}
          />
          {/* Gradient segments */}
          <View style={styles.barSegments}>
            <View style={[styles.segment, { backgroundColor: colors.healthBad }]} />
            <View style={[styles.segment, { backgroundColor: colors.healthMedium }]} />
            <View style={[styles.segment, { backgroundColor: colors.healthGood }]} />
          </View>
          {/* Marker */}
          <View
            style={[
              styles.marker,
              { left: `${(clampedScore / 10) * 100}%` },
            ]}
          />
        </View>
      </View>
    </Card>
  );
}

interface MicroCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

function MicroCard({ label, value, unit, color }: MicroCardProps) {
  return (
    <View style={styles.microCard}>
      <View style={[styles.microDot, { backgroundColor: color }]} />
      <Text style={styles.microLabel}>{label}</Text>
      <Text style={styles.microValue}>
        {value}
        <Text style={styles.microUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  microRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  microCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  microDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  microLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  microValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  microUnit: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  healthSection: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.base,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  healthLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  healthValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  barSegments: {
    flexDirection: 'row',
    height: 8,
    opacity: 0.2,
  },
  segment: {
    flex: 1,
  },
  marker: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.surface,
    marginLeft: -7,
    zIndex: 3,
  },
});
