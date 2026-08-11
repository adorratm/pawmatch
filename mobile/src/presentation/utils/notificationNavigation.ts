import type { AppNotification } from '@/infrastructure/api/notifications.service';

/** Bildirim tipine / data alanına göre ilgili ekrana yönlendir */
export function navigateFromNotification(navigation: any, item: AppNotification) {
  const data = item.data ?? {};
  const type = item.type || data.type;

  if (type === 'match' || type === 'like') {
    if (data.conversationId) {
      (navigation as any).navigate('Chat', { id: String(data.conversationId) });
      return;
    }
    if (data.likedPetId || data.petId) {
      (navigation as any).navigate('PetDetail', {
        id: String(data.likedPetId ?? data.petId),
      });
      return;
    }
    if (data.isAdoption || type === 'like') {
      (navigation as any).navigate('IncomingLikes');
      return;
    }
    (navigation as any).navigate('Matches');
    return;
  }

  if (type === 'message' && data.conversationId) {
    (navigation as any).navigate('Chat', { id: String(data.conversationId) });
    return;
  }

  if (type === 'appointment' || type === 'appointment_reminder') {
    (navigation as any).navigate('AppointmentHistory');
    return;
  }

  if (data.conversationId) {
    (navigation as any).navigate('Chat', { id: String(data.conversationId) });
    return;
  }

  if (data.petId || data.likedPetId) {
    (navigation as any).navigate('PetDetail', {
      id: String(data.petId ?? data.likedPetId),
    });
  }
}
