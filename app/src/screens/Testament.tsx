import React from 'react';
import { Animated, View } from 'react-native';
import {
  archiveRecord,
  askDeleteRecord,
  confirmRecord,
  openDoc,
  pick,
  reviewAnswer,
  saveLater,
  saveRecord,
  soon,
} from '../actions';
import { fadeUp, useEntrance } from '../anim';
import {
  Avatar,
  Badge,
  Card,
  Chevron,
  Dot,
  GlassPill,
  NavBar,
  PlusButton,
  PrimaryButton,
  Row,
  RowText,
  Screen,
  SecondaryButton,
  Section,
  SectionLabel,
  Serif,
  T,
  Tap,
  TextButton,
  ring,
  s as ui,
} from '../components/ui';
import { CATS, REC, RecordItem } from '../data';
import { fieldDisplay, fieldKey, recipientsOf, recordStatus } from '../records';
import { reviewList, useApp } from '../store';
import { color } from '../theme';

const typeLabel = { fontSize: 12, fontWeight: '600', letterSpacing: 0.72, textTransform: 'uppercase', color: color.inkTertiary } as const;
const pageTitle = { fontSize: 32, fontWeight: '700', letterSpacing: -0.32 } as const;

// ─── Testament (tab) ──────────────────────────────────────────────────────────

export function Testament() {
  const confirmed = useApp((s) => s.confirmed);
  const { push, openCat, openRec, openReview } = useApp.getState();
  const review = reviewList(confirmed);
  return (
    <Screen kind="tab">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <T accessibilityRole="header" style={pageTitle}>Testament</T>
        <PlusButton onPress={() => push('addRecord')} label="Add record" />
      </View>
      <Tap onPress={soon} style={{ height: 40, borderRadius: 12, backgroundColor: color.search, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 }} accessibilityRole="search">
        <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color.inkMuted }} />
        <T style={{ fontSize: 17, color: color.inkMuted }}>Search records</T>
      </Tap>
      {review.length > 0 && (
        <Tap onPress={openReview} style={{ backgroundColor: color.warningBg, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ gap: 2 }}>
            <T style={{ fontSize: 15, fontWeight: '600' }}>{review.length} records need a review</T>
            <T style={{ fontSize: 13, color: color.warning }}>Not confirmed in over a year</T>
          </View>
          <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Review</T>
        </Tap>
      )}
      <Section label="Pinned">
        <Card>
          <Row last onPress={() => openRec('emergency')}>
            <RowText title="Emergency information" sub="Blood type, GP, allergies · → Ama, Kofi · If unreachable" />
            <Chevron />
          </Row>
        </Card>
      </Section>
      <View style={{ gap: 8 }}>
        <SectionLabel>By category · {Object.keys(REC).length} records</SectionLabel>
        <Card>
          {CATS.map((c, i) => {
            const n = c.records.filter((r) => r.months >= 12 && !confirmed[r.id]).length;
            return (
              <Row key={c.id} onPress={() => openCat(c.id)} last={i === CATS.length - 1} style={{ paddingVertical: 13 }}>
                <T style={{ fontSize: 17 }}>{c.name}</T>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  {n > 0 && <Badge label={`${n} to review`} bg={color.warningBg} fg={color.warning} style={{ paddingVertical: 2, paddingHorizontal: 7 }} />}
                  <T style={{ fontSize: 15, color: color.inkSecondary }}>{c.records.length}</T>
                  <Chevron />
                </View>
              </Row>
            );
          })}
        </Card>
        <T style={{ fontSize: 13, color: color.inkMuted, paddingVertical: 4, paddingHorizontal: 2 }}>Archived (2) · Recently updated</T>
      </View>
    </Screen>
  );
}

// ─── Category ─────────────────────────────────────────────────────────────────

