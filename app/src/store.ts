import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { REC } from './data';

export type ScreenId =
  | 'homeOk'
  | 'homeMissed'
  | 'homeNew'
  | 'testament'
  | 'category'
  | 'record'
  | 'review'
  | 'addRecord'
  | 'people'
  | 'ama'
  | 'releasePlan'
  | 'checkin'
  | 'settings'
  | 'security';

export type TabId = 'home' | 'testament' | 'people' | 'settings';
export type NavKind = 'push' | 'pop' | 'fade';

export const SCREEN_NAMES: Record<ScreenId, string> = {
  homeOk: 'Home · protected',
  homeMissed: 'Home · missed check-in',
  homeNew: 'Home · new account',
  testament: 'Testament',
  category: 'Category',
  record: 'Record',
  review: 'Review',
  addRecord: 'Add record · recipients',
  people: 'People',
  ama: 'Ama Mensah',
  releasePlan: 'Release plan',
  checkin: 'Check-in',
  settings: 'Settings',
  security: 'Security Centre',
};

/** Screens that show the tab bar, and which tab is active on them. */
export const TABS: Partial<Record<ScreenId, TabId>> = {
  homeOk: 'home',
  homeMissed: 'home',
  homeNew: 'home',
  testament: 'testament',
  people: 'people',
  settings: 'settings',
};

export interface Dialog {
  title: string;
  body: string;
  confirm: string;
  cancel: string;
  danger: boolean;
  /** Requires typing DELETE before the confirm button enables. */
  typed?: boolean;
  then: () => void;
}

export interface ReviewResult {
  id: string;
  title: string;
  label: 'Confirmed' | 'To update' | 'Later';
}

type Picks = { ama: boolean; kofi: boolean; efua: boolean; none: boolean };

interface State {
  screen: ScreenId;
  stack: ScreenId[];
  anim: NavKind;
  /** Increments on every navigation so the incoming screen re-animates. */
  navN: number;
  scen: number;
  scenN: number;
  catId: string;
  recId: string;
  revealed: Record<string, boolean>;
  confirmed: Record<string, boolean>;
  reviewIdx: number;
  reviewN: number;
  reviewResults: ReviewResult[];
  picks: Picks;
  faceId: boolean;
  faceLabel: string;
  toast: { text: string; action?: string | null; n: number } | null;
  dialog: Dialog | null;
  typed: number;
  secAlert: boolean;
  locked: boolean;
  face: boolean;
  sessions: number;
  efuaStatus: string;
  demoMenu: boolean;
}

interface Actions {
  nav: (screen: ScreenId, kind: NavKind) => void;
  push: (screen: ScreenId) => void;
  back: () => void;
  tabTo: (screen: ScreenId) => void;
  openCat: (id: string) => void;
  openRec: (id: string) => void;
  openReview: () => void;
  showToast: (text: string, action?: string | null, onAction?: () => void) => void;
  toastAction: () => void;
  withFace: (label: string, then: () => void) => void;
  set: (patch: Partial<State>) => void;
}

export type Store = State & Actions;

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let onToast: (() => void) | undefined;

/** Records not confirmed in 12+ months that haven't been confirmed this session. */
export const reviewList = (confirmed: Record<string, boolean>) =>
  Object.values(REC).filter((r) => r.months >= 12 && !confirmed[r.id]);

async function authenticate(label: string): Promise<'ok' | 'failed' | 'unavailable'> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    if (!hasHardware || !enrolled) return 'unavailable';
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: label });
    return res.success ? 'ok' : 'failed';
  } catch {
    return 'unavailable';
  }
}

export const useApp = create<Store>((set, get) => ({
  screen: 'homeOk',
  stack: [],
  anim: 'fade',
  navN: 0,
  scen: 2,
  scenN: 0,
  catId: 'fin',
  recId: 'barclays',
  revealed: {},
  confirmed: {},
  reviewIdx: 0,
  reviewN: 0,
  reviewResults: [],
  picks: { ama: true, kofi: false, efua: false, none: false },
  faceId: false,
  faceLabel: 'Face ID',
  toast: null,
  dialog: null,
  typed: 0,
  secAlert: true,
  locked: false,
  face: true,
  sessions: 3,
  efuaStatus: 'Invited · 3d',
  demoMenu: false,

  set: (patch) => set(patch),

  nav: (screen, kind) =>
    set((s) => ({
      screen,
      anim: kind,
      navN: s.navN + 1,
      stack: kind === 'push' ? [...s.stack, s.screen] : kind === 'pop' ? s.stack.slice(0, -1) : [],
    })),
  push: (screen) => get().nav(screen, 'push'),
  back: () => {
    const { stack } = get();
    get().nav(stack[stack.length - 1] ?? 'homeOk', 'pop');
  },
  tabTo: (screen) => {
    const cur = get().screen;
    if (TABS[cur] === TABS[screen]) return;
    get().nav(screen, 'fade');
  },
  openCat: (id) => {
    set({ catId: id });
    get().nav('category', 'push');
  },
  openRec: (id) => {
    set({ recId: id });
    get().nav('record', 'push');
  },
  openReview: () => {
    set({ reviewIdx: 0, reviewResults: [] });
    get().nav('review', 'push');
  },

  showToast: (text, action = null, onAction) => {
    clearTimeout(toastTimer);
    onToast = onAction;
    set((s) => ({ toast: { text, action, n: (s.toast?.n ?? 0) + 1 } }));
    toastTimer = setTimeout(() => set({ toast: null }), 2800);
  },
  toastAction: () => {
    const f = onToast;
    set({ toast: null });
    f?.();
  },

  // Sensitive actions: use the device's Face ID / biometrics when enrolled,
  // otherwise show the prototype's simulated Face ID overlay for 1.1s.
  withFace: (label, then) => {
    set({ faceId: true, faceLabel: label });
    authenticate(label).then((result) => {
      if (result === 'unavailable') {
        setTimeout(() => {
          set({ faceId: false });
          then();
        }, 1100);
        return;
      }
      set({ faceId: false });
      if (result === 'ok') then();
      else get().showToast('Not confirmed — nothing was changed');
    });
  },
}));
