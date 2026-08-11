import { Text, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Ubuntu_400Regular,
  Ubuntu_500Medium,
  Ubuntu_700Bold,
} from '@expo-google-fonts/ubuntu';
import { FONTS } from './config';

const ubuntuFontMap = {
  [FONTS.regular]: Ubuntu_400Regular,
  [FONTS.medium]: Ubuntu_500Medium,
  [FONTS.bold]: Ubuntu_700Bold,
};

let defaultsApplied = false;

function applyDefaultFontFamily() {
  if (defaultsApplied) return;
  defaultsApplied = true;

  const base = { fontFamily: FONTS.regular };

  const TextAny = Text as typeof Text & {
    defaultProps?: { style?: unknown };
  };
  TextAny.defaultProps = TextAny.defaultProps ?? {};
  TextAny.defaultProps.style = [base, TextAny.defaultProps.style];

  const InputAny = TextInput as typeof TextInput & {
    defaultProps?: { style?: unknown };
  };
  InputAny.defaultProps = InputAny.defaultProps ?? {};
  InputAny.defaultProps.style = [base, InputAny.defaultProps.style];
}

export function useAppFonts() {
  const [loaded, error] = useFonts(ubuntuFontMap);

  // Apply before first paint of screens that wait on fontsLoaded
  if (loaded) {
    applyDefaultFontFamily();
  }

  return { fontsLoaded: loaded, fontError: error };
}
