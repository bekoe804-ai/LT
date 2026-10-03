import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { askDeleteAccount, askLock, askPauseAccount, endSession, removeDevice, signOutOthers, toggleFace, unlockAccount, wasMe } from '../actions';
import { Card, Choice, Field as Input, Group, LinkText, NavBar, Note, Page, PrimaryButton, Row, RowText, Screen, SectionLabel, Spacer, T, Tap, Toggle, s as ui } from '../components/ui';
import { back, go } from '../nav';
import { useApp } from '../store';
import { smooth } from '../layout';
import { color } from '../theme';

// ─── Security Centre ──────────────────────────────────────────────────────────

export function Security() {
  const secAlert = useApp((s) => s.secAlert);
  const locked = useApp((s) => s.locked);
  const face = useApp((s) => s.face);
  const sessions = useApp((s) => s.sessions.length);
  const devices = useApp((s) => s.devices.length);
  const twoStep = useApp((s) => s.twoStep);
  const codesUsed = useApp((s) => s.codesUsed);
  const pw = useApp((s) => s.passwordChanged);
  const paused = useApp((s) => s.accountPausedUntil);
  return (
    <Screen bottom={6}>
      <NavBar onBack={back} title="Security Centre" />
      {secAlert && (
        <Animated.View exiting={undefined} style={{ backgroundColor: color.dangerBg, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 10 }} accessibilityRole="alert">
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
            <Tap onPress={wasMe} scale style={[alertBtn, { backgroundColor: '#fff' }]}>
              <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Yes, it was me</T>
            </Tap>
            <Tap onPress={askLock} scale style={[alertBtn, { backgroundColor: color.danger }]}>
              <T style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Lock my account</T>
            </Tap>
          </View>
        </Animated.View>
      )}
      {locked && (
        <Animated.View entering={FadeInDown} style={{ backgroundColor: color.ink, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 6 }}>
          <T style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Account locked</T>
          <T style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 19 }}>
            All sessions signed out. Releases and check-ins are frozen until you unlock with your recovery code.
          </T>
          <Tap onPress={unlockAccount} style={{ paddingTop: 6 }}>
            <T style={{ fontSize: 15, fontWeight: '600', color: color.bronze }}>Unlock account</T>
          </Tap>
        </Animated.View>
      )}
      {paused && <Note tone="warning" title={`Account paused until ${paused}`} body="Check-ins and releases are on hold." />}
      <Card>
        <Row onPress={toggleFace}>
          <View style={{ flex: 1, gap: 2 }}>
            <T style={{ fontSize: 17 }}>Face ID</T>
            <T style={{ fontSize: 13, color: color.inkSecondary }}>Unlocks app and reveals secrets</T>
          </View>
          <Toggle on={face} />
        </Row>
        <SecRow title="Two-step verification" sub={`On · ${twoStep === 'app' ? 'authenticator app' : 'text message'}`} subColor={color.positive} onPress={() => go('/security/two-step')} />
        <SecRow title="Recovery codes" sub={`Saved · ${10 - codesUsed} of 10 unused`} subColor={color.positive} onPress={() => go('/security/recovery-codes')} />
        <SecRow title="Password" sub={pw} onPress={() => go('/security/password')} />
        <SecRow title="Recovery email & phone" onPress={() => go('/security/recovery-contact')} last />
      </Card>
      <Group
        items={[
          { title: 'Trusted devices', value: String(devices), onPress: () => go('/security/devices') },
          { title: 'Active sessions', value: String(sessions), onPress: () => go('/security/sessions') },
          { title: 'Sign-in activity', onPress: () => go('/security/activity') },
          { title: 'Sign out of all other sessions', onPress: signOutOthers, strong: true },
        ]}
      />
      <Group
        items={[
          { title: 'Emergency lock', sub: 'Freeze all access and releases immediately', onPress: askLock },
          { title: 'Pause account', onPress: () => go('/security/pause') },
          { title: 'Delete account', onPress: askDeleteAccount, danger: true },
        ]}
      />
    </Screen>
  );
}
const alertBtn = { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' } as const;

function SecRow({ title, sub, subColor, onPress, last }: { title: string; sub?: string; subColor?: string; onPress: () => void; last?: boolean }) {
  return (
    <Row onPress={onPress} last={last}>
      {sub ? <RowText title={title} sub={sub} titleStyle={{ fontWeight: '400' }} subStyle={subColor ? { color: subColor } : undefined} /> : <T style={{ fontSize: 17 }}>{title}</T>}
      <T style={{ color: color.inkMuted, fontSize: 17 }}>›</T>
    </Row>
  );
}

// ─── Two-step verification ───────────────────────────────────────────────────

export function TwoStep() {
  const method = useApp((s) => s.twoStep);
  const set = useApp((s) => s.set);
  const withFace = useApp((s) => s.withFace);
  const showToast = useApp((s) => s.showToast);
  const choose = (m: 'app' | 'sms') =>
    m !== method &&
    withFace('Change two-step method', () => {
      set({ twoStep: m });
      showToast(m === 'app' ? 'Now using your authenticator app' : 'Codes will come by text to •••• 318');
    });
  return (
    <Page title="Two-step verification" lead="When you sign in on a new device, we ask for a code as well as your password.">
      <Card>
        <Choice radio on={method === 'app'} title="Authenticator app" sub="Recommended · works without signal" onPress={() => choose('app')} />
        <Choice radio on={method === 'sms'} title="Text message" sub="+44 •••• 318" onPress={() => choose('sms')} last />
      </Card>
      <Group items={[{ title: 'Backup: recovery codes', sub: 'If you lose your phone', onPress: () => go('/security/recovery-codes') }]} />
      <Note body="Two-step verification can’t be turned off while your Testament has trusted people." />
    </Page>
  );
}

// ─── Recovery codes ──────────────────────────────────────────────────────────

const CODES = ['7KQ2-9FLM', 'P3ZD-4WXR', 'H8TN-2CVB', 'M5RJ-6YKE', 'B2WQ-8NDF', 'X9LP-3GTA', 'C4HV-7SUM', 'R6EK-1JZP', 'D7FA-5QWN', 'L1TY-9BRC'];
const CODES2 = ['N4QX-2LKD', 'W7ZE-5RHM', 'F3PB-8TJC', 'K9VA-1SNE', 'G2MD-6UYQ', 'T5HR-3WLF', 'J8CN-7EXA', 'Q1KB-4ZPV', 'V6LS-9DGT', 'Y3WF-2MRH'];

export function RecoveryCodes() {
  const used = useApp((s) => s.codesUsed);
  const regen = useApp((s) => s.codesRegenerated);
  const set = useApp((s) => s.set);
  const withFace = useApp((s) => s.withFace);
  const showToast = useApp((s) => s.showToast);
  const [shown, setShown] = useState(false);
  const codes = regen ? CODES2 : CODES;
  return (
    <Page title="Recovery codes" lead="Each code works once. Keep them somewhere safe, away from this phone — they let you back in if you lose it.">
      <Card style={{ padding: 18 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 }}>
          {codes.map((c, i) => (
            <Animated.View key={c + shown} entering={shown ? FadeIn.delay(i * 30) : undefined} style={{ width: '50%' }}>
              <T style={[ui.mono, { fontSize: 16, letterSpacing: 1.2, color: i < used ? color.inkMuted : color.ink, textDecorationLine: i < used && shown ? 'line-through' : 'none' }]}>
                {shown ? c : '••••-••••'}
              </T>
            </Animated.View>
          ))}
        </View>
      </Card>
      {!shown ? (
        <PrimaryButton label="Show codes with Face ID" onPress={() => withFace('Show recovery codes', () => setShown(true))} />
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PrimaryButton
            label="Copy all"
            onPress={() => {
              Clipboard.setStringAsync(codes.slice(used).join('\n')).catch(() => {});
              showToast('Codes copied · clears in 60 seconds');
            }}
            style={{ flex: 1 }}
          />
          <PrimaryButton label="Hide" onPress={() => setShown(false)} style={{ flex: 1, backgroundColor: color.stone }} textStyle={{ color: color.brand }} />
        </View>
      )}
      <LinkText
        label="Make new codes"
        onPress={() =>
          set({
            dialog: {
              title: 'Make new recovery codes?',
              body: 'Your current codes stop working straight away. Save the new ones before you leave this screen.',
              confirm: 'Make new codes',
              cancel: 'Cancel',
              then: () => {
                set({ codesRegenerated: true, codesUsed: 0 });
                setShown(true);
                showToast('New codes ready · old ones no longer work');
              },
            },
          })
        }
      />
      <T style={{ fontSize: 13, color: color.inkMuted }}>{used ? `${used} used · last used 3 Jun 2026` : 'None used'}</T>
    </Page>
  );
}

// ─── Password ────────────────────────────────────────────────────────────────

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 10) s++;
  if (pw.length >= 14) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function StrengthBar({ score }: { score: number }) {
  const bar = useAnimatedStyle(() => ({ width: withTiming(`${(score / 4) * 100}%`, { duration: 300 }), backgroundColor: score >= 3 ? color.positive : score === 2 ? color.warning : color.danger }), [score]);
  return (
    <View style={{ gap: 6 }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: color.track, overflow: 'hidden' }}>
        <Animated.View style={[{ height: 6, borderRadius: 3 }, bar]} />
      </View>
      <T style={{ fontSize: 13, color: color.inkSecondary }}>{['Too short', 'Weak', 'Fair', 'Strong', 'Very strong'][score]}</T>
    </View>
  );
}

