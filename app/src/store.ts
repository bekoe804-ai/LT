import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { INITIAL_PEOPLE, Person, RecordWithCat } from './data';

export type HomeState = 'ok' | 'missed' | 'new';

export interface DialogOption {
  label: string;
  sub?: string;
  selected?: boolean;
  onPress: () => void;
}

export interface Dialog {
  title: string;
  body: string;
  confirm?: string;
  cancel: string;
  danger?: boolean;
  /** Requires typing DELETE before the confirm button enables. */
  typed?: boolean;
  /** Skip the Face ID step after confirming (low-stakes sheets). */
  noFace?: boolean;
  /** A list of choices instead of a single confirm button. */
  options?: DialogOption[];
  then?: () => void;
}

export interface ReviewResult {
  id: string;
  title: string;
  label: 'Confirmed' | 'To update' | 'Later';
}

export interface Activity {
  id: number;
  text: string;
  when: string;
  href?: string;
}

export interface Notice {
  id: string;
  group: 'Needs you' | 'Earlier';
  kind: 'security' | 'people' | 'review' | 'checkin' | 'system';
  title: string;
  body: string;
  when: string;
  read: boolean;
  href: string;
}

export interface Session {
  id: string;
  device: string;
  where: string;
  when: string;
  current?: boolean;
  suspicious?: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  body: string;
  status: 'Open' | 'Answered';
  created: string;
}

export type RecordPatch = Partial<Pick<RecordWithCat, 'title' | 'fields' | 'to' | 'cond' | 'note' | 'confirmed' | 'months'>>;

interface State {
  /** App lock: Face ID opens the app; signing out returns here. */
  unlocked: boolean;
  lockReason: 'launch' | 'signedOut';
  homeState: HomeState;
  checkedIn: boolean;
  pausedUntil: string | null;
  checkinDays: number;
  channels: { app: boolean; email: boolean; sms: boolean };
  graceDays: number;

  scen: number;
  confirmed: Record<string, boolean>;
  revealed: Record<string, boolean>;
  reviewIdx: number;
  reviewN: number;
  reviewResults: ReviewResult[];

  added: RecordWithCat[];
  archived: Record<string, boolean>;
  deleted: Record<string, boolean>;
  patches: Record<string, RecordPatch>;
  history: Record<string, { text: string; when: string }[]>;

  people: Person[];
  removedPeople: Record<string, boolean>;

  activity: Activity[];
  notices: Notice[];

  faceId: boolean;
  faceDone: boolean;
  faceLabel: string;
  toast: { text: string; action?: string | null; n: number } | null;
  dialog: Dialog | null;
  typed: number;

  secAlert: boolean;
  locked: boolean;
  face: boolean;
  sessions: Session[];
  devices: Session[];
  twoStep: 'app' | 'sms';
  codesUsed: number;
  codesRegenerated: boolean;
  passwordChanged: string;
  recoveryEmail: string;
  recoveryPhone: string;
  accountPausedUntil: string | null;

  profile: { name: string; email: string; phone: string; born: string; address: string };
  prefs: { push: boolean; email: boolean; sms: boolean; reviews: boolean; people: boolean; news: boolean };
  privacy: { blockScreenshots: boolean; analytics: boolean; hideInSwitcher: boolean };
  a11y: { reduceMotion: boolean; largerText: boolean };
  timezone: string;
  tickets: Ticket[];
  exportRequested: boolean;

  demoMenu: boolean;
}

interface Actions {
  set: (patch: Partial<State> | ((s: State) => Partial<State>)) => void;
  showToast: (text: string, action?: string | null, onAction?: () => void) => void;
  toastAction: () => void;
  withFace: (label: string, then: () => void) => void;
  log: (text: string, href?: string) => void;
  recordEvent: (recId: string, text: string) => void;
}

export type Store = State & Actions;

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let onToast: (() => void) | undefined;
let activityN = 10;

