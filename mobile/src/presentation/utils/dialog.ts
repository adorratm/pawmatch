import {
  useDialogStore,
  type DialogConfig,
  type DialogVariant,
} from '@/application/stores/dialogStore';

function defaultIcon(variant: DialogVariant = 'default') {
  switch (variant) {
    case 'destructive':
      return 'warning-outline' as const;
    case 'success':
      return 'checkmark-circle-outline' as const;
    case 'info':
      return 'information-circle-outline' as const;
    default:
      return 'help-circle-outline' as const;
  }
}

export function showConfirm(
  config: Omit<DialogConfig, 'showCancel'> & { showCancel?: boolean },
): void {
  const variant = config.variant ?? 'default';
  useDialogStore.getState().open({
    ...config,
    variant,
    icon: config.icon ?? defaultIcon(variant),
    showCancel: config.showCancel ?? true,
    cancelLabel: config.cancelLabel ?? 'İptal',
    confirmLabel: config.confirmLabel ?? 'Onayla',
  });
}

export function showAlert(
  title: string,
  message: string,
  options?: Partial<Pick<DialogConfig, 'icon' | 'variant' | 'confirmLabel' | 'onConfirm'>>,
): void {
  useDialogStore.getState().open({
    title,
    message,
    variant: options?.variant ?? 'info',
    icon: options?.icon ?? defaultIcon(options?.variant ?? 'info'),
    showCancel: false,
    confirmLabel: options?.confirmLabel ?? 'Tamam',
    onConfirm: options?.onConfirm,
  });
}

/** Promise-based confirm — resolves true if confirmed */
export function confirmAsync(
  config: Omit<DialogConfig, 'onConfirm' | 'onCancel' | 'showCancel'>,
): Promise<boolean> {
  return new Promise((resolve) => {
    showConfirm({
      ...config,
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
