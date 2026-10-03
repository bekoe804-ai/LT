import React from 'react';
import { Animated, Image, View } from 'react-native';
import {
  askDeleteAccount,
  askLock,
  imOkay,
  pauseCheckins,
  signOut,
  signOutOthers,
  soon,
  toggleFace,
  unlock,
  wasMe,
} from '../actions';
import { Avatar, Card, Chevron, Dot, GlassPill, NavBar, Row, RowText, Screen, Serif, T, Tap, TextButton } from '../components/ui';
import { useApp } from '../store';
import { color, easeOut } from '../theme';

const mark = require('../../assets/brand/mark.png');

// ─── Check-in (push / email / SMS destination) ───────────────────────────────

export function Checkin() {
  const back = useApp((s) => s.back);
  return (
    <Screen gap={0} horizontal={24} bottom={48 - 34}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <GlassPill label="Later" onPress={back} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
        <Image source={mark} style={{ height: 48, width: 48 * (280 / 255), marginBottom: 12 }} accessibilityIgnoresInvertColors />
        <Serif accessibilityRole="header" style={{ fontSize: 40, lineHeight: 42, textAlign: 'center' }}>Nana, are you okay?</Serif>
        <T style={{ fontSize: 17, color: color.inkSecondary, lineHeight: 24.5, maxWidth: 300, textAlign: 'center' }}>
          It’s been 30 days. A quick confirmation keeps your Testament waiting, exactly as it is.
        </T>
      </View>
      <View style={{ gap: 12 }}>
        <Tap onPress={imOkay} style={{ height: 56, borderRadius: 14, backgroundColor: color.bronze, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <View style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: color.ink, opacity: 0.7 }} />
          <T style={{ fontSize: 17, fontWeight: '600' }}>I’m okay</T>
        </Tap>
        <TextButton label="I need to pause check-ins" onPress={pauseCheckins} />
        <T style={{ fontSize: 13, color: color.inkMuted, textAlign: 'center', lineHeight: 19.5 }}>Confirmed with Face ID · Next check-in 2 November</T>
      </View>
    </Screen>
  );
}

// ─── Settings (tab) ───────────────────────────────────────────────────────────

export function Settings() {
  const secAlert = useApp((s) => s.secAlert);
  const locked = useApp((s) => s.locked);
  const push = useApp((s) => s.push);
  const secSub = locked ? 'Account locked' : secAlert ? '1 new sign-in to review' : 'Everything looks good';
  const plain = (title: string, last?: boolean) => (
    <Row onPress={soon} last={last}>
      <T style={{ fontSize: 17 }}>{title}</T>
      <Chevron />
    </Row>
  );
  return (
    <Screen kind="tab">
      <T accessibilityRole="header" style={{ fontSize: 32, fontWeight: '700', letterSpacing: -0.32 }}>Settings</T>
      <Card>
        <Row last onPress={soon} style={{ justifyContent: 'flex-start', gap: 14 }}>
          <Avatar initial="N" size={48} fontSize={18} />
          <RowText title="Nana Mensah" sub="nana@example.com · +44 •••• 318" />
          <Chevron />
        </Row>
      </Card>
      <Card>
        <Row onPress={() => push('releasePlan')}>
          <RowText title="Check-ins & release plan" sub="Every 30 days · 3 scenarios set" titleStyle={{ fontWeight: '400' }} />
          <Chevron />
        </Row>
        <Row last onPress={() => push('security')}>
          <RowText title="Security Centre" sub={secSub} titleStyle={{ fontWeight: '400' }} subStyle={{ color: secAlert || locked ? color.danger : color.positive }} />
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            {secAlert && <Dot c={color.danger} />}
            <Chevron />
          </View>
        </Row>
      </Card>
      <Card>
        {plain('Notifications')}
        {plain('Privacy & data')}
        {plain('Accessibility & time zone', true)}
      </Card>
      <Card>
        {plain('Help & support')}
        {plain('Terms, privacy & legal', true)}
      </Card>
      <Tap onPress={signOut} style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: `0 0 0 1px ${color.cardRing}`, paddingVertical: 14, paddingHorizontal: 18 }}>
        <T style={{ fontSize: 17, color: color.brand, textAlign: 'center', fontWeight: '600' }}>Sign out</T>
      </Tap>
    </Screen>
  );
}

