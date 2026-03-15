import { Easing } from 'react-native-reanimated';

// cubic-bezier(0.16, 1, 0.3, 1) approximation for Reanimated
export const TEMPO_EASING = Easing.bezier(0.16, 1, 0.3, 1);

export const duration = {
  micro: 120,
  elementEnter: 280,
  screenTransition: 320,
  hero: 600,
  modal: 400,
  splashHold: 600,
  splashTotal: 1400,
  typewriterChar: 18,
  checkInPulse: 800,
  focusBorder: 200,
} as const;

export const staggerDelays = [0, 60, 120, 180, 240] as const;

export const enterDistance = 12;
