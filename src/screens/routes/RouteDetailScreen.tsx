import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteMap } from '../../components/map/RouteMap';
import { RouteMapHandle } from '../../components/map/RouteMap.types';
import { ElevationChart } from '../../components/charts/ElevationChart';
import { Button } from '../../components/ui/Button';
import { RateRouteModal } from '../../components/RateRouteModal';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useToast } from '../../state/ToastContext';
import { fetchCommunityRouteDetail, saveRoute, submitRating } from '../../lib/supabase/routes';
import { shareRouteAsGPX } from '../../lib/storage/gpx';
import type { RouteDetailParams } from '../../navigation/types';
import { SavedRoute } from '../../types';

type RouteDetailRouteProp = RouteProp<{ RouteDetail: RouteDetailParams }, 'RouteDetail'>;
const DEFAULT_REGION = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };

/** Détail d'un parcours possédé (Mes parcours) ou communautaire (Explorer) — même écran, deux sources de données. */
export function RouteDetailScreen() {
  const { tokens } = useTheme();
  const { params } = useRoute<RouteDetailRouteProp>();
  const { session, profile } = useAuth();
  const { savedRoutes, toggleFavorite, togglePublic, remove, refresh } = useRoutes();
  const { showToast } = useToast();
  const mapRef = useRef<RouteMapHandle>(null);
  const [communityRoute, setCommunityRoute] = useState<SavedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateVisible, setRateVisible] = useState(false);

  const owned = savedRoutes.find((r) => r.id === params.routeId);
  const route = owned ?? communityRoute;

  useEffect(() => {
    if (owned) return;
    let cancelled = false;
    setLoading(true);
    fetchCommunityRouteDetail(params.routeId)
      .then((r) => !cancelled && setCommunityRoute(r))
      .catch((e) => !cancelled && showToast(e.message, true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.routeId, owned]);

  useEffect(() => {
    if (route) {
      requestAnimationFrame(() => mapRef.current?.fitToCoordinates(route.coords.map((c) => ({ lat: c[1], lng: c[0] }))));
    }
  }, [route]);

  async function handleSaveToMine() {
    if (!route || !profile) return;
    const { error } = await saveRoute(profile.id, profile.name, route, route.name, route.terrain, false, false);
    if (error) showToast(error.message, true);
    else {
      await refresh();
      showToast('Ajouté à tes parcours', false, 3000, 'save');
    }
  }

  async function handleRate(score: number, comment: string) {
    if (!route || !session?.user) return;
    const { error } = await submitRating(session.user.id, route.id, score, comment);
    if (error) showToast(error.message, true);
    else showToast(`Note ${score}/5 envoyée !`, false, 3000, 'star');
    setRateVisible(false);
  }

  if (loading || !route) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={{ color: tokens.text2 }}>{loading ? 'Chargement…' : 'Parcours introuvable.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.mapArea}>
        <RouteMap
          ref={mapRef}
          initialRegion={DEFAULT_REGION}
          routes={[{ id: 'r', coords: route.coords, color: tokens.secondary }]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.name, { color: tokens.text, fontFamily: fonts.display }]}>{route.name}</Text>

        <View style={styles.statsRow}>
          <Stat value={route.distKm.toFixed(1)} label="km" />
          <Stat value={`+${route.elevation.totalAscent}`} label="D+ m" />
          <Stat value={String(route.elevation.maxEle)} label="Alt max" />
          <Stat value={String(route.elevation.minEle)} label="Alt min" />
        </View>

        <ElevationChart elevations={route.elevation.elevations} color={tokens.secondary} height={50} />

        <View style={styles.actions}>
          <Button title="Noter" icon="star" variant="secondary" onPress={() => setRateVisible(true)} style={styles.actionBtn} />
          <Button title="Exporter GPX" icon="share-2" onPress={() => shareRouteAsGPX(route).catch((e) => showToast(e.message, true))} style={styles.actionBtn} />
        </View>

        {owned ? (
          <View style={styles.actions}>
            <Button
              title={owned.isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              icon="heart"
              variant="secondary"
              onPress={() => toggleFavorite(owned.id)}
              style={styles.actionBtn}
            />
            <Button
              title={owned.isPublic ? 'Rendre privé' : 'Partager'}
              icon={owned.isPublic ? 'lock' : 'globe'}
              variant="secondary"
              onPress={() => togglePublic(owned.id)}
              style={styles.actionBtn}
            />
          </View>
        ) : (
          <Button title="Sauvegarder dans mes parcours" icon="save" onPress={handleSaveToMine} />
        )}
      </ScrollView>

      <RateRouteModal visible={rateVisible} routeName={route.name} onCancel={() => setRateVisible(false)} onSubmit={handleRate} />
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
