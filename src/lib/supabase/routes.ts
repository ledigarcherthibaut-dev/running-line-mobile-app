import { supabase } from './client';
import { Coord, RouteElevation, SavedRoute, Terrain } from '../../types';

interface RouteRow {
  id: string;
  name: string;
  is_fav: boolean;
  dist_km: number;
  elevation: RouteElevation;
  terrain: Terrain;
  coords: Coord[];
  is_public: boolean;
}

export function rowToSavedRoute(r: RouteRow): SavedRoute {
  return {
    id: r.id,
    name: r.name,
    isFav: r.is_fav,
    distKm: r.dist_km,
    elevation: r.elevation,
    terrain: r.terrain,
    coords: r.coords,
    isPublic: r.is_public,
  };
}

/** Port de fetchSavedRoutes (index.html:3427-3442). */
export function fetchSavedRoutes(userId: string) {
  return supabase.from('routes').select('*').eq('user_id', userId).order('saved_at', { ascending: false });
}

/** Port de saveRouteDB (index.html:3444-3460). */
export function saveRoute(
  userId: string,
  userName: string,
  route: { coords: Coord[]; distKm: number; elevation: RouteElevation },
  name: string,
  terrain: Terrain,
  isFav: boolean,
  isPublic: boolean
) {
  const full = {
    user_id: userId,
    name,
    is_fav: isFav,
    dist_km: route.distKm,
    elevation: {
      totalAscent: route.elevation.totalAscent,
      maxEle: route.elevation.maxEle,
      minEle: route.elevation.minEle,
    },
    terrain,
    coords: route.coords,
    user_name: userName,
    is_public: isPublic,
    saved_at: new Date().toISOString(),
  };
  return supabase.from('routes').insert([full]);
}

export function renameRoute(userId: string, routeId: string, name: string) {
  return supabase.from('routes').update({ name }).eq('id', routeId).eq('user_id', userId);
}

/** Port de toggleFav (index.html:3462-3468). */
export function toggleFavorite(userId: string, routeId: string, isFav: boolean) {
  return supabase.from('routes').update({ is_fav: isFav }).eq('id', routeId).eq('user_id', userId);
}

/** Port de deleteSaved (index.html:3470-3474). */
export function deleteRoute(userId: string, routeId: string) {
  return supabase.from('routes').delete().eq('id', routeId).eq('user_id', userId);
}

/** Port de toggleRoutePublic / shareRouteCommunity, identiques (index.html:4796-4829). */
export function togglePublic(userId: string, routeId: string, isPublic: boolean) {
  return supabase.from('routes').update({ is_public: isPublic }).eq('id', routeId).eq('user_id', userId);
}

export interface CommunityRoute {
  id: string;
  name: string;
  distKm: number;
  elevation: RouteElevation;
  terrain: Terrain;
  userName: string;
  savedAt: string;
  avgRating: number;
  ratingCount: number;
}

/** Port de loadCommunityRoutes (index.html:3691-3750), sans le rendu HTML. */
export async function fetchCommunityRoutes(): Promise<CommunityRoute[]> {
  const { data: rows, error } = await supabase
    .from('routes')
    .select('id,name,dist_km,elevation,terrain,coords,user_name,saved_at')
    .eq('is_public', true)
    .order('saved_at', { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  if (!rows?.length) return [];

  const ids = rows.map((r: any) => r.id);
  const { data: ratings } = await supabase.from('ratings').select('route_id,score').in('route_id', ids);
  const byRoute: Record<string, number[]> = {};
  (ratings || []).forEach((r: any) => {
    (byRoute[r.route_id] ??= []).push(r.score);
  });

  return rows.map((r: any): CommunityRoute => {
    const scores = byRoute[r.id] || [];
    const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    return {
      id: r.id,
      name: r.name,
      distKm: r.dist_km,
      elevation: r.elevation,
      terrain: r.terrain,
      userName: r.user_name || 'Anonyme',
      savedAt: r.saved_at,
      avgRating: avg,
      ratingCount: scores.length,
    };
  });
}

/** Port de loadCommunityRoute (index.html:3752-3766). */
export async function fetchCommunityRouteDetail(id: string): Promise<SavedRoute> {
  const { data, error } = await supabase.from('routes').select('*').eq('id', id).single();
  if (error || !data) throw new Error('Impossible de charger ce parcours.');
  return rowToSavedRoute(data as RouteRow);
}

/** Port de submitRating (index.html:3490-3501) — une note par user/route, upsert sur conflit. */
export function submitRating(userId: string, routeId: string, score: number, comment: string) {
  return supabase
    .from('ratings')
    .upsert([{ user_id: userId, route_id: routeId, score, comment }], { onConflict: 'user_id,route_id' });
}
