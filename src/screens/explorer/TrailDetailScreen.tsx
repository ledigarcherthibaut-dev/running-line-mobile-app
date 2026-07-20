import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteMap } from '../../components/map/RouteMap';
import { RouteMapHandle } from '../../components/map/RouteMap.types';
import { ElevationChart } from '../../components/charts/ElevationChart';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useToast } from '../../state/ToastContext';
import { fetchTrailGeometry } from '../../lib/api/overpass';
import { analyzeElevation } from '../../lib/routing/geo';
import { saveRoute } from '../../lib/supabase/routes';
import { shareRouteAsGPX } from '../../lib/storage/gpx';
import type { TrailDetailParams } from '../../navigation/types';
import { GeneratedRoute } from '../../types';

type TrailDetailRouteProp = RouteProp<{ TrailDetail: TrailDetailParams }, 'TrailDetail'>;
const DEFAULT_REGION = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };

/** Port de loadOSMTrail (index.html:4530-4563) — géométrie complète d'un sentier OSM. */
export function TrailDetailScreen() {
  const { tokens } = useTheme();
  const { params } = useRoute<TrailDetailRouteProp>();
  const { profile } = useAuth();
  const { refresh } = useRoutes();
  const { showToast } = useToast();
  const mapRef = useRef<RouteMapHandle>(null);
  const [route, setRoute] = useState<GeneratedRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTrailGeometry(params.trailId)
      .then(({ coords, distKm }) => {
        if (cancelled) return;
        setRoute({ coords, distKm, elevation: analyzeElevation(coords), name: params.trailName, color: tokens.sky });
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.trailId]);

  useEffect(() => {
    if (route) requestAnimationFrame(() => mapRef.current?.fitToCoordinates(route.coords.map((c) => ({ lat: c[1], lng: c[0] }))));
  }, [route]);

  async function handleSave() {
    if (!route || !profile) return;
    const { error: saveError } = await saveRoute(profile.id, profile.name, route, route.name, 'trail', false, false);
    if (saveError) showToast(saveError.message, true);
    else {
      await refresh();
      showToast('Ajouté à tes parcours', false, 3000, 'save');
    }
  }

  if (loading || !route) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={{ color: error ? tokens.danger : tokens.text2 }}>{error || 'Chargement du sentier…'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.mapArea}>
        <RouteMap ref={mapRef} initialRegion={DEFAULT_REGION} routes={[{ id: 't', coords: route.coords, color: tokens.sky }]} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.name, { color: tokens.text, fontFamily: fonts.display }]}>{route.name}</Text>
        <View style={styles.statsRow}>
          <Stat value={route.distKm.toFixed(1)} label="km" />
          <Stat value={`+${route.elevation.totalAscent}`} label="D+ m" />
          <Stat value={String(route.elevation.maxEle)} label="Alt max" />
        </View>
        <ElevationChart elevations={route.elevation.elevations} color={tokens.sky} height={50} />
        <View style={styles.actions}>
          <Button title="Exporter GPX" icon="share-2" variant="secondary" onPress={() => shareRouteAsGPX(route).catch((e) => showToast(e.message, true))} style={styles.actionBtn} />
          <Button title="Sauvegarder" icon="save" onPress={handleSave} style={styles.actionBtn} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: tokens.surface2, borderColor: tokens.border }]}>
      <Text style={[styles.statVal, { color: tokens.text, fontFamily: fonts.mono }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: tokens.text3, fontFamily: fonts.mono }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  mapArea: { height: '35%' },
  body: { padding: 16, gap: 12 },
  name: { fontSize: 20 },
  statsRow: { flexDirection: 'row', gap: 6 },
  stat: { flex: 1, borderRadius: radii.xs, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  statVal: { fontSize: 14, fontWeight: '700' },
  statLabel: { fontSize: 9 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1 },
});
