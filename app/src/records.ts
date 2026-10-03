import { COND, Field, PEOPLE, RecordItem } from './data';
import { color } from './theme';

/** How a record reads in lists and detail, given what has been confirmed this session. */
export function recordStatus(r: RecordItem, confirmed: Record<string, boolean>) {
  const confirmedNow = !!confirmed[r.id];
  const stale = r.months >= 12 && !confirmedNow;
  const draft = r.confirmed.startsWith('Draft');
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
    recipientsShort: r.to.map((p) => PEOPLE[p].name).join(', '),
  };
}

export function recipientsOf(r: RecordItem) {
  return r.to.map((p, i) => ({
    id: p,
    ...PEOPLE[p],
    when: COND[r.cond] + (i > 0 ? ` · if ${PEOPLE[r.to[0]].name} is unavailable` : ''),
  }));
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

export const fieldKey = (recId: string, i: number) => `${recId}:${i}`;
