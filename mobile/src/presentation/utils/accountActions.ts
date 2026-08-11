import { usersService } from '@/infrastructure/api/users.service';
import { useAuthStore } from '@/application/stores/authStore';
import { showAlert, showConfirm } from '@/presentation/utils/dialog';
import { t } from '@/i18n';

export function confirmLogout() {
  showConfirm({
    title: t('settings.logoutTitle'),
    message: t('settings.logoutMessage'),
    confirmLabel: t('settings.logoutConfirm'),
    icon: 'log-out-outline',
    variant: 'default',
    onConfirm: () => {
      void useAuthStore.getState().logout();
    },
  });
}

export function confirmDeleteAccount() {
  showConfirm({
    title: t('settings.deleteTitle'),
    message: t('settings.deleteMessage'),
    confirmLabel: t('settings.deleteConfirm'),
    icon: 'trash-outline',
    variant: 'destructive',
    onConfirm: async () => {
      try {
        await usersService.deleteAccount();
        await useAuthStore.getState().logout();
      } catch (e: any) {
        const msg = e?.response?.data?.message || t('settings.deleteFailed');
        queueMicrotask(() =>
          showAlert(t('common.error'), String(msg), {
            variant: 'destructive',
            icon: 'alert-circle-outline',
          }),
        );
      }
    },
  });
}
