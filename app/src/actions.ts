// Behaviours shared across screens. Anything that can stop or start a release,
// reveal a secret, change who receives what, or change security needs Face ID.
import { Platform } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { CATS, COND, CondId, Field, Person, RecordWithCat, Role, ROLE_LABEL, TEMPLATES } from './data';
import { back, go, jumpHome, openReview, tab } from './nav';
import { activeRecords, getRecord, maskOf, receivesBy, reviewList } from './records';
import { hapticWarning, useApp } from './store';

const g = () => useApp.getState();

// ─── Check-ins ────────────────────────────────────────────────────────────────

export const imOkay = () =>
  g().withFace('Confirming you’re okay', () => {
    g().set({ homeState: 'ok', checkedIn: true, pausedUntil: null });
    g().log('You confirmed you’re okay', '/checkin-settings');
    tab('home');
    g().showToast('Thank you, Nana. Next check-in 2 November.');
  });

export const pauseCheckins = () =>
  g().withFace('Pausing check-ins', () => {
    g().set({ homeState: 'ok', pausedUntil: '17 October' });
    g().log('Check-ins paused until 17 October', '/checkin-settings');
    tab('home');
    g().showToast('Check-ins paused until 17 October', 'Undo', resumeCheckins);
  });

export const resumeCheckins = () => {
  g().set({ pausedUntil: null });
  g().showToast('Check-ins resumed');
};

export const setCheckinDays = (days: number) =>
  g().withFace('Change check-in schedule', () => {
    g().set({ checkinDays: days });
    g().log(`Check-ins changed to every ${days} days`, '/checkin-settings');
    g().showToast(`We’ll check in every ${days} days`);
  });

// ─── Records ──────────────────────────────────────────────────────────────────

export function confirmRecord(id: string) {
  const r = getRecord(g(), id);
  g().set({ confirmed: { ...g().confirmed, [id]: true } });
  g().recordEvent(id, 'You confirmed it’s still correct');
  if (r) g().log(`You confirmed ${r.title}`, `/record/${id}`);
  const left = reviewList(g()).length;
  g().showToast(left ? `Confirmed · ${left} more to review` : 'Confirmed · everything is up to date', left ? 'Review' : null, openReview);
}

export function archiveRecord(id: string) {
  const r = getRecord(g(), id);
  if (!r) return;
  g().set({ archived: { ...g().archived, [id]: true } });
  g().recordEvent(id, 'Archived');
  back();
  g().showToast(`${r.title} archived`, 'Undo', () => restoreRecord(id));
}

export function restoreRecord(id: string) {
  const { [id]: _a, ...archived } = g().archived;
  const { [id]: _d, ...deleted } = g().deleted;
  g().set({ archived, deleted });
  g().recordEvent(id, 'Restored');
  g().showToast('Restored to your Testament');
}

export function askDeleteRecord(id: string) {
  const r = getRecord(g(), id);
  if (!r) return;
  const names = r.to.map((p) => g().people.find((x) => x.id === p)?.name ?? p);
  const who = names.length ? `${names.join(' and ')} will no longer receive it. ` : '';
  const docs = r.docs.length ? ` and its ${r.docs.length} document${r.docs.length > 1 ? 's' : ''}` : '';
  hapticWarning();
  g().set({
    dialog: {
      title: 'Delete this record?',
      body: `${who}The record${docs} ${docs ? 'are' : 'is'} kept for 30 days in case you change your mind.`,
      confirm: 'Delete record',
      cancel: 'Keep it',
      danger: true,
      then: () => {
        g().set({ deleted: { ...g().deleted, [id]: true } });
        g().log(`You deleted ${r.title}`);
        back();
        g().showToast('Record deleted · recoverable for 30 days', 'Undo', () => restoreRecord(id));
      },
    },
  });
}

/** Save edits from the Edit screen. Changing recipients or the condition needs Face ID. */
export function saveRecordEdits(id: string, edits: { title: string; fields: Field[]; to: string[]; cond: CondId; note?: string }) {
  const r = getRecord(g(), id);
  if (!r) return;
  const releaseChanged = r.cond !== edits.cond || r.to.join() !== edits.to.join();
  const apply = () => {
    g().set((s) => ({
      patches: { ...s.patches, [id]: { ...s.patches[id], ...edits, confirmed: r.confirmed.startsWith('Draft') ? r.confirmed : '3 Oct 2026', months: 0 } },
      confirmed: { ...s.confirmed, [id]: true },
    }));
    g().recordEvent(id, releaseChanged ? `Changed who receives it · ${COND[edits.cond]}` : 'Details updated');
    g().log(`You updated ${edits.title}`, `/record/${id}`);
    back();
    g().showToast(releaseChanged ? 'Saved · nobody is told until a release' : 'Saved');
  };
  if (releaseChanged) g().withFace('Change who receives this', apply);
  else apply();
}

