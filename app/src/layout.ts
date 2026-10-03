import { Platform } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';

/**
 * Smooth re-layout when items are added or removed. Disabled on web, where
 * Reanimated measures positions including the stack's slide transform and
 * leaves content offset after a back navigation.
 */
export const smooth = Platform.OS === 'web' ? undefined : LinearTransition.springify().damping(20).stiffness(220);
