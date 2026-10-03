import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { jump } from './actions';
import { eyebrow, FLOWS, START_POINTS, StartButton } from './DemoMenu';
import { T } from './components/ui';
import { InsetsOverride } from './insets';
import { PhoneApp } from './PhoneApp';
import { SCREEN_NAMES, useApp } from './store';
import { color, font } from './theme';

const logo = require('../assets/brand/logo-horizontal.png');

// The iPhone frame from ios-frame.jsx: 402×874, 48 radius, dynamic island,
// status bar and home indicator. Screens get 54/34 insets inside it.
const FRAME_INSETS = { top: 54, bottom: 34, left: 0, right: 0 };

function StatusBar() {
  const c = '#000';
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', paddingTop: 21, paddingHorizontal: 24, paddingBottom: 19 }}>
      <View style={{ flex: 1, height: 22, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ fontWeight: '600', fontSize: 17, lineHeight: 22, color: c }}>9:41</T>
      </View>
      <View style={{ width: 154 }} />
      <View style={{ flex: 1, height: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Svg width={19} height={12} viewBox="0 0 19 12">
          <Rect x={0} y={7.5} width={3.2} height={4.5} rx={0.7} fill={c} />
          <Rect x={4.8} y={5} width={3.2} height={7} rx={0.7} fill={c} />
          <Rect x={9.6} y={2.5} width={3.2} height={9.5} rx={0.7} fill={c} />
          <Rect x={14.4} y={0} width={3.2} height={12} rx={0.7} fill={c} />
        </Svg>
        <Svg width={17} height={12} viewBox="0 0 17 12">
          <Path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill={c} />
          <Path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill={c} />
          <Circle cx={8.5} cy={10.5} r={1.5} fill={c} />
        </Svg>
        <Svg width={27} height={13} viewBox="0 0 27 13">
          <Rect x={0.5} y={0.5} width={23} height={12} rx={3.5} stroke={c} strokeOpacity={0.35} fill="none" />
          <Rect x={2} y={2} width={20} height={9} rx={2} fill={c} />
          <Path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill={c} fillOpacity={0.4} />
        </Svg>
      </View>
    </View>
  );
}

function Device({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ width: 402, height: 874, borderRadius: 48, overflow: 'hidden', backgroundColor: color.canvas, boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)' }}>
      <InsetsOverride value={FRAME_INSETS}>{children}</InsetsOverride>
      <View pointerEvents="none" style={{ position: 'absolute', top: 11, left: 138, width: 126, height: 37, borderRadius: 24, backgroundColor: '#000', zIndex: 50 }} />
      <StatusBar />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 8, left: 131.5, width: 139, height: 5, borderRadius: 100, backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 60 }} />
    </View>
  );
}

/** Web build: the prototype's presentation — sidebar of start points beside the phone. */
export function WebDemo() {
  const screen = useApp((s) => s.screen);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.page }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 48, paddingVertical: 40, paddingHorizontal: 48, alignItems: 'flex-start' }}>
        <View style={{ width: 280, gap: 20 }}>
          <Image source={logo} style={{ height: 34, width: 34 * (590 / 100) }} accessibilityLabel="Last Testament" />
          <T style={{ fontFamily: font.serif, fontSize: 30, lineHeight: 33 }}>Owner app — clickable demo</T>
          <T style={{ fontSize: 14, lineHeight: 21, color: color.inkSecondary }}>
            Tap anything in the phone. Sensitive actions ask for Face ID; the tab bar, cards, rows and buttons navigate.
          </T>
          <View style={{ gap: 6 }}>
            <T style={eyebrow}>Start from</T>
            {START_POINTS.map((p) => (
              <StartButton key={p.screen} label={p.label} onPress={() => jump(p.screen)} />
            ))}
          </View>
          <View style={{ gap: 6 }}>
            <T style={eyebrow}>Try these flows</T>
            <T style={{ fontSize: 13, lineHeight: 21, color: color.inkSecondary }}>{FLOWS.join('\n')}</T>
          </View>
          <T style={{ fontSize: 12, color: color.inkMuted }}>Current: {SCREEN_NAMES[screen]}</T>
        </View>
        <Device>
          <PhoneApp />
        </Device>
      </View>
    </ScrollView>
  );
}