export function Password() {
  const set = useApp((s) => s.set);
  const withFace = useApp((s) => s.withFace);
  const showToast = useApp((s) => s.showToast);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const score = strength(next);
  const mismatch = again.length > 0 && again !== next;
  const ok = current.length >= 4 && score >= 3 && again === next;
  return (
    <Page title="Password" lead="Use a long passphrase you don’t use anywhere else. Four random words works well.">
      <Card>
        <Input label="Current password" value={current} onChangeText={setCurrent} secureTextEntry />
        <Input label="New password" value={next} onChangeText={setNext} secureTextEntry />
        <Input label="Type it again" value={again} onChangeText={setAgain} secureTextEntry last />
      </Card>
      {next.length > 0 && (
        <Animated.View entering={FadeIn}>
          <StrengthBar score={score} />
        </Animated.View>
      )}
      {mismatch && <T style={{ fontSize: 13, color: color.danger }}>The passwords don’t match yet.</T>}
      <LinkText label="Fill an example" onPress={() => { setCurrent('Harm@ttan!2024'); setNext('Kente-Mango-River-42'); setAgain('Kente-Mango-River-42'); }} style={{ fontSize: 13, color: color.inkSecondary }} />
      <Spacer />
      <PrimaryButton
        label="Change password"
        disabled={!ok}
        onPress={() =>
          withFace('Change password', () => {
            set({ passwordChanged: 'Changed just now' });
            back();
            showToast('Password changed · other devices signed out');
          })
        }
      />
    </Page>
  );
}

