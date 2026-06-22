import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Foreground presentation: show a banner + list entry, play a sound, don't
// touch the app badge. (SDK 53+ keys.)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    undefined
  );
}

async function fetchToken() {
  const projectId = getProjectId();
  const res = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  return res.data; // ExponentPushToken[xxxx]
}

// Ask for permission (if needed) and return the device's Expo push token.
// Throws 'PERMISSION_DENIED' or 'NOT_A_DEVICE' so the UI can message clearly.
export async function requestPushToken() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  if (!Device.isDevice) {
    const err = new Error('NOT_A_DEVICE');
    err.code = 'NOT_A_DEVICE';
    throw err;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') {
    const err = new Error('PERMISSION_DENIED');
    err.code = 'PERMISSION_DENIED';
    throw err;
  }

  return fetchToken();
}

// Return the token only if permission is already granted (no prompt). Used to
// silently refresh the server token on launch. Returns null otherwise.
export async function getPushTokenIfGranted() {
  try {
    if (!Device.isDevice) return null;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;
    return await fetchToken();
  } catch {
    return null;
  }
}