function RecordCard({ r }: { r: RecordItem }) {
  const confirmed = useApp((s) => s.confirmed);
  const openRec = useApp((s) => s.openRec);
  const st = recordStatus(r, confirmed);
  return (
    <Tap onPress={() => openRec(r.id)} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10, boxShadow: ring }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ gap: 3, flexShrink: 1 }}>
          <T style={typeLabel}>{r.type}</T>
          <T style={{ fontSize: 17, fontWeight: '600', lineHeight: 21 }}>{r.title}</T>
        </View>
        {st.stale && <Badge label="Review" bg={color.warningBg} fg={color.warning} />}
        {r.peek && <T style={[ui.mono, { fontSize: 14, color: color.inkSecondary, letterSpacing: 1.12 }]}>{r.peek}</T>}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Dot c={st.dotColor} />
          <T style={meta}>{st.confirmedShort}</T>
        </View>
        <T style={meta}>→ {st.recipientsShort} · {st.condition}</T>
        {r.docs.length > 0 && <T style={meta}>{r.docs.length} documents</T>}
      </View>
    </Tap>
  );
}
const meta = { fontSize: 13, color: color.inkSecondary, lineHeight: 18 } as const;

export function Category() {
  const catId = useApp((s) => s.catId);
  const { back, push } = useApp.getState();
  const cat = CATS.find((c) => c.id === catId) ?? CATS[0];
  return (
    <Screen bottom={60 - 34}>
      <NavBar onBack={back} right={<PlusButton onPress={() => push('addRecord')} label="Add record" />} />
      <View style={{ gap: 6 }}>
        <T accessibilityRole="header" style={{ fontSize: 28, fontWeight: '700', lineHeight: 32 }}>{cat.name}</T>
        <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>{cat.blurb}</T>
      </View>
      <View style={{ gap: 10 }}>
        {cat.records.map((r) => (
          <RecordCard key={r.id} r={r} />
        ))}
      </View>
      {cat.suggest && (
        <Tap onPress={() => push('addRecord')} style={dashed}>
          <View style={{ gap: 2 }}>
            <T style={{ fontSize: 15, fontWeight: '600' }}>{cat.suggest}</T>
            <T style={{ fontSize: 13, color: color.inkSecondary }}>Not recorded yet</T>
          </View>
          <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Add</T>
        </Tap>
      )}
    </Screen>
  );
}
const dashed = { borderWidth: 1, borderStyle: 'dashed', borderColor: color.bronze, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 } as const;

// ─── Record ───────────────────────────────────────────────────────────────────

const hideTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function revealField(key: string, label: string, secure: 'mask' | 'face') {
  const { revealed, set, withFace } = useApp.getState();
  if (revealed[key]) {
    set({ revealed: { ...revealed, [key]: false } });
    return;
  }
  const show = () => {
    set({ revealed: { ...useApp.getState().revealed, [key]: true } });
    // Secrets re-mask themselves after 30 seconds.
    clearTimeout(hideTimers[key]);
    hideTimers[key] = setTimeout(() => set({ revealed: { ...useApp.getState().revealed, [key]: false } }), 30000);
  };
  if (secure === 'face') withFace('Reveal ' + label.toLowerCase(), show);
  else show();
}