let newId = 1;

/** Create a record from the Add record wizard. */
export function createRecord(input: { templateId: string; title: string; values: string[]; note?: string; to: string[]; cond: CondId; docs: [string, string][] }) {
  const t = TEMPLATES.find((x) => x.id === input.templateId) ?? TEMPLATES[0];
  const cat = CATS.find((c) => c.id === t.catId)!;
  const fields: Field[] = t.fields.map((f, i) => ({
    label: f.label,
    value: input.values[i] ?? '',
    secure: f.secure ?? null,
    m: f.secure === 'face' ? '••••••••••' : f.secure === 'mask' ? maskOf(input.values[i] ?? '') : null,
  }));
  const id = `new${newId++}`;
  const rec: RecordWithCat = {
    id,
    type: t.type,
    title: input.title.trim() || t.titleSample,
    confirmed: '3 Oct 2026',
    months: 0,
    cond: input.cond,
    to: input.to,
    note: input.note || undefined,
    badge: t.id === 'letter' ? 'Private message' : t.catId === 'wish' ? 'Wishes · not a will' : undefined,
    peek: fields.find((f) => f.secure === 'mask')?.m ?? undefined,
    fields,
    docs: input.docs,
    cat,
  };
  const save = () => {
    g().set((s) => ({ added: [...s.added, rec], homeState: s.homeState === 'new' ? 'ok' : s.homeState }));
    g().recordEvent(id, 'Created');
    g().log(`You added ${rec.title}`, `/record/${id}`);
    // Close the wizard, then open the new record so Back returns to where you started.
    back();
    setTimeout(() => go(`/record/${id}`), 60);
    g().showToast(`Saved · ${rec.title}`);
  };
  if (input.to.length) g().withFace('Save and choose recipients', save);
  else save();
}

export const saveDraftLater = () => {
  back();
  g().showToast('Draft saved · finish any time');
};

// ─── Review flow ──────────────────────────────────────────────────────────────

export function reviewAnswer(label: 'Confirmed' | 'To update' | 'Later') {
  const s = g();
  const r = reviewList(s)[s.reviewIdx];
  if (!r) return;
  const results = [...s.reviewResults, { id: r.id, title: r.title, label }];
  if (label === 'Confirmed') {
    // Confirmed records drop out of the list, so the index stays put.
    s.set({ reviewResults: results, reviewN: s.reviewN + 1, confirmed: { ...s.confirmed, [r.id]: true } });
    s.recordEvent(r.id, 'You confirmed it’s still correct');
  } else {
    s.set({ reviewResults: results, reviewN: s.reviewN + 1, reviewIdx: s.reviewIdx + 1 });
  }
}

// ─── People ───────────────────────────────────────────────────────────────────

export function resendInvite(id: string) {
  const p = g().people.find((x) => x.id === id);
  if (!p) return;
  g().set((s) => ({ people: s.people.map((x) => (x.id === id ? { ...x, status: 'invited', statusNote: 'Resent · just now' } : x)) }));
  g().showToast(`Invitation resent to ${p.name}`);
}

export function invitePerson(input: Omit<Person, 'id' | 'initial' | 'status' | 'statusNote'>) {
  const id = input.name.toLowerCase().replace(/[^a-z]/g, '') + Date.now().toString(36).slice(-3);
  const person: Person = { ...input, id, initial: input.name.trim().charAt(0).toUpperCase() || '?', status: 'invited', statusNote: 'Invited · just now' };
  g().withFace(`Invite ${input.name}`, () => {
    g().set((s) => ({ people: [...s.people.map((x) => (person.role === 'primary' && x.role === 'primary' ? { ...x, role: 'backup' as Role, dark: false } : x)), person], homeState: s.homeState === 'new' ? 'ok' : s.homeState }));
    g().log(`You invited ${input.full}`, `/person/${id}`);
    back();
    setTimeout(() => go(`/person/${id}`), 60);
    g().showToast(`Invitation sent to ${input.name}`);
  });
}

