import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { GeneratedRoute, LatLng, Terrain } from '../types';

/**
 * État partagé entre GenerateScreen / DrawRouteScreen / GenerateResultsScreen (3 écrans
 * séparés du GenerateStack) — évite de sérialiser des tracés (potentiellement des centaines
 * de points) dans les params de navigation.
 */
type GenerateContextValue = {
  terrain: Terrain;
  setTerrain: (t: Terrain) => void;
  distance: number;
  setDistance: (d: number) => void;
  elevation: number;
  setElevation: (e: number) => void;
  userCoords: LatLng | null;
  setUserCoords: (c: LatLng | null) => void;
  results: GeneratedRoute[];
  setResults: (r: GeneratedRoute[]) => void;
};

const GenerateContext = createContext<GenerateContextValue | null>(null);

export function GenerateProvider({ children, defaultTerrain, defaultDistance }: { children: ReactNode; defaultTerrain: Terrain; defaultDistance: number }) {
  const [terrain, setTerrain] = useState<Terrain>(defaultTerrain);
  const [distance, setDistance] = useState(defaultDistance);
  const [elevation, setElevation] = useState(150);
  const [userCoords, setUserCoords] = useState<LatLng | null>(null);
  const [results, setResults] = useState<GeneratedRoute[]>([]);

  const value = useMemo(
    () => ({ terrain, setTerrain, distance, setDistance, elevation, setElevation, userCoords, setUserCoords, results, setResults }),
    [terrain, distance, elevation, userCoords, results]
  );

  return <GenerateContext.Provider value={value}>{children}</GenerateContext.Provider>;
}

export function useGenerate(): GenerateContextValue {
  const ctx = useContext(GenerateContext);
  if (!ctx) throw new Error('useGenerate must be used within a GenerateProvider');
  return ctx;
}
