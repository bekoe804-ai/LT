import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { Jost_400Regular } from '@expo-google-fonts/jost/400Regular';
import { Jost_500Medium } from '@expo-google-fonts/jost/500Medium';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { applyScreenshotPolicy } from '../actions';
import { DialogSheet, FaceIdOverlay, LockScreen, Toast } from '../components/chrome';
import { DemoMenu } from '../DemoMenu';
import { useApp } from '../store';
import { color } from '../theme';
import { WebDemo } from '../WebDemo';

/** Sheet-like screens rise from the bottom; check-in fades in like a notification landing. */
const RISE = { animation: 'slide_from_bottom', gestureDirection: 'vertical' } as const;

function AppStack() {
  const reduce = useApp((s) => s.a11y.reduceMotion);
  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.canvas },
          animation: reduce ? 'fade' : 'default',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="checkin" options={{ animation: 'fade', fullScreenGestureEnabled: false }} />
        <Stack.Screen name="add-record" options={reduce ? {} : RISE} />
        <Stack.Screen name="add-person" options={reduce ? {} : RISE} />
        <Stack.Screen name="document" options={reduce ? {} : RISE} />
        <Stack.Screen name="search" options={{ animation: 'fade' }} />
      </Stack>
      <DialogSheet />
      <Toast />
      <DemoMenu />
      <LockScreen />
      <FaceIdOverlay />
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ CormorantGaramond_500Medium, Jost_400Regular, Jost_500Medium });
  useEffect(() => {
    applyScreenshotPolicy(useApp.getState().privacy.blockScreenshots);
  }, []);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.canvas }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {Platform.OS === 'web' ? (
          <WebDemo>
            <AppStack />
          </WebDemo>
        ) : (
          <AppStack />
        )}
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
