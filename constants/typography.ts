import { TextStyle } from 'react-native';

export const fontFamilies = {
  display: 'PlayfairDisplay_700Bold',
  displayItalic: 'PlayfairDisplay_400Regular_Italic',
  displayBoldItalic: 'PlayfairDisplay_700Bold_Italic',
  body: 'DMSans_300Light',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export type TypographyVariant =
  | 'display-xl'
  | 'display-lg'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'label'
  | 'caption'
  | 'data';

export const typeScale: Record<TypographyVariant, TextStyle> = {
  'display-xl': {
    fontFamily: fontFamilies.display,
    fontSize: 56,
    lineHeight: 56, // 1.0
  },
  'display-lg': {
    fontFamily: fontFamilies.displayItalic,
    fontSize: 36,
    lineHeight: 39.6, // 1.1
  },
  heading: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 22,
    lineHeight: 27.5, // 1.25
  },
  subheading: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 17,
    lineHeight: 22.95, // 1.35
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 24.75, // 1.65
  },
  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 12,
    lineHeight: 16.8, // 1.4
    letterSpacing: 0.96, // 0.08em × 12px
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    lineHeight: 16.5, // 1.5
  },
  data: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: 14,
    lineHeight: 16.8, // 1.2
  },
} as const;
