import React, { useEffect } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useInsets } from '../insets';
import { useApp } from '../store';
import { color, font } from '../theme';
import { Check, PrimaryButton, Serif, T, Tap, TextButton, tick } from './ui';

const mark = require('../../assets/brand/mark.png');

// ─── Tab bar (Liquid Glass — functional layer only) ───────────────────────────

type TabId = 'index' | 'testament' | 'people' | 'settings';
const LABELS: Record<TabId, string> = { index: 'Home', testament: 'Testament', people: 'People', settings: 'Settings' };

function TabIcon({ id, on }: { id: TabId; on: boolean }) {
  const p = {
    fill: on ? 'rgba(201,181,149,0.35)' : 'none',
    stroke: on ? color.brand : color.inkSecondary,
    strokeWidth: on ? 2 : 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24">
      {id === 'index' && (
        <>
          <Path {...p} d="M3 10.2a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6a2 2 0 0 1 .7 1.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path {...p} d="M9.5 21v-6.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21" />
        </>
      )}
      {id === 'testament' && (
        <>
          <Path {...p} d="M4.5 19.5v-15A2.5 2.5 0 0 1 7 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a2.5 2.5 0 0 1 0-5h13" />
          <Path {...p} d="M9 7h6" />
        </>
      )}
      {id === 'people' && (
        <>
          <Circle {...p} cx={9} cy={7.5} r={3.5} />
          <Path {...p} d="M2.5 21v-1.5A4.5 4.5 0 0 1 7 15h4a4.5 4.5 0 0 1 4.5 4.5V21" />
          <Path {...p} d="M16 4.1a3.5 3.5 0 0 1 0 6.8" />
          <Path {...p} d="M21.5 21v-1.5a4.5 4.5 0 0 0-3.2-4.3" />
        </>
      )}
      {id === 'settings' && (
        <>
          <Path
            {...p}
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
          />
          <Circle {...p} cx={12} cy={12} r={3} />
        </>
      )}
    </Svg>
  );
}

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void; emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean } };
}

/** Floating glass pill with a highlight that slides between tabs. */
export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useInsets();
  const [w, setW] = React.useState(0);
  const n = state.routes.length;
  const seg = w ? (w - 12) / n : 0;
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withTiming(state.index * seg, { duration: 320, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  }, [state.index, seg, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[st.tabBar, { bottom: insets.bottom + 4 }]} accessibilityRole="tablist">
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.62)' }]} />
      {seg > 0 && <Animated.View style={[st.tabPill, { width: seg }, pill]} />}
      {state.routes.map((r, i) => {
        const id = r.name as TabId;
        const on = state.index === i;
        return (
          <Tap
            key={r.key}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
              if (!on && !e.defaultPrevented) {
                tick();
                navigation.navigate(r.name);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={LABELS[id]}
            style={st.tab}
          >
            <TabIcon id={id} on={on} />
            <T style={{ fontSize: 11, fontWeight: on ? '600' : '500', color: on ? color.brand : color.inkSecondary }}>{LABELS[id]}</T>
          </Tap>
        );
      })}
    </View>
  );
}

// ─── Face ID overlay ───────────────────────────────────────────────────────────

function FaceGlyph() {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withSequence(withTiming(1, { duration: 450 }), withTiming(0, { duration: 450 })), -1);
  }, [p]);
  const pulse = useAnimatedStyle(() => ({ opacity: 0.9 + p.value * 0.1, transform: [{ scale: 1 + p.value * 0.08 }] }));
  return (
    <Animated.View style={[st.faceGlyph, pulse]}>
      <View style={[st.eye, { left: 14 }]} />
      <View style={[st.eye, { right: 14 }]} />
      <View style={st.mouth} />
    </Animated.View>
  );
}

