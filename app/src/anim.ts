import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { easeOut } from './theme';

export const native = Platform.OS !== 'web';

/**
 * Plays a 0→1 entrance whenever `key` changes and returns the driver.
 * Mirrors the prototype's CSS keyframes, which restart on each state change.
 */
export function useEntrance(key: unknown, duration: number, easing = easeOut) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration, easing, useNativeDriver: native }).start();
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

/** fadeA/fadeB: opacity 0→1, translateY 6→0 */
export function fadeUp(v: Animated.Value) {
  return {
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
  };
}

export const easeOutCss = Easing.bezier(0, 0, 0.58, 1);
