import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export async function appendImageFile(form: FormData, uri: string, field = 'file') {
  const ext = (uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  const mime =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
  const name = `upload.${ext === 'jpeg' ? 'jpg' : ext}`;

  if (Platform.OS === 'web' || uri.startsWith('blob:') || uri.startsWith('data:')) {
    const res = await fetch(uri);
    const blob = await res.blob();
    form.append(field, blob, name);
    return;
  }

  form.append(field, { uri, name, type: mime } as never);
}

export async function pickImageUri(opts?: { allowsEditing?: boolean; aspect?: [number, number] }) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: opts?.allowsEditing ?? true,
    aspect: opts?.aspect ?? [1, 1],
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}
