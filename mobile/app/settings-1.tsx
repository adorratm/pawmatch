import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen1() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

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
          <TouchableOpacity style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=1' }} style={styles.profileImage} />
              <View style={styles.editBadge}>
                <Ionicons name="create" size={12} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Boncuk, 3</Text>
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
});

