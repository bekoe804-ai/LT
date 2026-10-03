import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { T, Tap } from './components/ui';
import { go, jumpHome } from './nav';
import { HomeState, useApp } from './store';
import { color, font } from './theme';

export const START_POINTS: { label: string; run: () => void }[] = [
  { label: 'Home · protected', run: () => jumpHome('ok') },
  { label: 'Home · missed check-in', run: () => jumpHome('missed') },
  { label: 'Home · new account', run: () => jumpHome('new') },
  {
    label: 'Check-in notification',
    run: () => {
      jumpHome('ok' as HomeState);
      setTimeout(() => go('/checkin'), 80);
    },
  },
  { label: 'App lock screen', run: () => useApp.getState().set({ unlocked: false, lockReason: 'launch', demoMenu: false }) },
];

export const FLOWS = [
  'Home → “I’m okay” → Face ID',
  'Home → records to review → review each',
  'Home → “Add car insurance” → 6-step wizard',
  'Testament → category → record → Reveal / Copy',
  'Testament → + → type → details → files → people → when → save',
  'People → + → invite a new trusted person',
  'People → Ama → Preview as Ama → switch scenario',
  'Settings → Security → Lock / sessions / codes',
  'Settings → Accessibility → Larger text, Reduce motion',
];

export const eyebrow = { fontFamily: font.jost, fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: color.inkTertiary, marginBottom: 4 } as const;

export function StartButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} scale style={styles.start}>
      <T style={{ fontSize: 14, fontWeight: '600' }}>{label}</T>
    </Tap>
  );
}

/**
 * On device there is no sidebar, so the demo start points live in a sheet
 * opened by long-pressing the Last Testament mark on Home.
 */
export function DemoMenu() {
  const open = useApp((s) => s.demoMenu);
  const set = useApp((s) => s.set);
  if (!open || Platform.OS === 'web') return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>
      <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
        <Tap onPress={() => set({ demoMenu: false })} accessibilityLabel="Close demo menu" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(26,26,26,0.35)' }]} />
      </Animated.View>
      <Animated.View entering={SlideInDown.springify().damping(20)} exiting={SlideOutDown.duration(200)} style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={{ gap: 6 }}>
          <T style={eyebrow}>Start from</T>
          {START_POINTS.map((p) => (
            <StartButton key={p.label} label={p.label} onPress={p.run} />
          ))}
        </View>
        <View style={{ gap: 6 }}>
          <T style={eyebrow}>Try these flows</T>
          <T style={{ fontSize: 13, lineHeight: 21, color: color.inkSecondary }}>{FLOWS.join('\n')}</T>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  start: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fff', boxShadow: `0 0 0 1px ${color.track}` },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: color.canvas,
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 20,
    boxShadow: '0 12px 32px rgba(26,26,26,0.2)',
  },
  grabber: { width: 36, height: 5, borderRadius: 3, backgroundColor: color.grabber, alignSelf: 'center', marginTop: -10 },
});
