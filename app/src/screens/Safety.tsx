import React from 'react';
import { Image, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { imOkay, pauseCheckins, resumeCheckins, setCheckinDays } from '../actions';
import { Avatar, Card, Choice, GlassPill, Group, LinkText, NavBar, Note, Page, Row, Screen, SectionLabel, Segmented, Serif, Spacer, T, Tap, TextButton } from '../components/ui';
import { SCEN } from '../data';
import { back, go, openPerson, tab } from '../nav';
import { scenarioFor, useActiveRecords, usePeople } from '../records';
import { useApp } from '../store';
import { color } from '../theme';

const mark = require('../../assets/brand/mark.png');
const COND_BY_SCEN = ['unr', 'inc', 'pass'] as const;

// ─── Release plan — "If this happens, these people receive these things." ────

export function ReleasePlan() {
  const scen = useApp((s) => s.scen);
  const set = useApp((s) => s.set);
  const days = useApp((s) => s.checkinDays);
  const records = useActiveRecords();
  const people = usePeople();
  const sc = SCEN[scen];
  const plan = scenarioFor(records, people, COND_BY_SCEN[scen]);
  return (
    <Screen bottom={6}>
      <NavBar onBack={back} title="Release plan" />
      <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22, textAlign: 'center' }}>If this happens, these people receive these things.</T>
      <Segmented options={['Unreachable', 'Incapacitated', 'After passing']} value={scen} onChange={(i) => set({ scen: i })} />
      <Animated.View key={scen} entering={FadeInDown.duration(300).withInitialValues({ transform: [{ translateY: 6 }] })}>
        <View style={{ gap: 6 }}>
          <Serif accessibilityRole="header" style={{ fontSize: 30, lineHeight: 33 }}>{sc.title}</Serif>
          <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>{sc.desc}</T>
        </View>
        <View style={{ gap: 8, marginTop: 18 }}>
          <SectionLabel>How this is confirmed</SectionLabel>
          <Card style={{ paddingVertical: 16, paddingHorizontal: 18, gap: 12 }}>
            <StepLine n={1} text={sc.s1} />
            <StepLine n={2} text={sc.s2} />
            <StepLine n={3} text={sc.s3} />
            <StepLine n={4} text="Release to each person below" final />
          </Card>
        </View>
        <View style={{ gap: 8, marginTop: 18 }}>
          <SectionLabel>Who receives what</SectionLabel>
          <Card>
            {plan.perPerson.map(({ person: p, count }, i) => (
              <Row key={p.id} onPress={() => openPerson(p.id)} last={i === plan.perPerson.length - 1} style={{ paddingVertical: 12, justifyContent: 'flex-start' }}>
                <Avatar initial={p.initial} dark={p.dark} size={32} fontSize={13} />
                <T style={{ flex: 1, fontSize: 17, fontWeight: '600' }}>{p.name}</T>
                <T style={{ fontSize: 15, color: color.inkSecondary }}>{count ? `${count} record${count > 1 ? 's' : ''}` : 'Nothing'} ›</T>
              </Row>
            ))}
          </Card>
          <T style={{ fontSize: 13, color: color.inkMuted, paddingVertical: 4, paddingHorizontal: 2, lineHeight: 19.5 }}>
            {plan.sealed} records stay sealed{plan.unassigned ? `, ${plan.unassigned} are assigned to no one and stay private` : ''}. Missed check-ins alone never release anything.
          </T>
        </View>
      </Animated.View>
      <Group
        label="Before any release"
        items={[
          { title: 'Check-in schedule', sub: `Every ${days} days · app, email and text`, onPress: () => go('/checkin-settings') },
          { title: 'Release history', sub: 'No releases have ever started', onPress: () => go('/release-history') },
        ]}
      />
    </Screen>
  );
}

function StepLine({ n, text, final }: { n: number; text: string; final?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: final ? color.brand : color.stone, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ fontSize: 12, fontWeight: '700', color: final ? '#fff' : color.ink }}>{n}</T>
      </View>
      <T style={{ fontSize: 15, lineHeight: 21, flex: 1 }}>{text}</T>
    </View>
  );
}

export function ReleaseHistory() {
  return (
    <Page title="Release history" lead="Every time a release is started, paused or cancelled — and by whom — appears here.">
      <Card style={{ padding: 18, gap: 14 }}>
        {[
          ['Check-in confirmed', '9 Sep 2026 · you, Face ID'],
          ['Check-in confirmed', '10 Aug 2026 · you, Face ID'],
          ['Missed check-in · reminder sent', '9 Jul 2026 · confirmed next day'],
          ['Release plan created', '14 Mar 2026'],
        ].map(([t, w], i) => (
          <View key={i} style={{ gap: 2 }}>
            <T style={{ fontSize: 15, fontWeight: '600' }}>{t}</T>
            <T style={{ fontSize: 13, color: color.inkMuted }}>{w}</T>
          </View>
        ))}
      </Card>
      <Note tone="positive" body="No release has ever started for your Testament." />
    </Page>
  );
}

