/** Web'de push bildirimleri desteklenmez; expo-notifications yüklenmez. */

export async function configurePushNotificationBehavior(): Promise<void> {}

export async function getExpoPushTokenOrNull(): Promise<string | null> {
  return null;
}

export async function registerPushTokenWithBackend(): Promise<void> {}

export async function unregisterPushTokenFromBackend(): Promise<void> {}
