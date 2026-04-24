import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { useAuth } from '../../state/AuthContext';
import { useSettingsStore } from '../../state/SettingsStore';
import { colors } from '../../theme/colors';
import { text as t } from '../../theme/typography';

export function ProfileScreen() {
  const nav = useNavigation<any>();
  const { user, mode, signOut, deleteAccount } = useAuth();
  const taxRequired = useSettingsStore(s => s.taxRequired);
  const setTaxRequired = useSettingsStore(s => s.setTaxRequired);
  const weekendSuppress = useSettingsStore(s => s.weekendSuppress);
  const setWeekendSuppress = useSettingsStore(s => s.setWeekendSuppress);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Eyebrow>Profile</Eyebrow>
        <Display variant="screen" style={{ marginTop: 6 }}>
          {user?.display_name || (mode === 'guest' ? 'Guest' : 'You')}
        </Display>
        {user?.email && (
          <Text style={[t.caption, { color: colors.ink3, marginTop: 4 }]}>{user.email}</Text>
        )}

        {mode === 'guest' && (
          <Card style={{ marginTop: 20, backgroundColor: colors.violetSoft }}>
            <Eyebrow color={colors.violet}>Save your data</Eyebrow>
            <Text style={[t.body, { color: colors.ink, marginTop: 8 }]}>
              Create a free account to keep your budget safe if you switch phones.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Button label="Create account" onPress={() => nav.navigate('SignUp')} style={{ flex: 1 }} />
              <Button label="Sign in" variant="ghost" onPress={() => nav.navigate('SignIn')} style={{ flex: 1 }} />
            </View>
          </Card>
        )}

        <View style={{ marginTop: 26 }}>
          <Eyebrow>Preferences</Eyebrow>
          <Card style={{ marginTop: 10 }}>
            <Row
              label="I pay taxes"
              caption="Show the Tax Obligations category"
              value={taxRequired}
              onChange={setTaxRequired}
            />
            <View style={styles.divider} />
            <Row
              label="Quiet weekends"
              caption="Suppress non-bill notifications on Sat/Sun"
              value={weekendSuppress}
              onChange={setWeekendSuppress}
            />
          </Card>
        </View>

        <View style={{ marginTop: 26 }}>
          <Pressable onPress={() => nav.navigate('NotificationCenter' as never)}>
            <Text style={[t.bodyMedium, { color: colors.sage }]}>Notification history →</Text>
          </Pressable>
        </View>

        {mode === 'signedIn' && (
          <View style={{ marginTop: 36, gap: 10 }}>
            <Button label="Sign out" variant="ghost" onPress={signOut} fullWidth />
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Delete account?',
                  'This will permanently remove all your data from this device.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: deleteAccount },
                  ],
                );
              }}
            >
              <Text style={[t.caption, { color: colors.coral, textAlign: 'center', marginTop: 6 }]}>
                Delete account
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, caption, value, onChange }: { label: string; caption?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[t.bodyMedium, { color: colors.ink }]}>{label}</Text>
        {caption && <Text style={[t.caption, { color: colors.ink3, marginTop: 2 }]}>{caption}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.hair, true: colors.sageSoft }}
        thumbColor={value ? colors.sage : '#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hair, marginVertical: 4 },
});
