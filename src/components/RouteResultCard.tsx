import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ElevationChart } from './charts/ElevationChart';
import { Button } from './ui/Button';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../state/AuthContext';
import { radii, fonts } from '../theme/tokens';
import { estimateDurationLabel } from '../lib/routing/pace';
import { GeneratedRoute, Terrain } from '../types';

const TERRAIN_LABEL: Record<Terrain, string> = { trail: 'Trail pur', road: 'Route', mixed: 'Mixte', any: 'Mixte' };

/** Port de renderResultCard (index.html:4348-4373). */
export function RouteResultCard({
  route,
  terrain,
  selected,
  recommended,
  onSelect,
  onCenter,
  onSave,
  onExportGpx,
}: {
  route: GeneratedRoute;
  terrain: Terrain;
  selected: boolean;
  recommended?: boolean;
  onSelect: () => void;
  onCenter: () => void;
  onSave: () => void;
  onExportGpx: () => void;
}) {
  const { tokens } = useTheme();
  const { profile } = useAuth();
  const purityColor = { good: tokens.success, warn: tokens.energy, bad: tokens.danger };
  const duration = estimateDurationLabel(route.distKm, profile?.vma);

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.card, { backgroundColor: tokens.surface, borderColor: selected ? route.color : tokens.border }]}
    >
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: route.color }]} />
        <Text style={[styles.name, { color: tokens.text, fontFamily: fonts.display }]}>{route.name}</Text>
      </View>

      <View style={styles.badges}>
        {recommended && (
          <View style={[styles.badgeRow, { backgroundColor: tokens.accentDim }]}>
            <Feather name="award" size={10} color={tokens.text} />
            <Text style={[styles.badgeText, { color: tokens.text }]}>Recommandé</Text>
          </View>
        )}
        <Text style={[styles.badge, { color: tokens.text2, backgroundColor: tokens.surface2 }]}>{TERRAIN_LABEL[terrain]}</Text>
        {!!route.purity && (
          <View style={[styles.badgeRow, { backgroundColor: tokens.surface2 }]}>
            <Feather name="navigation" size={10} color={purityColor[route.purity.cssClass]} />
            <Text style={[styles.badgeText, { color: purityColor[route.purity.cssClass] }]}>{route.purity.label}</Text>
          </View>
        )}
      </View>
      {duration && (
        <View style={styles.durationRow}>
          <Feather name="clock" size={11} color={tokens.text3} />
          <Text style={[styles.durationText, { color: tokens.text3, fontFamily: fonts.mono }]}>{duration} à ton allure</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <Stat value={route.distKm.toFixed(1)} label="km" />
        <Stat value={`+${route.elevation.totalAscent}`} label="D+ m" />
        <Stat value={String(route.elevation.maxEle)} label="Alt max" />
        <Stat value={String(route.elevation.minEle)} label="Alt min" />
      </View>

      <ElevationChart elevations={route.elevation.elevations} color={route.color || tokens.secondary} />

      <View style={styles.actions}>
        <Button title="Centrer" icon="crosshair" variant="secondary" onPress={onCenter} style={styles.actionBtn} />
        <Button title="Sauver" icon="save" onPress={onSave} style={styles.actionBtn} />
      </View>
      <Button title="Envoyer vers Garmin" icon="watch" variant="secondary" onPress={onExportGpx} />
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: tokens.surface2, borderColor: tokens.border }]}>
      <Text style={[styles.statVal, { color: tokens.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: tokens.text3 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.md, borderWidth: 1.5, padding: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  name: { fontSize: 15, flex: 1 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { fontSize: 10, fontFamily: fonts.mono, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.full },
  badgeText: { fontSize: 10, fontFamily: fonts.mono },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  durationText: { fontSize: 11 },
  statsRow: { flexDirection: 'row', gap: 6 },
  stat: { flex: 1, borderRadius: radii.xs, paddingVertical: 7, alignItems: 'center', borderWidth: 1 },
  statVal: { fontFamily: fonts.mono, fontSize: 14, fontWeight: '700' },
  statLabel: { fontSize: 9, fontFamily: fonts.mono },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1 },
});
