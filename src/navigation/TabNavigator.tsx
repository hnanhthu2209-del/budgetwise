import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { CategoryListScreen } from '../screens/categories/CategoryListScreen';
import { BillsScreen } from '../screens/categories/BillsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

const Tab = createBottomTabNavigator();

const tabIcon = (glyph: string) => ({ color }: { color: string }) =>
  <Text style={{ fontFamily: fontFamily.mono, fontSize: 11, color, letterSpacing: 1 }}>{glyph}</Text>;

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.hair,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.uiMedium, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarIcon: tabIcon('●') }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoryListScreen}
        options={{ tabBarIcon: tabIcon('▤') }}
      />
      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{ tabBarIcon: tabIcon('☷') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon('◔') }}
      />
    </Tab.Navigator>
  );
}
