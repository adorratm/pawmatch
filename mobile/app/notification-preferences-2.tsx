import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationPreferencesScreen2() {
  const router = useRouter();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [quietHours, setQuietHours] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirim Kanalları</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Kanalları</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Bildirimleri</Text>
                <Text style={styles.settingSubtitle}>Uygulama içi bildirimler</Text>
              </View>
              <Switch value={pushNotifications} onValueChange={setPushNotifications} trackColor={{ false: '#e5e5e5', true: COLORS.primary }} thumbColor="#fff" />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>E-posta Bildirimleri</Text>
                <Text style={styles.settingSubtitle}>E-posta ile bildirim al</Text>
              </View>
              <Switch value={emailNotifications} onValueChange={setEmailNotifications} trackColor={{ false: '#e5e5e5', true: COLORS.primary }} thumbColor="#fff" />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>SMS Bildirimleri</Text>
                <Text style={styles.settingSubtitle}>SMS ile bildirim al</Text>
              </View>
              <Switch value={smsNotifications} onValueChange={setSmsNotifications} trackColor={{ false: '#e5e5e5', true: COLORS.primary }} thumbColor="#fff" />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessiz Saatler</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Sessiz Saatleri Aktif Et</Text>
                <Text style={styles.settingSubtitle}>22:00 - 08:00 arası bildirim gönderme</Text>
              </View>
              <Switch value={quietHours} onValueChange={setQuietHours} trackColor={{ false: '#e5e5e5', true: COLORS.primary }} thumbColor="#fff" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  spacer: { width: 24 },
  content: { flex: 1 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 24, marginBottom: 12 },
  settingsList: { backgroundColor: '#fff', marginHorizontal: 24, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  settingSubtitle: { fontSize: 12, color: COLORS.textMuted },
});