const haptic = (kind: 'success' | 'warning' | 'error') => {
  if (Platform.OS === 'web') return;
  const t = { success: Haptics.NotificationFeedbackType.Success, warning: Haptics.NotificationFeedbackType.Warning, error: Haptics.NotificationFeedbackType.Error }[kind];
  Haptics.notificationAsync(t).catch(() => {});
};

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
  unlocked: false,
  lockReason: 'launch',
  homeState: 'ok',
  checkedIn: false,
  pausedUntil: null,
  checkinDays: 30,
  channels: { app: true, email: true, sms: true },
  graceDays: 14,

  scen: 2,
  confirmed: {},
  revealed: {},
  reviewIdx: 0,
  reviewN: 0,
  reviewResults: [],

  added: [],
  archived: {},
  deleted: {},
  patches: {},
  history: {},

  people: INITIAL_PEOPLE,
  removedPeople: {},

  activity: [
    { id: 1, text: 'Kofi accepted your invitation', when: 'Yesterday', href: '/person/kofi' },
    { id: 2, text: 'You updated Aviva life insurance', when: '12 Sep', href: '/record/aviva' },
    { id: 3, text: 'Voice note for Kofi saved', when: '3 Sep', href: '/record/voice' },
  ],
  notices: [
    { id: 'n1', group: 'Needs you', kind: 'security', title: 'New sign-in · iPad · Lagos', body: 'Today 14:02. Was this you?', when: '14:02', read: false, href: '/security' },
    { id: 'n2', group: 'Needs you', kind: 'review', title: '5 records to review', body: 'Added over a year ago — are they still correct?', when: 'Today', read: false, href: '/review' },
    { id: 'n3', group: 'Needs you', kind: 'people', title: 'Efua hasn’t accepted yet', body: 'Invited 3 days ago. You can resend the invitation.', when: 'Wed', read: false, href: '/person/efua' },
    { id: 'n4', group: 'Earlier', kind: 'people', title: 'Kofi accepted your invitation', body: 'He’s now your backup contact.', when: 'Yesterday', read: true, href: '/person/kofi' },
    { id: 'n5', group: 'Earlier', kind: 'checkin', title: 'Check-in confirmed', body: 'Thank you, Nana. Next check-in 9 October.', when: '9 Sep', read: true, href: '/checkin-settings' },
    { id: 'n6', group: 'Earlier', kind: 'system', title: 'Your documents are now encrypted at rest', body: 'A routine security upgrade — nothing for you to do.', when: '1 Sep', read: true, href: '/settings/privacy' },
  ],

  faceId: false,
  faceDone: false,
  faceLabel: 'Face ID',
  toast: null,
  dialog: null,
  typed: 0,

  secAlert: true,
  locked: false,
  face: true,
  sessions: [
    { id: 's1', device: 'iPhone 16 · this device', where: 'Croydon, UK', when: 'Active now', current: true },
    { id: 's2', device: 'MacBook Air · Safari', where: 'Croydon, UK', when: '2 hours ago' },
    { id: 's3', device: 'iPad · Last Testament app', where: 'Lagos, Nigeria', when: 'Today 14:02', suspicious: true },
  ],
  devices: [
    { id: 'd1', device: 'iPhone 16', where: 'Added 14 Mar 2026', when: 'Face ID', current: true },
    { id: 'd2', device: 'MacBook Air', where: 'Added 2 Jun 2026', when: 'Password + authenticator' },
  ],
  twoStep: 'app',
  codesUsed: 2,
  codesRegenerated: false,
  passwordChanged: 'Changed 4 months ago',
  recoveryEmail: 'nana.mensah62@gmail.com',
  recoveryPhone: '+44 7700 900 318',
  accountPausedUntil: null,

  profile: { name: 'Nana Mensah', email: 'nana@example.com', phone: '+44 7700 900 318', born: '14 February 1962', address: '14 Elm Road, Croydon CR0' },
  prefs: { push: true, email: true, sms: true, reviews: true, people: true, news: false },
  privacy: { blockScreenshots: true, analytics: false, hideInSwitcher: true },
  a11y: { reduceMotion: false, largerText: false },
  timezone: 'London (GMT+1)',
  tickets: [],
  exportRequested: false,

  demoMenu: false,

  set: (patch) => set(patch as never),

  showToast: (text, action = null, onAction) => {
    clearTimeout(toastTimer);
    onToast = onAction;
    set((s) => ({ toast: { text, action, n: (s.toast?.n ?? 0) + 1 } }));
    toastTimer = setTimeout(() => set({ toast: null }), 3000);
  },
  toastAction: () => {
    const f = onToast;
    clearTimeout(toastTimer);
    set({ toast: null });
    f?.();
  },

  log: (text, href) => set((s) => ({ activity: [{ id: ++activityN, text, when: 'Just now', href }, ...s.activity].slice(0, 8) })),
  recordEvent: (recId, text) =>
    set((s) => ({ history: { ...s.history, [recId]: [{ text, when: 'Just now' }, ...(s.history[recId] ?? [])] } })),

  // Sensitive actions: use the device's Face ID / biometrics when enrolled,
  // otherwise play a simulated Face ID scan (0.9s) and success tick (0.35s).
  withFace: (label, then) => {
    set({ faceId: true, faceDone: false, faceLabel: label });
    authenticate(label).then((result) => {
      if (result === 'failed') {
        set({ faceId: false });
        haptic('error');
        get().showToast('Not confirmed — nothing was changed');
        return;
      }
      const scan = result === 'unavailable' ? 900 : 0;
      setTimeout(() => {
        set({ faceDone: true });
        haptic('success');
        setTimeout(() => {
          set({ faceId: false, faceDone: false });
          then();
        }, 380);
      }, scan);
    });
  },
}));

export const hapticWarning = () => haptic('warning');
