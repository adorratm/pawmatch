import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router/react-navigation';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import { useAuthStore } from '@/application/stores/authStore';
import { usersService } from '@/infrastructure/api/users.service';
import { pickImageUri } from '@/infrastructure/api/imageUpload';
import { User } from '@/domain/entities/User';

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState(user?.profile?.photoUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    const uri = await pickImageUri({ allowsEditing: true, aspect: [1, 1] });
    if (!uri) return;
    setUploadingAvatar(true);
    try {
      const data = await usersService.uploadAvatar(uri);
      const next = data?.avatar as string | undefined;
      if (next) setAvatarUri(next);
      const me = await usersService.getMe();
      setUser(User.fromJSON(me));
    } catch (e: any) {
      showAlert(t('common.error'), e?.response?.data?.message || t('profile.photoFailed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert(t('auth.missingInfoTitle'), t('profile.missingInfo'));
      return;
    }
    setSaving(true);
    try {
      const updated = await usersService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim(),
      });
      setUser(User.fromJSON(updated));
      showAlert(t('profile.savedTitle'), t('profile.savedMsg'));
      navigation.goBack();
    } catch (e: any) {
      showAlert(t('common.error'), e?.response?.data?.message || t('profile.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.editTitle')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickAvatar} disabled={uploadingAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]}>
              <Ionicons name="person" size={36} color={COLORS.textMuted} />
            </View>
          )}
          <View style={styles.avatarBadge}>
            {uploadingAvatar ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="camera" size={14} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>{t('profile.changePhoto')}</Text>
        <Input
          label={t('profile.labelFirstName')}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          textContentType="givenName"
        />
        <Input
          label={t('profile.labelLastName')}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          textContentType="familyName"
        />
        <Input
          label={t('profile.labelEmail')}
          value={user?.email || ''}
          editable={false}
          containerStyle={styles.disabledField}
        />
        <Input
          label={t('profile.labelBio')}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          placeholder={t('profile.placeholderBio')}
          maxLength={300}
          hint={`${bio.length}/300`}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  saveText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  content: { flex: 1, padding: 24 },
  avatarWrap: { alignSelf: 'center', marginBottom: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#eee' },
  avatarPh: { alignItems: 'center', justifyContent: 'center' },
  avatarBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 20,
  },
  disabledField: { opacity: 0.7 },
});
