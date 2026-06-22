import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { navigationRef } from '../lib/navigationRef';
import { getPushTokenIfGranted } from '../lib/push';
import { registerPushToken } from '../api';

export const PUSH_OPT_IN_KEY = 'push_opt_in';

// Route a tapped notification to the right place.
function route(data) {
  if (!navigationRef.isReady() || !data) return;
  if (data.subscriptionId) {
    navigationRef.navigate('HomeTab', {
      screen: 'SubscriptionDetail',
      params: { id: data.subscriptionId },
    });
  } else {
    navigationRef.navigate('HomeTab', { screen: 'Notifications' });
  }
}

// Mounted once inside the authenticated tree: refreshes the server-side token
// (Expo tokens rotate) and routes notification taps. Renders nothing.
export function PushManager() {
  useEffect(() => {
    let mounted = true;

    (async () => {
      const optedIn = await AsyncStorage.getItem(PUSH_OPT_IN_KEY);
      if (optedIn !== '1' || !mounted) return;
      const token = await getPushTokenIfGranted();
      if (token) {
        try {
          await registerPushToken(token, Platform.OS);
        } catch {
          /* offline / transient — will retry next launch */
        }
      }
    })();

    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      route(resp?.notification?.request?.content?.data);
    });

    // App cold-started by tapping a notification.
    Notifications.getLastNotificationResponseAsync().then((resp) => {
      if (resp) route(resp.notification.request.content.data);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return null;
}
