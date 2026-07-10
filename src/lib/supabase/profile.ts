import { supabase } from './client';
import { Level, Terrain, UserProfile } from '../../types';

/** Port de loadProfile (index.html:3187-3209), sans la partie routage/UI (gérée par l'appelant). */
export function fetchProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single();
}

/** Port de saveProfile (index.html:3211-3223) — utilisé à la fin de l'onboarding. */
export function saveProfile(
  userId: string,
  email: string,
  level: Level,
  terrain: Terrain,
  dist: number,
  theme: 'dark' | 'light' | 'auto',
  name?: string
) {
  const rec: UserProfile = {
    id: userId,
    name: name || email.split('@')[0],
    level,
    preferred_terrain: terrain,
    preferred_dist: Math.round(dist) || 15,
    theme,
    updated_at: new Date().toISOString(),
  };
  return supabase.from('profiles').upsert(rec).select().single();
}

/** Port de savePhysicalData (index.html:3259-3267). */
export function savePhysicalData(profile: UserProfile, vma: number | null, fcMax: number | null) {
  const rec: UserProfile = { ...profile, vma, fc_max: fcMax, updated_at: new Date().toISOString() };
  return supabase.from('profiles').upsert(rec).select().single();
}

/** Sauvegarde immédiate d'une préférence isolée (niveau/terrain/thème), comme accSelectPref (index.html:3270-3288). */
export function updateProfilePreference(
  profile: UserProfile,
  patch: Partial<Pick<UserProfile, 'level' | 'preferred_terrain' | 'theme'>>
) {
  const rec: UserProfile = { ...profile, ...patch, updated_at: new Date().toISOString() };
  return supabase.from('profiles').upsert(rec).select().single();
}
