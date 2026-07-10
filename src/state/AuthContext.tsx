import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase/client';
import { fetchProfile } from '../lib/supabase/profile';
import { UserProfile } from '../types';

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  profile: UserProfile | null;
  /** true si connecté mais profil incomplet (level manquant) — cf. loadProfile() (index.html:3187-3209). */
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: (p: UserProfile) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfileState] = useState<UserProfile | null>(null);

  const loadProfileFor = useCallback(async (userId: string) => {
    const { data } = await fetchProfile(userId);
    setProfileState((data as UserProfile) ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) await loadProfileFor(data.session.user.id);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) await loadProfileFor(nextSession.user.id);
      else setProfileState(null);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfileFor]);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfileFor(session.user.id);
  }, [session, loadProfileFor]);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      profile,
      needsOnboarding: !!session && !profile?.level,
      refreshProfile,
      setProfile: setProfileState,
    }),
    [session, isLoading, profile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
