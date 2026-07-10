import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkTokens, lightTokens, THEME_STORAGE_KEY, type ThemeMode, type ThemeTokens } from './tokens';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedScheme: 'dark' | 'light';
  tokens: ThemeTokens;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(mode: ThemeMode, systemScheme: ReturnType<typeof useColorScheme>): 'dark' | 'light' {
  if (mode === 'auto') return systemScheme === 'light' ? 'light' : 'dark';
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light' || stored === 'auto') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const cycleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'auto' : mode === 'auto' ? 'light' : 'dark');
  }, [mode, setMode]);

  const resolvedScheme = resolveScheme(mode, systemScheme);
  const tokens = resolvedScheme === 'light' ? lightTokens : darkTokens;

  const value = useMemo(
    () => ({ mode, resolvedScheme, tokens, setMode, cycleMode }),
    [mode, resolvedScheme, tokens, setMode, cycleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
