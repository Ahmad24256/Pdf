import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  onAccent: string;
  danger: string;
  border: string;
  chip: string;
}

const light: ThemeColors = {
  background: '#f4f6f8',
  surface: '#ffffff',
  text: '#11161b',
  textSecondary: '#5c6672',
  accent: '#0a7d6c',
  onAccent: '#ffffff',
  danger: '#b3261e',
  border: '#e4e8ec',
  chip: '#edf1f4',
};

const dark: ThemeColors = {
  background: '#0e1113',
  surface: '#181d21',
  text: '#eef2f5',
  textSecondary: '#98a2ad',
  accent: '#2fbfa8',
  onAccent: '#06231e',
  danger: '#f0716a',
  border: '#242b30',
  chip: '#20272c',
};

export interface Theme {
  colors: ThemeColors;
  spacing: { xs: number; sm: number; md: number; lg: number };
  radius: { sm: number; md: number; lg: number };
  fontSize: { title: number; header: number; body: number; caption: number };
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return {
    colors: scheme === 'dark' ? dark : light,
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    radius: { sm: 8, md: 12, lg: 20 },
    fontSize: { title: 26, header: 18, body: 16, caption: 12 },
  };
}
