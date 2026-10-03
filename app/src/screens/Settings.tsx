import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { askSignOut, requestExport, setBlockScreenshots } from '../actions';
import { Avatar, Badge, Card, Chevron, Dot, Field as Input, Group, LinkText, Note, Page, PrimaryButton, Row, RowText, Screen, SectionLabel, Serif, Spacer, T, Tap, ring } from '../components/ui';
import { back, go } from '../nav';
import { useApp } from '../store';
import { smooth } from '../layout';
import { color } from '../theme';

// ─── Settings (tab) ───────────────────────────────────────────────────────────

export function Settings() {
  const secAlert = useApp((s) => s.secAlert);
  const locked = useApp((s) => s.locked);
  const profile = useApp((s) => s.profile);
  const days = useApp((s) => s.checkinDays);
  const secSub = locked ? 'Account locked' : secAlert ? '1 new sign-in to review' : 'Everything looks good';
  return (
    <Screen kind="tab">
      <T accessibilityRole="header" style={{ fontSize: 32, fontWeight: '700', letterSpacing: -0.32 }}>Settings</T>
      <Card>
        <Row last onPress={() => go('/settings/profile')} style={{ justifyContent: 'flex-start', gap: 14 }}>
          <Avatar initial={profile.name.charAt(0)} size={48} fontSize={18} />
          <RowText title={profile.name} sub={`${profile.email} · +44 •••• ${profile.phone.slice(-3)}`} />
          <Chevron />
        </Row>
      </Card>
      <Card>
        <Row onPress={() => go('/release-plan')}>
          <RowText title="Check-ins & release plan" sub={`Every ${days} days · 3 scenarios set`} titleStyle={{ fontWeight: '400' }} />
          <Chevron />
        </Row>
        <Row last onPress={() => go('/security')}>
          <RowText title="Security Centre" sub={secSub} titleStyle={{ fontWeight: '400' }} subStyle={{ color: secAlert || locked ? color.danger : color.positive }} />
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            {secAlert && <Dot c={color.danger} />}
            <Chevron />
          </View>
        </Row>
      </Card>
      <Group
        items={[
          { title: 'Notifications', onPress: () => go('/settings/notifications') },
          { title: 'Privacy & data', onPress: () => go('/settings/privacy') },
          { title: 'Accessibility & time zone', onPress: () => go('/settings/accessibility') },
        ]}
      />
      <Group
        items={[
          { title: 'Help & support', onPress: () => go('/settings/help') },
          { title: 'Terms, privacy & legal', onPress: () => go('/settings/legal') },
        ]}
      />
      <Tap onPress={askSignOut} scale style={{ backgroundColor: '#fff', borderRadius: 12, boxShadow: ring, paddingVertical: 14, paddingHorizontal: 18 }}>
        <T style={{ fontSize: 17, color: color.brand, textAlign: 'center', fontWeight: '600' }}>Sign out</T>
      </Tap>
    </Screen>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function Profile() {
  const profile = useApp((s) => s.profile);
  const set = useApp((s) => s.set);
  const showToast = useApp((s) => s.showToast);
  const [p, setP] = useState(profile);
  const dirty = JSON.stringify(p) !== JSON.stringify(profile);
  const save = () => {
    set({ profile: p });
    showToast('Profile saved');
    back();
  };
  return (
    <Page title="Profile" right={<LinkText label="Save" onPress={save} style={!dirty ? { color: color.inkMuted } : undefined} />}>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <Avatar initial={p.name.charAt(0) || 'N'} size={84} fontSize={32} />
        <LinkText label="Add a photo" onPress={() => showToast('A photo is optional — it only appears on this device')} style={{ fontSize: 13 }} />
      </View>
      <Card>
        <Input label="Full name" value={p.name} onChangeText={(v) => setP({ ...p, name: v })} />
        <Input label="Date of birth" value={p.born} onChangeText={(v) => setP({ ...p, born: v })} />
        <Input label="Home address" value={p.address} onChangeText={(v) => setP({ ...p, address: v })} last />
      </Card>
      <Group
        label="Contact details"
        items={[
          { title: 'Email', value: p.email, onPress: () => go('/security/recovery-contact') },
          { title: 'Mobile', value: p.phone, onPress: () => go('/security/recovery-contact') },
        ]}
        footer="Changing your email or phone is done in Security Centre and needs Face ID."
      />
      <Group label="Account" items={[{ title: 'Member since', value: 'March 2026' }, { title: 'Plan', value: 'Legacy · annual' }]} />
      <PrimaryButton label="Save" onPress={save} disabled={!dirty} />
    </Page>
  );
}

// ─── Notification preferences ────────────────────────────────────────────────

export function NotificationPrefs() {
  const prefs = useApp((s) => s.prefs);
  const set = useApp((s) => s.set);
  const t = (k: keyof typeof prefs) => ({ on: prefs[k], onChange: (on: boolean) => set({ prefs: { ...prefs, [k]: on } }) });
  return (
    <Page title="Notifications" lead="Check-in and security messages can’t be turned off — they’re how we keep your Testament safe.">
      <Group
        label="Always on"
        items={[
          { title: 'Check-ins', sub: 'Are you okay? reminders', right: <Badge label="Required" bg={color.stone} fg={color.bronzeInk} /> },
          { title: 'Security alerts', sub: 'New sign-ins, changes to recipients', right: <Badge label="Required" bg={color.stone} fg={color.bronzeInk} /> },
        ]}
      />
      <Group label="How" items={[{ title: 'Push notifications', toggle: t('push') }, { title: 'Email', toggle: t('email') }, { title: 'Text message', toggle: t('sms') }]} />
      <Group
        label="About"
        items={[
          { title: 'Records to review', sub: 'When something hasn’t been confirmed in a year', toggle: t('reviews') },
          { title: 'Your trusted people', sub: 'Invitations accepted, declined or expired', toggle: t('people') },
          { title: 'Product news', sub: 'A few times a year', toggle: t('news') },
        ]}
      />
      <LinkText label="See your notifications" onPress={() => go('/notifications')} />
    </Page>
  );
}

// ─── Privacy & data ───────────────────────────────────────────────────────────

export function Privacy() {
  const privacy = useApp((s) => s.privacy);
  const exportRequested = useApp((s) => s.exportRequested);
  const set = useApp((s) => s.set);
  return (
    <Page title="Privacy & data" lead="Your Testament is end-to-end encrypted. Our staff can’t read your records.">
      <Group
        label="On this phone"
        items={[
          { title: 'Block screenshots', sub: 'In records and documents', toggle: { on: privacy.blockScreenshots, onChange: setBlockScreenshots } },
          { title: 'Hide in app switcher', sub: 'Blurs the app when you switch away', toggle: { on: privacy.hideInSwitcher, onChange: (on) => set({ privacy: { ...privacy, hideInSwitcher: on } }) } },
        ]}
      />
      <Group label="Sharing" items={[{ title: 'Anonymous usage data', sub: 'Never includes anything you’ve preserved', toggle: { on: privacy.analytics, onChange: (on) => set({ privacy: { ...privacy, analytics: on } }) } }]} />
      <Group
        label="Your data"
        items={[
          { title: exportRequested ? 'Export requested' : 'Export everything', sub: exportRequested ? 'We’ll email an encrypted file within 24 hours' : 'An encrypted copy of all records and documents', onPress: exportRequested ? undefined : requestExport },
          { title: 'Delete account', sub: 'In Security Centre', onPress: () => go('/security'), danger: true },
        ]}
      />
    </Page>
  );
}

// ─── Accessibility & time zone ───────────────────────────────────────────────

const ZONES = ['London (GMT+1)', 'Accra (GMT)', 'Dubai (GMT+4)', 'New York (GMT−4)'];

export function Accessibility() {
  const a11y = useApp((s) => s.a11y);
  const tz = useApp((s) => s.timezone);
  const set = useApp((s) => s.set);
  return (
    <Page title="Accessibility & time zone">
      <Group
        label="Reading"
        items={[
          { title: 'Larger text', sub: 'Makes text across the app 15% bigger', toggle: { on: a11y.largerText, onChange: (on) => set({ a11y: { ...a11y, largerText: on } }) } },
          { title: 'Reduce motion', sub: 'Fades instead of slides and springs', toggle: { on: a11y.reduceMotion, onChange: (on) => set({ a11y: { ...a11y, reduceMotion: on } }) } },
        ]}
        footer="The app also follows your phone’s Text Size, Bold Text and VoiceOver settings."
      />
      <SectionLabel>Time zone</SectionLabel>
      <Card>
        {ZONES.map((z, i) => (
          <Row key={z} onPress={() => set({ timezone: z })} last={i === ZONES.length - 1}>
            <T style={{ fontSize: 17 }}>{z}</T>
            {tz === z && <Animated.View entering={FadeIn}><T style={{ color: color.brand, fontWeight: '700', fontSize: 17 }}>✓</T></Animated.View>}
          </Row>
        ))}
      </Card>
      <T style={{ fontSize: 13, color: color.inkMuted, lineHeight: 19 }}>Check-ins arrive at 10am in this time zone. When you travel, we’ll ask before changing it.</T>
    </Page>
  );
}

// ─── Help & support ───────────────────────────────────────────────────────────

const FAQ = [
  ['Is this a legal will?', 'No. Last Testament keeps information and wishes safe and delivers them to the right people. A will must be signed and witnessed under your local law — you can store a scan of it under Documents.'],
  ['What happens if I miss a check-in?', 'We remind you here, by email and by text. After your reminder period we ask your primary contact to check on you. Missed check-ins alone never release anything.'],
  ['Can Last Testament staff read my records?', 'No. Records are end-to-end encrypted. Staff can see that your account exists and the status of a release case — never the contents.'],
  ['Can I stop a release?', 'Yes, at any point before it completes. Open the app, confirm with Face ID, and the release is cancelled. Everyone involved is told it was stopped.'],
];

export function Help() {
  const [open, setOpen] = useState<number | null>(0);
  const tickets = useApp((s) => s.tickets);
  return (
    <Page title="Help & support">
      <SectionLabel>Common questions</SectionLabel>
      <Card>
        {FAQ.map(([q, a], i) => (
          <Animated.View key={q} layout={smooth}>
            <Row onPress={() => setOpen(open === i ? null : i)} last={i === FAQ.length - 1 && open !== i} style={{ alignItems: 'flex-start' }}>
              <T style={{ fontSize: 17, fontWeight: '600', flex: 1 }}>{q}</T>
              <T style={{ fontSize: 17, color: color.inkMuted, transform: [{ rotate: open === i ? '90deg' : '0deg' }] }}>›</T>
            </Row>
            {open === i && (
              <Animated.View entering={FadeInDown.duration(220)} style={[{ paddingHorizontal: 18, paddingBottom: 16 }, i < FAQ.length - 1 && { borderBottomWidth: 1, borderBottomColor: color.hairline }]}>
                <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>{a}</T>
              </Animated.View>
            )}
          </Animated.View>
        ))}
      </Card>
      {tickets.length > 0 && (
        <Group label="Your requests" items={tickets.map((t) => ({ key: t.id, title: t.subject, sub: `${t.status} · ${t.created}`, onPress: () => go(`/settings/ticket?id=${t.id}`) }))} />
      )}
      <Group
        label="Still need help?"
        items={[
          { title: 'Message support', sub: 'We reply within a day, by email', onPress: () => go('/settings/support') },
          { title: 'Call us', sub: '0800 048 7712 · weekdays 9–5', onPress: () => useApp.getState().showToast('Calling is available on your phone') },
        ]}
      />
    </Page>
  );
}

const TOPICS = ['Check-ins', 'Trusted people', 'A record', 'Security', 'Something else'];

export function Support() {
  const set = useApp((s) => s.set);
  const showToast = useApp((s) => s.showToast);
  const [topic, setTopic] = useState('Check-ins');
  const [body, setBody] = useState('');
  const send = () => {
    const id = 'T-' + (4810 + useApp.getState().tickets.length);
    set((s) => ({ tickets: [{ id, subject: topic, body, status: 'Open', created: 'Today' }, ...s.tickets] }));
    back();
    setTimeout(() => go(`/settings/ticket?id=${id}`), 60);
    showToast('Sent · we’ll reply by email within a day');
  };
  return (
    <Page title="Message support" lead="Don’t include passwords or account numbers. We will never ask for them.">
      <SectionLabel>About</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {TOPICS.map((t) => (
          <Tap key={t} onPress={() => setTopic(t)} scale haptic style={{ paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999, backgroundColor: topic === t ? color.brand : '#fff', boxShadow: topic === t ? undefined : ring }}>
            <T style={{ fontSize: 15, fontWeight: '600', color: topic === t ? '#fff' : color.ink }}>{t}</T>
          </Tap>
        ))}
      </View>
      <Card>
        <Input label="How can we help?" value={body} onChangeText={setBody} multiline placeholder="Tell us what happened…" last />
      </Card>
      <Spacer />
      <PrimaryButton label="Send" onPress={send} disabled={body.trim().length < 5} />
    </Page>
  );
}

export function Ticket({ id }: { id: string }) {
  const t = useApp((s) => s.tickets.find((x) => x.id === id));
  if (!t) return <Page title="Request"><Note body="This request couldn’t be found." /></Page>;
  return (
    <Page title={t.id} heading={t.subject} lead={`${t.status} · opened ${t.created}`}>
      <Card style={{ padding: 18, gap: 6 }}>
        <T style={{ fontSize: 13, color: color.inkMuted }}>You · just now</T>
        <T style={{ fontSize: 15, lineHeight: 22 }}>{t.body}</T>
      </Card>
      <Animated.View entering={FadeInDown.delay(400)}>
        <Card style={{ padding: 18, gap: 6, backgroundColor: color.stone, boxShadow: undefined }}>
          <T style={{ fontSize: 13, color: color.inkMuted }}>Last Testament support · automatic</T>
          <T style={{ fontSize: 15, lineHeight: 22 }}>Thanks, Nana. A member of our team will reply by email within one working day. We can see your request, but never your records.</T>
        </Card>
      </Animated.View>
    </Page>
  );
}

// ─── Terms, privacy & legal ──────────────────────────────────────────────────

export function Legal() {
  const show = (t: string) => useApp.getState().showToast(`${t} · opens in your browser`);
  return (
    <Page title="Terms, privacy & legal">
      <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 10, boxShadow: ring }}>
        <Serif style={{ fontSize: 26, lineHeight: 30 }}>Preserving isn’t the same as a will</Serif>
        <T style={{ fontSize: 15, lineHeight: 22, color: color.inkSecondary }}>
          What you write in Last Testament is kept as information and wishes. A legally valid will must be signed and witnessed under the law where you live. If you have one, store a scan under Documents and tell us where the original is.
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {['Personal record', 'Private message', 'Financial record', 'Asset record', 'Legal document', 'Wishes · not a will'].map((l) => (
            <Badge key={l} label={l} bg={color.stone} fg={color.bronzeInk} />
          ))}
        </View>
      </View>
      <Group items={[{ title: 'Terms of service', onPress: () => show('Terms of service') }, { title: 'Privacy policy', onPress: () => show('Privacy policy') }, { title: 'How releases are verified', onPress: () => go('/release-plan') }, { title: 'Open-source licences', onPress: () => show('Licences') }]} />
      <T style={{ fontSize: 13, color: color.inkMuted, textAlign: 'center' }}>Last Testament 1.0 (prototype)</T>
    </Page>
  );
}
