import { supabase } from './client';

/**
 * Suppression RGPD des données applicatives d'un utilisateur (parcours, notes, profil).
 * Ne supprime pas la ligne auth.users elle-même : ça nécessite la clé service_role,
 * qui ne doit jamais être embarquée côté client — la clé anon ne le permet pas.
 * L'appelant doit déconnecter l'utilisateur juste après (session Supabase toujours valide sinon).
 */
export async function deleteAccountData(userId: string): Promise<void> {
  const { error: ratingsError } = await supabase.from('ratings').delete().eq('user_id', userId);
  if (ratingsError) throw new Error(ratingsError.message);

  const { error: routesError } = await supabase.from('routes').delete().eq('user_id', userId);
  if (routesError) throw new Error(routesError.message);

  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
  if (profileError) throw new Error(profileError.message);
}
