import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SavedRouteCard } from '../../components/SavedRouteCard';
import { RateRouteModal } from '../../components/RateRouteModal';
import { GarminExportModal } from '../../components/GarminExportModal';
import { useRoutes } from '../../state/RoutesContext';
import { useAuth } from '../../state/AuthContext';
import { useToast } from '../../state/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { useGarminExport } from '../../hooks/useGarminExport';
import { submitRating } from '../../lib/supabase/routes';
import type { MyRoutesStackParamList } from '../../navigation/types';
import { SavedRoute } from '../../types';

type Props = NativeStackScreenProps<MyRoutesStackParamList, 'MyRoutesScreen'>;
type FeatherName = keyof typeof Feather.glyphMap;

type Filter = 'all' | 'fav' | 'trail' | 'road' | 'mixed';
const FILTERS: { value: Filter; label: string; icon?: FeatherName }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'fav', label: 'Favoris', icon: 'star' },
  { value: 'trail', label: 'Trail', icon: 'trending-up' },
  { value: 'road', label: 'Route', icon: 'navigation' },
  { value: 'mixed', label: 'Mixte', icon: 'git-merge' },
];

type SortMode = 'recent' | 'distanceAsc' | 'distanceDesc';
const SORT_NEXT: Record<SortMode, SortMode> = { recent: 'distanceAsc', distanceAsc: 'distanceDesc', distanceDesc: 'recent' };
const SORT_LABEL: Record<SortMode, string> = { recent: 'Récents', distanceAsc: 'Distance ↑', distanceDesc: 'Distance ↓' };
const SORT_ICON: Record<SortMode, FeatherName> = { recent: 'clock', distanceAsc: 'arrow-up', distanceDesc: 'arrow-down' };

/** Port de #page-routes (filterRoutes + buildSavedHTML, index.html:2725-2740, 3538-3667). */
export function MyRoutesScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const { session } = useAuth();
  const { savedRoutes, loading, refresh, toggleFavorite, togglePublic, remove } = useRoutes();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Filter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [rateTarget, setRateTarget] = useState<SavedRoute | null>(null);
  const { garminModalVisible, garminFilename, closeGarminModal, exportToGarmin } = useGarminExport();

  const filtered = savedRoutes.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'fav') return r.isFav;
    return r.terrain === filter;
  });
  if (sortMode !== 'recent') {
    filtered.sort((a, b) => (sortMode === 'distanceAsc' ? a.distKm - b.distKm : b.distKm - a.distKm));
  }

  async function handleRate(score: number, comment: string) {
    if (!rateTarget || !session?.user) return;
    const { error } = await submitRating(session.user.id, rateTarget.id, score, comment);
    if (error) showToast(error.message, true);
    else showToast(`Note ${score}/5 envoyée !`, false, 3000, 'star');
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
            {f.icon && <Feather name={f.icon} size={12} color={filter === f.value ? tokens.text : tokens.text2} />}
            <Text style={[styles.filterLabel, { color: tokens.text2, fontFamily: fonts.mono }, filter === f.value && { color: tokens.text, fontWeight: '700' }]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length > 0 && (
        <Pressable
          onPress={() => setSortMode(SORT_NEXT[sortMode])}
          style={styles.sortBtn}
          accessibilityRole="button"
          accessibilityLabel={`Trier par ${SORT_LABEL[sortMode]}`}
        >
          <Feather name={SORT_ICON[sortMode]} size={12} color={tokens.text2} />
          <Text style={[styles.sortLabel, { color: tokens.text2, fontFamily: fonts.mono }]}>Trier : {SORT_LABEL[sortMode]}</Text>
        </Pressable>
      )}

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="flag" size={40} color={tokens.text3} />
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
              onExportGpx={() => exportToGarmin(item).catch((e) => showToast(e.message, true))}
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
      <GarminExportModal visible={garminModalVisible} filename={garminFilename} onClose={closeGarminModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 8 },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.full, borderWidth: 1 },
  filterLabel: { fontSize: 12 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', paddingHorizontal: 16, marginBottom: 6 },
  sortLabel: { fontSize: 11 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 },
  emptyTitle: { fontSize: 16 },
  emptySub: { fontSize: 13, textAlign: 'center' },
});
