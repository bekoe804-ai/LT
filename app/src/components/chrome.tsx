import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path } from 'react-native-svg';
import { fadeUp, native, useEntrance } from '../anim';
import { useInsets } from '../insets';
import { ScreenId, TABS, TabId, useApp } from '../store';
import { color, font } from '../theme';
import { T, Tap } from './ui';

// ─── Tab bar (Liquid Glass — functional layer only) ───────────────────────────

const TAB_ITEMS: { id: TabId; label: string; screen: ScreenId }[] = [
  { id: 'home', label: 'Home', screen: 'homeOk' },
  { id: 'testament', label: 'Testament', screen: 'testament' },
  { id: 'people', label: 'People', screen: 'people' },
  { id: 'settings', label: 'Settings', screen: 'settings' },
];

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
      {id === 'home' && (
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

export function TabBar() {
  const insets = useInsets();
  const screen = useApp((s) => s.screen);
  const faceId = useApp((s) => s.faceId);
  const tabTo = useApp((s) => s.tabTo);
  const active = TABS[screen];
  if (!active || faceId) return null;
  return (
    <View style={[st.tabBar, { bottom: insets.bottom + 4 }]} accessibilityRole="tablist">
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.62)' }]} />
      {TAB_ITEMS.map((t) => {
        const on = active === t.id;
        return (
          <Tap
            key={t.id}
            onPress={() => tabTo(t.screen)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
            style={[st.tab, on && { backgroundColor: 'rgba(201,181,149,0.32)' }]}
          >
            <TabIcon id={t.id} on={on} />
            <T style={{ fontSize: 11, fontWeight: on ? '600' : '500', color: on ? color.brand : color.inkSecondary }}>{t.label}</T>
          </Tap>
        );
      })}
    </View>
  );
}

// ─── Face ID overlay ───────────────────────────────────────────────────────────

export function FaceIdOverlay() {
  const faceId = useApp((s) => s.faceId);
  const label = useApp((s) => s.faceLabel);
  const enter = useEntrance(faceId, 200, Easing.ease);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!faceId) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 0, duration: 450, easing: Easing.inOut(Easing.ease), useNativeDriver: native }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [faceId, pulse]);
  if (!faceId) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 30 }, fadeUp(enter)]} accessibilityLiveRegion="polite">
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(246,244,239,0.6)', alignItems: 'center', justifyContent: 'center' }]}>
        <View style={st.faceBox}>
          <Animated.View
            style={[
              st.faceGlyph,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
              },
            ]}
          >
            <View style={[st.eye, { left: 14 }]} />
            <View style={[st.eye, { right: 14 }]} />
            <View style={st.mouth} />
          </Animated.View>
          <T style={{ fontSize: 15, fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 }}>{label}</T>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Dialog sheet (consequential confirmations) ───────────────────────────────

export function DialogSheet() {
  const dialog = useApp((s) => s.dialog);
  const typed = useApp((s) => s.typed);
  const set = useApp((s) => s.set);
  const withFace = useApp((s) => s.withFace);
  const enter = useEntrance(dialog, 360);
  if (!dialog) return null;
  const blocked = !!dialog.typed && typed < 6;
  const dismiss = () => set({ dialog: null, typed: 0 });
  const confirm = () => {
    if (blocked) return;
    set({ dialog: null, typed: 0 });
    withFace('Confirm with Face ID', dialog.then);
  };
  return (
    <>
      <Tap onPress={dismiss} accessibilityLabel="Dismiss" style={[StyleSheet.absoluteFill, { zIndex: 20, backgroundColor: 'rgba(26,26,26,0.35)' }]} />
      <Animated.View
        accessibilityViewIsModal
        style={[
          st.sheet,
          { transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }] },
        ]}
      >
        <View style={st.grabber} />
        <T accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700', lineHeight: 24 }}>{dialog.title}</T>
        <T style={{ fontSize: 15, lineHeight: 22, color: color.inkSecondary }}>{dialog.body}</T>
        {dialog.typed && (
          <Tap
            onPress={() => set({ typed: Math.min(6, typed + 1) })}
            accessibilityLabel="Type DELETE to confirm"
            style={st.typedField}
          >
            <T style={{ fontSize: 17, fontFamily: font.mono, letterSpacing: 1.36, color: typed ? color.ink : color.inkMuted }}>
              {'DELETE'.slice(0, typed) + (typed < 6 ? '|' : '')}
            </T>
          </Tap>
        )}
        <Tap
          onPress={confirm}
          accessibilityState={{ disabled: blocked }}
          style={[st.dialogBtn, { backgroundColor: dialog.danger ? color.danger : color.brand }, blocked && { opacity: 0.4 }]}
        >
          <T style={{ fontSize: 17, fontWeight: '600', color: '#fff' }}>{dialog.confirm}</T>
        </Tap>
        <Tap onPress={dismiss} style={st.dialogBtn}>
          <T style={{ fontSize: 17, fontWeight: '600', color: color.brand }}>{dialog.cancel}</T>
        </Tap>
      </Animated.View>
    </>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

export function Toast() {
  const insets = useInsets();
  const toast = useApp((s) => s.toast);
  const toastAction = useApp((s) => s.toastAction);
  const enter = useEntrance(toast?.n, 280);
  if (!toast) return null;
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        st.toast,
        { bottom: insets.bottom + 82, opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
      ]}
    >
      <T style={{ color: '#fff', fontSize: 15, lineHeight: 20, flex: 1 }}>{toast.text}</T>
      {toast.action ? (
        <Tap onPress={toastAction}>
          <T style={{ fontWeight: '600', color: color.bronze, fontSize: 15 }}>{toast.action}</T>
        </Tap>
      ) : null}
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
    borderLeftWidth: 0,
    borderColor: color.brand,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 21,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 20,
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