// ─── Recovery email & phone ──────────────────────────────────────────────────

export function RecoveryContact() {
  const email = useApp((s) => s.recoveryEmail);
  const phone = useApp((s) => s.recoveryPhone);
  const set = useApp((s) => s.set);
  const withFace = useApp((s) => s.withFace);
  const showToast = useApp((s) => s.showToast);
  const [e, setE] = useState(email);
  const [p, setP] = useState(phone);
  const dirty = e !== email || p !== phone;
  return (
    <Page title="Recovery email & phone" lead="If you’re locked out, we send a code here. We also tell you here whenever these change.">
      <Card>
        <Input label="Recovery email" value={e} onChangeText={setE} keyboardType="email-address" autoCapitalize="none" />
        <Input label="Recovery phone" value={p} onChangeText={setP} keyboardType="phone-pad" last />
      </Card>
      <Note body="We’ll email your old address too, so nobody can change these without you knowing." />
      <Spacer />
      <PrimaryButton
        label="Save with Face ID"
        disabled={!dirty}
        onPress={() =>
          withFace('Change recovery details', () => {
            set((s) => ({ recoveryEmail: e, recoveryPhone: p, profile: { ...s.profile, email: e.includes('@') ? s.profile.email : s.profile.email } }));
            back();
            showToast('Recovery details updated · we emailed your old address');
          })
        }
      />
    </Page>
  );
}

// ─── Devices & sessions ──────────────────────────────────────────────────────

