// Environment variables from .env file
// Create .env file in mobile/ directory with:
// EXPO_PUBLIC_API_URL=http://localhost:3000/api
// EXPO_PUBLIC_SOCKET_URL=http://localhost:3000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export const COLORS = {
  primary: '#6a3f2a',
  primaryLight: '#82543e',
  background: '#ffffff',
  text: '#2c2520',
  textMuted: '#8c7b70',
  surface: '#f9f9f9',
  border: '#e5e5e5',
  error: '#ef4444',
  success: '#10b981',
};

/** Loaded via `useAppFonts` — use these names in StyleSheet fontFamily */
export const FONTS = {
  regular: 'Ubuntu',
  medium: 'Ubuntu-Medium',
  bold: 'Ubuntu-Bold',
} as const;


