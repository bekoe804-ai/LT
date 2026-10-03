import React from 'react';
import { Animated, View } from 'react-native';
import { askRemoveAma, previewAma, resendEfua, soon } from '../actions';
import { fadeUp, useEntrance, easeOutCss } from '../anim';
import { Avatar, Badge, Card, Chevron, GlassPill, NavBar, PlusButton, Row, Screen, SectionLabel, Serif, T, Tap, ring } from '../components/ui';
import { SCEN } from '../data';
import { useApp } from '../store';
import { color } from '../theme';

// ─── People (tab) ─────────────────────────────────────────────────────────────

function PersonCard({ initial, dark, name, role, receives, right, onPress }: { initial: string; dark?: boolean; name: string; role: string; receives: string; right: React.ReactNode; onPress?: () => void }) {
  const body = (
    <>
      <Avatar initial={initial} dark={dark} size={44} fontSize={17} />
      <View style={{ gap: 3, flex: 1 }}>
        <T style={{ fontSize: 17, fontWeight: '600' }}>{name}</T>
        <T style={sub}>{role}</T>
        <T style={sub}>{receives}</T>
      </View>
      {right}
    </>
  );
  const st = { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', gap: 14, alignItems: 'center', boxShadow: ring } as const;
  return onPress ? <Tap onPress={onPress} style={st}>{body}</Tap> : <View style={st}>{body}</View>;
}
const sub = { fontSize: 13, color: color.inkSecondary } as const;

export function People() {
  const efuaStatus = useApp((s) => s.efuaStatus);
  const push = useApp((s) => s.push);
  const accepted = <Badge label="Accepted" bg={color.positiveBg} fg={color.positive} style={{ alignSelf: 'center' }} />;
  return (
    <Screen kind="tab">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <T accessibilityRole="header" style={{ fontSize: 32, fontWeight: '700', letterSpacing: -0.32 }}>People</T>
        <PlusButton onPress={soon} label="Add a trusted person" />
      </View>
      <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>
        Each person receives only what you assign to them, only when the condition you set is met.
      </T>
      <View style={{ gap: 10 }}>
        <PersonCard initial="A" dark name="Ama Mensah" role="Daughter · Primary contact" receives="Receives 14 records" right={accepted} onPress={() => push('ama')} />
        <PersonCard initial="K" name="Kofi Mensah" role="Son · Backup contact" receives="Receives 6 records" right={accepted} onPress={() => push('ama')} />
        <PersonCard
          initial="E"
          name="Efua Boateng"
          role="Solicitor · Recipient only"
          receives="Receives 3 records · 1 sealed"
          right={
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Badge label={efuaStatus} bg={color.infoBg} fg={color.info} />
              <Tap onPress={resendEfua} hitSlop={8}>
                <T style={{ fontSize: 13, fontWeight: '600', color: color.brand }}>Resend</T>
              </Tap>
            </View>
          }
        />
      </View>
      <View style={{ gap: 8 }}>
        <SectionLabel>Roles</SectionLabel>
        <Card>
          <Role title="Primary contact" body="First person we ask to confirm if we can’t reach you." />
          <Role title="Backup contact" body="Steps in if the primary contact is unavailable." />
          <Role title="Recipient only" body="Receives assigned records but plays no part in confirmation." last />
        </Card>
      </View>
      <Tap onPress={() => push('releasePlan')} style={{ padding: 8 }}>
        <T style={{ fontSize: 15, fontWeight: '600', color: color.brand, textAlign: 'center' }}>See the full release plan</T>
      </Tap>
    </Screen>
  );
}

function Role({ title, body, last }: { title: string; body: string; last?: boolean }) {
  return (
    <Row last={last} style={{ paddingVertical: 12, flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
      <T style={{ fontSize: 15, fontWeight: '600' }}>{title}</T>
      <T style={{ fontSize: 13, color: color.inkSecondary, lineHeight: 18 }}>{body}</T>
    </Row>
  );
}

// ─── Ama — what one person receives, by circumstance ─────────────────────────

function Group({ label, count, items }: { label: string; count: string; items: { title: string; onPress: () => void; right?: string; muted?: boolean }[] }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
        <SectionLabel style={{ paddingHorizontal: 0 }}>{label}</SectionLabel>
        <T style={{ fontSize: 12, color: color.inkMuted }}>{count}</T>
      </View>
      <Card>
        {items.map((it, i) => (
          <Row key={it.title} onPress={it.onPress} last={i === items.length - 1} style={{ paddingVertical: 12 }}>
            <T style={{ fontSize: 15, color: it.muted ? color.inkSecondary : color.ink }}>{it.title}</T>
            {it.right ? <T style={{ fontSize: 12, fontWeight: '600', color: color.bronzeInk }}>{it.right}</T> : <Chevron />}
          </Row>
        ))}
      </Card>
    </View>
  );
}

export function Ama() {
  const { back, openRec, openCat } = useApp.getState();
  const more = () => openCat('wish');
  return (
    <Screen bottom={40 - 34}>
      <NavBar onBack={back} right={<GlassPill label="Edit" onPress={soon} />} />
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <Avatar initial="A" dark size={56} fontSize={22} />
        <View style={{ gap: 3, flex: 1 }}>
          <T accessibilityRole="header" style={{ fontSize: 24, fontWeight: '700' }}>Ama Mensah</T>
          <T style={{ fontSize: 15, color: color.inkSecondary }}>Daughter · Primary contact · Accepted 2 Sep</T>
        </View>
      </View>
      <View style={{ backgroundColor: color.stone, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18 }}>
        <T style={{ fontSize: 15, lineHeight: 22.5 }}>
          Ama will receive <T style={{ fontSize: 15, fontWeight: '700' }}>14 records</T> under three different circumstances. Nothing is visible to her before then.
        </T>
      </View>
      <Group
        label="If I’m unreachable"
        count="2 records"
        items={[
          { title: 'Emergency information', onPress: () => openRec('emergency') },
          { title: 'Travel itinerary & insurance', onPress: () => openRec('travel') },
        ]}
      />
      <Group
        label="If I’m incapacitated"
        count="4 records"
        items={[
          { title: 'Medical wishes', onPress: () => openRec('medical') },
          { title: 'Household bills & direct debits', onPress: () => openRec('bills') },
          { title: '2 more', onPress: more, muted: true },
        ]}
      />
      <Group
        label="After my passing"
        count="8 records"
        items={[
          { title: 'Barclays current account', onPress: () => openRec('barclays') },
          { title: 'Letter to Ama', onPress: () => openRec('letter'), right: 'Private message' },
          { title: '6 more', onPress: more, muted: true },
        ]}
      />
      <Tap onPress={previewAma} style={{ height: 50, borderRadius: 12, borderWidth: 1, borderColor: color.bronze, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ fontSize: 17, fontWeight: '600' }}>Preview as Ama</T>
      </Tap>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
        <Tap onPress={soon}><T style={link}>Change role</T></Tap>
        <Tap onPress={soon}><T style={link}>Replace</T></Tap>
        <Tap onPress={askRemoveAma}><T style={[link, { color: color.danger }]}>Remove</T></Tap>
      </View>
    </Screen>
  );
}
const link = { fontSize: 15, fontWeight: '600', color: color.brand } as const;

// ─── Release plan — "If this happens, these people receive these things." ────

const SEGMENTS = ['Unreachable', 'Incapacitated', 'After passing'];

export function ReleasePlan() {
  const scen = useApp((s) => s.scen);
  const scenN = useApp((s) => s.scenN);
  const { back, push, set } = useApp.getState();
  const sc = SCEN[scen];
  const enter = useEntrance(scenN, 300, easeOutCss);
  return (
    <Screen bottom={40 - 34}>
      <NavBar onBack={back} title="Release plan" />
      <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22, textAlign: 'center' }}>If this happens, these people receive these things.</T>
      <View style={{ flexDirection: 'row', gap: 4, backgroundColor: color.search, borderRadius: 12, padding: 4 }} accessibilityRole="tablist">
        {SEGMENTS.map((label, i) => {
          const on = scen === i;
          return (
            <Tap
              key={label}
              onPress={() => set({ scen: i, scenN: scenN + 1 })}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[{ flex: 1, height: 40, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, on && { backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }]}
            >
              <T style={{ fontSize: 13, fontWeight: '600', color: on ? color.ink : color.inkSecondary }}>{label}</T>
            </Tap>
          );
        })}
      </View>
      <Animated.View style={fadeUp(enter)}>
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
            <Receiver initial="A" dark name="Ama" what={sc.ama} onPress={() => push('ama')} />
            <Receiver initial="K" name="Kofi" what={sc.kofi} onPress={() => push('ama')} />
            <Receiver initial="E" name="Efua" what={sc.efua} last />
          </Card>
          <T style={{ fontSize: 13, color: color.inkMuted, paddingVertical: 4, paddingHorizontal: 2, lineHeight: 19.5 }}>
            {sc.note} Missed check-ins alone never release anything.
          </T>
        </View>
      </Animated.View>
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

function Receiver({ initial, dark, name, what, onPress, last }: { initial: string; dark?: boolean; name: string; what: string; onPress?: () => void; last?: boolean }) {
  return (
    <Row onPress={onPress} last={last} style={{ paddingVertical: 12, justifyContent: 'flex-start' }}>
      <Avatar initial={initial} dark={dark} size={32} fontSize={13} />
      <T style={{ flex: 1, fontSize: 17, fontWeight: '600' }}>{name}</T>
      <T style={{ fontSize: 15, color: color.inkSecondary }}>{what} ›</T>
    </Row>
  );
}
