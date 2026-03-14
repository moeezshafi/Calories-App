import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
  count: number;
}

export default function StreakBadge({ count }: Props) {
  if (count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Ionicons name="flame" size={16} color={colors.warning} style={styles.fireIcon} />
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  fireIcon: {
    fontSize: typography.sizes.base,
    marginRight: spacing.xs,
  },
  count: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
