import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SavedRouteCard } from '../../components/SavedRouteCard';
import { RateRouteModal } from '../../components/RateRouteModal';
import { useRoutes } from '../../state/RoutesContext';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { submitRating } from '../../lib/supabase/routes';
import { shareRouteAsGPX } from '../../lib/storage/gpx';
import type { MyRoutesStackParamList } from '../../navigation/types';
import { SavedRoute } from '../../types';

type Props = NativeStackScreenProps<MyRoutesStackParamList, 'MyRoutesScreen'>;

type Filter = 'all' | 'fav' | 'trail' | 'road' | 'mixed';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'fav', label: '⭐ Favoris' },
  { value: 'trail', label: '🏔️ Trail' },
  { value: 'road', label: '🛣️ Route' },
  { value: 'mixed', label: '🌿 Mixte' },
];

/** Port de #page-routes (filterRoutes + buildSavedHTML, index.html:2725-2740, 3538-3667). */
export function MyRoutesScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const { session } = useAuth();
  const { savedRoutes, loading, refresh, toggleFavorite, togglePublic, remove } = useRoutes();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [rateTarget, setRateTarget] = useState<SavedRoute | null>(null);

  const filtered = savedRoutes.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'fav') return r.isFav;
    return r.terrain === filter;
  });

  async function handleRate(score: number, comment: string) {
    if (!rateTarget || !session?.user) return;
    const { error } = await submitRating(session.user.id, rateTarget.id, score, comment);
    if (error) showToast(error.message, true);
    else showToast(`⭐ Note ${score}/5 envoyée !`);
    setRateTarget(null);
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[
              styles.filterTab,
              { backgroundColor: tokens.surface2, borderColor: tokens.border2 },
              filter === f.value && { backgroundColor: tokens.accentDim, borderColor: tokens.accent },
            ]}
          >
            <Text style={[styles.filterLabel, { color: tokens.text2, fontFamily: fonts.mono }, filter === f.value && { color: tokens.text, fontWeight: '700' }]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🚩</Text>
          <Text style={[styles.emptyTitle, { color: tokens.text, fontFamily: fonts.display }]}>Aucun parcours ici</Text>
          <Text style={[styles.emptySub, { color: tokens.text2 }]}>Génère un parcours et sauvegarde-le pour le retrouver ici.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={tokens.text} />}
          renderItem={({ item }) => (
            <SavedRouteCard
              route={item}
              onOpen={() => navigation.navigate('RouteDetail', { routeId: item.id })}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onTogglePublic={() => togglePublic(item.id)}
              onRate={() => setRateTarget(item)}
              onExportGpx={() => shareRouteAsGPX(item).catch((e) => showToast(e.message, true))}
              onDelete={() => remove(item.id)}
            />
          )}
        />
      )}

      <RateRouteModal
        visible={!!rateTarget}
        routeName={rateTarget?.name || ''}
        onCancel={() => setRateTarget(null)}
        onSubmit={handleRate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 8 },
  filterTab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.full, borderWidth: 1 },
  filterLabel: { fontSize: 12 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: 'center' },
});
