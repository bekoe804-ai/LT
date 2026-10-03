import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useInsets } from '../insets';
import { back as goBack } from '../nav';
import { useApp } from '../store';
import { smooth } from '../layout';
import { color, font, radius } from '../theme';

export const ring = `0 0 0 1px ${color.cardRing}`;
const glassShadow = '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)';
const SPRING = { damping: 18, stiffness: 260, mass: 0.6 };

export const tick = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};
export const thud = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export function useReduceMotion() {
  return useApp((s) => s.a11y.reduceMotion);
}

/** Text with the app's system-UI defaults. Honours the "Larger text" setting. */
export function T({ style, ...rest }: TextProps) {
  const large = useApp((s) => s.a11y.largerText);
  if (!large) return <Text {...rest} style={[s.text, style]} />;
  const flat = StyleSheet.flatten([s.text, style]) as TextStyle;
  return (
    <Text
      {...rest}
      style={[flat, { fontSize: (flat.fontSize ?? 17) * 1.15, lineHeight: flat.lineHeight ? flat.lineHeight * 1.15 : undefined }]}
    />
  );
}

const APressable = Animated.createAnimatedComponent(Pressable);

/**
 * Anything tappable. Cards and buttons (`scale`) spring down slightly while
 * pressed; text links dim to 70%, like the prototype's [data-tap]:active.
 */
export function Tap({
  style,
  scale,
  haptic,
  onPress,
  ...rest
}: PressableProps & { style?: StyleProp<ViewStyle>; scale?: boolean; haptic?: boolean }) {
  const p = useSharedValue(0);
  const anim = useAnimatedStyle(() =>
    scale ? { transform: [{ scale: 1 - p.value * 0.025 }], opacity: 1 - p.value * 0.08 } : { opacity: 1 - p.value * 0.3 },
  );
  return (
    <APressable
      accessibilityRole="button"
      {...rest}
      onPressIn={(e) => {
        p.value = withTiming(1, { duration: 90 });
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.value = withSpring(0, SPRING);
        rest.onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) tick();
        onPress?.(e);
      }}
      style={[style, anim]}
    />
  );
}

/** Children cascade in (8px lift + fade, 35ms apart) the first time a screen mounts. */
function Cascade({ children }: { children: React.ReactNode }) {
  const reduce = useReduceMotion();
  // Web preview: the JS stack keeps screens mounted and re-shows them, which
  // leaves Reanimated entering animations stuck. The phone gets the full motion.
  if (Platform.OS === 'web') return <>{children}</>;
  const items = React.Children.toArray(children);
  return (
    <>
      {items.map((child, i) => (
        <Animated.View
          key={(child as React.ReactElement).key ?? i}
          entering={reduce ? undefined : FadeInDown.duration(320).delay(Math.min(i, 7) * 35).withInitialValues({ transform: [{ translateY: 10 }] })}
          layout={reduce ? undefined : smooth}
          style={(child as React.ReactElement).type === Spacer ? { flex: 1 } : undefined}
        >
          {child}
        </Animated.View>
      ))}
    </>
  );
}

/** Flexible spacer that survives the cascade wrapper. */
export function Spacer() {
  return <View style={{ flex: 1 }} />;
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
  cascade = true,
}: {
  children: React.ReactNode;
  kind?: 'tab' | 'pushed';
  gap?: number;
  bottom?: number;
  horizontal?: number;
  contentStyle?: StyleProp<ViewStyle>;
  cascade?: boolean;
}) {
  const insets = useInsets();
  const top = insets.top + (kind === 'tab' ? 16 : 10);
  const pb = insets.bottom + (bottom ?? (kind === 'tab' ? 86 : 26));
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={[{ paddingTop: top, paddingBottom: pb, paddingHorizontal: horizontal, gap, flexGrow: 1 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      {cascade ? <Cascade>{children}</Cascade> : children}
    </ScrollView>
  );
}

/** A pushed screen with a centred title and optional large heading + lead. */
export function Page({
  title,
  heading,
  lead,
  right,
  children,
  gap,
  onBack = goBack,
}: {
  title?: string;
  heading?: string;
  lead?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  gap?: number;
  onBack?: () => void;
}) {
  return (
    <Screen gap={gap}>
      <NavBar onBack={onBack} title={title} right={right} />
      {(heading || lead) && (
        <View style={{ gap: 6 }}>
          {heading && <T accessibilityRole="header" style={{ fontSize: 28, fontWeight: '700', lineHeight: 32 }}>{heading}</T>}
          {lead && <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>{lead}</T>}
        </View>
      )}
      {children}
    </Screen>
  );
}

export function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[s.card, style]} />;
}

