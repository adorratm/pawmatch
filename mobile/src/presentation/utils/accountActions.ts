import React from 'react';
import { Alert, Platform } from 'react-native';
import { usersService } from '@/infrastructure/api/users.service';
import { useAuthStore } from '@/application/stores/authStore';

function confirm(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'İptal', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

export function confirmLogout() {
  confirm('Hesaptan Çıkış', 'Çıkış yapmak istediğine emin misin?', 'Çıkış Yap', () => {
    void useAuthStore.getState().logout();
  });
}

export function confirmDeleteAccount() {
  confirm(
    'Hesabı Sil',
    'Hesabın kalıcı olarak kapatılacak. Bu işlem geri alınamaz.',
    'Hesabı Sil',
    () => {
      void (async () => {
        try {
          await usersService.deleteAccount();
          await useAuthStore.getState().logout();
        } catch (e: any) {
          const msg = e?.response?.data?.message || 'Hesap silinemedi.';
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.alert(String(msg));
          } else {
            Alert.alert('Hata', String(msg));
          }
        }
      })();
    },
  );
}