export function FaceIdOverlay() {
  const faceId = useApp((s) => s.faceId);
  const done = useApp((s) => s.faceDone);
  const label = useApp((s) => s.faceLabel);
  if (!faceId) return null;
  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(220)} style={[StyleSheet.absoluteFill, { zIndex: 90 }]} accessibilityLiveRegion="polite">
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(246,244,239,0.6)', alignItems: 'center', justifyContent: 'center' }]}>
        <Animated.View entering={ZoomIn.springify().damping(16)} style={st.faceBox}>
          {done ? (
            <Animated.View entering={ZoomIn.springify().damping(12)} style={[st.faceGlyph, { borderColor: color.positive, alignItems: 'center', justifyContent: 'center' }]}>
              <T style={{ fontSize: 26, fontWeight: '700', color: color.positive }}>✓</T>
            </Animated.View>
          ) : (
            <FaceGlyph />
          )}
          <T style={{ fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 }}>{done ? 'Confirmed' : label}</T>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ─── Dialog sheet (consequential confirmations and choices) ──────────────────

export function DialogSheet() {
  const dialog = useApp((s) => s.dialog);
  const typed = useApp((s) => s.typed);
  const set = useApp((s) => s.set);
  const withFace = useApp((s) => s.withFace);
  const insets = useInsets();
  if (!dialog) return null;
  const blocked = !!dialog.typed && typed < 6;
  const dismiss = () => set({ dialog: null, typed: 0 });
  const confirm = () => {
    if (blocked) return;
    set({ dialog: null, typed: 0 });
    if (!dialog.then) return;
    if (dialog.noFace) dialog.then();
    else withFace('Confirm with Face ID', dialog.then);
  };
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={StyleSheet.absoluteFill}>
        <Tap onPress={dismiss} accessibilityLabel="Dismiss" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(26,26,26,0.35)' }]} />
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(20).stiffness(200)}
        exiting={SlideOutDown.duration(220)}
        accessibilityViewIsModal
        style={[st.sheet, { bottom: Math.max(12, insets.bottom - 22) }]}
      >
        <View style={st.grabber} />
        <T accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700', lineHeight: 24 }}>{dialog.title}</T>
        <T style={{ fontSize: 15, lineHeight: 22, color: color.inkSecondary }}>{dialog.body}</T>
        {dialog.options && (
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: color.hairline, overflow: 'hidden' }}>
            {dialog.options.map((o, i) => (
              <Tap
                key={o.label}
                onPress={() => {
                  tick();
                  o.onPress();
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: !!o.selected }}
                style={[{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 }, i > 0 && { borderTopWidth: 1, borderTopColor: color.hairline }, o.selected && { backgroundColor: color.surfaceMuted }]}
              >
                <Check on={!!o.selected} radio />
                <View style={{ flex: 1, gap: 2 }}>
                  <T style={{ fontSize: 17, fontWeight: '600' }}>{o.label}</T>
                  {o.sub && <T style={{ fontSize: 13, color: color.inkSecondary }}>{o.sub}</T>}
                </View>
              </Tap>
            ))}
          </View>
        )}
        {dialog.typed && (
          <Tap onPress={() => set({ typed: Math.min(6, typed + 1) })} accessibilityLabel="Type DELETE to confirm" style={st.typedField}>
            <T style={{ fontSize: 17, fontFamily: font.mono, letterSpacing: 1.36, color: typed ? color.ink : color.inkMuted }}>
              {'DELETE'.slice(0, typed) + (typed < 6 ? '|' : '')}
            </T>
          </Tap>
        )}
        {dialog.confirm && (
          <Tap
            onPress={confirm}
            scale
            accessibilityState={{ disabled: blocked }}
            style={[st.dialogBtn, { backgroundColor: dialog.danger ? color.danger : color.brand }, blocked && { opacity: 0.4 }]}
          >
            <T style={{ fontSize: 17, fontWeight: '600', color: '#fff' }}>{dialog.confirm}</T>
          </Tap>
        )}
        <TextButton label={dialog.cancel} onPress={dismiss} />
      </Animated.View>
    </View>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

