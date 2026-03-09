import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Card from '../common/Card';

interface Props {
  waterMl: number;
  onLogWater: () => void;
}

export default function WaterCard({ waterMl, onLogWater }: Props) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        {/* Water icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="water" size={24} color={colors.info} />
        </View>

        {/* Label + value */}
        <View style={styles.textSection}>
          <Text style={styles.label}>
            {t('home.water', { defaultValue: 'Water' })}
          </Text>
          <Text style={styles.value}>
            {waterMl.toLocaleString()}{' '}
            <Text style={styles.unit}>
              {t('home.ml', { defaultValue: 'ml' })}
            </Text>
          </Text>
        </View>

        {/* Log water button */}
        <TouchableOpacity
          style={styles.logButton}
          onPress={onLogWater}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={colors.primary} style={styles.logButtonIcon} />
          <Text style={styles.logButtonText}>
            {t('home.logWater', { defaultValue: 'Log Water' })}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    marginLeft: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  unit: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.textTertiary,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logButtonIcon: {
    marginRight: 4,
  },
  logButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});
