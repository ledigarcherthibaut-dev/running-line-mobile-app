import { Coord, LatLng } from '../../types';
import { TileStyle } from './tileStyles';

export interface MapMarkerSpec {
  id: string;
  coord: LatLng;
  color: string;
  label?: string;
}

export interface MapRouteSpec {
  id: string;
  coords: Coord[];
  color: string;
}

export interface RouteMapProps {
  initialRegion: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  tileStyle?: TileStyle;
  routes?: MapRouteSpec[];
  markers?: MapMarkerSpec[];
  /** Mode dessin manuel : un tap ajoute un point (index.html onMapClick, 4621-4650). */
  onMapPress?: (coord: LatLng) => void;
  onMarkerPress?: (id: string) => void;
}

export interface RouteMapHandle {
  fitToCoordinates: (coords: LatLng[]) => void;
  animateToRegion: (region: RouteMapProps['initialRegion']) => void;
}
