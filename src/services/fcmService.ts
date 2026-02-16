/**
 * FCM (Firebase Cloud Messaging) — push notifications.
 * Backend ko FCM token bhejna zaroori hai taake wo isi device ko push bhej sake.
 */

import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {getApiBaseUrl} from '../utils/apiConfig';
import {store} from '../store/store';
import Toast from 'react-native-toast-message';

const FCM_TOKEN_STORAGE_KEY = '@fcm_token_sent';

/** Backend endpoint jahan FCM token POST karte hain. Apni API ke hisaab se change kar sakte ho. */
const getFcmTokenEndpoint = () => `${getApiBaseUrl()}/notifications/fcm-token`;

const getAuthToken = (): string | null =>
  (store.getState() as any)?.userSlices?.token ?? null;

/** Android: background/quit state me notification receive karne ke liye zaroori */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Yahan koi heavy logic mat chalao; sirf log ya lightweight kaam
  console.log('FCM background message', remoteMessage?.messageId);
});

/**
 * Permission maango (iOS + Android 13+), FCM token lo, aur backend ko bhejo.
 * Settings me Push ON karne par ya login ke baad call karo.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.warn('FCM: Permission not granted', authStatus);
      return null;
    }

    const token = await messaging().getToken();
    if (!token) return null;

    await sendFcmTokenToBackend(token);
    return token;
  } catch (e) {
    console.warn('FCM register error', e);
    return null;
  }
}

/**
 * Backend ko FCM token bhejo taake wo is device ko push bhej sake.
 * Endpoint / body apne API ke mutabiq change kar sakte ho.
 */
export async function sendFcmTokenToBackend(fcmToken: string): Promise<boolean> {
  const authToken = getAuthToken();
  if (!authToken) {
    console.warn('FCM: No auth token, skipping send to backend');
    return false;
  }

  try {
    const response = await fetch(getFcmTokenEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fcmToken,
        platform: Platform.OS,
        // agar backend chahe to: appVersion, deviceId, etc.
      }),
    });

    if (!response.ok) {
      console.warn('FCM token save failed', response.status, await response.text());
      return false;
    }
    return true;
  } catch (e) {
    console.warn('FCM send token error', e);
    return false;
  }
}

/**
 * Foreground me notification aane par (in-app) — Toast ya koi UI.
 */
function handleForegroundMessage(remoteMessage: any) {
  const title = remoteMessage?.notification?.title ?? remoteMessage?.data?.title ?? 'Notification';
  const body = remoteMessage?.notification?.body ?? remoteMessage?.data?.body ?? '';
  Toast.show({
    type: 'info',
    text1: title,
    text2: body || undefined,
  });
}

/**
 * Jab user notification tap karke app open kare (app background/quit thi).
 */
function handleNotificationOpened(remoteMessage: any) {
  // Optional: specific screen open karo based on data
  const data = remoteMessage?.data ?? {};
  if (data?.screen) {
    // navigation.navigate(data.screen, data);
  }
}

/**
 * FCM listeners set karo. App start par ek baar call karo (e.g. App.tsx).
 */
export function setupFcmListeners(): () => void {
  if (Platform.OS === 'web') return () => {};

  const unsubscribeForeground = messaging().onMessage(handleForegroundMessage);
  const unsubscribeOpened = messaging().onNotificationOpenedApp(handleNotificationOpened);

  // App quit state se notification tap se open hua?
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) handleNotificationOpened(remoteMessage);
    });

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
  };
}
