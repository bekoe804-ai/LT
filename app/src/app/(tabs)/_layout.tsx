import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '../../components/chrome';
import { useApp } from '../../store';
import { color } from '../../theme';

export default function TabsLayout() {
  const reduce = useApp((s) => s.a11y.reduceMotion);
  return (
    <Tabs
      // Floating glass tab bar; the four tabs cross-fade.
      tabBar={(props) => <TabBar {...(props as unknown as Parameters<typeof TabBar>[0])} />}
      screenOptions={{ headerShown: false, animation: reduce ? 'none' : 'fade', sceneStyle: { backgroundColor: color.canvas } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="testament" options={{ title: 'Testament' }} />
      <Tabs.Screen name="people" options={{ title: 'People' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
