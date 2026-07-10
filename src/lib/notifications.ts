import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { readCache, writeCache, clearCache } from './storage/offlineCache';

const SETTINGS_KEY = 'reminder_settings';
const NOTIFICATION_ID_KEY = 'reminder_notification_id';

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const DEFAULT_SETTINGS: ReminderSettings = { enabled: false, hour: 18, minute: 0 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function getReminderSettings(): Promise<ReminderSettings> {
  return (await readCache<ReminderSettings>(SETTINGS_KEY)) ?? DEFAULT_SETTINGS;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

/** Rappel quotidien local d'entraînement. */
export async function setDailyReminder(hour: number, minute: number): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) throw new Error('Notifications refusées. Active-les dans les réglages du téléphone.');

  await cancelDailyReminder();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: "Rappels d'entraînement",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Running Line 🏃',
      body: "C'est l'heure de ta sortie du jour !",
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: 'reminders' },
  });

  await writeCache(NOTIFICATION_ID_KEY, id);
  await writeCache(SETTINGS_KEY, { enabled: true, hour, minute } satisfies ReminderSettings);
}

export async function cancelDailyReminder(): Promise<void> {
  const id = await readCache<string>(NOTIFICATION_ID_KEY);
  if (id) await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await clearCache(NOTIFICATION_ID_KEY);
  const settings = await getReminderSettings();
  await writeCache(SETTINGS_KEY, { ...settings, enabled: false } satisfies ReminderSettings);
}
