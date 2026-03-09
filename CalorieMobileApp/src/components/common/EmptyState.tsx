import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../theme';

interface EmptyStateProps {
  message: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = 'document-text-outline',
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon as any}
        size={56}
        color={colors.textTertiary}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
  message: {
    marginTop: spacing.base,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
});

export default EmptyState;
