import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../utils/colors';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const navigation = useNavigation();
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre gereklidir');
      return;
    }

    if (mode === 'signup' && (!firstName || !lastName)) {
      Alert.alert('Hata', 'Ad ve soyad gereklidir');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName, phone || undefined);
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerImageContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
            }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.headerGradient} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Pati Arkadaşını Bul</Text>
          <Text style={styles.subtitle}>
            Hayatına neşe katacak tüylü dostunla tanış.
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <View
              style={[
                styles.tabSlider,
                mode === 'signup' && styles.tabSliderRight,
              ]}
            />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setMode('login')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'login' && styles.tabTextActive,
                ]}
              >
                Giriş Yap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setMode('signup')}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === 'signup' && styles.tabTextActive,
                ]}
              >
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınız"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Soyad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Soyadınız"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Telefon (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+90 555 123 4567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta Adresi</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <View style={styles.inputIcon}>
                <Text style={styles.iconText}>✉</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.inputIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.iconText}>
                  {showPassword ? '👁' : '👁‍🗨'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'login' && (
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
                <Text style={styles.arrowIcon}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya şununla devam et</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => {
                // TODO: Implement Google OAuth
                Alert.alert('Google', 'Google ile giriş yakında eklenecek');
              }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
                  fill="#4285F4"
                />
                <Path
                  d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
                  fill="#34A853"
                />
                <Path
                  d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
                  fill="#FBBC05"
                />
                <Path
                  d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
                  fill="#EA4335"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => {
                // TODO: Implement Apple OAuth
                Alert.alert('Apple', 'Apple ile giriş yakında eklenecek');
              }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
                <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.03 3.96-.74 1.35.25 2.37.93 2.97 1.83-2.6 1.55-2.18 5.68.39 6.74-.28.74-.63 1.48-1.07 2.15-.75 1.12-1.55 2.21-1.33 2.25zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => {
                // TODO: Implement Facebook OAuth
                Alert.alert('Facebook', 'Facebook ile giriş yakında eklenecek');
              }}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M23.9981 12C23.9981 5.37258 18.626 0 11.9981 0C5.37018 0 -0.00195312 5.37258 -0.00195312 12C-0.00195312 17.9895 4.38605 22.954 10.1231 23.8542V15.4688H7.07593V12H10.1231V9.35625C10.1231 6.34875 11.9142 4.6875 14.655 4.6875C15.9677 4.6875 17.3419 4.92188 17.3419 4.92188V7.875H15.8281C14.3377 7.875 13.8731 8.80031 13.8731 9.75V12H17.2003L16.669 15.4688H13.8731V23.8542C19.6101 22.954 23.9981 17.9895 23.9981 12Z"
                  fill="#1877F2"
                />
                <Path
                  d="M16.669 15.4688L17.2003 12H13.8731V9.75C13.8731 8.80031 14.3377 7.875 15.8281 7.875H17.3419V4.92188C17.3419 4.92188 15.9677 4.6875 14.655 4.6875C11.9142 4.6875 10.1231 6.34875 10.1231 9.35625V12H7.07593V15.4688H10.1231V23.8542C10.7385 23.9511 11.3653 24 11.9981 24C12.6309 24 13.2577 23.9511 13.8731 23.8542V15.4688H16.669Z"
                  fill="white"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {mode === 'login' && (
            <View style={styles.signupLink}>
              <Text style={styles.signupLinkText}>
                Hesabın yok mu?{' '}
                <Text
                  style={styles.signupLinkBold}
                  onPress={() => setMode('signup')}
                >
                  Hemen Kayıt Ol
                </Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  headerImageContainer: {
    width: width,
    height: 192,
    marginBottom: 16,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  headerText: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 28,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
    position: 'relative',
  },
  tabSlider: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: colors.background,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabSliderRight: {
    left: '50%',
  },
  tab: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
  form: {
    paddingHorizontal: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  signupLinkText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  signupLinkBold: {
    fontWeight: '700',
    color: colors.primary,
  },
});
