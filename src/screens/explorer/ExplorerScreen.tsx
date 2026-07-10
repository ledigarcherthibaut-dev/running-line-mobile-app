import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { getUserLocation, LocationError } from '../../lib/location/location';
import { fetchNearbyTrails, OSMTrail, TrailType } from '../../lib/api/overpass';
import { fetchCommunityRoutes, CommunityRoute } from '../../lib/supabase/routes';
import type { ExplorerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ExplorerStackParamList, 'ExplorerScreen'>;
type Tab = 'trails' | 'community';
type TrailFilter = 'all' | TrailType;

const TRAIL_BADGE: Record<TrailType, string> = { foot: '🥾', bicycle: '🚴', mtb: '⛰️' };

/** Port de #page-explorer (index.html:751-786) — onglets Sentiers OSM / Communauté. */
export function ExplorerScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const [tab, setTab] = useState<Tab>('trails');

  const [trails, setTrails] = useState<OSMTrail[]>([]);
  const [trailFilter, setTrailFilter] = useState<TrailFilter>('all');
  const [loadingTrails, setLoadingTrails] = useState(false);
  const [trailsError, setTrailsError] = useState('');

  const [community, setCommunity] = useState<CommunityRoute[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [communityError, setCommunityError] = useState('');
  const [communityLoaded, setCommunityLoaded] = useState(false);

  async function loadTrails() {
    setLoadingTrails(true);
    setTrailsError('');
    try {
      const center = await getUserLocation();
      setTrails(await fetchNearbyTrails(center));
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

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.tabRow}>
        <TabButton label="🥾 Sentiers" active={tab === 'trails'} onPress={() => switchTab('trails')} />
        <TabButton label="🌍 Communauté" active={tab === 'community'} onPress={() => switchTab('community')} />
      </View>

      {tab === 'trails' ? (
        <View style={styles.flex}>
          {trails.length === 0 && !loadingTrails ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🥾</Text>
              <Text style={[styles.emptyTitle, { color: tokens.text, fontFamily: fonts.display }]}>Sentiers autour de toi</Text>
              <Text style={[styles.emptySub, { color: tokens.text2 }]}>Localise-toi pour découvrir les sentiers OSM dans un rayon de 25km.</Text>
              <Button title="📍 Chercher autour de moi" onPress={loadTrails} loading={loadingTrails} />
            </View>
          ) : (
            <>
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
                    <Text style={[styles.filterLabel, { color: tokens.text2, fontFamily: fonts.mono }, trailFilter === f && { color: tokens.text, fontWeight: '700' }]}>
                      {f === 'all' ? 'Tous' : `${TRAIL_BADGE[f]} ${f === 'foot' ? 'Pédestre' : f === 'bicycle' ? 'Vélo' : 'VTT'}`}
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
                    <Text style={styles.trailIcon}>{TRAIL_BADGE[item.type]}</Text>
                    <View style={styles.trailInfo}>
                      <Text style={[styles.trailName, { color: tokens.text, fontFamily: fonts.display }]}>{item.name}</Text>
                      <Text style={[styles.trailMeta, { color: tokens.text3, fontFamily: fonts.mono }]}>{item.distance || '?'} km · {item.network || item.type}</Text>
                    </View>
                    <Text style={[styles.trailArrow, { color: tokens.text3 }]}>›</Text>
                  </Pressable>
                )}
              />
            </>
          )}
        </View>
      ) : (
        <View style={styles.flex}>
          {!!communityError && <Text style={[styles.error, { color: tokens.danger }]}>{communityError}</Text>}
          <FlatList
            data={community}
            keyExtractor={(r) => r.id}
            contentContainerStyle={styles.list}
            refreshing={loadingCommunity}
            onRefresh={loadCommunity}
            ListEmptyComponent={
              !loadingCommunity ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>🌍</Text>
                  <Text style={[styles.emptySub, { color: tokens.text2 }]}>Aucun parcours partagé. Sois le premier !</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.communityCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
              >
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
                  <Text style={[styles.communityStat, { color: tokens.text2, fontFamily: fonts.mono }]}>{item.distKm.toFixed(1)} km</Text>
                  <Text style={[styles.communityStat, { color: tokens.text2, fontFamily: fonts.mono }]}>D+ {item.elevation?.totalAscent || 0}m</Text>
                  <Text style={[styles.communityStat, { color: tokens.text2, fontFamily: fonts.mono }]}>{item.terrain || 'mixte'}</Text>
                </View>
                <Text style={[styles.communityRating, { color: tokens.fav, fontFamily: fonts.mono }]}>
                  {item.ratingCount > 0 ? `⭐ ${item.avgRating.toFixed(1)} (${item.ratingCount})` : 'Pas encore noté'}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, { backgroundColor: tokens.surface2 }, active && { backgroundColor: tokens.accent }]}
    >
      <Text style={[styles.tabLabel, { color: tokens.text2, fontFamily: fonts.mono }, active && { color: tokens.text, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabRow: { flexDirection: 'row', gap: 8, padding: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.full, alignItems: 'center' },
  tabLabel: { fontSize: 13 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.full, borderWidth: 1 },
  filterLabel: { fontSize: 11 },
  error: { fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
  list: { padding: 16, paddingTop: 0, gap: 10 },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: 'center' },
  trailCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.md, padding: 12, borderWidth: 1 },
  trailIcon: { fontSize: 20 },
  trailInfo: { flex: 1 },
  trailName: { fontSize: 14 },
  trailMeta: { fontSize: 11 },
  trailArrow: { fontSize: 18 },
  communityCard: { borderRadius: radii.md, padding: 14, gap: 8, borderWidth: 1 },
  communityHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  communityAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  communityAvatarText: { fontSize: 14 },
  communityName: { fontSize: 14 },
  communityUser: { fontSize: 11 },
  communityMeta: { flexDirection: 'row', gap: 12 },
  communityStat: { fontSize: 11 },
  communityRating: { fontSize: 11 },
});
