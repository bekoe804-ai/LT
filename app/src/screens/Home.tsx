import React from 'react';
import { Image, Platform, View } from 'react-native';
import { imOkay, markAllRead, openNotice, pauseCheckins, resumeCheckins } from '../actions';
import { Avatar, Card, Chevron, Dot, LinkText, Page, PrimaryButton, Row, RowText, Screen, SecondaryButton, Section, SectionLabel, Serif, T, Tap } from '../components/ui';
import { go, openCat, openRec, openReview, tab } from '../nav';
import { useActiveRecords, usePeople, useReviewList } from '../records';
import { Notice, useApp } from '../store';
import { color } from '../theme';

const mark = require('../../assets/brand/mark.png');

/** Mark + bell + avatar. Long-press the mark on device to open the demo-state menu. */
function HomeHeader() {
  const set = useApp((s) => s.set);
  const unread = useApp((s) => s.notices.filter((n) => !n.read).length);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Tap
        onLongPress={() => set({ demoMenu: true })}
        delayLongPress={450}
        accessibilityLabel="Last Testament"
        accessibilityHint={Platform.OS === 'web' ? undefined : 'Long-press for demo states'}
      >
        <Image source={mark} style={{ height: 26, width: 26 * (280 / 255) }} />
      </Tap>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Tap onPress={() => go('/notifications')} scale accessibilityLabel={`Notifications, ${unread} unread`} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: color.stone, alignItems: 'center', justifyContent: 'center' }}>
          <Bell />
          {unread > 0 && (
            <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: color.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: color.canvas }}>
              <T style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unread}</T>
            </View>
          )}
        </Tap>
        <Tap onPress={() => go('/settings/profile')} scale accessibilityLabel="Your profile">
          <Avatar initial="N" size={36} fontSize={14} />
        </Tap>
      </View>
    </View>
  );
}

function Bell() {
  // Simple bell: dome + clapper, drawn with views (no custom SVG art).
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 13, height: 12, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderWidth: 1.8, borderBottomWidth: 0, borderColor: color.brand }} />
      <View style={{ width: 17, height: 1.8, backgroundColor: color.brand, borderRadius: 1 }} />
      <View style={{ width: 4, height: 2.5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: color.brand, marginTop: 1 }} />
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

export function HomeScreen() {
  const state = useApp((s) => s.homeState);
  return state === 'missed' ? <HomeMissed /> : state === 'new' ? <HomeNew /> : <HomeOk />;
}

