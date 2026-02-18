/**
 * FCM (Firebase Cloud Messaging) — push notifications.
 * Jab tak google-services.json add nahi karte, Firebase init nahi hoga — app crash nahi karegi.
 */

import {Platform} from 'react-native';
import {getApiBaseUrl} from '../utils/apiConfig';
import {store} from '../store/store';
import Toast from 'react-native-toast-message';

function getMessaging(): any {
  try {
    return require('@react-native-firebase/messaging').default;
  } catch {
    return null;
  }
}

/** Backend endpoint jahan FCM token POST karte hain. */
const getFcmTokenEndpoint = () => `${getApiBaseUrl()}/notifications/fcm-token`;

const getAuthToken = (): string | null =>
  (store.getState() as any)?.userSlices?.token ?? null;

/**
 * Permission maango, FCM token lo, backend ko bhejo.
 * Firebase na ho to silently null return.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const messaging = getMessaging();
  if (!messaging) return null;

  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return null;

    const token = await messaging().getToken();
    if (!token) return null;

    await sendFcmTokenToBackend(token);
    return token;
  } catch (e) {
    console.warn('FCM register error', e);
    return null;
  }
}

export async function sendFcmTokenToBackend(fcmToken: string): Promise<boolean> {
  const authToken = getAuthToken();
  if (!authToken) return false;

  try {
    const response = await fetch(getFcmTokenEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcmToken, platform: Platform.OS }),
    });
    return response.ok;
  } catch (e) {
    console.warn('FCM send token error', e);
    return false;
  }
}

function handleForegroundMessage(remoteMessage: any) {
  const title = remoteMessage?.notification?.title ?? remoteMessage?.data?.title ?? 'Notification';
  const body = remoteMessage?.notification?.body ?? remoteMessage?.data?.body ?? '';
  Toast.show({ type: 'info', text1: title, text2: body || undefined });
}

function handleNotificationOpened(remoteMessage: any) {
  const data = remoteMessage?.data ?? {};
  if (data?.screen) {
    // navigation.navigate(data.screen, data);
  }
}

/**
 * FCM listeners. Firebase na ho to kuch nahi karta, crash nahi.
 */
export function setupFcmListeners(): () => void {
  if (Platform.OS === 'web') return () => {};

  const messaging = getMessaging();
  if (!messaging) return () => {};

  try {
    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
      console.log('FCM background', remoteMessage?.messageId);
    });

    const unsubscribeForeground = messaging().onMessage(handleForegroundMessage);
    const unsubscribeOpened = messaging().onNotificationOpenedApp(handleNotificationOpened);

    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) handleNotificationOpened(remoteMessage);
      });

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  } catch (e) {
    console.warn('FCM setup error', e);
    return () => {};
  }
}
