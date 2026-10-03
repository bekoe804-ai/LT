import { useShallow } from 'zustand/react/shallow';
import { CATS, COND, COND_ORDER, CondId, Field, Person, REC, RecordItem, RecordWithCat } from './data';
import { Store, useApp } from './store';
import { color } from './theme';

// ─── Live records (seed data + additions, edits, archive, delete) ─────────────

type RecState = Pick<Store, 'added' | 'archived' | 'deleted' | 'patches'>;

// Patched records are cached so selectors return stable objects between renders.
const patched = new WeakMap<RecordWithCat, { p: object; out: RecordWithCat }>();
const patch = (s: RecState, r: RecordWithCat): RecordWithCat => {
  const p = s.patches[r.id];
  if (!p) return r;
  const hit = patched.get(r);
  if (hit && hit.p === p) return hit.out;
  const out = { ...r, ...p };
  patched.set(r, { p, out });
  return out;
};

/** Every record that still exists (archived included), with edits applied. */
export function allRecords(s: RecState): RecordWithCat[] {
  return [...Object.values(REC), ...s.added].filter((r) => !s.deleted[r.id]).map((r) => patch(s, r));
}

/** Records shown in the Testament — not archived, not deleted. */
export function activeRecords(s: RecState) {
  return allRecords(s).filter((r) => !s.archived[r.id]);
}

export function getRecord(s: RecState, id: string): RecordWithCat | undefined {
  const r = REC[id] ?? s.added.find((x) => x.id === id);
  return r ? patch(s, r) : undefined;
}

export function useActiveRecords() {
  return useApp(useShallow((s) => activeRecords(s)));
}

export function useRecord(id: string) {
  return useApp((s) => getRecord(s, id));
}

/** Records not confirmed in 12+ months that haven't been confirmed this session. */
export function reviewList(s: RecState & Pick<Store, 'confirmed'>) {
  return activeRecords(s).filter((r) => r.months >= 12 && !s.confirmed[r.id]);
}

export function useReviewList() {
  return useApp(useShallow((s) => reviewList(s)));
}

export function categoriesWithRecords(records: RecordWithCat[]) {
  return CATS.map((c) => ({ ...c, records: records.filter((r) => r.cat.id === c.id) }));
}

// ─── People ───────────────────────────────────────────────────────────────────

export function usePeople() {
  return useApp(useShallow((s) => s.people.filter((p) => !s.removedPeople[p.id])));
}

export function personById(people: Person[], id: string) {
  return people.find((p) => p.id === id);
}

/** What one person receives, grouped by circumstance. */
export function receivesBy(records: RecordWithCat[], personId: string) {
  const mine = records.filter((r) => r.to.includes(personId));
  const groups = COND_ORDER.map((c) => ({ cond: c, label: COND[c], records: mine.filter((r) => r.cond === c) })).filter((g) => g.records.length);
  return { total: mine.length, sealed: mine.filter((r) => r.badge === 'Sealed').length, groups };
}

/** Release-plan numbers for one scenario. */
export function scenarioFor(records: RecordWithCat[], people: Person[], cond: CondId) {
  const inScen = records.filter((r) => r.cond === cond);
  return {
    perPerson: people.map((p) => ({ person: p, count: inScen.filter((r) => r.to.includes(p.id)).length })),
    sealed: records.length - inScen.length,
    unassigned: inScen.filter((r) => r.to.length === 0).length,
  };
}

// ─── Record display helpers ───────────────────────────────────────────────────

export function recordStatus(r: RecordItem, confirmed: Record<string, boolean>, names: (id: string) => string) {
  const confirmedNow = !!confirmed[r.id];
  const stale = r.months >= 12 && !confirmedNow;
  const draft = r.confirmed.startsWith('Draft');
  const recips = r.to.map(names);
  return {
    stale,
    dotColor: stale ? color.warning : color.positive,
    confirmedShort: confirmedNow
      ? 'Confirmed today'
      : stale
        ? `Added ${r.months} months ago`
        : draft
          ? r.confirmed
          : 'Confirmed ' + r.confirmed.replace(/ \d{4}$/, ''),
    confirmedLong: confirmedNow
      ? 'Confirmed correct today'
      : stale
        ? `Last confirmed ${r.months} months ago`
        : draft
          ? r.confirmed
          : 'Confirmed correct ' + r.confirmed,
    reviewPrompt: `You added this ${r.months} months ago. Is it still correct?`,
    condition: COND[r.cond],
    recipientsShort: recips.length ? recips.join(', ') : 'Only you',
  };
}

export function useNameOf() {
  const people = useApp((s) => s.people);
  return (id: string) => people.find((p) => p.id === id)?.name ?? id;
}

/** Masked display for a field — secure fields show their mask until revealed. */
export function fieldDisplay(f: Field, revealed: boolean) {
  const mono = !!f.secure;
  return {
    shown: f.secure && !revealed ? (f.m ?? '') : f.value,
    mono,
    textColor: f.secure === 'face' && !revealed ? color.inkSecondary : color.ink,
    action: !f.secure ? null : revealed ? 'Hide' : f.secure === 'face' ? 'Face ID' : 'Reveal',
  };
}

/** A masked version of a value: keep the last 4 characters. */
export function maskOf(value: string) {
  const v = value.trim();
  if (v.length <= 4) return '••••';
  return '•••• ' + v.slice(-4);
}

export const fieldKey = (recId: string, i: number) => `${recId}:${i}`;
