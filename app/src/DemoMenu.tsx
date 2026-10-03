import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { jump } from './actions';
import { useEntrance } from './anim';
import { T, Tap } from './components/ui';
import { ScreenId, useApp } from './store';
import { color, font } from './theme';

export const START_POINTS: { label: string; screen: ScreenId }[] = [
  { label: 'Home · protected', screen: 'homeOk' },
  { label: 'Home · missed check-in', screen: 'homeMissed' },
  { label: 'Home · new account', screen: 'homeNew' },
  { label: 'Check-in notification', screen: 'checkin' },
];

export const FLOWS = [
  'Home → “I’m okay” → Face ID',
  'Home → “3 records to review” → review each',
  'Home → “Add car insurance” → Insurance',
  'Testament → any category → open a record → Reveal / Face ID',
  'Testament → + → choose people → Save',
  'People → Ama → scenarios → Preview',
  'Settings → Security → Lock account',
  'Settings → Check-ins → switch scenario',
];

export const eyebrow = { fontFamily: font.jost, fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: color.inkTertiary, marginBottom: 4 } as const;

export function StartButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} style={styles.start}>
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
  const enter = useEntrance(open, 360);
  if (!open || Platform.OS === 'web') return null;
  return (
    <>
      <Tap onPress={() => set({ demoMenu: false })} accessibilityLabel="Close demo menu" style={[StyleSheet.absoluteFill, { zIndex: 50, backgroundColor: 'rgba(26,26,26,0.35)' }]} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}>
        <View style={styles.grabber} />
        <View style={{ gap: 6 }}>
          <T style={eyebrow}>Start from</T>
          {START_POINTS.map((p) => (
            <StartButton key={p.screen} label={p.label} onPress={() => jump(p.screen)} />
          ))}
        </View>
        <View style={{ gap: 6 }}>
          <T style={eyebrow}>Try these flows</T>
          <T style={{ fontSize: 13, lineHeight: 21, color: color.inkSecondary }}>{FLOWS.join('\n')}</T>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  start: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fff', boxShadow: `0 0 0 1px ${color.track}` },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 51,
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
