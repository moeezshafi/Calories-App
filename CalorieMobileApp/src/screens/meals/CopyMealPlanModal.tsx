import React from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectDay: (dayIndex: number) => void;
  currentDayIndex: number;
  weekDates: Date[];
}

export default function CopyMealPlanModal({
  visible,
  onClose,
  onSelectDay,
  currentDayIndex,
  weekDates,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('meals.copyToDay', { defaultValue: 'Copy to Day' })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t('meals.selectTargetDay', { defaultValue: 'Select the day to copy meals to:' })}
          </Text>

          <ScrollView style={styles.dayList} showsVerticalScrollIndicator={false}>
            {weekDates.map((date, index) => {
              const isCurrentDay = index === currentDayIndex;
              const dayLabel = DAY_LABELS[index];
              const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayItem,
                    isCurrentDay && styles.dayItemDisabled,
                  ]}
                  onPress={() => {
                    if (!isCurrentDay) {
                      onSelectDay(index);
                      onClose();
                    }
                  }}
                  disabled={isCurrentDay}
                  activeOpacity={0.7}
                >
                  <View style={styles.dayInfo}>
                    <Text style={[
                      styles.dayLabel,
                      isCurrentDay && styles.dayLabelDisabled,
                    ]}>
                      {dayLabel}
                    </Text>
                    <Text style={[
                      styles.dayDate,
                      isCurrentDay && styles.dayDateDisabled,
                    ]}>
                      {dateStr}
                    </Text>
                  </View>
                  {isCurrentDay && (
                    <Text style={styles.currentDayBadge}>
                      {t('meals.currentDay', { defaultValue: 'Current' })}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 28,
    color: colors.textTertiary,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  dayList: {
    maxHeight: 300,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.base,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dayItemDisabled: {
    opacity: 0.5,
    backgroundColor: colors.surface,
  },
  dayInfo: {
    flex: 1,
  },
  dayLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  dayLabelDisabled: {
    color: colors.textTertiary,
  },
  dayDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayDateDisabled: {
    color: colors.textTertiary,
  },
  currentDayBadge: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
  },
  cancelButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
});
