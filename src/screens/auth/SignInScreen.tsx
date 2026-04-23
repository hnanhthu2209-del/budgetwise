import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Button } from '../../components/primitives/Button';
import { useAuth } from '../../state/AuthContext';
import { colors } from '../../theme/colors';
import { fontFamily, text as t } from '../../theme/typography';

export function SignInScreen() {
  const nav = useNavigation<any>();
  const { signIn, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Could not sign in', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <Pressable onPress={() => nav.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={colors.ink2} />
          <Text style={[t.bodyMedium, { color: colors.ink2 }]}>Back</Text>
        </Pressable>
        <Eyebrow style={{ marginTop: 16 }}>Welcome back</Eyebrow>
        <Display variant="screen" style={{ marginTop: 10 }}>Sign in</Display>

        <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" autoCapitalize="none" keyboardType="email-address" />
        <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" secureTextEntry />

        <Pressable onPress={() => nav.navigate('SignUp')} style={{ marginTop: 16 }}>
          <Text style={[t.caption, { color: colors.sage }]}>Don't have an account? Create one.</Text>
        </Pressable>
      </View>

      <View style={{ gap: 12 }}>
        <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={onSubmit} disabled={busy || !email || !password} fullWidth />
        <Button label="Continue as guest" variant="ghost" onPress={continueAsGuest} fullWidth />
      </View>
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
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