function HomeOk() {
  const records = useActiveRecords();
  const people = usePeople();
  const review = useReviewList();
  const checkedIn = useApp((s) => s.checkedIn);
  const paused = useApp((s) => s.pausedUntil);
  const activity = useApp((s) => s.activity);
  const locked = useApp((s) => s.locked);
  const hasCar = records.some((r) => r.type === 'Insurance record' && /car/i.test(r.title));
  return (
    <Screen kind="tab" gap={22}>
      <HomeHeader />
      <Greeting title="Good evening, Nana.">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Dot c={locked ? color.danger : color.positive} />
          <T style={{ fontSize: 17, color: color.inkSecondary }}>{locked ? 'Your account is locked.' : 'Your Testament is protected.'}</T>
        </View>
      </Greeting>

      <Card style={{ padding: 18, flexDirection: 'row', gap: 8 }}>
        <Stat value="12 Sep" label="Last reviewed" onPress={() => go('/recent')} />
        <Stat value={String(records.length)} label="Records" onPress={() => tab('testament')} />
        <Stat value={String(people.length)} label="Trusted people" onPress={() => tab('people')} />
      </Card>

      <Card style={{ paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <Tap onPress={() => go('/checkin-settings')} style={{ flex: 1, gap: 2 }}>
          <T style={{ fontSize: 17, fontWeight: '600' }}>{paused ? 'Check-ins paused' : 'Next check-in'}</T>
          <T style={{ fontSize: 13, color: paused ? color.warning : color.inkSecondary }}>
            {paused ? `Until ${paused} · nothing can be released` : checkedIn ? 'Sunday 2 November · in 30 days' : 'Thursday 9 October · in 6 days'}
          </T>
        </Tap>
        {paused ? (
          <Tap onPress={resumeCheckins} scale style={pill}>
            <T style={pillText}>Resume</T>
          </Tap>
        ) : checkedIn ? (
          <View style={[pill, { backgroundColor: color.positiveBg, flexDirection: 'row', gap: 6, alignItems: 'center' }]}>
            <T style={[pillText, { color: color.positive }]}>✓ Done</T>
          </View>
        ) : (
          <Tap onPress={imOkay} scale haptic style={pill}>
            <T style={pillText}>I’m okay</T>
          </Tap>
        )}
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
          {hasCar ? (
            <Row last onPress={() => openCat('ins')}>
              <RowText title="Insurance is complete" sub="Car, home and life policies recorded" />
              <Chevron />
            </Row>
          ) : (
            <Row last onPress={() => openCat('ins')}>
              <RowText title="Add car insurance" sub="Suggested · 2 policies recorded, car not yet" />
              <Chevron />
            </Row>
          )}
        </Card>
      </Section>

      <Section label="Recently" right={<LinkText label="See all" onPress={() => go('/notifications')} style={{ fontSize: 13 }} />}>
        <View>
          {activity.slice(0, 3).map((a) => (
            <Tap key={a.id} onPress={a.href ? () => go(a.href!) : undefined} disabled={!a.href} style={{ paddingVertical: 3, paddingHorizontal: 2 }}>
              <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22.5 }}>
                {a.text} · {a.when}
              </T>
            </Tap>
          ))}
        </View>
      </Section>
    </Screen>
  );
}
const pill = { height: 40, paddingHorizontal: 16, borderRadius: 10, backgroundColor: color.stone, justifyContent: 'center' } as const;
const pillText = { color: color.brand, fontSize: 15, fontWeight: '600' } as const;

function Stat({ value, label, onPress }: { value: string; label: string; onPress?: () => void }) {
  return (
    <Tap onPress={onPress} style={{ flex: 1, gap: 2 }} accessibilityLabel={`${value} ${label}`}>
      <T style={{ fontSize: 20, fontWeight: '700' }}>{value}</T>
      <T style={{ fontSize: 12, color: color.inkSecondary }}>{label}</T>
    </Tap>
  );
}

function Step({ title, sub, last, children }: { title: string; sub: string; last?: boolean; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 14 }}>
      <View style={{ alignItems: 'center' }}>
        {children}
        {!last && <View style={{ width: 2, flex: 1, backgroundColor: color.track }} />}
      </View>
      <View style={{ paddingBottom: last ? 0 : 16, gap: 2, flex: 1 }}>
        <T style={{ fontSize: 15, fontWeight: '600', color: color.inkSecondary }}>{title}</T>
        <T style={{ fontSize: 13, color: color.inkMuted }}>{sub}</T>
      </View>
    </View>
  );
}

const hollowNode = { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: color.border, marginTop: 4 } as const;

function HomeMissed() {
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
        <SectionLabel style={{ marginBottom: 14, paddingHorizontal: 0 }}>What happens if we don’t hear from you</SectionLabel>
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
        <SecondaryButton label="See release plan" onPress={() => go('/release-plan')} style={{ flex: 1 }} />
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
        <T style={{ fontSize: 17, color: color.inkMuted, textDecorationLine: 'line-through', flex: 1 }}>{title}</T>
      ) : current ? (
        <RowText title={title} sub={sub} />
      ) : (
        <T style={{ fontSize: 17, color: color.inkSecondary, flex: 1 }}>{title}</T>
      )}
      {onPress && !done && <Chevron />}
    </Row>
  );
}

