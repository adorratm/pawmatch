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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router/react-navigation';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import { useAuthStore } from '@/application/stores/authStore';
import { usersService } from '@/infrastructure/api/users.service';
import { User } from '@/domain/entities/User';

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert('Eksik bilgi', 'Ad ve soyad gerekli.');
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
      showAlert('Kaydedildi', 'Profilin güncellendi.');
      navigation.goBack();
    } catch (e: any) {
      showAlert('Hata', e?.response?.data?.message || 'Profil güncellenemedi.');
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
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="Ad"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          textContentType="givenName"
        />
        <Input
          label="Soyad"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          textContentType="familyName"
        />
        <Input
          label="E-posta"
          value={user?.email || ''}
          editable={false}
          containerStyle={styles.disabledField}
        />
        <Input
          label="Hakkımda"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          placeholder="Kendinden bahset..."
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
  disabledField: { opacity: 0.7 },
});