// ─── Security Centre ──────────────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  const v = React.useRef(new Animated.Value(on ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(v, { toValue: on ? 1 : 0, duration: 250, easing: easeOut, useNativeDriver: false }).start();
  }, [on, v]);
  return (
    <Animated.View
      style={{
        width: 50,
        height: 30,
        borderRadius: 15,
        flexShrink: 0,
        backgroundColor: v.interpolate({ inputRange: [0, 1], outputRange: [color.border, color.positive] }),
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }],
        }}
      />
    </Animated.View>
  );
}

function SecRow({ title, sub, subColor, onPress, last, right, danger }: { title: string; sub?: string; subColor?: string; onPress: () => void; last?: boolean; right?: React.ReactNode; danger?: boolean }) {
  return (
    <Row onPress={onPress} last={last}>
      {sub ? (
        <RowText title={title} sub={sub} titleStyle={{ fontWeight: '400' }} subStyle={subColor ? { color: subColor } : undefined} />
      ) : (
        <T style={{ fontSize: 17, color: danger ? color.danger : color.ink }}>{title}</T>
      )}
      {right ?? <Chevron />}
    </Row>
  );
}

export function Security() {
  const secAlert = useApp((s) => s.secAlert);
  const locked = useApp((s) => s.locked);
  const face = useApp((s) => s.face);
  const sessions = useApp((s) => s.sessions);
  const back = useApp((s) => s.back);
  const count = (n: number | string) => (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <T style={{ fontSize: 15, color: color.inkSecondary }}>{n}</T>
      <Chevron />
    </View>
  );
  return (
    <Screen bottom={40 - 34}>
      <NavBar onBack={back} title="Security Centre" />
      {secAlert && (
        <View style={{ backgroundColor: color.dangerBg, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 10 }} accessibilityRole="alert">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color.danger, alignItems: 'center', justifyContent: 'center' }}>
              <T style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>!</T>
            </View>
            <T style={{ fontSize: 15, lineHeight: 21, flex: 1 }}>
              <T style={{ fontSize: 15, fontWeight: '700' }}>New sign-in · iPad · Lagos, Nigeria</T>
              {'\n'}Today 14:02. Was this you?
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Tap onPress={wasMe} style={[alertBtn, { backgroundColor: '#fff' }]}>
              <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Yes, it was me</T>
            </Tap>
            <Tap onPress={askLock} style={[alertBtn, { backgroundColor: color.danger }]}>
              <T style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Lock my account</T>
            </Tap>
          </View>
        </View>
      )}
      {locked && (
        <View style={{ backgroundColor: color.ink, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 6 }}>
          <T style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Account locked</T>
          <T style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 19 }}>
            All sessions signed out. Releases and check-ins are frozen until you unlock with your recovery code.
          </T>
          <Tap onPress={unlock} style={{ paddingTop: 6 }}>
            <T style={{ fontSize: 15, fontWeight: '600', color: color.bronze }}>Unlock account</T>
          </Tap>
        </View>
      )}
      <Card>
        <Row onPress={toggleFace}>
          <View accessibilityRole="switch" accessibilityState={{ checked: face }} style={{ flex: 1, gap: 2 }}>
            <T style={{ fontSize: 17 }}>Face ID</T>
            <T style={{ fontSize: 13, color: color.inkSecondary }}>Unlocks app and reveals secrets</T>
          </View>
          <Toggle on={face} />
        </Row>
        <SecRow title="Two-step verification" sub="On · authenticator app" subColor={color.positive} onPress={soon} />
        <SecRow title="Recovery codes" sub="Saved · 8 of 10 unused" subColor={color.positive} onPress={soon} />
        <SecRow title="Password" sub="Changed 4 months ago" onPress={soon} />
        <SecRow title="Recovery email & phone" onPress={soon} last />
      </Card>
      <Card>
        <SecRow title="Trusted devices" onPress={soon} right={count(2)} />
        <SecRow title="Active sessions" onPress={soon} right={count(sessions)} />
        <SecRow title="Sign-in activity" onPress={soon} />
        <Row last onPress={signOutOthers}>
          <T style={{ fontSize: 17, color: color.brand, fontWeight: '600' }}>Sign out of all other sessions</T>
        </Row>
      </Card>
      <Card>
        <SecRow title="Emergency lock" sub="Freeze all access and releases immediately" onPress={askLock} />
        <SecRow title="Pause account" onPress={soon} />
        <SecRow title="Delete account" onPress={askDeleteAccount} danger last />
      </Card>
    </Screen>
  );
}
const alertBtn = { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' } as const;
