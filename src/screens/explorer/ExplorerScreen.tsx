import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { RouteMap } from '../../components/map/RouteMap';
import { RouteMapHandle } from '../../components/map/RouteMap.types';
import { RouteSatellitePreview } from '../../components/routePreview/RouteSatellitePreview';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, lightTokens, radii } from '../../theme/tokens';
import { getUserLocation, LocationError } from '../../lib/location/location';
import { fetchNearbyTrails, OSMTrail, TrailType } from '../../lib/api/overpass';
import { fetchCommunityRoutes, CommunityRoute } from '../../lib/supabase/routes';
import type { ExplorerStackParamList } from '../../navigation/types';
import { LatLng, Terrain } from '../../types';

type Props = NativeStackScreenProps<ExplorerStackParamList, 'ExplorerScreen'>;
type Tab = 'trails' | 'community';
type TrailFilter = 'all' | TrailType;
type CommunityFilter = 'all' | Terrain;
type FeatherName = keyof typeof Feather.glyphMap;

const TRAIL_BADGE: Record<TrailType, FeatherName> = { foot: 'compass', bicycle: 'wind', mtb: 'trending-up' };
const TRAIL_FILTER_LABEL: Record<TrailType, string> = { foot: 'Pédestre', bicycle: 'Vélo', mtb: 'VTT' };
const DEFAULT_REGION = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };
/** Couleurs de marque, identiques en clair/sombre (cf. theme/tokens.ts) — utilisables hors composant. */
const MARKER_COLOR: Record<TrailType, string> = { foot: lightTokens.sky, bicycle: lightTokens.energy, mtb: lightTokens.secondary };

const COMMUNITY_FILTERS: { value: CommunityFilter; label: string; icon?: FeatherName }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'trail', label: 'Trail', icon: 'trending-up' },
  { value: 'road', label: 'Route', icon: 'navigation' },
  { value: 'mixed', label: 'Mixte', icon: 'git-merge' },
];

