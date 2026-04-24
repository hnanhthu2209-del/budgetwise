import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { WrapScreen } from '../screens/wrap/WrapScreen';
import { BillsScreen } from '../screens/categories/BillsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

const Tab = createBottomTabNavigator();

function NullScreen() { return null; }

function CenterFAB({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.fabWrap} pointerEvents="box-none">
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.82 : 1 }]}>
        <LinearGradient
          colors={['#FF6B6B', '#FF9F45', '#FF7AC6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

export function TabNavigatorWithFAB() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.violet,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Wrap"
        component={WrapScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={22} color={color} />
          ),
        }}
      />

      {/* Centre FAB — intercepted by tabPress */}
      <Tab.Screen
        name="Add"
        component={NullScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => (
            <CenterFAB onPress={props.onPress as () => void} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('AddExpense');
          },
        })}
      />

      <Tab.Screen
        name="Bills"
        component={BillsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Keep old export name as alias so any remaining imports don't break
export { TabNavigatorWithFAB as TabNavigator };

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.94)' : '#fff',
    borderTopColor: 'rgba(31,26,46,0.07)',
    borderTopWidth: 1,
    height: 74,
    paddingBottom: 14,
    paddingTop: 8,
    shadowColor: '#1F1A2E',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  label: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.1,
  },
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
});
