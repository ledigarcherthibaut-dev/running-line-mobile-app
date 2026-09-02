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
  /** true une fois la lecture AsyncStorage terminée (trouvée ou non) — sert à savoir quand il
   * est possible de décider si une préférence distante (profil) doit être appliquée. */
  localPreferenceLoaded: boolean;
  /** true si CET appareil a déjà un choix de thème (stocké ou fait dans la session) — permet à
   * un connecteur externe de n'appliquer le thème du profil Supabase que sur un appareil neuf
   * (nouvelle installation/nouveau téléphone), jamais par-dessus un choix local existant. */
  hasLocalPreference: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(mode: ThemeMode, systemScheme: ReturnType<typeof useColorScheme>): 'dark' | 'light' {
  if (mode === 'auto') return systemScheme === 'light' ? 'light' : 'dark';
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  // Clair par défaut tant que l'utilisateur n'a pas choisi explicitement (à l'onboarding ou
  // plus tard) — le sombre reste disponible via l'onboarding ou le sélecteur du Compte.
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [localPreferenceLoaded, setLocalPreferenceLoaded] = useState(false);
  const [hasLocalPreference, setHasLocalPreference] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light' || stored === 'auto') {
        setModeState(stored);
        setHasLocalPreference(true);
      }
      setLocalPreferenceLoaded(true);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setHasLocalPreference(true);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
  }, []);

  const cycleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'auto' : mode === 'auto' ? 'light' : 'dark');
  }, [mode, setMode]);

  const resolvedScheme = resolveScheme(mode, systemScheme);
  const tokens = resolvedScheme === 'light' ? lightTokens : darkTokens;

  const value = useMemo(
    () => ({ mode, resolvedScheme, tokens, setMode, cycleMode, localPreferenceLoaded, hasLocalPreference }),
    [mode, resolvedScheme, tokens, setMode, cycleMode, localPreferenceLoaded, hasLocalPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
