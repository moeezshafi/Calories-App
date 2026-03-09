import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface BadgeIconProps {
  icon: string;
  name: string;
  earned?: boolean;
  size?: number;
}

const ICON_MAP: Record<string, string> = {
  star: 'star',
  fire: 'flame',
  trophy: 'trophy',
  medal: 'medal',
  shield: 'shield-checkmark',
  crown: 'ribbon',
  diamond: 'diamond',
};

export const BadgeIcon: React.FC<BadgeIconProps> = ({ icon, name, earned = false, size = 56 }) => {
  const ionIcon = ICON_MAP[icon] || 'ribbon';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          earned ? styles.earned : styles.locked,
        ]}
      >
        <Ionicons
          name={ionIcon as any}
          size={size * 0.45}
          color={earned ? colors.accent : colors.textTertiary}
        />
      </View>
      <Text style={[styles.name, !earned && styles.lockedText]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  earned: {
    backgroundColor: `${colors.accent}20`,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  locked: {
    backgroundColor: colors.divider,
    borderWidth: 2,
    borderColor: colors.surfaceBorder,
  },
  name: {
    fontSize: typography.sizes.xxs,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: typography.weights.medium as any,
  },
  lockedText: {
    color: colors.textTertiary,
  },
});
