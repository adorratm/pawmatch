import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/application/stores/authStore';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/infrastructure/api/auth.service';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';

export default function LoginScreen() {
  const { login, register, checkAuth } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Expo OAuth client ids: `mobile/.env` içine ekleyebilirsin.
  // - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
  // - EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
  // - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  // - EXPO_PUBLIC_FACEBOOK_APP_ID
  const googleIosClientId = (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID as string | undefined) || '';
  const googleAndroidClientId = (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID as string | undefined) || '';
  const googleWebClientId = (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined) || '';
  const facebookAppId = (process.env.EXPO_PUBLIC_FACEBOOK_APP_ID as string | undefined) || '';

  const getNativeGoogleRedirectUri = () => {
    const platformClientId = Platform.OS === 'ios' ? googleIosClientId : googleAndroidClientId;
    if (!platformClientId) return undefined;

    // Google native redirect format:
    // com.googleusercontent.apps.<client-id-without-suffix>:/oauthredirect
    const clientIdPrefix = platformClientId.replace('.apps.googleusercontent.com', '');
    return `com.googleusercontent.apps.${clientIdPrefix}:/oauthredirect`;
  };

  const googleRedirectUri =
    Platform.OS === 'web'
      ? AuthSession.makeRedirectUri()
      : getNativeGoogleRedirectUri();
  const googleRuntimeClientId =
    Platform.OS === 'ios'
      ? googleIosClientId
      : Platform.OS === 'android'
        ? googleAndroidClientId
        : googleWebClientId;

  const [googleRequest, , promptGoogle] = Google.useIdTokenAuthRequest({
    iosClientId: googleIosClientId || undefined,
    androidClientId: googleAndroidClientId || undefined,
    webClientId: googleWebClientId || undefined,
    scopes: ['email', 'profile'],
    redirectUri: googleRedirectUri,
    // We exchange authorization code on backend. Prevent client-side code redemption.
    shouldAutoExchangeCode: false,
  });

  const [, , promptFacebook] = Facebook.useAuthRequest({
    iosClientId: facebookAppId || 'dummy',
    androidClientId: facebookAppId || 'dummy',
    webClientId: facebookAppId || 'dummy',
    scopes: ['email'],
  });

  const handleOAuthError = (error: unknown, fallbackMessage: string) => {
    console.error('OAuth error:', error);
    console.error('OAuth response payload:', (error as any)?.response?.data);
    const responseMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      fallbackMessage;
    Alert.alert('Giriş Hatası', String(responseMessage));
  };

  const handleGoogleLogin = async () => {
    const hasPlatformClient =
      (Platform.OS === 'ios' && !!googleIosClientId) ||
      (Platform.OS === 'android' && !!googleAndroidClientId) ||
      (Platform.OS === 'web' && !!googleWebClientId);

    if (!hasPlatformClient) {
      return handleOAuthError(new Error('Missing GOOGLE platform client id'), 'Google platform client id ayarlı değil.');
    }

    setLoading(true);
    try {
      const result = await promptGoogle();
      if (result.type !== 'success') return;

      const idToken =
        result.params?.id_token ??
        (result.params as any)?.idToken ??
        (result.authentication as any)?.idToken ??
        (result.authentication as any)?.id_token;
      const accessToken =
        (result.authentication as any)?.accessToken ??
        (result.params as any)?.access_token ??
        (result.params as any)?.accessToken;
      const authorizationCode =
        result.params?.code ??
        (result.params as any)?.authorization_code ??
        (result.params as any)?.authorizationCode;

      if (!idToken && !accessToken && !authorizationCode) {
        throw new Error('Google token missing');
      }

      await authService.googleLogin({
        idToken: idToken ? String(idToken) : undefined,
        accessToken: accessToken ? String(accessToken) : undefined,
        authorizationCode: authorizationCode ? String(authorizationCode) : undefined,
        redirectUri: googleRedirectUri,
        codeVerifier: googleRequest?.codeVerifier,
        clientId: googleRuntimeClientId,
      });
      await checkAuth();
    } catch (error) {
      handleOAuthError(error, 'Google ile giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (!facebookAppId) {
      return handleOAuthError(new Error('Missing Facebook app id'), 'Facebook app id ayarlı değil.');
    }

    setLoading(true);
    try {
      const result = await promptFacebook();
      if (result.type !== 'success') return;

      const accessToken =
        result.params?.access_token ??
        (result.params as any)?.accessToken ??
        (result.params as any)?.access_token?.toString?.();

      if (!accessToken) {
        throw new Error('Facebook access_token missing');
      }

      await authService.facebookLogin(String(accessToken));
      await checkAuth();
    } catch (error) {
      handleOAuthError(error, 'Facebook ile giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error('Apple not available');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple identityToken missing');
      }

      await authService.appleLogin(credential.identityToken, credential.authorizationCode ?? undefined);
      await checkAuth();
    } catch (error) {
      handleOAuthError(error, 'Apple ile giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ email, password, firstName, lastName });
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <ImageBackground
            source={{ uri: 'https://picsum.photos/400/300?random=2' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Pati Arkadaşını Bul</Text>
          <Text style={styles.subtitle}>Hayatına neşe katacak tüylü dostunla tanış.</Text>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleBackground}>
              <View style={[styles.toggleSlider, mode === 'login' && styles.toggleSliderActive]} />
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'signup' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Ad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adınız"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Soyad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Soyadınız"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta Adresi</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Ionicons name="mail" size={24} color={COLORS.textMuted} style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya şununla devam et</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} disabled={loading}>
              <Ionicons name="logo-google" size={24} color="#4285F4" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin} disabled={loading}>
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin} disabled={loading}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  toggleContainer: {
    marginBottom: 24,
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    padding: 4,
    position: 'relative',
  },
  toggleSlider: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleSliderActive: {
    left: '52%',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  toggleTextActive: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: COLORS.text,
  },
  inputIcon: {
    marginLeft: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


