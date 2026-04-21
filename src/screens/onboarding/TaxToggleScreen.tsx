import React, { useState } from 'react';
import { View, StyleSheet, Switch, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { colors } from '../../theme/colors';
import { text as t } from '../../theme/typography';

export function TaxToggleScreen() {
  const { setOnboarded } = useAuth();
  const setTaxRequired = useSettingsStore(s => s.setTaxRequired);
  const [on, setOn] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <Eyebrow>Step 3 of 3</Eyebrow>
        <Display variant="screen" style={{ marginTop: 10 }}>
          Are you required{'\n'}to pay taxes?
        </Display>
        <Text style={[t.body, { color: colors.ink2, marginTop: 8 }]}>
          We'll add a Tax Obligations category that helps you set aside money
          and track filing deadlines. You can change this anytime.
        </Text>

        <Card style={{ marginTop: 26, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[t.bodyMedium, { color: colors.ink }]}>I pay taxes</Text>
            <Text style={[t.caption, { color: colors.ink3, marginTop: 4 }]}>
              Freelancer, self-employed, side-income earner
            </Text>
          </View>
          <Switch
            value={on}
            onValueChange={setOn}
            trackColor={{ false: colors.hair, true: colors.sageSoft }}
            thumbColor={on ? colors.sage : '#fff'}
          />
        </Card>

        <Text style={[t.caption, { color: colors.ink3, marginTop: 14, lineHeight: 18 }]}>
          BudgetWise provides estimates for budgeting awareness only. Consult a
          licensed tax professional for official tax advice.
        </Text>
      </View>

      <Button
        label="Start using BudgetWise"
        onPress={() => {
          setTaxRequired(on);
          setOnboarded();
        }}
        fullWidth
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'space-between', backgroundColor: colors.bg },
});
