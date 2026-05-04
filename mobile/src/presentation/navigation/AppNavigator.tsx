import React, { useEffect } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/application/stores/authStore';
import WelcomeScreen from '@app/WelcomeScreen';
import Onboarding1Screen from '@app/Onboarding1Screen';
import Onboarding2Screen from '@app/Onboarding2Screen';
import LoginScreen from '@app/LoginScreen';
import DiscoverScreen from '@app/DiscoverScreen';
import DiscoverMapScreen from '@app/DiscoverMapScreen';
import PetDetailScreen from '@app/PetDetailScreen';
import CreatePetProfileScreen from '@app/CreatePetProfileScreen';
import MatchesScreen from '@app/MatchesScreen';
import NewMatchNotificationScreen from '@app/NewMatchNotificationScreen';
import ConversationsScreen from '@app/ConversationsScreen';
import ChatScreen from '@app/ChatScreen';
import FilterScreen from '@app/FilterScreen';
import SuggestMeetingPointScreen from '@app/SuggestMeetingPointScreen';
import VeterinariansScreen from '@app/VeterinariansScreen';
import VeterinariansMapScreen from '@app/VeterinariansMapScreen';
import VeterinarianDetailScreen1 from '@app/VeterinarianDetailScreen1';
import VeterinarianDetailScreen2 from '@app/VeterinarianDetailScreen2';
import AppointmentHistoryScreen from '@app/AppointmentHistoryScreen';
import AppointmentManagementScreen from '@app/AppointmentManagementScreen';
import RatingScreen1 from '@app/RatingScreen1';
import RatingScreen2 from '@app/RatingScreen2';
import SettingsScreen1 from '@app/SettingsScreen1';
import SettingsScreen2 from '@app/SettingsScreen2';
import NotificationPreferencesScreen1 from '@app/NotificationPreferencesScreen1';
import NotificationPreferencesScreen2 from '@app/NotificationPreferencesScreen2';
import AboutScreen from '@app/AboutScreen';
import HelpSupportScreen from '@app/HelpSupportScreen';
import InAppPurchasesScreen from '@app/InAppPurchasesScreen';
import ProfileScreen from '@app/ProfileScreen';
import FavoritesScreen from '@app/FavoritesScreen';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '@/presentation/styles/config';
import { revenueCatService } from '@/infrastructure/purchases/revenueCat.service';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ConversationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    let alive = true;
    void (async () => {
      await revenueCatService.configure();
      if (alive) {
        await useAuthStore.getState().checkAuth();
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (isLoading) {
    return null; // Show loading screen
  }

  return (
    <SafeAreaProvider>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
                <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
                <Stack.Screen name="Login" component={LoginScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="DiscoverMap" component={DiscoverMapScreen} />
                <Stack.Screen name="PetDetail" component={PetDetailScreen} />
                <Stack.Screen name="Favorites" component={FavoritesScreen} />
                <Stack.Screen name="CreatePetProfile" component={CreatePetProfileScreen} />
                <Stack.Screen name="Matches" component={MatchesScreen} />
                <Stack.Screen name="NewMatchNotification" component={NewMatchNotificationScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="Filter" component={FilterScreen} />
                <Stack.Screen name="SuggestMeetingPoint" component={SuggestMeetingPointScreen} />
                <Stack.Screen name="Veterinarians" component={VeterinariansScreen} />
                <Stack.Screen name="VeterinariansMap" component={VeterinariansMapScreen} />
                <Stack.Screen name="VeterinarianDetail1" component={VeterinarianDetailScreen1} />
                <Stack.Screen name="VeterinarianDetail2" component={VeterinarianDetailScreen2} />
                <Stack.Screen name="AppointmentHistory" component={AppointmentHistoryScreen} />
                <Stack.Screen name="AppointmentManagement" component={AppointmentManagementScreen} />
                <Stack.Screen name="Rating1" component={RatingScreen1} />
                <Stack.Screen name="Rating2" component={RatingScreen2} />
                <Stack.Screen name="Settings1" component={SettingsScreen1} />
                <Stack.Screen name="Settings2" component={SettingsScreen2} />
                <Stack.Screen name="NotificationPreferences1" component={NotificationPreferencesScreen1} />
                <Stack.Screen name="NotificationPreferences2" component={NotificationPreferencesScreen2} />
                <Stack.Screen name="About" component={AboutScreen} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                <Stack.Screen name="InAppPurchases" component={InAppPurchasesScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </SafeAreaProvider>
  );
}
