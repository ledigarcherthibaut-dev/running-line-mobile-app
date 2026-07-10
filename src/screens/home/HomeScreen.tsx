import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { RoutePreviewSvg } from '../../components/routePreview/RoutePreviewSvg';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import type { AppTabParamList, HomeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>;

const QUICK_PRESETS = [
  { km: 5, terrain: 'mixed' as const, icon: '🌱', label: '5 km', sub: 'Récup' },
  { km: 10, terrain: 'mixed' as const, icon: '🏃', sub: 'Endurance', label: '10 km' },
  { km: 15, terrain: 'trail' as const, icon: '🏔️', sub: 'Trail', label: '15 km' },
];

/** Port de #page-home (index.html:2299-2369) — hero, stats, parcours récents, générateur express. */
export function HomeScreen({ navigation }: Props) {
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<AppTabParamList>>();
  const { tokens } = useTheme();
  const { profile } = useAuth();
  const { savedRoutes } = useRoutes();

  const totalKm = savedRoutes.reduce((s, r) => s + (r.distKm || 0), 0);
  const totalDp = savedRoutes.reduce((s, r) => s + (r.elevation?.totalAscent || 0), 0);
  const favCount = savedRoutes.filter((r) => r.isFav).length;
  const recent = savedRoutes.slice(0, 3);

  function goGenerate(presetKm?: number, presetTerrain?: 'mixed' | 'trail') {
    tabNavigation?.navigate('Generate', { screen: 'GenerateScreen', params: presetKm ? { presetKm, presetTerrain } : undefined });
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={[styles.greeting, { color: tokens.text2, fontFamily: fonts.mono }]}>{profile?.name || 'Coureur'}</Text>
          <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.display }]}>Prêt pour ta{'\n'}prochaine sortie ?</Text>
          <Text style={[styles.subtitle, { color: tokens.text2 }]}>Des itinéraires uniques générés en secondes, autour de toi.</Text>
          <View style={styles.heroActions}>
            <Button title="Générer un parcours" onPress={() => goGenerate()} />
            <Button
              title="🧭 Explorer autour de moi"
              variant="secondary"
              onPress={() => tabNavigation?.navigate('Explorer', { screen: 'ExplorerScreen' })}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon="🔥" value={`${totalKm.toFixed(0)} km`} label="Distance totale" />
          <StatCard icon="⛰️" value={`${totalDp.toFixed(0)} m`} label="Dénivelé cumulé" />
          <StatCard icon="🚩" value={String(savedRoutes.length)} label="Parcours créés" />
          <StatCard icon="❤️" value={String(favCount)} label="Favoris" />
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
                <Text style={styles.presetIcon}>{p.icon}</Text>
                <Text style={[styles.presetLabel, { color: tokens.text, fontFamily: fonts.display }]}>{p.label}</Text>
                <Text style={[styles.presetSub, { color: tokens.text3, fontFamily: fonts.mono }]}>{p.sub}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {recent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: tokens.text3, fontFamily: fonts.mono }]}>DERNIERS PARCOURS</Text>
                <Text style={[styles.sectionSub, { color: tokens.text2 }]}>Tes créations récentes</Text>
              </View>
              <Button
                title="Voir tout"
                variant="text"
                onPress={() => tabNavigation?.navigate('MyRoutes', { screen: 'MyRoutesScreen' })}
              />
            </View>
            {recent.map((r) => (
              <Pressable
                key={r.id}
                style={[styles.recentCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
                onPress={() => navigation.navigate('RouteDetail', { routeId: r.id })}
              >
                <View style={styles.recentThumb}>
                  <RoutePreviewSvg coords={r.coords} color={tokens.secondary} />
                </View>
                <View style={styles.recentBody}>
                  <Text style={[styles.recentName, { color: tokens.text, fontFamily: fonts.display }]}>{r.name}</Text>
                  <Text style={[styles.recentMeta, { color: tokens.text2, fontFamily: fonts.mono }]}>
                    📏 {r.distKm.toFixed(1)} km · ⛰ D+{r.elevation.totalAscent}m · 🌿 {r.terrain}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: tokens.text, fontFamily: fonts.display }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: tokens.text2 }]}>{label}</Text>
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
  statCard: { flexBasis: '47%', flexGrow: 1, borderRadius: radii.md, padding: 14, gap: 4, borderWidth: 1 },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 10.5, letterSpacing: 1 },
  sectionSub: { fontSize: 12, marginTop: 2 },
  presetRow: { gap: 10, paddingRight: 4 },
  presetChip: { width: 96, alignItems: 'center', gap: 2, paddingVertical: 14, borderRadius: radii.md, borderWidth: 1 },
  presetIcon: { fontSize: 22, marginBottom: 4 },
  presetLabel: { fontSize: 15 },
  presetSub: { fontSize: 10 },
  recentCard: { flexDirection: 'row', borderRadius: radii.md, overflow: 'hidden', borderWidth: 1 },
  recentThumb: { width: 84, backgroundColor: '#080d12' },
  recentBody: { flex: 1, padding: 12, gap: 4 },
  recentName: { fontSize: 14 },
  recentMeta: { fontSize: 11 },
});
