import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanScreen, GenerateScreen, HistoryScreen, SettingsScreen, ActionHubScreen } from '../screens';
import { Colors } from '../theme';
import { AuthProvider, AppModeProvider, useAppMode } from '../context';

const Tab = createBottomTabNavigator();

const ICON_MAP: Record<string, { default: keyof typeof Ionicons.glyphMap; focused: keyof typeof Ionicons.glyphMap }> = {
  Scan:      { default: 'scan-outline',     focused: 'scan' },
  Generate:  { default: 'qr-code-outline',  focused: 'qr-code' },
  ActionHub: { default: 'flash-outline',    focused: 'flash' },
  History:   { default: 'time-outline',     focused: 'time' },
  Settings:  { default: 'settings-outline', focused: 'settings' },
};

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { appMode } = useAppMode();

  const screenOptions = ({ route }: any) => ({
    tabBarIcon: ({ focused, color, size }: any) => {
      const icons = ICON_MAP[route.name];
      const iconName: keyof typeof Ionicons.glyphMap = icons
        ? focused ? icons.focused : icons.default
        : 'help-outline';

      return (
        <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
          <Ionicons name={iconName} size={size} color={color} />
        </View>
      );
    },
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.textMuted,
    tabBarStyle: {
      backgroundColor: Colors.surface,
      borderTopColor: Colors.border,
      borderTopWidth: 1,
      paddingTop: 8,
      paddingBottom: Platform.OS === 'android' ? 20 : Math.max(insets.bottom, 12),
      height: Platform.OS === 'android' ? 80 : 60 + Math.max(insets.bottom, 12),
      marginBottom: Platform.OS === 'android' ? insets.bottom : 0,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '500' as const,
      marginTop: 4,
    },
    headerStyle: {
      backgroundColor: Colors.background,
      borderBottomWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: Colors.text,
    headerTitleStyle: {
      fontWeight: 'bold' as const,
      fontSize: 20,
    },
  });

  if (appMode === 'actionhub') {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="ActionHub"
          component={ActionHubScreen}
          options={{ title: 'Action Hub', headerShown: false }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings', headerTitle: 'Settings' }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Generate"
        component={GenerateScreen}
        options={{ title: 'Create QR', headerTitle: 'Create QR Code' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History', headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', headerTitle: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <AppModeProvider>
      <AuthProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </AuthProvider>
    </AppModeProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 30,
    borderRadius: 15,
  },
  iconContainerFocused: {
    backgroundColor: Colors.primary + '20',
  },
});