export function RecordScreen() {
  const recId = useApp((s) => s.recId);
  const confirmed = useApp((s) => s.confirmed);
  const revealed = useApp((s) => s.revealed);
  const { back, push } = useApp.getState();
  const r = REC[recId] ?? REC.barclays;
  const st = recordStatus(r, confirmed);
  const recips = recipientsOf(r);
  return (
    <Screen bottom={60 - 34}>
      <NavBar onBack={back} right={<GlassPill label="Edit" onPress={() => push('addRecord')} />} />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <T style={[typeLabel, { letterSpacing: 0.96 }]}>{r.type}</T>
          {r.badge && <Badge label={r.badge} bg={color.stone} fg={color.bronzeInk} style={{ paddingVertical: 3, paddingHorizontal: 7 }} />}
        </View>
        <T accessibilityRole="header" style={{ fontSize: 26, fontWeight: '700', lineHeight: 30 }}>{r.title}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Dot c={st.dotColor} />
          <T style={{ fontSize: 13, color: color.inkSecondary }}>{st.confirmedLong}</T>
        </View>
      </View>

      {st.stale && (
        <View style={{ backgroundColor: color.warningBg, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 18, gap: 12 }}>
          <T style={{ fontSize: 15, lineHeight: 21 }}>{st.reviewPrompt}</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PrimaryButton label="Yes, still correct" onPress={() => confirmRecord(r.id)} style={{ flex: 1, height: 40, borderRadius: 10 }} textStyle={{ fontSize: 15 }} />
            <PrimaryButton label="Update" onPress={() => push('addRecord')} style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: '#fff' }} textStyle={{ fontSize: 15, color: color.brand }} />
          </View>
        </View>
      )}

      {r.note && (
        <Card style={{ padding: 18 }}>
          <Serif style={{ fontSize: 20, lineHeight: 29 }}>{r.note}</Serif>
        </Card>
      )}

      {r.fields.length > 0 && (
        <Card>
          {r.fields.map((f, i) => {
            const key = fieldKey(r.id, i);
            const d = fieldDisplay(f, !!revealed[key]);
            return (
              <View
                key={key}
                style={[
                  ui.row,
                  { paddingVertical: 13 },
                  i < r.fields.length - 1 && ui.divider,
                  f.secure === 'face' && { backgroundColor: color.stone },
                ]}
              >
                <View style={{ gap: 3, flexShrink: 1 }}>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{f.label}</T>
                  <T style={[{ fontSize: 17, lineHeight: 23, color: d.textColor }, d.mono && [ui.mono, { letterSpacing: 1.36 }]]}>{d.shown}</T>
                </View>
                {d.action && f.secure && (
                  <Tap
                    onPress={() => revealField(key, f.label, f.secure as 'mask' | 'face')}
                    accessibilityLabel={`${d.action} ${f.label}`}
                    hitSlop={8}
                  >
                    <T style={{ fontSize: 15, fontWeight: '600', color: color.brand, paddingVertical: 8, paddingLeft: 12 }}>{d.action}</T>
                  </Tap>
                )}
              </View>
            );
          })}
        </Card>
      )}

      {recips.length > 0 ? (
        <Section label="Who receives this">
          <Card>
            {recips.map((p, i) => (
              <Row key={p.id} onPress={() => push('ama')} last={i === recips.length - 1} style={{ paddingVertical: 12, justifyContent: 'flex-start' }}>
                <Avatar initial={p.initial} dark={p.dark} size={32} fontSize={13} />
                <View style={{ gap: 1, flex: 1 }}>
                  <T style={{ fontSize: 17, fontWeight: '600' }}>{p.name}</T>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{p.when}</T>
                </View>
                <Chevron />
              </Row>
            ))}
          </Card>
        </Section>
      ) : (
        <Tap onPress={() => push('addRecord')} style={[dashed, { paddingVertical: 14, paddingHorizontal: 18 }]}>
          <View style={{ gap: 2 }}>
            <T style={{ fontSize: 15, fontWeight: '600' }}>Only you can see this</T>
            <T style={{ fontSize: 13, color: color.inkSecondary }}>No recipient chosen yet</T>
          </View>
          <T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Choose</T>
        </Tap>
      )}

      {r.docs.length > 0 && (
        <Section label={`Documents · ${r.docs.length}`}>
          <Card>
            {r.docs.map(([name, m], i) => (
              <Row key={name} onPress={openDoc} last={i === r.docs.length - 1} style={{ paddingVertical: 12, justifyContent: 'flex-start' }}>
                <View style={{ width: 32, height: 40, borderRadius: 4, backgroundColor: color.stone, borderWidth: 1, borderColor: color.track }} />
                <View style={{ gap: 1, flex: 1 }}>
                  <T numberOfLines={1} style={{ fontSize: 15, fontWeight: '600' }}>{name}</T>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{m}</T>
                </View>
              </Row>
            ))}
          </Card>
        </Section>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 6 }}>
        <Tap onPress={soon}><T style={linkText}>History</T></Tap>
        <Tap onPress={() => archiveRecord(r.id)}><T style={linkText}>Archive</T></Tap>
        <Tap onPress={() => askDeleteRecord(r.id)}><T style={[linkText, { color: color.danger }]}>Delete</T></Tap>
      </View>
    </Screen>
  );
}
const linkText = { fontSize: 15, fontWeight: '600', color: color.brand } as const;

