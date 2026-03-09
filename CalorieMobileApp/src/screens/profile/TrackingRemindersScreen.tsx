import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Toggle from '../../components/common/Toggle';
import * as preferencesService from '../../services/preferences';

interface MealReminderState {
  breakfast: { time: string; enabled: boolean };
  lunch: { time: string; enabled: boolean };
  snack: { time: string; enabled: boolean };
  dinner: { time: string; enabled: boolean };
}

export default function TrackingRemindersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [mealReminders, setMealReminders] = useState<MealReminderState>({
    breakfast: { time: '8:30 AM', enabled: true },
    lunch: { time: '11:30 AM', enabled: true },
    snack: { time: '4:00 PM', enabled: false },
    dinner: { time: '6:00 PM', enabled: true },
  });
  const [endOfDay, setEndOfDay] = useState({ time: '9:00 PM', enabled: false });

  useEffect(() => {
    loadReminders();
  }, []);

  const to12h = (time24: string): string => {
    if (!time24 || time24.includes('AM') || time24.includes('PM')) return time24;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const to24h = (time12: string): string => {
    if (!time12 || !time12.includes(' ')) return time12;
    const [timePart, ampm] = time12.split(' ');
    let [h, m] = timePart.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const loadReminders = async () => {
    try {
      const result = await preferencesService.getReminders();
      // API returns: { success, data: { reminders: [...] } }
      const reminderList = result?.data?.reminders || result?.reminders || (Array.isArray(result?.data) ? result.data : []);
      if (Array.isArray(reminderList)) {
        const updated = { ...mealReminders };
        reminderList.forEach((r: any) => {
          const type = r.meal_type?.toLowerCase() as keyof MealReminderState;
          if (type && updated[type]) {
            updated[type] = {
              time: to12h(r.reminder_time) || updated[type].time,
              enabled: r.enabled ?? updated[type].enabled,
            };
          }
          if (r.meal_type === 'end_of_day') {
            setEndOfDay({
              time: to12h(r.reminder_time) || endOfDay.time,
              enabled: r.enabled ?? endOfDay.enabled,
            });
          }
        });
        setMealReminders(updated);
      }
    } catch {
      // Use defaults
    }
  };

  const toggleMealReminder = async (meal: keyof MealReminderState) => {
    const newState = {
      ...mealReminders,
      [meal]: {
        ...mealReminders[meal],
        enabled: !mealReminders[meal].enabled,
      },
    };
    setMealReminders(newState);
    saveReminders(newState, endOfDay);
  };

  const toggleEndOfDay = async () => {
    const newEndOfDay = { ...endOfDay, enabled: !endOfDay.enabled };
    setEndOfDay(newEndOfDay);
    saveReminders(mealReminders, newEndOfDay);
  };

  const saveReminders = async (meals: MealReminderState, eod: typeof endOfDay) => {
    try {
      const reminders = [
        { meal_type: 'breakfast', reminder_time: to24h(meals.breakfast.time), enabled: meals.breakfast.enabled },
        { meal_type: 'lunch', reminder_time: to24h(meals.lunch.time), enabled: meals.lunch.enabled },
        { meal_type: 'snack', reminder_time: to24h(meals.snack.time), enabled: meals.snack.enabled },
        { meal_type: 'dinner', reminder_time: to24h(meals.dinner.time), enabled: meals.dinner.enabled },
        { meal_type: 'end_of_day', reminder_time: to24h(eod.time), enabled: eod.enabled },
      ];
      await preferencesService.updateReminders(reminders);
    } catch {
      // Silently fail
    }
  };

  const mealList: { key: keyof MealReminderState; label: string }[] = [
    { key: 'breakfast', label: t('food.breakfast', { defaultValue: 'Breakfast' }) },
    { key: 'lunch', label: t('food.lunch', { defaultValue: 'Lunch' }) },
    { key: 'snack', label: t('food.snack', { defaultValue: 'Snack' }) },
    { key: 'dinner', label: t('food.dinner', { defaultValue: 'Dinner' }) },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleSpace} />
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Status Banner */}
        <View style={styles.notificationBanner}>
          <Ionicons
            name="notifications-off-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.bannerIcon}
          />
          <Text style={styles.bannerText}>
            {t('reminders.notificationsDisabled', {
              defaultValue: 'Notifications are currently disabled. Enable them in your device settings to receive tracking reminders.',
            })}
          </Text>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>
          {t('profile.trackingReminders', { defaultValue: 'Tracking Reminders' })}
        </Text>

        {/* Meal Reminders Card */}
        <View style={styles.reminderCard}>
          {mealList.map((meal, index) => {
            const reminder = mealReminders[meal.key];
            const isLast = index === mealList.length - 1;
            return (
              <View
                key={meal.key}
                style={[styles.reminderRow, !isLast && styles.reminderRowBorder]}
              >
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderLabel}>{meal.label}</Text>
                  <Text style={styles.reminderTime}>{reminder.time}</Text>
                </View>
                <Toggle
                  value={reminder.enabled}
                  onValueChange={() => toggleMealReminder(meal.key)}
                />
              </View>
            );
          })}
        </View>

        {/* End of Day Card */}
        <View style={styles.endOfDayCard}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderLabel}>
                {t('reminders.endOfDay', { defaultValue: 'End of Day' })}
              </Text>
              <Text style={styles.reminderTime}>{endOfDay.time}</Text>
            </View>
            <Toggle
              value={endOfDay.enabled}
              onValueChange={toggleEndOfDay}
            />
          </View>
          <Text style={styles.endOfDayDesc}>
            {t('reminders.endOfDayDesc', {
              defaultValue: 'Get a summary of your daily intake and a reminder to log any remaining meals.',
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  headerTitleSpace: {
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  // Notification Banner
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  bannerIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  bannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  // Section Title
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  // Meal Reminders Card
  reminderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
  },
  reminderRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  // End of Day Card
  endOfDayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  endOfDayDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
});
