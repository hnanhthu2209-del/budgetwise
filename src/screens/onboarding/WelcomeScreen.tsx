import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Button } from '../../components/primitives/Button';
import { text as t } from '../../theme/typography';

export function WelcomeScreen() {
  const nav = useNavigation<any>();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Eyebrow>BudgetWise</Eyebrow>
        <Display variant="hero" style={{ marginTop: 16 }}>
          Spend less{'\n'}
          <Display variant="hero" italic color={colors.sage}>save more</Display>
        </Display>
        <Text style={[t.body, { color: colors.ink2, marginTop: 18 }]}>
          A calm, monthly budget you can keep up with. Log your income, watch
          your categories, get a gentle nudge before you overspend.
        </Text>
      </View>
      <View style={{ gap: 12 }}>
        <Button label="Get started" onPress={() => nav.navigate('CurrencyPick')} fullWidth />
        <Button label="Sign in" variant="ghost" onPress={() => nav.navigate('SignIn')} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 28, justifyContent: 'space-between', backgroundColor: colors.bg },
  body: { flex: 1, justifyContent: 'center' },
});
