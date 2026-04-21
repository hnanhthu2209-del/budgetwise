import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { CurrencyInput } from '../../components/CurrencyInput';
import { useSettingsStore } from '../../state/SettingsStore';
import { incomeRepo } from '../../data/repositories/incomeRepo';
import { colors } from '../../theme/colors';
import { text as t } from '../../theme/typography';

export function IncomeSetupScreen() {
  const nav = useNavigation<any>();
  const currency = useSettingsStore(s => s.currency);
  const [amount, setAmount] = useState<number | null>(null);

  const onContinue = async () => {
    if (amount && amount > 0) {
      await incomeRepo.add({ userId: null, source: 'Salary', amount, currency });
    }
    nav.navigate('TaxToggle');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <Eyebrow>Step 2 of 3</Eyebrow>
        <Display variant="screen" style={{ marginTop: 10 }}>
          What's your monthly income?
        </Display>
        <Text style={[t.body, { color: colors.ink2, marginTop: 8 }]}>
          Salary, freelance, side income — sum it up. Add more sources later.
        </Text>

        <Card style={{ marginTop: 26, paddingVertical: 28, alignItems: 'center' }}>
          <Eyebrow>This month</Eyebrow>
          <View style={{ marginTop: 8 }}>
            <CurrencyInput value={amount} onChange={setAmount} currency={currency} size="large" autoFocus />
          </View>
        </Card>
      </View>

      <Button label="Continue" onPress={onContinue} fullWidth disabled={!amount || amount <= 0} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'space-between', backgroundColor: colors.bg },
});
