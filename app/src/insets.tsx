import React, { createContext, useContext } from 'react';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * On device we use the real safe-area insets. On web the app is drawn inside an
 * iPhone frame (status bar + home indicator), so the frame supplies fixed insets.
 */
const Override = createContext<EdgeInsets | null>(null);

export function InsetsOverride({ value, children }: { value: EdgeInsets; children: React.ReactNode }) {
  return <Override.Provider value={value}>{children}</Override.Provider>;
}

export function useInsets(): EdgeInsets {
  const real = useSafeAreaInsets();
  return useContext(Override) ?? real;
}