export function Toast() {
  const insets = useInsets();
  const toast = useApp((s) => s.toast);
  const toastAction = useApp((s) => s.toastAction);
  if (!toast) return null;
  return (
    <Animated.View
      key={toast.n}
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(200)}
      accessibilityLiveRegion="polite"
      style={[st.toast, { bottom: insets.bottom + 82 }]}
    >
      <T style={{ color: '#fff', fontSize: 15, lineHeight: 20, flex: 1 }}>{toast.text}</T>
      {toast.action ? (
        <Tap onPress={toastAction} hitSlop={10}>
          <T style={{ fontWeight: '600', color: color.bronze, fontSize: 15 }}>{toast.action}</T>
        </Tap>
      ) : null}
    </Animated.View>
  );
}

// ─── App lock (launch / signed out) ──────────────────────────────────────────

export function LockScreen() {
  const unlocked = useApp((s) => s.unlocked);
  const reason = useApp((s) => s.lockReason);
  const withFace = useApp((s) => s.withFace);
  const set = useApp((s) => s.set);
  const insets = useInsets();
  const unlock = () => withFace('Unlock Last Testament', () => set({ unlocked: true }));
  useEffect(() => {
    if (unlocked || reason !== 'launch') return;
    const t = setTimeout(unlock, 700);
    return () => clearTimeout(t);
  }, [unlocked, reason]); // eslint-disable-line react-hooks/exhaustive-deps
  if (unlocked) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(380)}
      style={[StyleSheet.absoluteFill, { zIndex: 80, backgroundColor: color.canvas, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 28 }]}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <Animated.View entering={FadeInDown.duration(500).delay(80)}>
          <Image source={mark} style={{ height: 64, width: 64 * (280 / 255) }} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(500).delay(180)} style={{ alignItems: 'center', gap: 8 }}>
          <Serif style={{ fontSize: 36, lineHeight: 40, textAlign: 'center' }}>{reason === 'launch' ? 'Last Testament' : 'You’re signed out.'}</Serif>
          <T style={{ fontSize: 15, color: color.inkSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 }}>
            {reason === 'launch' ? 'Where you keep the things only you know.' : 'Your Testament is safe and check-ins continue while you’re away.'}
          </T>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ gap: 8 }}>
        <PrimaryButton label={reason === 'launch' ? 'Unlock with Face ID' : 'Sign in with Face ID'} onPress={unlock} />
        <TextButton label="Use password instead" onPress={() => set({ unlocked: true })} />
      </Animated.View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 999,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 6px 18px rgba(0,0,0,0.08), inset 1.5px 1.5px 1px rgba(255,255,255,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 5,
  },
  tabPill: { position: 'absolute', left: 6, top: 6, height: 52, borderRadius: 999, backgroundColor: 'rgba(201,181,149,0.32)' },
  tab: { flex: 1, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center', gap: 3 },
  faceBox: {
    width: 160,
    height: 160,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.85)',
    boxShadow: '0 12px 32px rgba(26,26,26,0.16), inset 1px 1px 1px #fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  faceGlyph: { width: 56, height: 56, borderRadius: 16, borderWidth: 3, borderColor: color.brand },
  eye: { position: 'absolute', top: 16, width: 5, height: 5, borderRadius: 2.5, backgroundColor: color.brand },
  mouth: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 13,
    height: 8,
    borderBottomWidth: 3,
    borderColor: color.brand,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 12,
    gap: 14,
    boxShadow: '0 12px 32px rgba(26,26,26,0.2)',
  },
  grabber: { width: 36, height: 5, borderRadius: 3, backgroundColor: color.grabber, alignSelf: 'center', marginTop: -10 },
  typedField: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: color.grabber, paddingHorizontal: 14, justifyContent: 'center' },
  dialogBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 40,
    backgroundColor: color.ink,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
});
