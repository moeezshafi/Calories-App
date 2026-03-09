import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ReminderConfig {
  meal_type: string;
  reminder_time: string; // HH:MM format
  enabled: boolean;
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meal-reminders', {
        name: 'Meal Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#065F46',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedule a daily notification at a specific time
 */
async function scheduleDailyNotification(
  identifier: string,
  title: string,
  body: string,
  hour: number,
  minute: number,
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'meal_reminder', identifier },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        repeats: true,
        channelId: Platform.OS === 'android' ? 'meal-reminders' : undefined,
      },
    });
    return notificationId;
  } catch (error) {
    console.error(`Error scheduling notification ${identifier}:`, error);
    return null;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Cancel a specific notification by identifier
 */
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const notification = scheduled.find(
      (n) => n.content.data?.identifier === identifier,
    );
    if (notification?.identifier) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error(`Error canceling notification ${identifier}:`, error);
  }
}

/**
 * Schedule all meal reminders based on configuration
 */
export async function scheduleReminders(reminders: ReminderConfig[]): Promise<void> {
  try {
    // First, cancel all existing notifications
    await cancelAllNotifications();

    // Check permissions
    const hasPermission = await areNotificationsEnabled();
    if (!hasPermission) {
      console.log('Notification permissions not granted');
      return;
    }

    // Schedule each enabled reminder
    for (const reminder of reminders) {
      if (!reminder.enabled) continue;

      const [hourStr, minuteStr] = reminder.reminder_time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour) || isNaN(minute)) continue;

      let title = '';
      let body = '';

      switch (reminder.meal_type.toLowerCase()) {
        case 'breakfast':
          title = 'Breakfast Time!';
          body = "Don't forget to log your breakfast and start your day right!";
          break;
        case 'lunch':
          title = 'Lunch Reminder';
          body = 'Time for lunch! Remember to track your meal.';
          break;
        case 'snack':
          title = 'Snack Time';
          body = 'Having a snack? Log it to stay on track!';
          break;
        case 'dinner':
          title = 'Dinner Time';
          body = "It's dinner time! Don't forget to log your meal.";
          break;
        case 'end_of_day':
          title = 'Daily Summary';
          body = 'Review your daily intake and log any remaining meals!';
          break;
        default:
          title = 'Meal Reminder';
          body = 'Time to log your meal!';
      }

      await scheduleDailyNotification(
        `reminder_${reminder.meal_type}`,
        title,
        body,
        hour,
        minute,
      );
    }

    console.log('Reminders scheduled successfully');
  } catch (error) {
    console.error('Error scheduling reminders:', error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}
