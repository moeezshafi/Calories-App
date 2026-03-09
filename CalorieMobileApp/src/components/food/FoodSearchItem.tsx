import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
  name: string;
  calories: number;
  serving: string;
  onAdd: () => void;
}

export default function FoodSearchItem({ name, calories, serving, onAdd }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.detailRow}>
          <Ionicons name="flame-outline" size={13} color={colors.textTertiary} />
          <Text style={styles.calories}>
            {' '}{calories} {t('nutrition.cal', { defaultValue: 'cal' })}
          </Text>
          <Text style={styles.dot}> {'\u00B7'} </Text>
          <Text style={styles.serving}>{serving}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAdd}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color={colors.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  textSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  calories: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  dot: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  serving: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
