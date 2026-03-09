import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import { getWeekDates, isSameDay } from '../../utils/date';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function WeekDaySelector({ selectedDate, onSelectDate }: Props) {
  const { t } = useTranslation();
  const weekDates = getWeekDates(selectedDate);

  return (
    <View style={styles.container}>
      {weekDates.map((date, index) => {
        const isSelected = isSameDay(date, selectedDate);
        return (
          <TouchableOpacity key={index} style={styles.dayItem} onPress={() => onSelectDate(date)}>
            <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>
              {t(`days.${DAY_KEYS[date.getDay()]}`)}
            </Text>
            <View style={[styles.dateCircle, isSelected && styles.dateCircleActive]}>
              <Text style={[styles.dateNumber, isSelected && styles.dateNumberActive]}>
                {date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  dayItem: { alignItems: 'center', flex: 1 },
  dayLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: 6 },
  dayLabelActive: { color: colors.textPrimary, fontWeight: typography.weights.semibold },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    borderStyle: 'dashed',
  },
  dateCircleActive: { borderColor: colors.textPrimary, borderStyle: 'solid', borderWidth: 2 },
  dateNumber: { fontSize: typography.sizes.base, color: colors.textSecondary },
  dateNumberActive: { color: colors.textPrimary, fontWeight: typography.weights.bold },
});
