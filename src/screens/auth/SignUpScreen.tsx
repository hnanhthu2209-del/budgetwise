import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Button } from '../../components/primitives/Button';
import { useAuth } from '../../state/AuthContext';
import { colors } from '../../theme/colors';
import { fontFamily, text as t } from '../../theme/typography';

export function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
    } catch (e: any) {
      Alert.alert('Could not create account', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <Eyebrow>Create account</Eyebrow>
        <Display variant="screen" style={{ marginTop: 10 }}>Save your progress</Display>
        <Text style={[t.caption, { color: colors.ink3, marginTop: 8 }]}>
          Your data stays on your device. An account lets you sync across phones later.
        </Text>

        <Field label="Display name (optional)" value={name} onChange={setName} placeholder="Linh" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" autoCapitalize="none" keyboardType="email-address" />
        <Field label="Password" value={password} onChange={setPassword} placeholder="At least 8 characters" secureTextEntry />
      </View>

      <Button label={busy ? 'Creating…' : 'Create account'} onPress={onSubmit} disabled={busy || !email || !password} fullWidth />
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, ...rest }: any) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={[t.eyebrow, { color: colors.ink3, marginBottom: 6 }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor={colors.ink3}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, justifyContent: 'space-between', backgroundColor: colors.bg },
  input: {
    fontFamily: fontFamily.ui,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.hair,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
