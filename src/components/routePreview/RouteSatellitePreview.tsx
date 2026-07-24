import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { Coord } from '../../types';
import { TILE_URLS } from '../map/tileStyles';
import { latToTileYFrac, lonToTileXFrac, pickTileGrid } from '../../lib/map/tileMath';

/**
 * Aperçu du tracé sur fond satellite (mosaïque de tuiles Esri World_Imagery + ligne du parcours
 * superposée en SVG, reprojetée dans le même espace de tuiles pour rester alignée avec l'image).
 * Remplace RoutePreviewSvg (silhouette sur fond uni) sur les cartes de parcours existants.
 */
export function RouteSatellitePreview({ coords, color }: { coords: Coord[]; color: string }) {
  if (!coords || coords.length < 2) return null;

  const sample = coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 60)) === 0);
  const lats = sample.map((c) => c[1]);
  const lngs = sample.map((c) => c[0]);
  const bounds = { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) };
  const grid = pickTileGrid(bounds, 2);

  const toPixel = (lng: number, lat: number) => ({
    x: ((lonToTileXFrac(lng, grid.zoom) - grid.minTileX) / grid.cols) * 100,
    y: ((latToTileYFrac(lat, grid.zoom) - grid.minTileY) / grid.rows) * 100,
  });

  const points = sample.map((c) => {
    const p = toPixel(c[0], c[1]);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  });
  const start = toPixel(sample[0][0], sample[0][1]);
  const end = toPixel(sample[sample.length - 1][0], sample[sample.length - 1][1]);

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
        <Image
          key={`${t.x}-${t.y}`}
          source={{ uri: t.uri }}
          style={{
            position: 'absolute',
            left: `${(t.x / grid.cols) * 100}%`,
            top: `${(t.y / grid.rows) * 100}%`,
            width: `${(1 / grid.cols) * 100}%`,
            height: `${(1 / grid.rows) * 100}%`,
          }}
          resizeMode="cover"
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

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#0d1a12' },
});