export function askChangeRole(id: string) {
  const p = g().people.find((x) => x.id === id);
  if (!p) return;
  const roles: Role[] = ['primary', 'backup', 'recipient'];
  g().set({
    dialog: {
      title: `${p.name}’s role`,
      body: 'Roles decide who we ask to confirm. What each person receives doesn’t change.',
      cancel: 'Cancel',
      options: roles.map((r) => ({
        label: ROLE_LABEL[r],
        selected: p.role === r,
        onPress: () => {
          if (p.role === r) return g().set({ dialog: null });
          g().set({ dialog: null });
          g().withFace('Change role', () => {
            g().set((s) => ({
              people: s.people.map((x) =>
                x.id === id ? { ...x, role: r, dark: r === 'primary' } : r === 'primary' && x.role === 'primary' ? { ...x, role: 'backup', dark: false } : x,
              ),
            }));
            g().log(`${p.name} is now your ${ROLE_LABEL[r].toLowerCase()}`, `/person/${id}`);
            g().showToast(`${p.name} is now your ${ROLE_LABEL[r].toLowerCase()}`);
          });
        },
      })),
    },
  });
}

/** Move everything one person receives to someone else. */
export function replacePerson(fromId: string, toId: string) {
  const s = g();
  const from = s.people.find((x) => x.id === fromId)!;
  const to = s.people.find((x) => x.id === toId)!;
  const recs = activeRecords(s).filter((r) => r.to.includes(fromId));
  s.set({
    dialog: {
      title: `Give ${to.name} what ${from.name} would receive?`,
      body: `${recs.length} records move to ${to.name}, under the same circumstances. ${from.name} stays in your People list with nothing assigned.`,
      confirm: `Move ${recs.length} records`,
      cancel: 'Cancel',
      then: () => {
        g().set((st) => {
          const patches = { ...st.patches };
          recs.forEach((r) => {
            const next = Array.from(new Set(r.to.map((p) => (p === fromId ? toId : p))));
            patches[r.id] = { ...patches[r.id], to: next };
          });
          return { patches };
        });
        g().log(`${to.name} replaces ${from.name} for ${recs.length} records`, `/person/${toId}`);
        back();
        g().showToast(`${recs.length} records now go to ${to.name}`);
      },
    },
  });
}

export function askRemovePerson(id: string) {
  const s = g();
  const p = s.people.find((x) => x.id === id);
  if (!p) return;
  const n = receivesBy(activeRecords(s), id).total;
  const nextPrimary = s.people.find((x) => x.id !== id && x.role === 'backup');
  hapticWarning();
  s.set({
    dialog: {
      title: `Remove ${p.name}?`,
      body:
        (p.role === 'primary' && nextPrimary ? `${p.name} is your primary contact. ${nextPrimary.name} becomes primary. ` : '') +
        (n ? `${n} records will have no recipient until you choose one.` : `${p.name} doesn’t receive anything yet.`),
      confirm: `Remove ${p.name}`,
      cancel: `Keep ${p.name}`,
      danger: true,
      then: () => {
        g().set((st) => ({
          removedPeople: { ...st.removedPeople, [id]: true },
          people: p.role === 'primary' && nextPrimary ? st.people.map((x) => (x.id === nextPrimary.id ? { ...x, role: 'primary', dark: true } : x)) : st.people,
        }));
        g().log(`You removed ${p.full}`);
        back();
        g().showToast(`${p.name} removed`, 'Undo', () => {
          const { [id]: _r, ...rest } = g().removedPeople;
          g().set({ removedPeople: rest });
          g().showToast(`${p.name} restored`);
        });
      },
    },
  });
}

// ─── Security ─────────────────────────────────────────────────────────────────

export const askLock = () => {
  hapticWarning();
  g().set({
    dialog: {
      title: 'Lock your account now?',
      body: 'Every device is signed out, releases and check-ins freeze, and nothing can be changed until you unlock with a recovery code. Takes effect immediately.',
      confirm: 'Lock account',
      cancel: 'Not now',
      danger: true,
      then: () => {
        g().set((s) => ({ locked: true, secAlert: false, sessions: s.sessions.filter((x) => x.current), notices: s.notices.map((n) => (n.id === 'n1' ? { ...n, read: true } : n)) }));
        g().log('You locked your account', '/security');
        g().showToast('Account locked · all other sessions ended');
      },
    },
  });
};