/** A list row inside a Card. Highlights while pressed, like an iOS table cell. */
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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [st, pressed && { backgroundColor: color.pressed }]}
    >
      {children}
    </Pressable>
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
      {sub != null && sub !== '' && <T style={[s.sub, subStyle]}>{sub}</T>}
    </View>
  );
}

export interface GroupItem {
  title: string;
  sub?: string;
  subColor?: string;
  value?: string;
  onPress?: () => void;
  toggle?: { on: boolean; onChange: (on: boolean) => void };
  danger?: boolean;
  strong?: boolean;
  right?: React.ReactNode;
  left?: React.ReactNode;
  key?: string;
}

/** A card of settings-style rows, described as data. */
export function Group({ items, label, footer }: { items: GroupItem[]; label?: string; footer?: string }) {
  const body = (
    <Card>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        const press = it.toggle ? () => { tick(); it.toggle!.onChange(!it.toggle!.on); } : it.onPress;
        return (
          <Row key={it.key ?? it.title} onPress={press} last={last} style={it.left ? { justifyContent: 'flex-start', gap: 14 } : undefined}>
            {it.left}
            {it.sub ? (
              <RowText title={it.title} sub={it.sub} titleStyle={{ fontWeight: it.strong ? '600' : '400', color: it.danger ? color.danger : color.ink }} subStyle={it.subColor ? { color: it.subColor } : undefined} />
            ) : (
              <T style={{ fontSize: 17, flex: 1, fontWeight: it.strong ? '600' : '400', color: it.danger ? color.danger : it.strong ? color.brand : color.ink }}>{it.title}</T>
            )}
            {it.right ??
              (it.toggle ? (
                <Toggle on={it.toggle.on} />
              ) : (
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  {it.value ? <T style={{ fontSize: 15, color: color.inkSecondary }}>{it.value}</T> : null}
                  {it.onPress && !it.strong ? <Chevron /> : null}
                </View>
              ))}
          </Row>
        );
      })}
    </Card>
  );
  if (!label && !footer) return body;
  return (
    <View style={{ gap: 8 }}>
      {label && <SectionLabel>{label}</SectionLabel>}
      {body}
      {footer && <T style={{ fontSize: 13, color: color.inkMuted, lineHeight: 19, paddingHorizontal: 2 }}>{footer}</T>}
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

export function Section({ label, children, right }: { label: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      {right ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>{label}</SectionLabel>
          {right}
        </View>
      ) : typeof label === 'string' ? (
        <SectionLabel>{label}</SectionLabel>
      ) : (
        label
      )}
      {children}
    </View>
  );
}

/** Small text action, e.g. "See all". */
export function LinkText({ label, onPress, danger, style }: { label: string; onPress: () => void; danger?: boolean; style?: StyleProp<TextStyle> }) {
  return (
    <Tap onPress={onPress} hitSlop={8}>
      <T style={[{ fontSize: 15, fontWeight: '600', color: danger ? color.danger : color.brand }, style]}>{label}</T>
    </Tap>
  );
}

/** Translucent circular nav button (back). */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Tap onPress={onPress} scale accessibilityLabel="Back" style={[s.glassBtn, { width: 44 }]}>
      <T style={{ fontSize: 20, color: color.brand }}>‹</T>
    </Tap>
  );
}

/** Translucent pill nav button with a label (Edit, Later). */
export function GlassPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Tap onPress={onPress} scale style={[s.glassBtn, { paddingHorizontal: 16 }]}>
      <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>{label}</T>
    </Tap>
  );
}

