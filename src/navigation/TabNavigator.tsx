import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { CategoryListScreen } from '../screens/categories/CategoryListScreen';
import { BillsScreen } from '../screens/categories/BillsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: {
          // Frosted glass look
          backgroundColor:
            Platform.OS === 'ios' ? 'rgba(255,255,255,0.88)' : colors.card,
          borderTopColor: 'rgba(31,26,46,0.06)',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
          paddingTop: 10,
          // subtle elevation
          shadowColor: '#1F1A2E',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.10,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.uiMedium,
          fontSize: 11,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoryListScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