// ─── Review ───────────────────────────────────────────────────────────────────

const RESULT_TONE = {
  Confirmed: { bg: color.positiveBg, fg: color.positive },
  'To update': { bg: color.warningBg, fg: color.warning },
  Later: { bg: color.neutralBg, fg: color.inkSecondary },
} as const;

export function Review() {
  const confirmed = useApp((s) => s.confirmed);
  const idx = useApp((s) => s.reviewIdx);
  const results = useApp((s) => s.reviewResults);
  const reviewN = useApp((s) => s.reviewN);
  const { back, tabTo, openRec } = useApp.getState();
  const list = reviewList(confirmed);
  const r = list[idx];
  const total = results.length + Math.max(0, list.length - idx);
  const cardIn = useEntrance(reviewN, 300);
  const doneIn = useEntrance(!r, 400);

  if (!r) {
    const c = results.filter((x) => x.label === 'Confirmed').length;
    const u = results.filter((x) => x.label === 'To update').length;
    const summary = (c ? `${c} confirmed` : 'Nothing confirmed') + (u ? `, ${u} to update` : '') + '. We’ll ask again in a year.';
    return (
      <Screen gap={20} bottom={40 - 34}>
        <NavBar onBack={back} title="Review" />
        <Animated.View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }, fadeUp(doneIn)]}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: color.positiveBg, alignItems: 'center', justifyContent: 'center' }}>
            <T style={{ color: color.positive, fontSize: 24, fontWeight: '700' }}>✓</T>
          </View>
          <Serif style={{ fontSize: 34, lineHeight: 37 }}>All reviewed.</Serif>
          <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22.5, maxWidth: 300, textAlign: 'center' }}>{summary}</T>
        </Animated.View>
        {results.length > 0 && (
          <Card>
            {results.map((x, i) => (
              <Row key={x.id + i} onPress={() => openRec(x.id)} last={i === results.length - 1} style={{ paddingVertical: 12 }}>
                <T numberOfLines={1} style={{ fontSize: 15, flexShrink: 1 }}>{x.title}</T>
                <Badge label={x.label} bg={RESULT_TONE[x.label].bg} fg={RESULT_TONE[x.label].fg} />
              </Row>
            ))}
          </Card>
        )}
        <PrimaryButton label="Back to Home" onPress={() => tabTo('homeOk')} />
      </Screen>
    );
  }

  const st = recordStatus(r, confirmed);
  return (
    <Screen gap={20} bottom={40 - 34}>
      <NavBar onBack={back} title="Review" />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: Math.max(total, 1) }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < results.length ? color.brand : color.track }} />
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <T accessibilityRole="header" style={{ fontSize: 26, fontWeight: '700', lineHeight: 30 }}>Is this still correct?</T>
        <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>
          Record {results.length + 1} of {total} · {r.cat.name}
        </T>
      </View>
      <Animated.View style={fadeUp(cardIn)}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 14, boxShadow: `0 8px 24px rgba(26,26,26,0.08), ${ring}` }}>
          <View style={{ gap: 3 }}>
            <T style={typeLabel}>{r.type}</T>
            <T style={{ fontSize: 22, fontWeight: '700', lineHeight: 26 }}>{r.title}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Dot c={color.warning} />
              <T style={{ fontSize: 13, color: color.warning }}>{st.confirmedLong}</T>
            </View>
          </View>
          <View style={{ borderTopWidth: 1, borderTopColor: color.hairline }}>
            {r.fields.slice(0, 3).map((f, i) => {
              const d = fieldDisplay(f, false);
              return (
                <View key={i} style={{ paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: color.hairline }}>
                  <T style={{ fontSize: 13, color: color.inkSecondary }}>{f.label}</T>
                  <T style={[{ fontSize: 15, textAlign: 'right', flexShrink: 1 }, d.mono && [ui.mono, { letterSpacing: 1.2 }]]}>{d.shown}</T>
                </View>
              );
            })}
          </View>
          <T style={{ fontSize: 13, color: color.inkSecondary, lineHeight: 19 }}>
            → {st.recipientsShort} · {st.condition}
          </T>
        </View>
      </Animated.View>
      <View style={{ flex: 1 }} />
      <View style={{ gap: 10 }}>
        <PrimaryButton label="Yes, still correct" onPress={() => reviewAnswer('Confirmed')} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SecondaryButton label="Needs updating" onPress={() => reviewAnswer('To update')} style={{ flex: 1 }} />
          <TextButton label="Ask me later" onPress={() => reviewAnswer('Later')} style={{ flex: 1, height: 48 }} textStyle={{ fontSize: 15 }} />
        </View>
      </View>
    </Screen>
  );
}

