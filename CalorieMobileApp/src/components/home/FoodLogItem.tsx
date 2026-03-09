import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Card from '../common/Card';

interface Props {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  imageUri?: string;
}

export default function FoodLogItem({
  foodName,
  calories,
  protein,
  carbs,
  fats,
  time,
  imageUri,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {/* Thumbnail or placeholder */}
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="fast-food-outline" size={22} color={colors.textTertiary} />
          </View>
        )}

        {/* Name, time, and nutrition */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.foodName} numberOfLines={1}>
              {foodName}
            </Text>
            <Text style={styles.calories}>
              {calories} {t('nutrition.kcal', { defaultValue: 'kcal' })}
            </Text>
          </View>

          <Text style={styles.time}>{time}</Text>

          {/* Macro pills */}
          <View style={styles.macroRow}>
            <MacroPill label={t('nutrition.p', { defaultValue: 'P' })} value={protein} color={colors.protein} />
            <MacroPill label={t('nutrition.c', { defaultValue: 'C' })} value={carbs} color={colors.carbs} />
            <MacroPill label={t('nutrition.f', { defaultValue: 'F' })} value={fats} color={colors.fats} />
          </View>
        </View>
      </View>
    </Card>
  );
}

interface MacroPillProps {
  label: string;
  value: number;
  color: string;
}

function MacroPill({ label, value, color }: MacroPillProps) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
      <Text style={styles.pillValue}>{value}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  placeholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  calories: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pillLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginRight: 3,
  },
  pillValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
});
