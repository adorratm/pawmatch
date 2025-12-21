import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';
import WelcomeScreen from '../screens/WelcomeScreen';
import Onboarding1Screen from '../screens/Onboarding1Screen';
import Onboarding2Screen from '../screens/Onboarding2Screen';
import LoginScreen from '../screens/LoginScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import DiscoverMapScreen from '../screens/DiscoverMapScreen';
import PetDetailScreen from '../screens/PetDetailScreen';
import CreatePetProfileScreen from '../screens/CreatePetProfileScreen';
import MatchesScreen from '../screens/MatchesScreen';
import NewMatchNotificationScreen from '../screens/NewMatchNotificationScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';
import FilterScreen from '../screens/FilterScreen';
import SuggestMeetingPointScreen from '../screens/SuggestMeetingPointScreen';
import VeterinariansScreen from '../screens/VeterinariansScreen';
import VeterinariansMapScreen from '../screens/VeterinariansMapScreen';
import VeterinarianDetailScreen1 from '../screens/VeterinarianDetailScreen1';
import VeterinarianDetailScreen2 from '../screens/VeterinarianDetailScreen2';
import AppointmentHistoryScreen from '../screens/AppointmentHistoryScreen';
import AppointmentManagementScreen from '../screens/AppointmentManagementScreen';
import RatingScreen1 from '../screens/RatingScreen1';
import RatingScreen2 from '../screens/RatingScreen2';
import SettingsScreen1 from '../screens/SettingsScreen1';
import SettingsScreen2 from '../screens/SettingsScreen2';
import NotificationPreferencesScreen1 from '../screens/NotificationPreferencesScreen1';
import NotificationPreferencesScreen2 from '../screens/NotificationPreferencesScreen2';
import AboutScreen from '../screens/AboutScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import InAppPurchasesScreen from '../screens/InAppPurchasesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/config';

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
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return null; // Show loading screen
  }

  return (
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
  );
}
