// In-app notification center — lists all delivered + scheduled notifications
// so users who prefer no push can still see them (PRD §6.2).

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Display } from '../../components/primitives/Display';
import { Eyebrow } from '../../components/primitives/Eyebrow';
import { Card } from '../../components/primitives/Card';
import { notificationRepo, NotificationRow } from '../../data/repositories/notificationRepo';
import { useAuth } from '../../state/AuthContext';
import { colors } from '../../theme/colors';
import { text as t } from '../../theme/typography';

export function NotificationCenter() {
  const { user } = useAuth();
  const nav = useNavigation();
  const [rows, setRows] = useState<NotificationRow[]>([]);

  useFocusEffect(useCallback(() => {
    notificationRepo.list(user?.id ?? null, 100).then(setRows);
  }, [user]));

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

        {/* Back button */}
        <Pressable onPress={() => nav.goBack()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={colors.ink2} />
          <Text style={[t.bodyMedium, { color: colors.ink2 }]}>Back</Text>
        </Pressable>

        <Eyebrow style={{ marginTop: 16 }}>History</Eyebrow>
        <Display variant="screen" style={{ marginTop: 6 }}>Notifications</Display>

        <View style={{ marginTop: 18, gap: 10 }}>
          {rows.length === 0 && (
            <Text style={[t.caption, { color: colors.ink3 }]}>No notifications yet.</Text>
          )}
          {rows.map(n => {
            let payload: any = {};
            try { payload = JSON.parse(n.payload_json); } catch {}
            const when = n.delivered_at ?? n.scheduled_at;
            return (
              <Card key={n.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Eyebrow>Tier {n.tier} · {n.category ?? 'general'}</Eyebrow>
                  {when && <Text style={[t.caption, { color: colors.ink3 }]}>{format(new Date(when), 'MMM d · HH:mm')}</Text>}
                </View>
                {payload.message && (
                  <>
                    <Text style={[t.bodyMedium, { color: colors.ink, marginTop: 6 }]}>{payload.message.title}</Text>
                    <Text style={[t.caption, { color: colors.ink2, marginTop: 4 }]}>{payload.message.body}</Text>
                  </>
                )}
                {payload.label && !payload.message && (
                  <Text style={[t.bodyMedium, { color: colors.ink, marginTop: 6 }]}>{payload.label}</Text>
                )}
                {payload.suppressed && (
                  <Text style={[t.caption, { color: colors.ink3, marginTop: 4 }]}>Suppressed by quiet rules</Text>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
