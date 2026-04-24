// RootNavigator: directs traffic between Onboarding, Auth, and the Tab app.
// Guest mode lands directly in the Tab app — accounts are optional per PRD §4.

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../state/AuthContext';
import { TabNavigatorWithFAB as TabNavigator } from './TabNavigator';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { CurrencyPickScreen } from '../screens/onboarding/CurrencyPickScreen';
import { IncomeSetupScreen } from '../screens/onboarding/IncomeSetupScreen';
import { TaxToggleScreen } from '../screens/onboarding/TaxToggleScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { AddExpenseSheet } from '../screens/expense/AddExpenseSheet';
import { IncomeScreen } from '../screens/income/IncomeScreen';
import { NotificationCenter } from '../screens/profile/NotificationCenter';
import { MonthlySummaryScreen } from '../screens/summary/MonthlySummaryScreen';
import { CategoryDetailScreen } from '../screens/categories/CategoryDetailScreen';
import { CategoryListScreen } from '../screens/categories/CategoryListScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { mode } = useAuth();

  if (mode === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.sage} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {mode === 'onboarding' ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="CurrencyPick" component={CurrencyPickScreen} />
          <Stack.Screen name="IncomeSetup" component={IncomeSetupScreen} />
          <Stack.Screen name="TaxToggle" component={TaxToggleScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseSheet}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="Income" component={IncomeScreen} />
          <Stack.Screen name="NotificationCenter" component={NotificationCenter} />
          <Stack.Screen name="MonthlySummary" component={MonthlySummaryScreen} />
          <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
          <Stack.Screen name="CategoryList" component={CategoryListScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
