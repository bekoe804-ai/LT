import React from 'react';
import { Image, Platform, View } from 'react-native';
import { imOkay, pauseCheckins } from '../actions';
import { Avatar, Card, Chevron, Dot, PrimaryButton, Row, RowText, Screen, SecondaryButton, Section, Serif, T, Tap } from '../components/ui';
import { REC } from '../data';
import { reviewList, useApp } from '../store';
import { color } from '../theme';

const mark = require('../../assets/brand/mark.png');

/** Mark + avatar. Long-press the mark on device to open the demo-state menu. */
function HomeHeader() {
  const push = useApp((s) => s.push);
  const set = useApp((s) => s.set);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Tap
        onLongPress={() => set({ demoMenu: true })}
        delayLongPress={500}
        accessibilityLabel="Last Testament"
        accessibilityHint={Platform.OS === 'web' ? undefined : 'Long-press for demo states'}
      >
        <Image source={mark} style={{ height: 26, width: 26 * (280 / 255) }} />
      </Tap>
      <Tap onPress={() => push('settings')} accessibilityLabel="Settings">
        <Avatar initial="N" size={36} fontSize={14} />
      </Tap>
    </View>
  );
}

function Greeting({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8, marginTop: 8 }}>
      <Serif accessibilityRole="header" style={{ fontSize: 34, lineHeight: 37 }}>{title}</Serif>
      {children}
    </View>
  );
}

const lead = { fontSize: 17, color: color.inkSecondary, lineHeight: 24 } as const;

export function HomeOk() {
  const confirmed = useApp((s) => s.confirmed);
  const { tabTo, push, openRec, openCat, openReview } = useApp.getState();
  const review = reviewList(confirmed);
  return (
    <Screen kind="tab" gap={22}>
      <HomeHeader />
      <Greeting title="Good evening, Nana.">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Dot c={color.positive} />
          <T style={{ fontSize: 17, color: color.inkSecondary }}>Your Testament is protected.</T>
        </View>
      </Greeting>

      <Card style={{ padding: 18, flexDirection: 'row', gap: 8 }}>
        <Stat value="12 Sep" label="Last reviewed" />
        <Stat value={String(Object.keys(REC).length)} label="Records" onPress={() => tabTo('testament')} />
        <Stat value="3" label="Trusted people" onPress={() => tabTo('people')} />
      </Card>

      <Card style={{ paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <Tap onPress={() => push('checkin')} style={{ flex: 1, gap: 2 }}>
          <T style={{ fontSize: 17, fontWeight: '600' }}>Next check-in</T>
          <T style={{ fontSize: 13, color: color.inkSecondary }}>Thursday 9 October · in 6 days</T>
        </Tap>
        <Tap onPress={imOkay} style={{ height: 40, paddingHorizontal: 16, borderRadius: 10, backgroundColor: color.stone, justifyContent: 'center' }}>
          <T style={{ color: color.brand, fontSize: 15, fontWeight: '600' }}>I’m okay</T>
        </Tap>
      </Card>

      <Section label="Continue">
        <Card>
          <Row onPress={() => openRec('letter')}>
            <RowText title="Letter to Ama" sub="Draft · private message" />
            <Chevron />
          </Row>
          {review.length > 0 && (
            <Row onPress={openReview}>
              <RowText title={`${review.length} records to review`} sub="Added over a year ago — still correct?" subStyle={{ color: color.warning }} />
              <Chevron />
            </Row>
          )}
          <Row last onPress={() => openCat('ins')}>
            <RowText title="Add car insurance" sub="Suggested · 2 policies recorded, car not yet" />
            <Chevron />
          </Row>
        </Card>
      </Section>

      <Section label="Recently">
        <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22.5, paddingHorizontal: 2 }}>
          Kofi accepted your invitation · Yesterday{'\n'}You updated Aviva life insurance · 12 Sep{'\n'}Voice note for Kofi saved · 3 Sep
        </T>
      </Section>
    </Screen>
  );
}

function Stat({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  const body = (
    <>
      <T style={{ fontSize: 20, fontWeight: '700' }}>{value}</T>
      <T style={{ fontSize: 12, color: color.inkSecondary }}>{label}</T>
    </>
  );
  return onPress ? (
    <Tap onPress={onPress} style={{ flex: 1, gap: 2 }} accessibilityLabel={`${value} ${label}`}>
      {body}
    </Tap>
  ) : (
    <View style={{ flex: 1, gap: 2 }}>{body}</View>
  );
}

function Step({ title, sub, last, children }: { title: string; sub?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ alignItems: 'center' }}>
        {children}
        {!last && <View style={{ width: 2, flex: 1, backgroundColor: color.track }} />}
      </View>
      <View style={{ paddingBottom: last ? 0 : 16, gap: 2, flex: 1 }}>
        <T style={{ fontSize: 15, fontWeight: '600', color: sub === undefined ? color.ink : color.inkSecondary }}>{title}</T>
        {sub !== undefined && <T style={{ fontSize: 13, color: color.inkMuted }}>{sub}</T>}
      </View>
    </View>
  );
}

