import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/presentation/styles/config';
import { useDialogStore } from '@/application/stores/dialogStore';

const VARIANT_COLOR: Record<string, string> = {
  default: COLORS.primary,
  destructive: '#c45c26',
  success: COLORS.success,
  info: COLORS.primaryLight,
};

export function AppDialog() {
  const visible = useDialogStore((s) => s.visible);
  const config = useDialogStore((s) => s.config);
  const busy = useDialogStore((s) => s.busy);
  const close = useDialogStore((s) => s.close);
  const setBusy = useDialogStore((s) => s.setBusy);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.92);
    }
  }, [visible, opacity, scale]);

  if (!config) return null;

  const accent = VARIANT_COLOR[config.variant ?? 'default'] ?? COLORS.primary;
  const showCancel = config.showCancel !== false;

  const handleCancel = () => {
    if (busy) return;
    config.onCancel?.();
    close();
  };

  const handleConfirm = async () => {
    if (busy) return;
    try {
      setBusy(true);
      await config.onConfirm?.();
      close();
    } catch {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={showCancel ? handleCancel : undefined} />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
            <Ionicons
              name={config.icon ?? 'help-circle-outline'}
              size={28}
              color={accent}
            />
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message}>{config.message}</Text>

          <View style={[styles.actions, !showCancel && styles.actionsSingle]}>
            {showCancel ? (
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={handleCancel}
                disabled={busy}
                accessibilityRole="button"
              >
                <Text style={styles.btnGhostText}>{config.cancelLabel ?? 'İptal'}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                { backgroundColor: accent },
                !showCancel && styles.btnFull,
                busy && styles.btnDisabled,
              ]}
              onPress={() => void handleConfirm()}
              disabled={busy}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>{config.confirmLabel ?? 'Onayla'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 37, 32, 0.48)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 24px 48px rgba(44, 37, 32, 0.18)',
      },
      default: {
        shadowColor: '#2c2520',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
      },
    }),
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionsSingle: {
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  btnFull: {
    flex: 1,
    maxWidth: 220,
    alignSelf: 'center',
  },
  btnGhost: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnGhostText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.text,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#fff',
  },
  btnDisabled: {
    opacity: 0.7,
  },
});

export default AppDialog;