// ─── Add record · recipients step ─────────────────────────────────────────────

function Check({ on }: { on: boolean }) {
  return on ? (
    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color.brand, alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</T>
    </View>
  ) : (
    <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: color.border }} />
  );
}

const PICK_ROWS = [
  { k: 'ama', initial: 'A', dark: true, name: 'Ama Mensah', role: 'Daughter · Primary contact' },
  { k: 'kofi', initial: 'K', name: 'Kofi Mensah', role: 'Son · Backup contact' },
  { k: 'efua', initial: 'E', name: 'Efua Boateng', role: 'Solicitor · Recipient only' },
] as const;

export function AddRecord() {
  const picks = useApp((s) => s.picks);
  const { back, tabTo } = useApp.getState();
  return (
    <Screen gap={20} bottom={40 - 34}>
      <NavBar
        onBack={back}
        right={
          <Tap onPress={saveLater}>
            <T style={{ fontSize: 15, fontWeight: '600', color: color.brand, paddingVertical: 10 }}>Save & finish later</T>
          </Tap>
        }
      />
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel="Step 4 of 6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < 4 ? color.brand : color.track }} />
        ))}
      </View>
      <View style={{ gap: 8 }}>
        <T accessibilityRole="header" style={{ fontSize: 26, fontWeight: '700', lineHeight: 30 }}>Who should receive this?</T>
        <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>Barclays current account. You’ll choose when in the next step. Only you can see it until then.</T>
      </View>
      <Card>
        {PICK_ROWS.map((p, i) => (
          <Tap
            key={p.k}
            onPress={() => pick(p.k)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: picks[p.k] }}
            style={[pickRow, i < 2 && ui.divider, picks[p.k] && { backgroundColor: color.surfaceMuted }]}
          >
            <Check on={picks[p.k]} />
            <Avatar initial={p.initial} dark={'dark' in p && p.dark} />
            <RowText title={p.name} sub={p.role} />
          </Tap>
        ))}
      </Card>
      <Tap
        onPress={() => pick('none')}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: picks.none }}
        style={[pickRow, { backgroundColor: picks.none ? color.surfaceMuted : '#fff', borderRadius: 12, boxShadow: ring }]}
      >
        <Check on={picks.none} />
        <RowText title="No one yet" sub="Keep it private. You can add people later." />
      </Tap>
      <Tap onPress={() => tabTo('people')}>
        <T style={{ fontSize: 15, fontWeight: '600', color: color.brand, paddingHorizontal: 2 }}>+ Add a new trusted person</T>
      </Tap>
      <View style={{ flex: 1 }} />
      <PrimaryButton label="Continue" onPress={saveRecord} />
    </Screen>
  );
}
const pickRow = { paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', gap: 14, alignItems: 'center' } as const;
