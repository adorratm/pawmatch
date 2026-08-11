import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/application/stores/authStore';
import { COLORS } from '@/presentation/styles/config';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/presentation/components/forms/Input';
import { authService } from '@/infrastructure/api/auth.service';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Web redirect / popup dönüşünde oturumu tamamlamak için gerekli
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, register, checkAuth, applyOAuthSession } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const googleHandledRef = useRef<string | null>(null);

  const googleIosClientId = (process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID as string | undefined) || '';
  const googleAndroidClientId =
    (process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID as string | undefined) || '';
  const googleWebClientId = (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined) || '';
  const facebookAppId = (process.env.EXPO_PUBLIC_FACEBOOK_APP_ID as string | undefined) || '';

  const getNativeGoogleRedirectUri = () => {
    const platformClientId = Platform.OS === 'ios' ? googleIosClientId : googleAndroidClientId;
    if (!platformClientId) return undefined;
    const clientIdPrefix = platformClientId.replace('.apps.googleusercontent.com', '');
    return `com.googleusercontent.apps.${clientIdPrefix}:/oauthredirect`;
  };

  // Web: Google Console redirect URI = http://localhost:8081 (Expo origin)
  const googleRedirectUri =
    Platform.OS === 'web'
      ? AuthSession.makeRedirectUri({ preferLocalhost: true })
      : getNativeGoogleRedirectUri();

  useEffect(() => {
    if (__DEV__ && Platform.OS === 'web' && googleRedirectUri) {
      console.log("[Google OAuth] redirect_uri (Google Console'a ekle):", googleRedirectUri);
    }
  }, [googleRedirectUri]);

  const googleRuntimeClientId =
    Platform.OS === 'ios'
      ? googleIosClientId
      : Platform.OS === 'android'
        ? googleAndroidClientId
        : googleWebClientId;

  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    iosClientId: googleIosClientId || undefined,
    androidClientId: googleAndroidClientId || undefined,
    webClientId: googleWebClientId || undefined,
    scopes: ['email', 'profile'],
    redirectUri: googleRedirectUri,
    shouldAutoExchangeCode: false,
  });

  const [, , promptFacebook] = Facebook.useAuthRequest({
    iosClientId: facebookAppId || 'dummy',
    androidClientId: facebookAppId || 'dummy',
    webClientId: facebookAppId || 'dummy',
    scopes: ['email'],
  });

  const showAuthAlert = (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleOAuthError = (error: unknown, fallbackMessage: string) => {
    console.error('OAuth error:', error);
    console.error('OAuth response payload:', (error as any)?.response?.data);
    const data = (error as any)?.response?.data;
    const message = Array.isArray(data?.message)
      ? data.message.join('\n')
      : data?.message || (error as any)?.message || fallbackMessage;
    showAuthAlert('Giriş Hatası', String(message));
  };

  const clearOAuthUrlParams = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (
        url.searchParams.has('code') ||
        url.searchParams.has('error') ||
        url.hash.includes('access_token')
      ) {
        window.history.replaceState({}, document.title, url.pathname);
      }
    }
  };

  const finishGoogleAuth = useCallback(
    async (result: AuthSession.AuthSessionResult) => {
      if (result.type !== 'success') {
        if (result.type === 'error') {
          handleOAuthError(
            result.error ?? new Error('Google auth error'),
            'Google ile giriş başarısız.',
          );
        }
        return;
      }

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

      const dedupeKey = String(authorizationCode || idToken || accessToken || '');
      if (!dedupeKey) {
        handleOAuthError(new Error('Google token missing'), 'Google token alınamadı.');
        return;
      }
      if (googleHandledRef.current === dedupeKey) return;
      googleHandledRef.current = dedupeKey;

      setLoading(true);
      try {
        if (__DEV__) {
          console.log('[Google OAuth] exchanging', {
            hasIdToken: !!idToken,
            hasAccessToken: !!accessToken,
            hasCode: !!authorizationCode,
            hasCodeVerifier: !!googleRequest?.codeVerifier,
            redirectUri: googleRedirectUri,
            clientId: googleRuntimeClientId,
          });
        }

        const data = await authService.googleLogin({
          idToken: idToken ? String(idToken) : undefined,
          accessToken: accessToken ? String(accessToken) : undefined,
          authorizationCode: authorizationCode ? String(authorizationCode) : undefined,
          redirectUri: googleRedirectUri,
          codeVerifier: googleRequest?.codeVerifier,
          clientId: googleRuntimeClientId,
        });

        clearOAuthUrlParams();

        if (data?.user) {
          await applyOAuthSession(data.user);
        } else {
          await checkAuth();
        }
      } catch (error) {
        googleHandledRef.current = null;
        handleOAuthError(error, 'Google ile giriş başarısız.');
      } finally {
        setLoading(false);
      }
    },
    [
      applyOAuthSession,
      checkAuth,
      googleRedirectUri,
      googleRequest?.codeVerifier,
      googleRuntimeClientId,
    ],
  );

  // Web redirect sayfayı yeniler; promptAsync kaybolur. Hook response URL'den gelir.
  useEffect(() => {
    if (googleResponse) {
      void finishGoogleAuth(googleResponse);
    }
  }, [googleResponse, finishGoogleAuth]);

  const handleGoogleLogin = async () => {
    const hasPlatformClient =
      (Platform.OS === 'ios' && !!googleIosClientId) ||
      (Platform.OS === 'android' && !!googleAndroidClientId) ||
      (Platform.OS === 'web' && !!googleWebClientId);

    if (!hasPlatformClient) {
      return handleOAuthError(
        new Error('Missing GOOGLE platform client id'),
        'Google platform client id ayarlı değil.',
      );
    }

    setLoading(true);
    try {
      const result = await promptGoogle();
      if (result) {
        await finishGoogleAuth(result);
      }
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

      const data = await authService.facebookLogin(String(accessToken));
      if (data?.user) {
        await applyOAuthSession(data.user);
      } else {
        await checkAuth();
      }
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

      const data = await authService.appleLogin(
        credential.identityToken,
        credential.authorizationCode ?? undefined,
      );
      if (data?.user) {
        await applyOAuthSession(data.user);
      } else {
        await checkAuth();
      }
    } catch (error) {
      handleOAuthError(error, 'Apple ile giriş başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (error: unknown, fallback: string) => {
    const data = (error as any)?.response?.data;
    const message = data?.message;
    if (Array.isArray(message)) return message.join('\n');
    if (typeof message === 'string' && message.trim()) return message;
    if ((error as any)?.message) return String((error as any).message);
    return fallback;
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      showAuthAlert('Eksik bilgi', 'E-posta ve şifre gerekli.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      showAuthAlert('Geçersiz e-posta', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    if (mode === 'signup' && (!firstName.trim() || !lastName.trim())) {
      showAuthAlert('Eksik bilgi', 'Ad ve soyad gerekli.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: trimmedEmail, password });
      } else {
        await register({
          email: trimmedEmail,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      const detail =
        (error as any)?.response?.data != null
          ? JSON.stringify((error as any).response.data)
          : undefined;
      if (detail) console.error('Auth error body:', detail);
      showAuthAlert(
        mode === 'login' ? 'Giriş başarısız' : 'Kayıt başarısız',
        getAuthErrorMessage(
          error,
          mode === 'login' ? 'E-posta veya şifre hatalı.' : 'Kayıt tamamlanamadı.',
        ),
      );
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
              <TouchableOpacity style={styles.toggleButton} onPress={() => setMode('login')}>
                <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleButton} onPress={() => setMode('signup')}>
                <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'signup' && (
            <>
              <Input
                label="Ad"
                placeholder="Adınız"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                textContentType="givenName"
              />
              <Input
                label="Soyad"
                placeholder="Soyadınız"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                textContentType="familyName"
              />
            </>
          )}

          <Input
            label="E-posta Adresi"
            placeholder="ornek@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            rightIcon="mail"
          />

          <Input
            label="Şifre"
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="password"
            rightIcon={showPassword ? 'eye' : 'eye-off'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

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
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={24} color="#4285F4" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-apple" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleFacebookLogin}
              disabled={loading}
            >
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
