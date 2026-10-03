import React, { useState } from 'react';
import { Platform, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useShallow } from 'zustand/react/shallow';
import { restoreRecord } from '../actions';
import { Badge, Card, Chevron, Dot, Empty, NavBar, Page, PlusButton, Row, RowText, Screen, Section, SectionLabel, T, Tap, ring, s as ui } from '../components/ui';
import { CATS, RecordWithCat } from '../data';
import { back, go, openCat, openRec, openReview } from '../nav';
import { allRecords, categoriesWithRecords, recordStatus, useActiveRecords, useNameOf, useReviewList } from '../records';
import { useApp } from '../store';
import { smooth } from '../layout';
import { color } from '../theme';

export const typeLabel = { fontSize: 12, fontWeight: '600', letterSpacing: 0.72, textTransform: 'uppercase', color: color.inkTertiary } as const;
const pageTitle = { fontSize: 32, fontWeight: '700', letterSpacing: -0.32 } as const;

// ─── Testament (tab) ──────────────────────────────────────────────────────────

export function Testament() {
  const records = useActiveRecords();
  const review = useReviewList();
  const archivedCount = useApp((s) => Object.keys(s.archived).filter((k) => s.archived[k] && !s.deleted[k]).length);
  const cats = categoriesWithRecords(records);
  return (
    <Screen kind="tab">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <T accessibilityRole="header" style={pageTitle}>Testament</T>
        <PlusButton onPress={() => go('/add-record')} label="Add record" />
      </View>
      <Tap onPress={() => go('/search')} accessibilityRole="search" style={searchBox}>
        <View style={searchIcon} />
        <T style={{ fontSize: 17, color: color.inkMuted }}>Search records</T>
      </Tap>
      {review.length > 0 && (
        <Tap onPress={openReview} scale style={{ backgroundColor: color.warningBg, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <SectionLabel>By category · {records.length} records</SectionLabel>
        <Card>
          {cats.map((c, i) => {
            const n = review.filter((r) => r.cat.id === c.id).length;
            return (
              <Row key={c.id} onPress={() => openCat(c.id)} last={i === cats.length - 1} style={{ paddingVertical: 13 }}>
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
        <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 4, paddingHorizontal: 2 }}>
          <Tap onPress={() => go('/archived')}><T style={footLink}>Archived ({archivedCount + SEED_ARCHIVE.length})</T></Tap>
          <T style={footLink}>·</T>
          <Tap onPress={() => go('/recent')}><T style={footLink}>Recently updated</T></Tap>
        </View>
      </View>
    </Screen>
  );
}
const footLink = { fontSize: 13, color: color.inkMuted } as const;
const searchBox = { height: 40, borderRadius: 12, backgroundColor: color.search, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 } as const;
const searchIcon = { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: color.inkMuted } as const;

// ─── Record card (used by category, search, recent) ──────────────────────────

export function RecordCard({ r }: { r: RecordWithCat }) {
  const confirmed = useApp((s) => s.confirmed);
  const nameOf = useNameOf();
  const st = recordStatus(r, confirmed, nameOf);
  return (
    <Tap onPress={() => openRec(r.id)} scale style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10, boxShadow: ring }}>
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
        {r.docs.length > 0 && <T style={meta}>{r.docs.length} document{r.docs.length > 1 ? "s" : ""}</T>}
      </View>
    </Tap>
  );
}
const meta = { fontSize: 13, color: color.inkSecondary, lineHeight: 18 } as const;

const dashed = { borderWidth: 1, borderStyle: 'dashed', borderColor: color.bronze, borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 } as const;

// ─── Category ─────────────────────────────────────────────────────────────────

export function Category({ id }: { id: string }) {
  const records = useActiveRecords();
  const cat = CATS.find((c) => c.id === id) ?? CATS[0];
  const list = records.filter((r) => r.cat.id === cat.id);
  // The car-insurance suggestion disappears once one has been added.
  const showSuggest = !!cat.suggest && !list.some((r) => r.id.startsWith('new') && /car/i.test(r.title + r.fields.map((f) => f.value).join(' ')));
  return (
    <Screen bottom={26}>
      <NavBar onBack={back} right={<PlusButton onPress={() => go(`/add-record?cat=${cat.id}`)} label="Add record" />} />
      <View style={{ gap: 6 }}>
        <T accessibilityRole="header" style={{ fontSize: 28, fontWeight: '700', lineHeight: 32 }}>{cat.name}</T>
        <T style={{ fontSize: 15, color: color.inkSecondary, lineHeight: 22 }}>{cat.blurb}</T>
      </View>
      <View style={{ gap: 10 }}>
        {list.map((r) => (
          <Animated.View key={r.id} layout={smooth} entering={FadeIn} exiting={FadeOut}>
            <RecordCard r={r} />
          </Animated.View>
        ))}
        {list.length === 0 && <Empty tone="neutral" icon="+" title="Nothing here yet" body="Add the first record in this category." />}
      </View>
      {showSuggest && (
        <Tap onPress={() => go('/add-record?template=car-ins')} scale style={dashed}>
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

// ─── Search ───────────────────────────────────────────────────────────────────

const SUGGESTIONS = ['Barclays', 'passport', 'Dubai', 'insurance', 'Kofi', 'loan'];

export function Search() {
  const records = useActiveRecords();
  const nameOf = useNameOf();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  // Secure values are never searched — only titles, types, recipients and non-secret fields.
  const hits = query
    ? records.filter((r) =>
        [r.title, r.type, r.cat.name, r.to.map(nameOf).join(' '), ...r.fields.filter((f) => !f.secure).map((f) => f.label + ' ' + f.value)]
          .join(' ')
          .toLowerCase()
          .includes(query),
      )
    : [];
  return (
    <Screen cascade={false}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={[searchBox, { flex: 1 }]}>
          <View style={searchIcon} />
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            placeholder="Search records"
            placeholderTextColor={color.inkMuted}
            returnKeyType="search"
            accessibilityLabel="Search records"
            style={[{ flex: 1, fontSize: 17, color: color.ink }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
          />
        </View>
        <Tap onPress={back}><T style={{ fontSize: 17, color: color.brand, fontWeight: '600' }}>Cancel</T></Tap>
      </View>
      {!query ? (
        <Animated.View entering={FadeIn} style={{ gap: 10 }}>
          <SectionLabel>Try</SectionLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <Tap key={s} onPress={() => setQ(s)} scale style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#fff', boxShadow: ring }}>
                <T style={{ fontSize: 15 }}>{s}</T>
              </Tap>
            ))}
          </View>
          <T style={{ fontSize: 13, color: color.inkMuted, lineHeight: 19, marginTop: 8 }}>Passwords, account numbers and other secrets are never searched or shown in results.</T>
        </Animated.View>
      ) : (
        <View style={{ gap: 10 }}>
          <SectionLabel>{hits.length} {hits.length === 1 ? 'result' : 'results'}</SectionLabel>
          {hits.map((r) => (
            <Animated.View key={r.id} entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} layout={smooth}>
              <RecordCard r={r} />
            </Animated.View>
          ))}
          {hits.length === 0 && <Empty tone="neutral" icon="?" title="No matches" body={`Nothing matches “${q.trim()}”. Try a name, a bank or a category.`} />}
        </View>
      )}
    </Screen>
  );
}

// ─── Archived ─────────────────────────────────────────────────────────────────

const SEED_ARCHIVE = [
  { title: 'HSBC savings account (closed 2024)', sub: 'Financial record · archived Jan 2025' },
  { title: 'Old Vodafone contract', sub: 'Digital account · archived Mar 2025' },
];

export function Archived() {
  const archived = useApp(useShallow((s) => allRecords(s).filter((r) => s.archived[r.id])));
  return (
    <Page title="Archived" lead="Archived records aren’t released to anyone. Restore one to put it back in your Testament.">
      <Card>
        {archived.map((r) => (
          <Row key={r.id}>
            <RowText title={r.title} sub={`${r.type} · archived just now`} titleStyle={{ fontSize: 15 }} />
            <Tap onPress={() => restoreRecord(r.id)} hitSlop={8}><T style={{ fontSize: 15, fontWeight: '600', color: color.brand }}>Restore</T></Tap>
          </Row>
        ))}
        {SEED_ARCHIVE.map((a, i) => (
          <Row key={a.title} last={i === SEED_ARCHIVE.length - 1}>
            <RowText title={a.title} sub={a.sub} titleStyle={{ fontSize: 15, color: color.inkSecondary }} />
          </Row>
        ))}
      </Card>
    </Page>
  );
}

// ─── Recently updated ─────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateValue = (s: string) => {
  const m = s.match(/(\d+) (\w{3}) (\d{4})/);
  return m ? Number(m[3]) * 400 + MONTHS.indexOf(m[2]) * 32 + Number(m[1]) : 0;
};

export function Recent() {
  const records = useActiveRecords();
  const confirmed = useApp((s) => s.confirmed);
  const score = (r: RecordWithCat) => (confirmed[r.id] || r.id.startsWith('new') ? 1e9 : dateValue(r.confirmed));
  const sorted = [...records].sort((a, b) => score(b) - score(a)).slice(0, 10);
  return (
    <Page title="Recently updated" lead="The ten records you’ve added, changed or confirmed most recently.">
      <View style={{ gap: 10 }}>
        {sorted.map((r) => (
          <RecordCard key={r.id} r={r} />
        ))}
      </View>
    </Page>
  );
}