/** Dark circular add button. */
export function PlusButton({ onPress, label = 'Add' }: { onPress: () => void; label?: string }) {
  return (
    <Tap onPress={onPress} scale haptic accessibilityLabel={label} style={s.plus}>
      <T style={{ fontSize: 24, color: '#fff', lineHeight: 26 }}>+</T>
    </Tap>
  );
}

/** Top bar for pushed screens: back · optional centred title · optional right control. */
export function NavBar({ onBack, title, right }: { onBack: () => void; title?: string; right?: React.ReactNode }) {
  return (
    <View style={s.navBar}>
      <BackButton onPress={onBack} />
      {title ? (
        <T numberOfLines={1} style={{ fontSize: 17, fontWeight: '600', flexShrink: 1, textAlign: 'center' }}>
          {title}
        </T>
      ) : null}
      {right ?? <View style={{ width: 44 }} />}
    </View>
  );
}

type BtnProps = { label: React.ReactNode; onPress: () => void; style?: StyleProp<ViewStyle>; textStyle?: StyleProp<TextStyle>; disabled?: boolean };

export function PrimaryButton({ label, onPress, style, textStyle, disabled }: BtnProps) {
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      scale
      accessibilityState={{ disabled: !!disabled }}
      style={[s.btn, { height: 50, backgroundColor: color.brand }, disabled && { opacity: 0.4 }, style]}
    >
      {typeof label === 'string' ? <T style={[s.btnText, { color: '#fff', fontSize: 17 }, textStyle]}>{label}</T> : label}
    </Tap>
  );
}

export function SecondaryButton({ label, onPress, style, textStyle }: BtnProps) {
  return (
    <Tap onPress={onPress} scale style={[s.btn, s.secondary, style]}>
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

/** iOS-style switch with a springy knob. */
export function Toggle({ on }: { on: boolean }) {
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.value = withSpring(on ? 1 : 0, SPRING);
  }, [on, v]);
  const track = useAnimatedStyle(() => ({ backgroundColor: v.value > 0.5 ? color.positive : color.border }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: v.value * 20 }] }));
  return (
    <Animated.View accessibilityRole="switch" accessibilityState={{ checked: on }} style={[{ width: 50, height: 30, borderRadius: 15, flexShrink: 0 }, track]}>
      <Animated.View style={[{ position: 'absolute', top: 2, left: 2, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }, knob]} />
    </Animated.View>
  );
}

/** Segmented control with a sliding white indicator. */
export function Segmented({ options, value, onChange, height = 40 }: { options: string[]; value: number; onChange: (i: number) => void; height?: number }) {
  const [w, setW] = useState(0);
  const seg = w ? (w - 8 - 4 * (options.length - 1)) / options.length : 0;
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withSpring(value * (seg + 4), SPRING);
  }, [value, seg, x]);
  const ind = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4, backgroundColor: color.search, borderRadius: 12, padding: 4 }}>
      {seg > 0 && <Animated.View style={[{ position: 'absolute', top: 4, left: 4, width: seg, height, borderRadius: 9, backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }, ind]} />}
      {options.map((label, i) => (
        <Pressable
          key={label}
          onPress={() => {
            if (i !== value) tick();
            onChange(i);
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === value }}
          style={{ flex: 1, height, alignItems: 'center', justifyContent: 'center' }}
        >
          <T style={{ fontSize: 13, fontWeight: '600', color: i === value ? color.ink : color.inkSecondary }}>{label}</T>
        </Pressable>
      ))}
    </View>
  );
}

function ProgressSeg({ filled }: { filled: boolean }) {
  const v = useSharedValue(filled ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(filled ? 1 : 0, { duration: 380 });
  }, [filled, v]);
  const st = useAnimatedStyle(() => ({ width: `${v.value * 100}%` }));
  return (
    <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: color.track, overflow: 'hidden' }}>
      <Animated.View style={[{ height: 4, backgroundColor: color.brand }, st]} />
    </View>
  );
}

/** Step progress: `done` of `total` segments filled; fills animate. */
export function Progress({ done, total }: { done: number; total: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`Step ${Math.min(done + 1, total)} of ${total}`}>
      {Array.from({ length: Math.max(total, 1) }, (_, i) => (
        <ProgressSeg key={i} filled={i < done} />
      ))}
    </View>
  );
}

