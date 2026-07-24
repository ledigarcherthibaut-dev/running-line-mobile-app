import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { RouteSatellitePreview } from '../../components/routePreview/RouteSatellitePreview';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import type { AppTabParamList, HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>;
type FeatherName = keyof typeof Feather.glyphMap;

const QUICK_PRESETS: { km: number; terrain: 'mixed' | 'trail'; icon: FeatherName; label: string; sub: string }[] = [
  { km: 5, terrain: 'mixed', icon: 'sunrise', label: '5 km', sub: 'Récup' },
  { km: 10, terrain: 'mixed', icon: 'activity', sub: 'Endurance', label: '10 km' },
  { km: 15, terrain: 'trail', icon: 'trending-up', sub: 'Trail', label: '15 km' },
];

/** Port de #page-home (index.html:2299-2369) — hero, stats, parcours récents, générateur express. */
export function HomeScreen({ navigation }: Props) {
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const { tokens } = useTheme();
  const { profile } = useAuth();
  const { savedRoutes, loading, refresh } = useRoutes();

  const totalKm = savedRoutes.reduce((s, r) => s + (r.distKm || 0), 0);
  const totalDp = savedRoutes.reduce((s, r) => s + (r.elevation?.totalAscent || 0), 0);
  const favCount = savedRoutes.filter((r) => r.isFav).length;
  const recent = savedRoutes.slice(0, 3);

  function goGenerate(presetKm?: number, presetTerrain?: 'mixed' | 'trail') {
    tabNavigation?.navigate('Generate', { screen: 'GenerateScreen', params: presetKm ? { presetKm, presetTerrain } : undefined });
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={tokens.text} />}
      >
        <View style={styles.hero}>
          <Text style={[styles.greeting, { color: tokens.text2, fontFamily: fonts.mono }]}>{profile?.name || 'Coureur'}</Text>
          <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.display }]}>Prêt pour ta{'\n'}prochaine sortie ?</Text>
          <Text style={[styles.subtitle, { color: tokens.text2 }]}>Des itinéraires uniques générés en secondes, autour de toi.</Text>
          <View style={styles.heroActions}>
            <Button title="Générer un parcours" onPress={() => goGenerate()} />
            <Button
              title="Explorer autour de moi"
              icon="compass"
              variant="secondary"
              onPress={() => tabNavigation?.navigate('Explorer', { screen: 'ExplorerScreen' })}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="trending-up" value={`${totalKm.toFixed(0)} km`} label="Distance totale" />
          <StatCard icon="bar-chart-2" value={`${totalDp.toFixed(0)} m`} label="Dénivelé cumulé" />
          <StatCard icon="flag" value={String(savedRoutes.length)} label="Parcours créés" />
          <StatCard icon="heart" value={String(favCount)} label="Favoris" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tokens.text3, fontFamily: fonts.mono }]}>GÉNÉRATION EXPRESS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
            {QUICK_PRESETS.map((p) => (
              <Pressable
                key={p.label}
                style={[styles.presetChip, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                onPress={() => goGenerate(p.km, p.terrain)}
              >
                <Feather name={p.icon} size={22} color={tokens.text} style={styles.presetIcon} />
                <Text style={[styles.presetLabel, { color: tokens.text, fontFamily: fonts.display }]}>{p.label}</Text>
                <Text style={[styles.presetSub, { color: tokens.text3, fontFamily: fonts.mono }]}>{p.sub}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: tokens.text3, fontFamily: fonts.mono }]}>DERNIERS PARCOURS</Text>
              <Text style={[styles.sectionSub, { color: tokens.text2 }]}>Tes créations récentes</Text>
            </View>
            {recent.length > 0 && (
              <Button
                title="Voir tout"
                variant="text"
                onPress={() => tabNavigation?.navigate('MyRoutes', { screen: 'MyRoutesScreen' })}
              />
            )}
          </View>
          {recent.length > 0 ? (
            recent.map((r) => (
              <Pressable
                key={r.id}
                style={[styles.recentCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                onPress={() => navigation.navigate('RouteDetail', { routeId: r.id })}
              >
                <View style={styles.recentThumb}>
                  <RouteSatellitePreview coords={r.coords} color={tokens.accent} />
                </View>
                <View style={styles.recentBody}>
                  <Text style={[styles.recentName, { color: tokens.text, fontFamily: fonts.display }]}>{r.name}</Text>
                  <View style={styles.recentMetaRow}>
                    <MetaItem icon="trending-up" text={`${r.distKm.toFixed(1)} km`} color={tokens.text2} />
                    <MetaItem icon="bar-chart-2" text={`D+${r.elevation.totalAscent}m`} color={tokens.text2} />
                    <MetaItem icon="map" text={r.terrain} color={tokens.text2} />
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
              <Feather name="flag" size={26} color={tokens.text3} />
              <Text style={[styles.emptyStateTitle, { color: tokens.text, fontFamily: fonts.display }]}>Aucun parcours pour l'instant</Text>
              <Text style={[styles.emptyStateSub, { color: tokens.text2 }]}>Génère ton premier parcours ci-dessus pour le retrouver ici.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label }: { icon: FeatherName; value: string; label: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: tokens.surface2 }]}>
      <Feather name={icon} size={18} color={tokens.accent} />
      <Text style={[styles.statValue, { color: tokens.accent, fontFamily: fonts.display }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: tokens.text2 }]}>{label}</Text>
    </View>
  );
}

function MetaItem({ icon, text, color }: { icon: FeatherName; text: string; color: string }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={11} color={color} />
      <Text style={[styles.recentMeta, { color, fontFamily: fonts.mono }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20, gap: 24 },
  hero: { gap: 8 },
  greeting: { fontSize: 12, letterSpacing: 1 },
  title: { fontSize: 28, lineHeight: 32 },
  subtitle: { fontSize: 14, marginBottom: 8 },
  heroActions: { gap: 8, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flexBasis: '47%', flexGrow: 1, borderRadius: radii.md, padding: 14, gap: 4 },
  statValue: { fontSize: 24 },
  statLabel: { fontSize: 11 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 10.5, letterSpacing: 1 },
  sectionSub: { fontSize: 12, marginTop: 2 },
  presetRow: { gap: 10, paddingRight: 4 },
  presetChip: { width: 96, alignItems: 'center', gap: 2, paddingVertical: 14, borderRadius: radii.md, borderWidth: 1 },
  presetIcon: { marginBottom: 4 },
  presetLabel: { fontSize: 15 },
  presetSub: { fontSize: 10 },
  recentCard: { flexDirection: 'row', borderRadius: radii.md, overflow: 'hidden', borderWidth: 1 },
  recentThumb: { width: 84, backgroundColor: '#080d12' },
  recentBody: { flex: 1, padding: 12, gap: 4 },
  recentName: { fontSize: 14 },
  recentMetaRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  recentMeta: { fontSize: 11 },
  emptyState: { alignItems: 'center', gap: 6, padding: 24, borderRadius: radii.md, borderWidth: 1 },
  emptyStateTitle: { fontSize: 15, marginTop: 4 },
  emptyStateSub: { fontSize: 12, textAlign: 'center' },
});
