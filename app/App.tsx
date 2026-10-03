import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { Jost_400Regular } from '@expo-google-fonts/jost/400Regular';
import { Jost_500Medium } from '@expo-google-fonts/jost/500Medium';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneApp } from './src/PhoneApp';
import { WebDemo } from './src/WebDemo';
import { color } from './src/theme';

export default function App() {
  const [loaded] = useFonts({ CormorantGaramond_500Medium, Jost_400Regular, Jost_500Medium });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.canvas }} />;
  return (
    <SafeAreaProvider>
      {Platform.OS === 'web' ? <WebDemo /> : <PhoneApp />}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