export function Devices() {
  const devices = useApp((s) => s.devices);
  return (
    <Page title="Trusted devices" lead="These can open Last Testament without a two-step code.">
      <Card>
        {devices.map((d, i) => (
          <Animated.View key={d.id} layout={smooth} exiting={undefined}>
            <Row last={i === devices.length - 1}>
              <RowText title={d.device} sub={`${d.where} · ${d.when}`} titleStyle={{ fontWeight: '500' }} />
              {d.current ? <T style={{ fontSize: 13, color: color.positive, fontWeight: '600' }}>This phone</T> : <LinkText label="Remove" danger onPress={() => removeDevice(d.id)} />}
            </Row>
          </Animated.View>
        ))}
      </Card>
    </Page>
  );
}

export function Sessions() {
  const sessions = useApp((s) => s.sessions);
  return (
    <Page title="Active sessions" lead="Everywhere you’re signed in right now.">
      <Card>
        {sessions.map((x, i) => (
          <Animated.View key={x.id} layout={smooth}>
            <Row last={i === sessions.length - 1} style={x.suspicious ? { backgroundColor: color.dangerBg } : undefined}>
              <RowText title={x.device} sub={`${x.where} · ${x.when}`} titleStyle={{ fontWeight: '500' }} subStyle={x.suspicious ? { color: color.danger } : undefined} />
              {x.current ? <T style={{ fontSize: 13, color: color.positive, fontWeight: '600' }}>Now</T> : <LinkText label="Sign out" danger={x.suspicious} onPress={() => endSession(x.id)} />}
            </Row>
          </Animated.View>
        ))}
      </Card>
      {sessions.length > 1 && <LinkText label="Sign out of all other sessions" onPress={signOutOthers} />}
    </Page>
  );
}

export function SignInActivity() {
  const items = [
    ['iPad · Lagos, Nigeria', 'Today 14:02 · new device', true],
    ['iPhone 16 · Croydon', 'Today 08:15 · Face ID', false],
    ['MacBook Air · Croydon', 'Yesterday 21:40 · password + code', false],
    ['iPhone 16 · Accra, Ghana', '29 Aug · Face ID · while travelling', false],
    ['Failed attempt · unknown device', '12 Aug · wrong password, blocked', true],
  ] as const;
  return (
    <Page title="Sign-in activity" lead="The last 30 days.">
      <Card>
        {items.map(([t, s, warn], i) => (
          <Row key={i} last={i === items.length - 1}>
            <RowText title={t} sub={s} titleStyle={{ fontWeight: '500', color: warn ? color.danger : color.ink }} />
          </Row>
        ))}
      </Card>
      <LinkText label="Something looks wrong? Lock my account" danger onPress={askLock} />
    </Page>
  );
}

// ─── Pause account ───────────────────────────────────────────────────────────

const DURATIONS = ['17 October', '3 November', '1 January'];

export function PauseAccount() {
  const paused = useApp((s) => s.accountPausedUntil);
  const set = useApp((s) => s.set);
  const [until, setUntil] = useState(DURATIONS[0]);
  return (
    <Page title="Pause account" lead="For a long trip, a hospital stay or any time you want everything to stand still. Nothing is deleted.">
      {paused ? (
        <>
          <Note tone="warning" title={`Paused until ${paused}`} body="Check-ins are off and no release can start." />
          <PrimaryButton label="Resume now" onPress={() => { set({ accountPausedUntil: null }); useApp.getState().showToast('Account resumed'); }} />
        </>
      ) : (
        <>
          <SectionLabel>Pause until</SectionLabel>
          <Card>
            {DURATIONS.map((d, i) => (
              <Choice key={d} radio on={until === d} title={d} sub={i === 0 ? '2 weeks' : i === 1 ? 'About a month' : 'Until the new year'} onPress={() => setUntil(d)} last={i === DURATIONS.length - 1} />
            ))}
          </Card>
          <Note body="Your trusted people aren’t told. If something happens while you’re paused, a release can still be requested — but it won’t start until you resume or the pause ends." />
          <Spacer />
          <PrimaryButton label={`Pause until ${until}`} onPress={() => askPauseAccount(until)} />
        </>
      )}
    </Page>
  );
}
