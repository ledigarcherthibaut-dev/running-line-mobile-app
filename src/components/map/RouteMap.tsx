import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { Paths } from 'expo-file-system';
import { TILE_URLS } from './tileStyles';
import { RouteMapHandle, RouteMapProps } from './RouteMap.types';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const TILE_CACHE_PATH = `${Paths.cache.uri}map-tiles`;

/**
 * Carte native (react-native-maps) — tuiles OSM/OpenTopoMap/Esri satellite via UrlTile,
 * pas de compte Google Maps/Mapbox requis (app.config.ts prévoit une clé Google Maps
 * optionnelle si on bascule provider="google" plus tard, non utilisée ici).
 *
 * Offline : les tuiles sont mises en cache disque au fur et à mesure (tileCachePath) ;
 * hors-ligne, offlineMode bascule sur les tuiles déjà en cache au lieu d'échouer en réseau.
 */
export const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(function RouteMap(
  { initialRegion, tileStyle = 'osm', routes = [], markers = [], onMapPress, onMarkerPress },
  ref
) {
  const mapRef = useRef<MapView>(null);
  const { isOffline } = useNetworkStatus();

  useImperativeHandle(ref, () => ({
    fitToCoordinates(coords) {
      mapRef.current?.fitToCoordinates(
        coords.map((c) => ({ latitude: c.lat, longitude: c.lng })),
        { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
      );
    },
    animateToRegion(region) {
      mapRef.current?.animateToRegion(region, 400);
    },
  }));

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      onPress={onMapPress ? (e) => onMapPress({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude }) : undefined}
    >
      <UrlTile urlTemplate={TILE_URLS[tileStyle]} maximumZ={19} tileCachePath={TILE_CACHE_PATH} offlineMode={isOffline} />
      {routes.map((r) => (
        <Polyline
          key={r.id}
          coordinates={r.coords.map((c) => ({ latitude: c[1], longitude: c[0] }))}
          strokeColor={r.color}
          strokeWidth={4}
        />
      ))}
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.coord.lat, longitude: m.coord.lng }}
          pinColor={m.color}
          title={m.label}
          onPress={() => onMarkerPress?.(m.id)}
        />
      ))}
    </MapView>
  );
});