/** Round check / radio used in choice lists. */
export function Check({ on, radio }: { on: boolean; radio?: boolean }) {
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.value = withSpring(on ? 1 : 0, SPRING);
  }, [on, v]);
  const fill = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.6 + v.value * 0.4 }] }));
  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: on ? color.brand : color.border, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Animated.View style={[{ position: 'absolute', top: -2, left: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: color.brand, alignItems: 'center', justifyContent: 'center' }, radio && { top: 3, left: 3, width: 14, height: 14, borderRadius: 7 }, fill]}>
        {!radio && <T style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</T>}
      </Animated.View>
    </View>
  );
}

/** A selectable row with a check or radio. */
export function Choice({ on, radio, title, sub, onPress, left, last, style }: { on: boolean; radio?: boolean; title: string; sub?: string; onPress: () => void; left?: React.ReactNode; last?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={() => {
        tick();
        onPress();
      }}
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: on }}
      style={({ pressed }) => [s.choice, !last && s.divider, on && { backgroundColor: color.surfaceMuted }, pressed && { backgroundColor: color.pressed }, style]}
    >
      <Check on={on} radio={radio} />
      {left}
      <RowText title={title} sub={sub} />
    </Pressable>
  );
}

/** Labelled text input in the card style. */
export function Field({ label, last, mono, ...rest }: TextInputProps & { label: string; last?: boolean; mono?: boolean }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[{ paddingVertical: 10, paddingHorizontal: 18, gap: 2 }, !last && s.divider, focus && { backgroundColor: color.surfaceMuted }]}>
      <T style={{ fontSize: 13, color: focus ? color.brand : color.inkSecondary }}>{label}</T>
      <TextInput
        placeholderTextColor={color.inkMuted}
        {...rest}
        onFocus={(e) => {
          setFocus(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          rest.onBlur?.(e);
        }}
        style={[{ fontSize: 17, color: color.ink, paddingVertical: 4, minHeight: 28 }, mono && { fontFamily: font.mono, letterSpacing: 1 }, rest.multiline && { minHeight: 72, textAlignVertical: 'top' }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object), rest.style]}
      />
    </View>
  );
}

/** Centered empty / success state. */
export function Empty({ icon = '✓', title, body, tone = 'positive' }: { icon?: string; title: string; body?: string; tone?: 'positive' | 'neutral' }) {
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 28 }}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: tone === 'positive' ? color.positiveBg : color.stone, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ color: tone === 'positive' ? color.positive : color.bronzeInk, fontSize: 24, fontWeight: '700' }}>{icon}</T>
      </View>
      <Serif style={{ fontSize: 28, lineHeight: 31, textAlign: 'center' }}>{title}</Serif>
      {body ? <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22, textAlign: 'center', maxWidth: 300 }}>{body}</T> : null}
    </View>
  );
}

/** Informational panel in warm stone. */
export function Note({ title, body, tone = 'stone' }: { title?: string; body: React.ReactNode; tone?: 'stone' | 'warning' | 'danger' | 'positive' }) {
  const bg = { stone: color.stone, warning: color.warningBg, danger: color.dangerBg, positive: color.positiveBg }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 4 }}>
      {title && <T style={{ fontSize: 15, fontWeight: '600' }}>{title}</T>}
      <T style={{ fontSize: title ? 13 : 15, color: title ? color.inkSecondary : color.ink, lineHeight: title ? 19 : 22 }}>{body}</T>
    </View>
  );
}

export const s = StyleSheet.create({
  text: { color: color.ink, fontSize: 17 },
  sub: { fontSize: 13, color: color.inkSecondary },
  card: { backgroundColor: color.surface, borderRadius: radius.card, boxShadow: ring, overflow: 'hidden' },
  row: { paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  choice: { paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', gap: 14, alignItems: 'center' },
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
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  btn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  secondary: { borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
  btnText: { fontSize: 15, fontWeight: '600' },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  mono: { fontFamily: font.mono },
});
