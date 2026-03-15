import { useColorScheme } from 'react-native';

const light = {
  // Base
  ground: '#FAFAF8',
  surface: '#F4F3F0',
  border: '#E8E6E1',
  borderMid: '#D4D1CB',

  // Text
  ink: '#1A1916',
  ink2: '#6B6860',
  ink3: '#A8A59E',

  // Accent
  accent: '#2D5A3D',
  accentLight: '#EBF2ED',

  // Agent surface
  agent: '#1A2B3C',
  agentLight: '#EEF1F5',

  // Semantic
  success: '#3A7D5C',
  warning: '#8B6914',
  danger: '#8B2E2E',

  // Tab hues
  reflectGround: '#FAFAF6',
  actGround: '#F6F8FB',
  adaptGround: '#F6FAF7',
} as const;

const dark = {
  ground: '#111110',
  surface: '#1C1B1A',
  border: '#2A2927',
  borderMid: '#3A3835',

  ink: '#F0EEE9',
  ink2: '#908D86',
  ink3: '#5C5A55',

  accent: '#5A9E74',
  accentLight: '#162419',

  agent: '#A8BDD4',
  agentLight: '#111820',

  success: '#3A7D5C',
  warning: '#8B6914',
  danger: '#8B2E2E',

  reflectGround: '#18170F',
  actGround: '#111419',
  adaptGround: '#111812',
} as const;

export type Colors = typeof light & typeof dark;

export function useColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export { light, dark };
