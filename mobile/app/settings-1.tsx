import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../src/stores/authStore';
import { useUserStore } from '../src/stores/userStore';
import { usersService } from '../src/services/users.service';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen1() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, loadProfile, updateProfile } = useUserStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditFirstName(profile.firstName || '');
      setEditLastName(profile.lastName || '');
      setEditBio(profile.profile?.bio || '');
      setEditAvatar(profile.profile?.avatar || null);
    }
  }, [profile]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      let avatarUrl = editAvatar;
      
      // If avatar is a local URI, upload it first
      if (editAvatar && editAvatar.startsWith('file://')) {
        const filename = editAvatar.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('file', {
          uri: editAvatar,
          name: filename,
          type,
        } as any);

        const uploadResult = await usersService.uploadAvatar(formData);
        avatarUrl = uploadResult.avatar;
      }

      await updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        bio: editBio.trim() || undefined,
        avatar: avatarUrl || undefined,
      });
      setShowEditModal(false);
      Alert.alert('Başarılı', 'Profil güncellendi!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Hata', error?.response?.data?.message || 'Profil güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer} />
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.doneText}>Bitti</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => setShowEditModal(true)}
          >
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: profile?.profile?.avatar || 'https://i.pravatar.cc/150?img=1',
                }}
                style={styles.profileImage}
              />
              <View style={styles.editBadge}>
                <Ionicons name="create" size={12} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
              </Text>
              <Text style={styles.profileSubtext}>Profili Düzenle</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.premiumSection}>
          <View style={styles.premiumCard}>
            <View style={styles.premiumIcon}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>Pati Gold'a Geç</Text>
              <Text style={styles.premiumSubtitle}>Sınırsız beğeni hakkı kazan ve seni kimlerin beğendiğini anında gör.</Text>
            </View>
            <TouchableOpacity style={styles.premiumButton} onPress={() => router.push('/in-app-purchases')}>
              <Text style={styles.premiumButtonText}>Pati Gold'u Keşfet</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keşif Ayarları</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="location" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Konum</Text>
                <Text style={styles.settingSubtitle}>İstanbul, Kadıköy</Text>
              </View>
              <Switch value={locationEnabled} onValueChange={setLocationEnabled} trackColor={{ false: '#e5e5e5', true: COLORS.primary }} thumbColor="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/filter')}>
              <Ionicons name="options" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Filtreler</Text>
                <Text style={styles.settingSubtitle}>Tür, yaş, cinsiyet</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Bildirimler</Text>
                <Text style={styles.settingSubtitle}>Eşleşme, mesaj bildirimleri</Text>
              </View>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#e5e5e5', true: COLORS.primary }} thumbColor="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/notification-preferences-1')}>
              <Ionicons name="settings" size={24} color={COLORS.text} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Bildirim Tercihleri</Text>
                <Text style={styles.settingSubtitle}>Detaylı ayarlar</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="person" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>Profil Ayarları</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings-2')}>
              <Ionicons name="lock-closed" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>Gizlilik</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>Güvenlik</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diğer</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/help-support')}>
              <Ionicons name="help-circle" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>Yardım & Destek</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/about')}>
              <Ionicons name="information-circle" size={24} color={COLORS.text} />
              <Text style={styles.settingTitle}>Uygulama Hakkında</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelText}>İptal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Profili Düzenle</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <Text style={styles.modalSaveText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={handlePickImage}>
                <Image
                  source={{
                    uri: editAvatar || profile?.profile?.avatar || 'https://i.pravatar.cc/150?img=1',
                  }}
                  style={styles.editAvatar}
                />
                <View style={styles.avatarEditBadge}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ad</Text>
                <TextInput
                  style={styles.input}
                  value={editFirstName}
                  onChangeText={setEditFirstName}
                  placeholder="Adınız"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Soyad</Text>
                <TextInput
                  style={styles.input}
                  value={editLastName}
                  onChangeText={setEditLastName}
                  placeholder="Soyadınız"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Biyografi</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Kendiniz hakkında bir şeyler yazın..."
                  multiline
                  numberOfLines={4}
                  maxLength={300}
                />
                <Text style={styles.charCount}>{editBio.length}/300</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  spacer: { width: 60 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  doneText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  content: { flex: 1 },
  profileSection: { padding: 24, paddingBottom: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  profileImageContainer: { position: 'relative', marginRight: 16 },
  profileImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: COLORS.primary },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.background },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  profileSubtext: { fontSize: 14, color: COLORS.textMuted },
  premiumSection: { paddingHorizontal: 24, marginBottom: 24 },
  premiumCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.primary + '33', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  premiumIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  premiumInfo: { marginBottom: 16 },
  premiumTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  premiumSubtitle: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  premiumButton: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  premiumButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 24, marginBottom: 12 },
  settingsList: { backgroundColor: '#fff', marginHorizontal: 24, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  settingInfo: { flex: 1, marginLeft: 12 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, flex: 1, marginLeft: 12 },
  settingSubtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalCancelText: { fontSize: 16, color: COLORS.textMuted },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalSaveText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  modalContent: { flex: 1, padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  formSection: { gap: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
});


