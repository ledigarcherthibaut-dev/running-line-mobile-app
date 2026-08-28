import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as routesApi from '../lib/supabase/routes';
import { readCache, writeCache } from '../lib/storage/offlineCache';
import { SavedRoute } from '../types';

/**
 * Équivalent du tableau global `savedRoutes` (index.html:2954), partagé par Accueil,
 * Mes parcours et Compte.
 *
 * Offline-first : la dernière liste connue est mise en cache localement par utilisateur et
 * réhydratée immédiatement au démarrage. Si le fetch réseau échoue (hors-ligne), on garde
 * les données en cache plutôt que de vider l'écran.
 */
type RoutesContextValue = {
  savedRoutes: SavedRoute[];
  loading: boolean;
  refresh: () => Promise<void>;
  toggleFavorite: (routeId: string) => Promise<void>;
  togglePublic: (routeId: string) => Promise<void>;
  rename: (routeId: string, name: string) => Promise<void>;
  remove: (routeId: string) => Promise<void>;
};

const RoutesContext = createContext<RoutesContextValue | null>(null);

function cacheKeyFor(userId: string) {
  return `saved_routes_${userId}`;
}

export function RoutesProvider({ children }: { children: ReactNode }) {
  const { session, needsOnboarding } = useAuth();
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.user) {
      setSavedRoutes([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await routesApi.fetchSavedRoutes(session.user.id);
      if (error) throw new Error(error.message);
      const mapped = (data ?? []).map(routesApi.rowToSavedRoute);
      setSavedRoutes(mapped);
      writeCache(cacheKeyFor(session.user.id), mapped);
    } catch {
      // Hors-ligne / erreur réseau : on garde les données déjà affichées (cache ou précédent fetch).
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user || needsOnboarding) {
      setSavedRoutes([]);
      return;
    }
    const userId = session.user.id;
    let cancelled = false;
    // Le fetch réseau fait autorité sur le cache local : si le cache (AsyncStorage) répond
    // après que refresh() a déjà posé des données fraîches, il ne doit pas les écraser avec
    // d'anciennes valeurs — d'où le drapeau plutôt qu'un simple fire-and-forget des deux en parallèle.
    let refreshed = false;
    readCache<SavedRoute[]>(cacheKeyFor(userId)).then((cached) => {
      if (!cancelled && cached && !refreshed) setSavedRoutes(cached);
    });
    refresh().finally(() => {
      refreshed = true;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, needsOnboarding]);

  const toggleFavorite = useCallback(
    async (routeId: string) => {
      if (!session?.user) return;
      const r = savedRoutes.find((x) => x.id === routeId);
      if (!r) return;
      await routesApi.toggleFavorite(session.user.id, routeId, !r.isFav);
      setSavedRoutes((prev) => {
        const next = prev.map((x) => (x.id === routeId ? { ...x, isFav: !x.isFav } : x));
        writeCache(cacheKeyFor(session.user.id), next);
        return next;
      });
    },
    [session, savedRoutes]
  );

  const togglePublic = useCallback(
    async (routeId: string) => {
      if (!session?.user) return;
      const r = savedRoutes.find((x) => x.id === routeId);
      if (!r) return;
      await routesApi.togglePublic(session.user.id, routeId, !r.isPublic);
      setSavedRoutes((prev) => {
        const next = prev.map((x) => (x.id === routeId ? { ...x, isPublic: !x.isPublic } : x));
        writeCache(cacheKeyFor(session.user.id), next);
        return next;
      });
    },
    [session, savedRoutes]
  );

  const rename = useCallback(
    async (routeId: string, name: string) => {
      if (!session?.user) return;
      const { error } = await routesApi.renameRoute(session.user.id, routeId, name);
      if (error) throw new Error(error.message);
      setSavedRoutes((prev) => {
        const next = prev.map((x) => (x.id === routeId ? { ...x, name } : x));
        writeCache(cacheKeyFor(session.user.id), next);
        return next;
      });
    },
    [session]
  );

  const remove = useCallback(
    async (routeId: string) => {
      if (!session?.user) return;
      await routesApi.deleteRoute(session.user.id, routeId);
      setSavedRoutes((prev) => {
        const next = prev.filter((x) => x.id !== routeId);
        writeCache(cacheKeyFor(session.user.id), next);
        return next;
      });
    },
    [session]
  );

  const value = useMemo(
    () => ({ savedRoutes, loading, refresh, toggleFavorite, togglePublic, rename, remove }),
    [savedRoutes, loading, refresh, toggleFavorite, togglePublic, rename, remove]
  );

  return <RoutesContext.Provider value={value}>{children}</RoutesContext.Provider>;
}

export function useRoutes(): RoutesContextValue {
  const ctx = useContext(RoutesContext);
  if (!ctx) throw new Error('useRoutes must be used within a RoutesProvider');
  return ctx;
}
