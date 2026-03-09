import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import Toggle from '../../components/common/Toggle';
import Header from '../../components/common/Header';
import * as preferencesService from '../../services/preferences';
import * as notificationService from '../../services/notifications';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadReminders();
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const enabled = await notificationService.areNotificationsEnabled();
    setNotificationsEnabled(enabled);
  };

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
      
      // Schedule notifications if permissions are granted
      if (notificationsEnabled) {
        await notificationService.scheduleReminders(reminders);
      }
    } catch {
      // Silently fail
    }
  };

  const handleRequestPermissions = async () => {
    const granted = await notificationService.requestNotificationPermissions();
    setNotificationsEnabled(granted);
    
    if (granted) {
      // Schedule reminders immediately after granting permissions
      const reminders = [
        { meal_type: 'breakfast', reminder_time: to24h(mealReminders.breakfast.time), enabled: mealReminders.breakfast.enabled },
        { meal_type: 'lunch', reminder_time: to24h(mealReminders.lunch.time), enabled: mealReminders.lunch.enabled },
        { meal_type: 'snack', reminder_time: to24h(mealReminders.snack.time), enabled: mealReminders.snack.enabled },
        { meal_type: 'dinner', reminder_time: to24h(mealReminders.dinner.time), enabled: mealReminders.dinner.enabled },
        { meal_type: 'end_of_day', reminder_time: to24h(endOfDay.time), enabled: endOfDay.enabled },
      ];
      await notificationService.scheduleReminders(reminders);
      Alert.alert(
        t('reminders.permissionsGranted', { defaultValue: 'Notifications Enabled' }),
        t('reminders.permissionsGrantedDesc', { defaultValue: 'You will now receive tracking reminders at your scheduled times.' })
      );
    } else {
      Alert.alert(
        t('reminders.permissionsDenied', { defaultValue: 'Permissions Required' }),
        t('reminders.permissionsDeniedDesc', { defaultValue: 'Please enable notifications in your device settings to receive reminders.' }),
        [
          { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
          { text: t('common.settings', { defaultValue: 'Settings' }), onPress: () => Linking.openSettings() },
        ]
      );
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
      <Header
        title={t('profile.trackingReminders', { defaultValue: 'Tracking Reminders' })}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Status Banner */}
        {!notificationsEnabled && (
          <TouchableOpacity
            style={styles.notificationBanner}
            onPress={handleRequestPermissions}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-off-outline"
              size={20}
              color={colors.warning}
              style={styles.bannerIcon}
            />
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerText}>
                {t('reminders.notificationsDisabled', {
                  defaultValue: 'Notifications are currently disabled. Tap to enable them and receive tracking reminders.',
                })}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {notificationsEnabled && (
          <View style={styles.notificationEnabledBanner}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
              style={styles.bannerIcon}
            />
            <Text style={styles.bannerEnabledText}>
              {t('reminders.notificationsEnabled', {
                defaultValue: 'Notifications are enabled. You will receive reminders at your scheduled times.',
              })}
            </Text>
          </View>
        )}

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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  notificationEnabledBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.success,
    padding: spacing.base,
    marginBottom: spacing.xl,
  },
  bannerIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  bannerEnabledText: {
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