const hollowNode = { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: color.border, marginTop: 4 } as const;

export function HomeMissed() {
  const push = useApp((s) => s.push);
  return (
    <Screen kind="tab" gap={22}>
      <HomeHeader />
      <Greeting title="Nana, are you okay?">
        <T style={lead}>We haven’t heard from you since Monday 29 September. A quick confirmation keeps everything as it is.</T>
      </Greeting>
      <PrimaryButton
        onPress={imOkay}
        style={{ height: 56, borderRadius: 14, gap: 10 }}
        label={
          <>
            <View style={{ width: 18, height: 18, borderRadius: 5, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' }} />
            <T style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>I’m okay — confirm with Face ID</T>
          </>
        }
      />
      <Card style={{ padding: 18 }}>
        <T style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.96, textTransform: 'uppercase', color: color.inkTertiary, marginBottom: 14 }}>
          What happens if we don’t hear from you
        </T>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color.warning, marginTop: 4, boxShadow: `0 0 0 4px ${color.warningBg}` }} />
            <View style={{ width: 2, flex: 1, backgroundColor: color.track }} />
          </View>
          <View style={{ paddingBottom: 16, gap: 2, flex: 1 }}>
            <T style={{ fontSize: 15, fontWeight: '600' }}>Reminders · now</T>
            <T style={{ fontSize: 13, color: color.inkSecondary }}>Here, by email and by text</T>
          </View>
        </View>
        <Step title="We ask Ama to check on you" sub="8 October">
          <View style={hollowNode} />
        </Step>
        <Step title="Nothing is released without verification" sub="And a 7-day period you can stop at any time" last>
          <View style={hollowNode} />
        </Step>
      </Card>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SecondaryButton label="Pause for 2 weeks" onPress={pauseCheckins} style={{ flex: 1 }} />
        <SecondaryButton label="See release plan" onPress={() => push('releasePlan')} style={{ flex: 1 }} />
      </View>
      <T style={{ fontSize: 13, color: color.inkMuted, lineHeight: 19.5, textAlign: 'center' }}>Pausing or changing the schedule needs Face ID.</T>
    </Screen>
  );
}

function SetupStep({ n, done, current, title, sub, onPress, last }: { n: number; done?: boolean; current?: boolean; title: string; sub?: string; onPress?: () => void; last?: boolean }) {
  const node = done ? (
    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color.positive, alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</T>
    </View>
  ) : (
    <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: current ? color.brand : color.border, alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ fontSize: 13, fontWeight: '700', color: current ? color.brand : color.inkMuted }}>{n}</T>
    </View>
  );
  return (
    <Row onPress={onPress} last={last} style={[{ justifyContent: 'flex-start', gap: 14 }, current && { backgroundColor: color.surfaceMuted }]}>
      {node}
      {done ? (
        <T style={{ fontSize: 17, color: color.inkMuted, textDecorationLine: 'line-through' }}>{title}</T>
      ) : current ? (
        <RowText title={title} sub={sub} />
      ) : (
        <T style={{ fontSize: 17, color: color.inkSecondary }}>{title}</T>
      )}
      {current && <Chevron />}
    </Row>
  );
}

export function HomeNew() {
  const { tabTo, push } = useApp.getState();
  return (
    <Screen kind="tab" gap={22}>
      <HomeHeader />
      <Greeting title="Welcome, Nana.">
        <T style={lead}>Your Testament isn’t protected yet. Three short steps remain — finish them whenever suits you.</T>
      </Greeting>
      <Card>
        <SetupStep n={1} done title="Secure your account" />
        <SetupStep n={2} done title="Save recovery codes" />
        <SetupStep n={3} current title="Add a trusted person" sub="Someone who may one day receive what you preserve" onPress={() => tabTo('people')} />
        <SetupStep n={4} title="Add your first record" onPress={() => push('addRecord')} />
        <SetupStep n={5} title="Choose how often we check in" onPress={() => push('releasePlan')} last />
      </Card>
      <PrimaryButton label="Add a trusted person" onPress={() => tabTo('people')} />
      <View style={{ backgroundColor: color.stone, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 4 }}>
        <T style={{ fontSize: 15, fontWeight: '600' }}>Preserving isn’t the same as a will</T>
        <T style={{ fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>
          Last Testament keeps information and wishes safe and delivers them to the right people. It doesn’t replace a legally executed will.
        </T>
      </View>
    </Screen>
  );
}

