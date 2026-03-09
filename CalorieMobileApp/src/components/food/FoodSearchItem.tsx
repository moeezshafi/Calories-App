import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
  name: string;
  calories: number;
  serving: string;
  onAdd: () => void;
  imageUri?: string;
}

export default function FoodSearchItem({ name, calories, serving, onAdd, imageUri }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.thumbnail} />
      )}
      <View style={styles.textSection}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.detailRow}>
          <Ionicons name="flame-outline" size={13} color={colors.textTertiary} />
          <Text style={styles.calories}>
            {' '}{calories} {t('nutrition.cal', { defaultValue: 'cal' })}
          </Text>
          <Text style={styles.dot}> • </Text>
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
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
    backgroundColor: colors.background,
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
