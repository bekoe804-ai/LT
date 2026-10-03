// Prototype behaviours shared across screens. Everything that can stop or start
// a release, reveal a secret, or change security goes through Face ID.
import { PEOPLE, REC } from './data';
import { reviewList, ScreenId, useApp } from './store';

const g = () => useApp.getState();

export const imOkay = () =>
  g().withFace('Confirming you’re okay', () => {
    g().nav('homeOk', 'fade');
    g().showToast('Thank you, Nana. Next check-in 2 November.');
  });

export const pauseCheckins = () =>
  g().withFace('Pausing check-ins', () => {
    g().nav('homeOk', 'fade');
    g().showToast('Check-ins paused until 17 October', 'Undo', () => g().showToast('Check-ins resumed'));
  });

export const soon = () => g().showToast('Not in this prototype yet');

export const jump = (screen: ScreenId) => {
  g().set({ demoMenu: false });
  g().nav(screen, 'fade');
};

// ─── Records ──────────────────────────────────────────────────────────────────

export function confirmRecord(id: string) {
  g().set({ confirmed: { ...g().confirmed, [id]: true } });
  const left = reviewList(g().confirmed).length;
  g().showToast(
    left ? `Confirmed · ${left} more to review` : 'Confirmed · everything is up to date',
    left ? 'Review' : null,
    () => g().openReview(),
  );
}

export function archiveRecord(id: string) {
  g().back();
  g().showToast(REC[id].title + ' archived', 'Undo', () => {});
}

export function askDeleteRecord(id: string) {
  const r = REC[id];
  const names = r.to.map((p) => PEOPLE[p].name);
  const who = names.length ? `${names.join(' and ')} will no longer receive it. ` : '';
  const docs = r.docs.length ? ` and its ${r.docs.length} document${r.docs.length > 1 ? 's' : ''}` : '';
  g().set({
    dialog: {
      title: 'Delete this record?',
      body: `${who}The record${docs} ${docs ? 'are' : 'is'} kept for 30 days in case you change your mind.`,
      confirm: 'Delete record',
      cancel: 'Keep it',
      danger: true,
      then: () => {
        g().back();
        g().showToast('Record deleted · recoverable for 30 days', 'Undo', () => {});
      },
    },
  });
}

export const openDoc = () => g().showToast('Secure document viewer — coming in stage 3');

// ─── Review flow ──────────────────────────────────────────────────────────────

export function reviewAnswer(label: 'Confirmed' | 'To update' | 'Later') {
  const s = g();
  const r = reviewList(s.confirmed)[s.reviewIdx];
  if (!r) return;
  const results = [...s.reviewResults, { id: r.id, title: r.title, label }];
  if (label === 'Confirmed') {
    // Confirmed records drop out of the list, so the index stays put.
    s.set({ reviewResults: results, reviewN: s.reviewN + 1, confirmed: { ...s.confirmed, [r.id]: true } });
  } else {
    s.set({ reviewResults: results, reviewN: s.reviewN + 1, reviewIdx: s.reviewIdx + 1 });
  }
}

// ─── Add record ───────────────────────────────────────────────────────────────

export function pick(k: 'ama' | 'kofi' | 'efua' | 'none') {
  const p = { ...g().picks };
  if (k === 'none') {
    g().set({ picks: { ama: false, kofi: false, efua: false, none: !p.none } });
    return;
  }
  p[k] = !p[k];
  p.none = false;
  g().set({ picks: p });
}

export const saveLater = () => {
  g().back();
  g().showToast('Draft saved · finish any time');
};

// The add-record mock is for the Barclays current account, so land on it.
export const saveRecord = () => {
  g().openRec('barclays');
  g().showToast('Saved · Barclays current account');
};

// ─── People ───────────────────────────────────────────────────────────────────

export const resendEfua = () => {
  g().set({ efuaStatus: 'Resent · just now' });
  g().showToast('Invitation resent to Efua');
};

export const previewAma = () => g().showToast('Recipient portal preview — coming in stage 3');

export const askRemoveAma = () =>
  g().set({
    dialog: {
      title: 'Remove Ama?',
      body: 'Ama is your primary contact and receives 14 records. Kofi becomes primary. Those 14 records will have no recipient until you choose one.',
      confirm: 'Remove Ama',
      cancel: 'Keep Ama',
      danger: true,
      then: () => {
        g().back();
        g().showToast('Ama removed', 'Undo', () => {});
      },
    },
  });

// ─── Security & settings ──────────────────────────────────────────────────────

export const askLock = () =>
  g().set({
    dialog: {
      title: 'Lock your account now?',
      body: 'Every device is signed out, releases and check-ins freeze, and nothing can be changed until you unlock with a recovery code. Takes effect immediately.',
      confirm: 'Lock account',
      cancel: 'Not now',
      danger: true,
      then: () => {
        g().set({ locked: true, secAlert: false, sessions: 1 });
        g().showToast('Account locked · all other sessions ended');
      },
    },
  });

export const askDeleteAccount = () =>
  g().set({
    typed: 0,
    dialog: {
      title: 'Delete your account?',
      body: `Your Testament holds ${Object.keys(REC).length} records that have not been released. They will be permanently erased for you and for Ama, Kofi and Efua. Nothing will ever reach them. Type DELETE to continue.`,
      confirm: 'Delete permanently',
      cancel: 'Keep my Testament',
      danger: true,
      typed: true,
      then: () => g().showToast('This is a prototype — nothing was deleted.'),
    },
  });

export const wasMe = () => {
  g().set({ secAlert: false });
  g().showToast('Thanks — iPad added to trusted devices');
};

export const unlock = () =>
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
      danger: false,
      then: () => g().set({ face: false }),
    },
  });
};

export const signOutOthers = () =>
  g().withFace('Signing out other sessions', () => {
    g().set({ sessions: 1 });
    g().showToast('2 other sessions signed out');
  });

export const signOut = () => g().showToast('Signed out (prototype)');
