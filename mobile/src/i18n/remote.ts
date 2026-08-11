import api from '@/infrastructure/api/api';
import { i18n } from './index';

/**
 * Web panelinden gelen çevirileri yükler ve yerel sözlüğe deep-merge eder.
 * Endpoint henüz yoksa sessizce no-op.
 */
export async function loadRemoteTranslations(locale: string = 'tr'): Promise<void> {
  try {
    const { data } = await api.get(`/i18n/${locale}`);
    if (data && typeof data === 'object') {
      i18n.addResourceBundle(locale, 'translation', data, true, true);
    }
  } catch {
    // Panel / endpoint yok — bundled tr kullanılır
  }
}