// ─── Check-in (push / email / SMS destination) ───────────────────────────────

export function Checkin() {
  return (
    <Screen gap={0} horizontal={24} bottom={14} cascade={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <GlassPill label="Later" onPress={back} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Image source={mark} style={{ height: 48, width: 48 * (280 / 255), marginBottom: 12 }} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(500).delay(120)}>
          <Serif accessibilityRole="header" style={{ fontSize: 40, lineHeight: 42, textAlign: 'center' }}>Nana, are you okay?</Serif>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(500).delay(220)}>
          <T style={{ fontSize: 17, color: color.inkSecondary, lineHeight: 24.5, maxWidth: 300, textAlign: 'center' }}>
            It’s been 30 days. A quick confirmation keeps your Testament waiting, exactly as it is.
          </T>
        </Animated.View>
      </View>
      <Animated.View entering={FadeInDown.duration(500).delay(320)} style={{ gap: 12 }}>
        <Tap onPress={imOkay} scale haptic style={{ height: 56, borderRadius: 14, backgroundColor: color.bronze, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <View style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: color.ink, opacity: 0.7 }} />
          <T style={{ fontSize: 17, fontWeight: '600' }}>I’m okay</T>
        </Tap>
        <TextButton label="I need to pause check-ins" onPress={pauseCheckins} />
        <T style={{ fontSize: 13, color: color.inkMuted, textAlign: 'center', lineHeight: 19.5 }}>Confirmed with Face ID · Next check-in 2 November</T>
      </Animated.View>
    </Screen>
  );
}

// ─── Check-in settings ───────────────────────────────────────────────────────

const FREQS = [7, 14, 30, 60];

export function CheckinSettings() {
  const days = useApp((s) => s.checkinDays);
  const channels = useApp((s) => s.channels);
  const grace = useApp((s) => s.graceDays);
  const paused = useApp((s) => s.pausedUntil);
  const set = useApp((s) => s.set);
  return (
    <Page title="Check-ins" heading="How often we check in" lead="A gentle “Are you okay?” on a schedule you choose. Changing it needs Face ID.">
      {paused && (
        <Animated.View entering={FadeIn}>
          <Note tone="warning" title={`Paused until ${paused}`} body="No check-ins are sent and nothing can be released while paused." />
          <LinkText label="Resume check-ins now" onPress={resumeCheckins} style={{ marginTop: 10 }} />
        </Animated.View>
      )}
      <Card>
        {FREQS.map((d, i) => (
          <Choice key={d} radio on={days === d} title={`Every ${d} days`} sub={d === 30 ? 'Recommended' : d === 7 ? 'If you travel often or live alone' : undefined} onPress={() => d !== days && setCheckinDays(d)} last={i === FREQS.length - 1} />
        ))}
      </Card>
      <Group
        label="Where we ask"
        items={[
          { title: 'In the app', sub: 'A notification that opens “Are you okay?”', toggle: { on: channels.app, onChange: (on) => set({ channels: { ...channels, app: on } }) } },
          { title: 'Email', sub: 'nana@example.com', toggle: { on: channels.email, onChange: (on) => set({ channels: { ...channels, email: on } }) } },
          { title: 'Text message', sub: '+44 •••• 318', toggle: { on: channels.sms, onChange: (on) => set({ channels: { ...channels, sms: on } }) } },
        ]}
        footer={!channels.app && !channels.email && !channels.sms ? 'Choose at least one — otherwise we can’t reach you.' : undefined}
      />
      <Group
        label="If you don’t answer"
        items={[
          { title: 'Reminders for', value: `${grace} days`, onPress: () => set({ graceDays: grace === 14 ? 21 : grace === 21 ? 7 : 14 }) },
          { title: 'Then we ask', value: 'Ama, then Kofi', onPress: () => tab('people') },
          { title: 'Try a check-in now', onPress: () => go('/checkin'), strong: true },
        ]}
        footer="Missed check-ins alone never release anything. A trusted person must confirm, and you can stop a release at any point."
      />
      {!paused && <LinkText label="Pause check-ins for 2 weeks" onPress={pauseCheckins} />}
      <Spacer />
    </Page>
  );
}
