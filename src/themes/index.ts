import { Theme, ThemeColors } from '../types';

export const lightThemeColors: ThemeColors = {
  // Background colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  modal: '#FFFFFF',

  // Text colors
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  // Status colors
  primary: '#007AFF',
  secondary: '#8E8E93',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',

  // Input colors
  inputBackground: '#FFFFFF',
  inputBorder: '#DDDDDD',
  inputPlaceholder: '#999999',

  // Tab colors
  tabActive: '#007AFF',
  tabInactive: '#8E8E93',

  // Special colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkThemeColors: ThemeColors = {
  // Background colors
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  modal: '#2C2C2C',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',

  // Border colors
  border: '#404040',
  borderLight: '#333333',

  // Status colors
  primary: '#0A84FF',
  secondary: '#8E8E93',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#64D2FF',

  // Input colors
  inputBackground: '#2C2C2C',
  inputBorder: '#404040',
  inputPlaceholder: '#666666',

  // Tab colors
  tabActive: '#0A84FF',
  tabInactive: '#8E8E93',

  // Special colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightThemeColors,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkThemeColors,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};