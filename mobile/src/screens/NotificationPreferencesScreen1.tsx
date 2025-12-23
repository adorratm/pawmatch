import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/config';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationPreferencesScreen1() {
  const navigation = useNavigation();
  const [newMatches, setNewMatches] = useState(true);
  const [messages, setMessages] = useState(true);
  const [likes, setLikes] = useState(false);
  const [appointments, setAppointments] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirim Tercihleri</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Türleri</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="heart" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Yeni Eşleşmeler</Text>
                <Text style={styles.settingSubtitle}>Eşleştiğinizde bildirim al</Text>
              </View>
              <Switch
                value={newMatches}
                onValueChange={setNewMatches}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="chatbubble" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Yeni Mesajlar</Text>
                <Text style={styles.settingSubtitle}>Mesaj geldiğinde bildirim al</Text>
              </View>
              <Switch
                value={messages}
                onValueChange={setMessages}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="thumbs-up" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Beğeniler</Text>
                <Text style={styles.settingSubtitle}>Profilin beğenildiğinde bildirim al</Text>
              </View>
              <Switch
                value={likes}
                onValueChange={setLikes}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Randevular</Text>
                <Text style={styles.settingSubtitle}>Randevu hatırlatmaları</Text>
              </View>
              <Switch
                value={appointments}
                onValueChange={setAppointments}
                trackColor={{ false: '#e5e5e5', true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  settingsList: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});


