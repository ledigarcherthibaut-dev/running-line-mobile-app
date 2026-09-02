import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { Coord } from '../../types';
import { TILE_URLS } from '../map/tileStyles';
import { latToTileYFrac, lonToTileXFrac, pickTileGrid } from '../../lib/map/tileMath';

const MAX_TILE_RETRIES = 2;

/**
 * Aperçu du tracé sur fond satellite (mosaïque de tuiles Esri World_Imagery + ligne du parcours
 * superposée en SVG, reprojetée dans le même espace de tuiles pour rester alignée avec l'image).
 * Remplace RoutePreviewSvg (silhouette sur fond uni) sur les cartes de parcours existants.
 */
export function RouteSatellitePreview({ coords, color }: { coords: Coord[]; color: string }) {
  if (!coords || coords.length < 2) return null;

  // Bornes calculées sur le tracé COMPLET, pas un échantillon — un point extrême écarté par
  // l'échantillonnage pouvait sortir de la grille de tuiles choisie et se retrouver hors-cadre.
  const lats = coords.map((c) => c[1]);
  const lngs = coords.map((c) => c[0]);
  const bounds = { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
  const grid = pickTileGrid(bounds, 2);

  const sample = coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 60)) === 0);

  const toPixel = (lng: number, lat: number) => ({
    x: ((lonToTileXFrac(lng, grid.zoom) - grid.minTileX) / grid.cols) * 100,
    y: ((latToTileYFrac(lat, grid.zoom) - grid.minTileY) / grid.rows) * 100,
  });

  const points = sample.map((c) => {
    const p = toPixel(c[0], c[1]);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  });
  const start = toPixel(coords[0][0], coords[0][1]);
  const end = toPixel(coords[coords.length - 1][0], coords[coords.length - 1][1]);

  const tiles: { x: number; y: number; uri: string }[] = [];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const uri = TILE_URLS.satellite
        .replace('{z}', String(grid.zoom))
        .replace('{x}', String(grid.minTileX + col))
        .replace('{y}', String(grid.minTileY + row));
      tiles.push({ x: col, y: row, uri });
    }
  }

  return (
    <View style={styles.container}>
      {tiles.map((t) => (
        <Tile
          key={`${grid.zoom}-${t.x}-${t.y}`}
          uri={t.uri}
          style={{
            position: 'absolute',
            left: `${(t.x / grid.cols) * 100}%`,
            top: `${(t.y / grid.rows) * 100}%`,
            width: `${(1 / grid.cols) * 100}%`,
            height: `${(1 / grid.rows) * 100}%`,
          }}
        />
      ))}
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <Circle cx={start.x} cy={start.y} r={2.2} fill={color} />
        <Circle cx={end.x} cy={end.y} r={2.2} fill="white" stroke={color} strokeWidth={1} />
      </Svg>
    </View>
  );
}

/**
 * Les tuiles Esri (serveur gratuit, non garanti) échouent parfois ponctuellement — sans retry, une
 * tuile en erreur reste un trou vide sous le tracé en permanence. On retente quelques fois avant
 * d'abandonner sur cette tuile précise.
 */
function Tile({ uri, style }: { uri: string; style: object }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <Image
      key={attempt}
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={() => {
        if (attempt < MAX_TILE_RETRIES) setAttempt((a) => a + 1);
        else setFailed(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#0d1a12' },
});
