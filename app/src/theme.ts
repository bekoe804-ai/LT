import { Easing, Platform } from 'react-native';

// Colour tokens from the Last Testament foundations (Foundations.dc.html).
export const color = {
  canvas: '#F6F4EF', // ivory app background
  surface: '#FFFFFF',
  surfaceMuted: '#FBFAF7', // selected row
  stone: '#EFE9DD', // warm stone fill (avatars, info panels, Face ID rows)
  search: '#ECE9E2',
  page: '#EBE8E1', // web page behind the phone

  ink: '#1A1A1A',
  inkSecondary: '#5E5C56',
  inkTertiary: '#6B6A66', // section labels
  inkMuted: '#8A8781', // chevrons, footnotes

  brand: '#0B2D26', // deep green — primary actions
  bronze: '#C9B595', // heritage accent
  bronzeInk: '#6B5A3A', // text on stone badges

  hairline: '#EFECE6', // row dividers
  cardRing: '#E8E4DC', // card outline
  border: '#CFCAC0', // secondary button border
  track: '#E3DFD6', // progress / timeline track
  grabber: '#D6D1C7',

  positive: '#2E6B4F',
  positiveBg: '#E4EFE8',
  warning: '#9A6B1E',
  warningBg: '#F7EEDC',
  danger: '#9B3B2E',
  dangerBg: '#F7E4E0',
  info: '#3D5A80',
  infoBg: '#E7ECF2',
  neutralBg: '#ECEAE5',
} as const;

export const font = {
  // Serif is reserved for brand moments (greetings, ceremonial headings).
  serif: 'CormorantGaramond_500Medium',
  jost: 'Jost_400Regular',
  jostMedium: 'Jost_500Medium',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' }),
};

// The prototype's standard curve: cubic-bezier(.2,.8,.2,1)
export const easeOut = Easing.bezier(0.2, 0.8, 0.2, 1);

export const radius = { card: 12, sheet: 20, pill: 999 } as const;
