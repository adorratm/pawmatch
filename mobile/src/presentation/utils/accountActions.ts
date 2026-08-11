import { usersService } from '@/infrastructure/api/users.service';
import { useAuthStore } from '@/application/stores/authStore';
import { showAlert, showConfirm } from '@/presentation/utils/dialog';

export function confirmLogout() {
  showConfirm({
    title: 'Hesaptan Çıkış',
    message: 'Çıkış yapmak istediğine emin misin?',
    confirmLabel: 'Çıkış Yap',
    icon: 'log-out-outline',
    variant: 'default',
    onConfirm: () => {
      void useAuthStore.getState().logout();
    },
  });
}

export function confirmDeleteAccount() {
  showConfirm({
    title: 'Hesabı Sil',
    message: 'Hesabın kalıcı olarak kapatılacak. Bu işlem geri alınamaz.',
    confirmLabel: 'Hesabı Sil',
    icon: 'trash-outline',
    variant: 'destructive',
    onConfirm: async () => {
      try {
        await usersService.deleteAccount();
        await useAuthStore.getState().logout();
      } catch (e: any) {
        const msg = e?.response?.data?.message || 'Hesap silinemedi.';
        queueMicrotask(() =>
          showAlert('Hata', String(msg), {
            variant: 'destructive',
            icon: 'alert-circle-outline',
          }),
        );
      }
    },
  });
}
