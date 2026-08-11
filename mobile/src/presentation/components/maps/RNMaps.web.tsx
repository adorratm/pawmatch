import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { COLORS } from '@/presentation/styles/config';

type MapViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  [key: string]: unknown;
};

/** react-native-maps web'de native codegen kullanır; web için boş kabuk. */
export function MapView({ style }: MapViewProps) {
  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.title}>Harita web'de desteklenmiyor</Text>
      <Text style={styles.subtitle}>Bu ekranı iOS veya Android uygulamasında açın.</Text>
    </View>
  );
}

export function Marker(_props: Record<string, unknown>) {
  return null;
}

export function Callout(_props: Record<string, unknown>) {
  return null;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
