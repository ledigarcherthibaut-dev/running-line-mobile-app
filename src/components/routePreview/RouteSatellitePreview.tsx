import { useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { Coord } from '../../types';
import { computeAspectBBox } from '../../lib/map/staticBBox';

const MAX_RETRIES = 2;
const EXPORT_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export';

/**
 * Aperçu du tracé sur fond satellite. Anciennement une mosaïque de tuiles composées à la main
 * (plusieurs <Image> positionnées en %) : les arrondis de positionnement laissaient un mince
 * interstice visible entre tuiles (un "trait" au milieu de la photo), et une grille tronquée
 * désynchronisait le tracé de l'image (coupé ou mal placé) sur les parcours plus étendus.
 * Remplacé par UNE seule image satellite pré-cadrée exactement sur la bbox du tracé (endpoint
 * `export` d'ArcGIS, qui accepte une bbox + une taille en pixels et renvoie une image déjà
 * découpée à ce ratio — donc aucune déformation) ; le tracé est ensuite reprojeté en linéaire
 * sur cette même bbox, garantissant un alignement exact avec la photo.
 */
export function RouteSatellitePreview({ coords, color }: { coords: Coord[]; color: string }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0 && (!size || size.width !== width || size.height !== height)) {
      setSize({ width: Math.round(width), height: Math.round(height) });
    }
  }

  if (!coords || coords.length < 2) return <View style={styles.container} onLayout={onLayout} />;
  if (!size) return <View style={styles.container} onLayout={onLayout} />;

  const bbox = computeAspectBBox(coords, size.width / size.height);
  const uri =
    `${EXPORT_URL}?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}` +
    `&bboxSR=4326&imageSR=4326&size=${size.width},${size.height}&format=jpg&f=image`;

  const toPixel = (lng: number, lat: number) => ({
    x: ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * 100,
    y: ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * 100,
  });

  const sample = coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 60)) === 0);
  const points = sample.map((c) => {
    const p = toPixel(c[0], c[1]);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  });
  const start = toPixel(coords[0][0], coords[0][1]);
  const end = toPixel(coords[coords.length - 1][0], coords[coords.length - 1][1]);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <SnapshotImage uri={uri} />
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <Circle cx={start.x} cy={start.y} r={2.2} fill={color} />
        <Circle cx={end.x} cy={end.y} r={2.2} fill="white" stroke={color} strokeWidth={1} />
      </Svg>
    </View>
  );
}

/** Une image satellite gratuite (serveur non garanti) échoue parfois ponctuellement — on retente
 * quelques fois avant d'abandonner et de laisser le fond uni. */
function SnapshotImage({ uri }: { uri: string }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <Image
      key={`${uri}-${attempt}`}
      source={{ uri }}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
      onError={() => {
        if (attempt < MAX_RETRIES) setAttempt((a) => a + 1);
        else setFailed(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#0d1a12' },
});
