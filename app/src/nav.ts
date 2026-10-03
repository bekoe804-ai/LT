import { router, type Href } from 'expo-router';
import { HomeState, useApp } from './store';

/** Push a route onto the stack (native slide on iOS, with swipe-back). */
export const go = (href: string) => router.push(href as Href);

export const back = () => {
  if (router.canGoBack()) router.back();
  else router.replace('/' as Href);
};

const TAB_HREF = { home: '/', testament: '/testament', people: '/people', settings: '/settings' } as const;
export type TabName = keyof typeof TAB_HREF;

/** Switch tab from anywhere, closing pushed screens first. */
export function tab(name: TabName) {
  if (router.canDismiss()) router.dismissAll();
  router.navigate(TAB_HREF[name] as Href);
}

/** Demo jumps: set a Home state and land on Home. */
export function jumpHome(state: HomeState) {
  useApp.getState().set({ homeState: state, demoMenu: false, unlocked: true });
  tab('home');
}

export const openRec = (id: string) => go(`/record/${id}`);
export const openCat = (id: string) => go(`/category/${id}`);
export const openPerson = (id: string) => go(`/person/${id}`);
export const openReview = () => {
  useApp.getState().set({ reviewIdx: 0, reviewResults: [] });
  go('/review');
};
