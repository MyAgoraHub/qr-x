export const Colors = {
  primary: '#6C63FF',
  primaryDark: '#5850EC',
  primaryLight: '#8B85FF',
  
  secondary: '#00D9FF',
  secondaryDark: '#00B8D9',
  
  success: '#00C851',
  warning: '#FFBB33',
  error: '#FF4444',
  
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6C6C7C',
  
  border: '#2A2A40',
  
  // Content type colors
  typeColors: {
    url: '#00D9FF',
    email: '#FF6B6B',
    phone: '#4ECB71',
    sms: '#FFD93D',
    contact: '#6C63FF',
    wifi: '#FF9F43',
    geo: '#10B981',
    calendar: '#A855F7',
    crypto: '#F7931A',
    text: '#94A3B8',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: Colors.text,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: Colors.textSecondary,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: Colors.textMuted,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    color: Colors.textMuted,
  },
};
