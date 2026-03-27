import { Platform, StyleSheet } from 'react-native';

export const colors = {
  primary: '#A9BFA0',
  primaryForeground: '#faf8f3',
  background: '#f8f7f4',
  foreground: '#5a6b52',
  card: '#ffffff',
  cardForeground: '#1a1f2e',
  secondary: '#ced4bf',
  secondaryForeground: '#1a1f2e',
  muted: '#e8e6e1',
  mutedForeground: '#6b7280',
  accent: '#d5d2c3',
  accentForeground: '#1a1f2e',
  border: '#e8e6e1',
  input: '#ffffff',
  destructive: '#c73e3a',
  destructiveForeground: '#ffffff',
  // Special
  liveBg: '#e8f5e9',
  liveText: '#2e7d32',
  selectedBg: '#fafff8',
  warningBg: '#fff8e6',
  warningText: '#8b6914',
  warningIcon: '#d4a500',
  infoBg: '#f0f5ed',
  pendingBg: '#f0f0f0',
  pendingText: '#6b7280',
  surfaceMuted: '#eef3eb',
  surfaceSubtle: '#faf9f7',
  overlay: 'rgba(0,0,0,0.5)',
  searchSurface: '#f2f1ee',
  dividerLight: 'rgba(0,0,0,0.06)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 4,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '500' as const },
  labelSmall: { fontSize: 12, fontWeight: '600' as const },
  button: { fontSize: 16, fontWeight: '500' as const },
  navLabel: { fontSize: 11, fontWeight: '500' as const, letterSpacing: -0.2 },
};

export const shadows = {
  card: Platform.select({
    web: { boxShadow: '0 1px 3px rgba(0,0,0,0.04)' } as any,
    default: { elevation: 1 },
  }),
  toast: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } as any,
    default: { elevation: 5 },
  }),
  container: Platform.select({
    web: { boxShadow: '0 0 40px rgba(0,0,0,0.1)', minHeight: '100dvh' } as any,
    default: {},
  }),
};

export const borderWidths = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  medium: 1.5,
  thick: 2,
};

export const animation = {
  pressScale: 0.98,
};

export const MAX_WIDTH = 430;
