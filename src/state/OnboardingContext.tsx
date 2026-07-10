import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Level, Terrain } from '../types';

/** Choix éphémères des 3 étapes d'onboarding avant sauvegarde du profil — cf. obChoices (index.html:2973). */
export interface OnboardingChoices {
  level?: Level;
  terrain?: Terrain;
  dist?: string;
}

type OnboardingContextValue = {
  choices: OnboardingChoices;
  setChoice: <K extends keyof OnboardingChoices>(key: K, value: OnboardingChoices[K]) => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [choices, setChoices] = useState<OnboardingChoices>({});

  const setChoice = useCallback(<K extends keyof OnboardingChoices>(key: K, value: OnboardingChoices[K]) => {
    setChoices((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setChoices({}), []);

  const value = useMemo(() => ({ choices, setChoice, reset }), [choices, setChoice, reset]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within an OnboardingProvider');
  return ctx;
}
