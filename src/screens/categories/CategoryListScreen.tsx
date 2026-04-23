// Simple list of all categories — taps through to the shared CategoryDetail.
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { CategoryCard } from '../../components/CategoryCard';
import { CategoryDetailScreen } from './CategoryDetailScreen';
import { useBudgetStore } from '../../state/BudgetStore';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { colors } from '../../theme/colors';

const Stack = createNativeStackNavigator();

function Inner() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const currency = useSettingsStore(s => s.currency);
  const taxRequired = useSettingsStore(s => s.taxRequired);
  const refresh = useBudgetStore(s => s.refresh);
  const setUser = useBudgetStore(s => s.setUser);
  const snapshot = useBudgetStore(s => s.snapshot);

  useFocusEffect(useCallback(() => {
    setUser(user?.id ?? null);
    refresh();
  }, [user, refresh, setUser]));

  const categories = (snapshot?.perCategory ?? []).filter(c =>
    c.category !== 'tax' || taxRequired,
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Eyebrow>This month</Eyebrow>
        <Display variant="screen" style={{ marginTop: 6 }}>Categories</Display>
        <View style={{ gap: 10, marginTop: 18 }}>
          {categories.map(c => (
            <CategoryCard
              key={c.category}
              status={c}
              currency={currency}
              onPress={() => nav.navigate('CategoryDetail', { category: c.category })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function CategoryListScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="CategoryList" component={Inner} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } });
