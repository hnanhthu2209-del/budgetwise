import React from 'react';
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

function tabIcon(focused: string, unfocused: string) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={(focused) as IoniconsName} size={size} color={color} />
  );
}

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