function HomeNew() {
  return (
    <Screen kind="tab" gap={22}>
      <HomeHeader />
      <Greeting title="Welcome, Nana.">
        <T style={lead}>Your Testament isn’t protected yet. Three short steps remain — finish them whenever suits you.</T>
      </Greeting>
      <Card>
        <SetupStep n={1} done title="Secure your account" onPress={() => go('/security')} />
        <SetupStep n={2} done title="Save recovery codes" onPress={() => go('/security/recovery-codes')} />
        <SetupStep n={3} current title="Add a trusted person" sub="Someone who may one day receive what you preserve" onPress={() => go('/add-person')} />
        <SetupStep n={4} title="Add your first record" onPress={() => go('/add-record')} />
        <SetupStep n={5} title="Choose how often we check in" onPress={() => go('/checkin-settings')} last />
      </Card>
      <PrimaryButton label="Add a trusted person" onPress={() => go('/add-person')} />
      <View style={{ backgroundColor: color.stone, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 4 }}>
        <T style={{ fontSize: 15, fontWeight: '600' }}>Preserving isn’t the same as a will</T>
        <T style={{ fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>
          Last Testament keeps information and wishes safe and delivers them to the right people. It doesn’t replace a legally executed will.
        </T>
        <LinkText label="How this works" onPress={() => go('/settings/legal')} style={{ fontSize: 13, marginTop: 6 }} />
      </View>
    </Screen>
  );
}

// ─── Notifications & activity ────────────────────────────────────────────────

const KIND_TONE: Record<Notice['kind'], { bg: string; fg: string; glyph: string }> = {
  security: { bg: color.dangerBg, fg: color.danger, glyph: '!' },
  review: { bg: color.warningBg, fg: color.warning, glyph: '↻' },
  people: { bg: color.infoBg, fg: color.info, glyph: '◦' },
  checkin: { bg: color.positiveBg, fg: color.positive, glyph: '✓' },
  system: { bg: color.stone, fg: color.bronzeInk, glyph: 'i' },
};

export function Notifications() {
  const notices = useApp((s) => s.notices);
  const activity = useApp((s) => s.activity);
  const unread = notices.filter((n) => !n.read).length;
  const groups = (['Needs you', 'Earlier'] as const).map((g) => ({ g, items: notices.filter((n) => n.group === g) }));
  return (
    <Page title="Notifications" right={unread ? <LinkText label="Read all" onPress={markAllRead} /> : undefined}>
      {groups.map(({ g, items }) =>
        items.length ? (
          <Section key={g} label={g}>
            <Card>
              {items.map((n, i) => {
                const tone = KIND_TONE[n.kind];
                return (
                  <Row key={n.id} onPress={() => openNotice(n.id)} last={i === items.length - 1} style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <T style={{ color: tone.fg, fontWeight: '700', fontSize: 15 }}>{tone.glyph}</T>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        <T style={{ fontSize: 15, fontWeight: n.read ? '500' : '700', flex: 1 }}>{n.title}</T>
                        <T style={{ fontSize: 12, color: color.inkMuted }}>{n.when}</T>
                      </View>
                      <T style={{ fontSize: 13, color: color.inkSecondary, lineHeight: 18 }}>{n.body}</T>
                    </View>
                    {!n.read && <View style={{ marginTop: 6 }}><Dot c={color.brand} /></View>}
                  </Row>
                );
              })}
            </Card>
          </Section>
        ) : null,
      )}
      <Section label="Your activity">
        <Card>
          {activity.map((a, i) => (
            <Row key={a.id} onPress={a.href ? () => go(a.href!) : undefined} last={i === activity.length - 1} style={{ paddingVertical: 12 }}>
              <T style={{ fontSize: 15, flex: 1 }}>{a.text}</T>
              <T style={{ fontSize: 13, color: color.inkMuted }}>{a.when}</T>
            </Row>
          ))}
        </Card>
      </Section>
      <T style={{ fontSize: 13, color: color.inkMuted, textAlign: 'center' }}>Every notification opens the thing it’s about.</T>
    </Page>
  );
}
