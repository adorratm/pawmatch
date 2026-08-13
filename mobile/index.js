import './src/setup/silenceWebPointerEventsWarning';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

import 'expo-router/entry';