/** Port de #page-explorer (index.html:751-786) — onglets Sentiers OSM / Communauté. */
export function ExplorerScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const [tab, setTab] = useState<Tab>('trails');
  const mapRef = useRef<RouteMapHandle>(null);

  const [trails, setTrails] = useState<OSMTrail[]>([]);
  const [trailFilter, setTrailFilter] = useState<TrailFilter>('all');
  const [loadingTrails, setLoadingTrails] = useState(false);
  const [trailsError, setTrailsError] = useState('');
  const [searchCenter, setSearchCenter] = useState<LatLng | null>(null);

  const [community, setCommunity] = useState<CommunityRoute[]>([]);
  const [communityFilter, setCommunityFilter] = useState<CommunityFilter>('all');
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [communityLoaded, setCommunityLoaded] = useState(false);

  async function loadTrails() {
    setLoadingTrails(true);
    setTrailsError('');
    try {
      const center = await getUserLocation();
      setSearchCenter(center);
      const found = await fetchNearbyTrails(center);
      setTrails(found);
      const points = [center, ...found.map((t) => t.center).filter((c): c is LatLng => !!c)];
      requestAnimationFrame(() => mapRef.current?.fitToCoordinates(points));
    } catch (e) {
      setTrailsError(e instanceof LocationError ? e.message : (e as Error).message);
    } finally {
      setLoadingTrails(false);
    }
  }

  async function loadCommunity() {
    setLoadingCommunity(true);
    setCommunityError('');
    try {
      setCommunity(await fetchCommunityRoutes());
      setCommunityLoaded(true);
    } catch (e) {
      setCommunityError((e as Error).message);
    } finally {
      setLoadingCommunity(false);
    }
  }

  function switchTab(next: Tab) {
    setTab(next);
    if (next === 'community' && !communityLoaded) loadCommunity();
  }

  const filteredTrails = trailFilter === 'all' ? trails : trails.filter((t) => t.type === trailFilter);
  const filteredCommunity = communityFilter === 'all' ? community : community.filter((r) => r.terrain === communityFilter);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.tabRow}>
        <TabButton icon="compass" label="Sentiers" active={tab === 'trails'} onPress={() => switchTab('trails')} />
        <TabButton icon="globe" label="Communauté" active={tab === 'community'} onPress={() => switchTab('community')} />
      </View>

      {tab === 'trails' ? (
        <View style={styles.flex}>
          {trails.length === 0 && !loadingTrails ? (
            <View style={styles.empty}>
              <Feather name="compass" size={36} color={tokens.text3} />
              <Text style={[styles.emptyTitle, { color: tokens.text, fontFamily: fonts.display }]}>Sentiers autour de toi</Text>
              <Text style={[styles.emptySub, { color: tokens.text2 }]}>Localise-toi pour découvrir les sentiers OSM dans un rayon de 25km.</Text>
              <Button title="Chercher autour de moi" icon="map-pin" onPress={loadTrails} loading={loadingTrails} />
            </View>
          ) : (
            <>
              <View style={styles.trailMapArea}>
                <RouteMap
                  ref={mapRef}
                  initialRegion={searchCenter ? { latitude: searchCenter.lat, longitude: searchCenter.lng, latitudeDelta: 0.3, longitudeDelta: 0.3 } : DEFAULT_REGION}
                  markers={filteredTrails
                    .filter((t): t is OSMTrail & { center: LatLng } => !!t.center)
                    .map((t) => ({ id: String(t.id), coord: t.center, color: MARKER_COLOR[t.type] }))}
                  onMarkerPress={(id) => {
                    const trail = trails.find((t) => String(t.id) === id);
                    if (trail) navigation.navigate('TrailDetail', { trailId: trail.id, trailName: trail.name });
                  }}
                />
              </View>
              <View style={styles.filterRow}>
                {(['all', 'foot', 'bicycle', 'mtb'] as TrailFilter[]).map((f) => (
                  <Pressable
                    key={f}
                    onPress={() => setTrailFilter(f)}
                    style={[
                      styles.filterTab,
                      { backgroundColor: tokens.surface2, borderColor: tokens.border2 },
                      trailFilter === f && { backgroundColor: tokens.accentDim, borderColor: tokens.accent },
                    ]}
                  >
                    {f !== 'all' && <Feather name={TRAIL_BADGE[f]} size={12} color={trailFilter === f ? tokens.text : tokens.text2} />}
                    <Text style={[styles.filterLabel, { color: tokens.text2, fontFamily: fonts.mono }, trailFilter === f && { color: tokens.text, fontWeight: '700' }]}>
                      {f === 'all' ? 'Tous' : TRAIL_FILTER_LABEL[f]}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {!!trailsError && <Text style={[styles.error, { color: tokens.danger }]}>{trailsError}</Text>}
              <FlatList
                data={filteredTrails}
                keyExtractor={(t) => String(t.id)}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loadingTrails} onRefresh={loadTrails} tintColor={tokens.text} />}
                ListEmptyComponent={<Text style={[styles.emptySub, { color: tokens.text2 }]}>Aucun sentier dans cette catégorie.</Text>}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.trailCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                    onPress={() => navigation.navigate('TrailDetail', { trailId: item.id, trailName: item.name })}
                  >
                    <Feather name={TRAIL_BADGE[item.type]} size={20} color={tokens.text2} />
                    <View style={styles.trailInfo}>
                      <Text style={[styles.trailName, { color: tokens.text, fontFamily: fonts.display }]}>{item.name}</Text>
                      <Text style={[styles.trailMeta, { color: tokens.text3, fontFamily: fonts.mono }]}>{item.distance || '?'} km · {item.network || item.type}</Text>
                    </View>
                    <Feather name="chevron-right" size={18} color={tokens.text3} />
                  </Pressable>
                )}
              />
            </>
          )}
        </View>
      ) : (
        <View style={styles.flex}>
          {community.length > 0 && (
            <View style={styles.filterRow}>
              {COMMUNITY_FILTERS.map((f) => (
                <Pressable
                  key={f.value}
                  onPress={() => setCommunityFilter(f.value)}
                  style={[
                    styles.filterTab,
                    { backgroundColor: tokens.surface2, borderColor: tokens.border2 },
                    communityFilter === f.value && { backgroundColor: tokens.accentDim, borderColor: tokens.accent },
                  ]}
                >
                  {f.icon && <Feather name={f.icon} size={12} color={communityFilter === f.value ? tokens.text : tokens.text2} />}
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: tokens.text2, fontFamily: fonts.mono },
                      communityFilter === f.value && { color: tokens.text, fontWeight: '700' },
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {!!communityError && <Text style={[styles.error, { color: tokens.danger }]}>{communityError}</Text>}
          <FlatList
            data={filteredCommunity}
            keyExtractor={(r) => r.id}
            contentContainerStyle={styles.list}
            refreshing={loadingCommunity}
            onRefresh={loadCommunity}
            ListEmptyComponent={
              !loadingCommunity ? (
                <View style={styles.empty}>
                  <Feather name="globe" size={36} color={tokens.text3} />
                  <Text style={[styles.emptySub, { color: tokens.text2 }]}>
                    {community.length === 0 ? 'Aucun parcours partagé. Sois le premier !' : 'Aucun parcours dans cette catégorie.'}
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.communityCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
              >
                {item.coords?.length > 1 && (
                  <View style={styles.communityPreview}>
                    <RouteSatellitePreview coords={item.coords} color={tokens.accent} />
                  </View>
                )}
                <View style={styles.communityBody}>
                  <View style={styles.communityHeader}>
                    <View style={[styles.communityAvatar, { backgroundColor: tokens.secondaryDim }]}>
                      <Text style={[styles.communityAvatarText, { color: tokens.text, fontFamily: fonts.display }]}>{(item.userName[0] || 'A').toUpperCase()}</Text>
                    </View>
                    <View style={styles.flex}>
                      <Text style={[styles.communityName, { color: tokens.text, fontFamily: fonts.display }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.communityUser, { color: tokens.text3 }]}>{item.userName}</Text>
                    </View>
                  </View>
                  <View style={styles.communityMeta}>
                    <Text style={[styles.communityStat, { color: tokens.accent, fontFamily: fonts.mono }]}>{item.distKm.toFixed(1)} km</Text>
                    <Text style={[styles.communityStat, { color: tokens.accent, fontFamily: fonts.mono }]}>D+ {item.elevation?.totalAscent || 0}m</Text>
                    <Text style={[styles.communityStatMuted, { color: tokens.text3, fontFamily: fonts.mono }]}>{item.terrain || 'mixte'}</Text>
                  </View>
                  <View style={styles.communityRatingRow}>
                    <Feather name="star" size={11} color={tokens.fav} />
                    <Text style={[styles.communityRating, { color: tokens.fav, fontFamily: fonts.mono }]}>
                      {item.ratingCount > 0 ? `${item.avgRating.toFixed(1)} (${item.ratingCount})` : 'Pas encore noté'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function TabButton({ icon, label, active, onPress }: { icon: FeatherName; label: string; active: boolean; onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, { backgroundColor: tokens.surface2 }, active && { backgroundColor: tokens.accent }]}
    >
      <Feather name={icon} size={14} color={active ? tokens.onAccent : tokens.text2} />
      <Text style={[styles.tabLabel, { color: tokens.text2, fontFamily: fonts.mono }, active && { color: tokens.onAccent, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabRow: { flexDirection: 'row', gap: 8, padding: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radii.full },
  tabLabel: { fontSize: 13 },
  trailMapArea: { height: 180, marginHorizontal: 16, marginBottom: 10, borderRadius: radii.md, overflow: 'hidden' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1 },
  filterLabel: { fontSize: 11 },
  error: { fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
  list: { padding: 16, paddingTop: 0, gap: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: 'center' },
  trailCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.md, padding: 12, borderWidth: 1 },
  trailInfo: { flex: 1 },
  trailName: { fontSize: 14 },
  trailMeta: { fontSize: 11 },
  communityCard: { borderRadius: radii.md, overflow: 'hidden', borderWidth: 1 },
  communityPreview: { height: 110 },
  communityBody: { padding: 14, gap: 8 },
  communityHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  communityAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  communityAvatarText: { fontSize: 14 },
  communityName: { fontSize: 14 },
  communityUser: { fontSize: 11 },
  communityMeta: { flexDirection: 'row', gap: 12 },
  communityStat: { fontSize: 12, fontWeight: '700' },
  communityStatMuted: { fontSize: 11 },
  communityRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  communityRating: { fontSize: 11 },
});
