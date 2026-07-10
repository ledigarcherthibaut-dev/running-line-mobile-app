import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, CameraRef, GeoJSONSource, Layer, Map as MapLibreMap, MapRef, Marker, RasterSource } from '@maplibre/maplibre-react-native';
import { TILE_URLS } from './tileStyles';
import { RouteMapHandle, RouteMapProps } from './RouteMap.types';
import { useTheme } from '../../theme/ThemeContext';

/**
 * Carte native — MapLibre (open-source, aucune clé/compte requis) plutôt que
 * react-native-maps : sur Android, react-native-maps dépend du SDK Google Maps même
 * pour un simple fond de carte OSM (UrlTile par-dessus), ce qui exige une clé Google
 * Cloud avec facturation liée. Comme l'app n'affiche de toute façon que des tuiles
 * raster gratuites (OSM/OpenTopoMap/Esri), MapLibre est un meilleur fit : gratuit,
 * pas de compte, et permet d'évoluer vers des tuiles vectorielles plus tard.
 */
const EMPTY_STYLE = { version: 8 as const, sources: {}, layers: [] };

export const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(function RouteMap(
  { initialRegion, tileStyle = 'osm', routes = [], markers = [], onMapPress, onMarkerPress },
  ref
) {
  const { tokens } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);

  useImperativeHandle(ref, () => ({
    fitToCoordinates(coords) {
      if (!coords.length) return;
      const lngs = coords.map((c) => c.lng);
      const lats = coords.map((c) => c.lat);
      cameraRef.current?.fitBounds(
        [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
        { padding: { top: 60, right: 60, bottom: 60, left: 60 }, duration: 500 }
      );
    },
    animateToRegion(region) {
      cameraRef.current?.flyTo({ center: [region.longitude, region.latitude], zoom: 13, duration: 500 });
    },
  }));

  return (
    <MapLibreMap
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      mapStyle={EMPTY_STYLE}
      onPress={
        onMapPress
          ? (e) => onMapPress({ lat: e.nativeEvent.lngLat[1], lng: e.nativeEvent.lngLat[0] })
          : undefined
      }
    >
      <Camera ref={cameraRef} initialViewState={{ center: [initialRegion.longitude, initialRegion.latitude], zoom: 12 }} />

      <RasterSource id="base-tiles" tiles={[TILE_URLS[tileStyle]]} tileSize={256} minzoom={0} maxzoom={19}>
        <Layer id="base-tiles-layer" type="raster" source="base-tiles" />
      </RasterSource>

      {routes.map((r) => (
        <GeoJSONSource
          key={r.id}
          id={r.id}
          data={{
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: r.coords.map((c) => [c[0], c[1]]) },
          }}
        >
          <Layer
            id={`${r.id}-line`}
            type="line"
            source={r.id}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': r.color, 'line-width': 4, 'line-opacity': 0.88 }}
          />
        </GeoJSONSource>
      ))}

      {markers.map((m) => (
        <Marker key={m.id} id={m.id} lngLat={[m.coord.lng, m.coord.lat]} onPress={() => onMarkerPress?.(m.id)}>
          <View style={[styles.marker, { backgroundColor: m.color, borderColor: tokens.text }]} />
        </Marker>
      ))}
    </MapLibreMap>
  );
});

const styles = StyleSheet.create({
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
});