export const askDeleteAccount = () => {
  hapticWarning();
  g().set({
    typed: 0,
    dialog: {
      title: 'Delete your account?',
      body: `Your Testament holds ${activeRecords(g()).length} records that have not been released. They will be permanently erased for you and for ${g().people.map((p) => p.name).join(', ')}. Nothing will ever reach them. Type DELETE to continue.`,
      confirm: 'Delete permanently',
      cancel: 'Keep my Testament',
      danger: true,
      typed: true,
      then: () => g().showToast('This is a prototype — nothing was deleted.'),
    },
  });
};

export const wasMe = () => {
  g().set((s) => ({ secAlert: false, sessions: s.sessions.map((x) => ({ ...x, suspicious: false })), notices: s.notices.map((n) => (n.id === 'n1' ? { ...n, read: true } : n)) }));
  g().showToast('Thanks — iPad added to trusted devices');
};

export const unlockAccount = () =>
  g().withFace('Unlocking', () => {
    g().set({ locked: false });
    g().showToast('Account unlocked');
  });

export const toggleFace = () => {
  if (!g().face) return g().set({ face: true });
  g().set({
    dialog: {
      title: 'Turn off Face ID?',
      body: 'You’ll enter your password to open the app and reveal secrets.',
      confirm: 'Turn off',
      cancel: 'Keep Face ID',
      then: () => g().set({ face: false }),
    },
  });
};

export const endSession = (id: string) => {
  const sess = g().sessions.find((x) => x.id === id);
  g().withFace('Sign out session', () => {
    g().set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id), secAlert: sess?.suspicious ? false : s.secAlert }));
    g().showToast(`${sess?.device.split(' ·')[0]} signed out`);
  });
};

export const signOutOthers = () =>
  g().withFace('Signing out other sessions', () => {
    const n = g().sessions.filter((x) => !x.current).length;
    g().set((s) => ({ sessions: s.sessions.filter((x) => x.current), secAlert: false }));
    g().showToast(n ? `${n} other session${n > 1 ? 's' : ''} signed out` : 'No other sessions');
  });

export const removeDevice = (id: string) => {
  const d = g().devices.find((x) => x.id === id);
  hapticWarning();
  g().set({
    dialog: {
      title: `Remove ${d?.device}?`,
      body: 'It will need your password and two-step code to sign in again.',
      confirm: 'Remove device',
      cancel: 'Cancel',
      danger: true,
      then: () => {
        g().set((s) => ({ devices: s.devices.filter((x) => x.id !== id) }));
        g().showToast(`${d?.device} removed`);
      },
    },
  });
};

export const askPauseAccount = (until: string) =>
  g().set({
    dialog: {
      title: `Pause until ${until}?`,
      body: 'Check-ins stop and no release can start. Everything resumes automatically on that date, or whenever you choose.',
      confirm: 'Pause account',
      cancel: 'Cancel',
      then: () => {
        g().set({ accountPausedUntil: until });
        g().log(`Account paused until ${until}`, '/security/pause');
        g().showToast(`Paused until ${until}`, 'Undo', () => g().set({ accountPausedUntil: null }));
      },
    },
  });

// ─── Settings ─────────────────────────────────────────────────────────────────

export const askSignOut = () =>
  g().set({
    dialog: {
      title: 'Sign out?',
      body: 'Your Testament stays safe. Check-ins continue and you’ll need Face ID or your password to come back.',
      confirm: 'Sign out',
      cancel: 'Cancel',
      noFace: true,
      then: () => {
        g().set({ unlocked: false, lockReason: 'signedOut' });
        tab('home');
      },
    },
  });

export function setBlockScreenshots(on: boolean) {
  g().set((s) => ({ privacy: { ...s.privacy, blockScreenshots: on } }));
  applyScreenshotPolicy(on);
}

export function applyScreenshotPolicy(on: boolean) {
  if (Platform.OS === 'web') return;
  (on ? ScreenCapture.preventScreenCaptureAsync() : ScreenCapture.allowScreenCaptureAsync()).catch(() => {});
}

export const requestExport = () =>
  g().withFace('Export your data', () => {
    g().set({ exportRequested: true });
    g().showToast('We’ll email an encrypted export within 24 hours');
  });

export const markAllRead = () => g().set((s) => ({ notices: s.notices.map((n) => ({ ...n, read: true })) }));

export const openNotice = (id: string) => {
  const n = g().notices.find((x) => x.id === id);
  if (!n) return;
  g().set((s) => ({ notices: s.notices.map((x) => (x.id === id ? { ...x, read: true } : x)) }));
  if (n.href === '/review') openReview();
  else go(n.href);
};

export { jumpHome };
