// App root: fonts, providers, navigation, notification permission bootstrap.

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';

// DateTimePicker v8 shows a deprecation warning for `onChange` on iOS inline
// mode — the fix (onValueChange) isn't in the published types yet. Safe to ignore.
LogBox.ignoreLogs(['DateTimePicker: `onChange` is deprecated']);
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import {
  useFonts as useInstrument,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import { AuthProvider } from './src/state/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export default function App() {
  const [fontsLoaded] = useInstrument({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    requestNotificationPermissions().catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.sage} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
