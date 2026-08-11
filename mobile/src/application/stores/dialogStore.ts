import { create } from 'zustand';
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type DialogIconName = ComponentProps<typeof Ionicons>['name'];

export type DialogVariant = 'default' | 'destructive' | 'success' | 'info';

export type DialogButton = {
  label: string;
  variant?: 'primary' | 'destructive' | 'ghost';
  onPress?: () => void | Promise<void>;
};

export type DialogConfig = {
  title: string;
  message: string;
  icon?: DialogIconName;
  variant?: DialogVariant;
  cancelLabel?: string;
  confirmLabel?: string;
  /** If false, hide cancel (alert-style). Default true for confirm. */
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

type DialogState = {
  visible: boolean;
  config: DialogConfig | null;
  busy: boolean;
  open: (config: DialogConfig) => void;
  close: () => void;
  setBusy: (busy: boolean) => void;
};

export const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  config: null,
  busy: false,
  open: (config) => set({ visible: true, config, busy: false }),
  close: () => set({ visible: false, config: null, busy: false }),
  setBusy: (busy) => set({ busy }),
}));
