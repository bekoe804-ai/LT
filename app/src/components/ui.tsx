import React from 'react';
import {
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { useInsets } from '../insets';
import { color, font, radius } from '../theme';

export const ring = `0 0 0 1px ${color.cardRing}`;
const glassShadow = '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)';

/** Text with the app's system-UI defaults. */
export function T({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[s.text, style]} />;
}

/** Anything tappable: dims to 70% while pressed, like the prototype's [data-tap]:active. */
export function Tap({ style, ...rest }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [style, pressed && { opacity: 0.7 }]}
    />
  );
}

/**
 * Scrollable screen body. Tab screens leave room for the floating tab bar;
 * pushed screens have a slightly shorter top margin for the nav buttons.
 */
export function Screen({
  children,
  kind = 'pushed',
  gap = 18,
  bottom,
  horizontal = 20,
  contentStyle,
}: {
  children: React.ReactNode;
  kind?: 'tab' | 'pushed';
  gap?: number;
  bottom?: number;
  horizontal?: number;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useInsets();
  const top = insets.top + (kind === 'tab' ? 16 : 10);
  const pb = insets.bottom + (bottom ?? (kind === 'tab' ? 86 : 26));
  return (
    <ScrollView
      style={StyleSheet.absoluteFill}
      contentContainerStyle={[
        { paddingTop: top, paddingBottom: pb, paddingHorizontal: horizontal, gap, flexGrow: 1 },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[s.card, style]} />;
}

/** A list row inside a Card, with a hairline divider unless it's the last row. */
export function Row({
  onPress,
  last,
  style,
  children,
  accessibilityLabel,
}: {
  onPress?: () => void;
  last?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  accessibilityLabel?: string;
}) {
  const st = [s.row, !last && s.divider, style];
  if (!onPress) return <View style={st}>{children}</View>;
  return (
    <Tap onPress={onPress} style={st} accessibilityLabel={accessibilityLabel}>
      {children}
    </Tap>
  );
}

/** Title + optional subtitle stacked, as used in most rows. */
export function RowText({
  title,
  sub,
  titleStyle,
  subStyle,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  titleStyle?: StyleProp<TextStyle>;
  subStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <T style={[{ fontSize: 17, fontWeight: '600' }, titleStyle]}>{title}</T>
      {sub != null && <T style={[s.sub, subStyle]}>{sub}</T>}
    </View>
  );
}

export function Chevron() {
  return <T style={{ color: color.inkMuted, fontSize: 17 }}>›</T>;
}

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <T accessibilityRole="header" style={[s.sectionLabel, style]}>
      {children}
    </T>
  );
}

export function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      {typeof label === 'string' ? <SectionLabel>{label}</SectionLabel> : label}
      {children}
    </View>
  );
}

/** Translucent circular nav button (back). */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Tap onPress={onPress} accessibilityLabel="Back" style={[s.glassBtn, { width: 44 }]}>
      <T style={{ fontSize: 20, color: color.brand }}>‹</T>
    </Tap>
  );
}

/** Translucent pill nav button with a label (Edit, Later). */
export function GlassPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} style={[s.glassBtn, { paddingHorizontal: 16 }]}>
      <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>{label}</T>
    </Tap>
  );
}

/** Dark circular add button. */
export function PlusButton({ onPress, label = 'Add' }: { onPress: () => void; label?: string }) {
  return (
    <Tap onPress={onPress} accessibilityLabel={label} style={s.plus}>
      <T style={{ fontSize: 24, color: '#fff', lineHeight: 26 }}>+</T>
    </Tap>
  );
}

/** Top bar for pushed screens: back · optional centred title · optional right control. */
export function NavBar({ onBack, title, right }: { onBack: () => void; title?: string; right?: React.ReactNode }) {
  return (
    <View style={s.navBar}>
      <BackButton onPress={onBack} />
      {title ? <T style={{ fontSize: 17, fontWeight: '600' }}>{title}</T> : null}
      {right ?? <View style={{ width: 44 }} />}
    </View>
  );
}

type BtnProps = { label: React.ReactNode; onPress: () => void; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; disabled?: boolean };

export function PrimaryButton({ label, onPress, style, textStyle, disabled }: BtnProps) {
  return (
    <Tap onPress={onPress} disabled={disabled} style={[s.btn, { height: 50, backgroundColor: color.brand }, style]}>
      {typeof label === 'string' ? <T style={[s.btnText, { color: '#fff', fontSize: 17 }, textStyle]}>{label}</T> : label}
    </Tap>
  );
}

export function SecondaryButton({ label, onPress, style, textStyle }: BtnProps) {
  return (
    <Tap onPress={onPress} style={[s.btn, s.secondary, style]}>
      <T style={[s.btnText, { color: color.brand }, textStyle]}>{label}</T>
    </Tap>
  );
}

export function TextButton({ label, onPress, style, textStyle }: BtnProps) {
  return (
    <Tap onPress={onPress} style={[s.btn, { height: 50 }, style]}>
      <T style={[s.btnText, { color: color.brand, fontSize: 17 }, textStyle]}>{label}</T>
    </Tap>
  );
}

export function Badge({ label, bg, fg, style }: { label: string; bg: string; fg: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }, style]}>
      <T style={{ fontSize: 12, fontWeight: '600', color: fg }}>{label}</T>
    </View>
  );
}

export function Avatar({ initial, dark, size = 36, fontSize = 15 }: { initial: string; dark?: boolean; size?: number; fontSize?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: dark ? color.brand : color.stone,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <T style={{ fontSize, fontWeight: '600', color: dark ? '#fff' : color.brand }}>{initial}</T>
    </View>
  );
}

export function Dot({ c, size = 8 }: { c: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c, flexShrink: 0 }} />;
}

/** Serif heading for brand moments. */
export function Serif({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[{ fontFamily: font.serif, color: color.ink }, style]} />;
}

export const s = StyleSheet.create({
  text: { color: color.ink, fontSize: 17 },
  sub: { fontSize: 13, color: color.inkSecondary },
  card: { backgroundColor: color.surface, borderRadius: radius.card, boxShadow: ring, overflow: 'hidden' },
  row: { paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: color.hairline },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.96,
    textTransform: 'uppercase',
    color: color.inkTertiary,
    paddingHorizontal: 2,
  },
  glassBtn: {
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    boxShadow: glassShadow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    height: 44,
    width: 44,
    borderRadius: radius.pill,
    backgroundColor: color.brand,
    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  secondary: { borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
  btnText: { fontSize: 15, fontWeight: '600' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  mono: { fontFamily: font.mono },
});
