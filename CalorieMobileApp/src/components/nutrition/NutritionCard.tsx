import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Card from '../common/Card';

interface Props {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function NutritionCard({ calories, protein, carbs, fats }: Props) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      {/* Calories header */}
      <View style={styles.calorieRow}>
        <Ionicons name="flame-outline" size={20} color={colors.textPrimary} />
        <Text style={styles.calorieLabel}>
          {t('nutrition.calories', { defaultValue: 'Calories' })}
        </Text>
        <Text style={styles.calorieValue}>{calories.toLocaleString()}</Text>
      </View>

      {/* Macro cards */}
      <View style={styles.macroRow}>
        <MacroCard
          label={t('nutrition.protein', { defaultValue: 'Protein' })}
          value={protein}
          color={colors.protein}
        />
        <MacroCard
          label={t('nutrition.carbs', { defaultValue: 'Carbs' })}
          value={carbs}
          color={colors.carbs}
        />
        <MacroCard
          label={t('nutrition.fats', { defaultValue: 'Fats' })}
          value={fats}
          color={colors.fats}
        />
      </View>
    </Card>
  );
}

interface MacroCardProps {
  label: string;
  value: number;
  color: string;
}

function MacroCard({ label, value, color }: MacroCardProps) {
  return (
    <View style={[styles.macroCard, { borderLeftColor: color }]}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {value}
        <Text style={styles.macroUnit}>g</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  calorieLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  calorieValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  macroCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  macroLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  macroValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  macroUnit: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
});
