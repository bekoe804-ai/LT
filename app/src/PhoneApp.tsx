import React, { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { native } from './anim';
import { DialogSheet, FaceIdOverlay, TabBar, Toast } from './components/chrome';
import { DemoMenu } from './DemoMenu';
import { Ama, People, ReleasePlan } from './screens/People';
import { HomeMissed, HomeNew, HomeOk } from './screens/Home';
import { Checkin, Security, Settings } from './screens/Settings';
import { AddRecord, Category, RecordScreen, Review, Testament } from './screens/Testament';
import { NavKind, ScreenId, useApp } from './store';
import { color, easeOut } from './theme';

const SCREENS: Record<ScreenId, React.ComponentType> = {
  homeOk: HomeOk,
  homeMissed: HomeMissed,
  homeNew: HomeNew,
  testament: Testament,
  category: Category,
  record: RecordScreen,
  review: Review,
  addRecord: AddRecord,
  people: People,
  ama: Ama,
  releasePlan: ReleasePlan,
  checkin: Checkin,
  settings: Settings,
  security: Security,
};

/**
 * The incoming screen animates in over 340ms:
 * push slides from the right, pop slides back from -30% while fading up, and
 * tab switches / jumps cross-fade with a 6px lift.
 */
function Transition({ kind, width, children }: { kind: NavKind; width: number; children: React.ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  React.useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 340, easing: easeOut, useNativeDriver: native }).start();
  }, [v]);
  const style =
    kind === 'push'
      ? { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }] }
      : kind === 'pop'
        ? {
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
            transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-0.3 * width, 0] }) }],
          }
        : {
            opacity: v,
            transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
          };
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: color.canvas }, style]}>{children}</Animated.View>;
}

export function PhoneApp() {
  const screen = useApp((s) => s.screen);
  const anim = useApp((s) => s.anim);
  const navN = useApp((s) => s.navN);
  const [width, setWidth] = useState(402);
  const Current = SCREENS[screen];
  return (
    <View style={styles.root} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Transition key={navN} kind={anim} width={width}>
        <Current />
      </Transition>
      <TabBar />
      <DialogSheet />
      <FaceIdOverlay />
      <Toast />
      <DemoMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas, overflow: 'hidden' },
});
