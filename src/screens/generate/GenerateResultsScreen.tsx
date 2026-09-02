import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/ui/Icon';
import { RouteMap } from '../../components/map/RouteMap';
import { RouteMapHandle } from '../../components/map/RouteMap.types';
import { RouteResultCard } from '../../components/RouteResultCard';
import { SaveRouteModal } from '../../components/SaveRouteModal';
import { GarminExportModal } from '../../components/GarminExportModal';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { useGenerate } from '../../state/GenerateContext';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useToast } from '../../state/ToastContext';
import { useGarminExport } from '../../hooks/useGarminExport';
import { useBottomSheet } from '../../hooks/useBottomSheet';
import { regionFromCoords } from '../../lib/routing/geo';
import { saveRoute } from '../../lib/supabase/routes';
import type { GenerateStackParamList } from '../../navigation/types';
import { GeneratedRoute } from '../../types';

type Props = NativeStackScreenProps<GenerateStackParamList, 'GenerateResults'>;

const FALLBACK_REGION = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };
const PEEK_HEIGHT = 108;

/** Port du panneau résultats (index.html:96-153, 4348-4373) — cartes de résultats + carte. */
/**
 * Le meilleur tracé parmi les alternatives n'est pas garanti en première position par le
 * générateur (ordre = ordre de découverte, pas de classement) — on le déduit ici de l'écart à
 * la distance cible et, pour le trail, du taux de bitume.
 */
function findRecommendedIndex(routes: GeneratedRoute[], targetKm: number): number {
  if (routes.length < 2) return 0;
  let bestIdx = 0;
  let bestScore = Infinity;
  routes.forEach((r, i) => {
    const distErr = Math.abs(r.distKm - targetKm) / targetKm;
    const purityPenalty = r.purity ? r.purity.pct / 100 : 0;
    const score = distErr + purityPenalty * 0.5;
    if (score < bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export function GenerateResultsScreen({}: Props) {
  const { tokens } = useTheme();
  const { terrain, distance, results } = useGenerate();
  const { profile } = useAuth();
  const { refresh: refreshSavedRoutes } = useRoutes();
  const { showToast } = useToast();
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<RouteMapHandle>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [saveTarget, setSaveTarget] = useState<GeneratedRoute | null>(null);
  const { garminModalVisible, garminFilename, closeGarminModal, exportToGarmin } = useGarminExport();
  const recommendedIdx = findRecommendedIndex(results, distance);

  const panelHeight = Math.round(screenHeight * 0.56);
  const peekHeight = PEEK_HEIGHT + insets.bottom;
  const { collapsed, translateY, panHandlers, snapTo } = useBottomSheet({ panelHeight, peekHeight });

  const initialRegion = useMemo(() => {
    const points = results.flatMap((r) => r.coords.map((c) => ({ lat: c[1], lng: c[0] })));
    return points.length ? regionFromCoords(points) : FALLBACK_REGION;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectRoute(i: number) {
    setSelectedIdx(i);
    mapRef.current?.fitToCoordinates(results[i].coords.map((c) => ({ lat: c[1], lng: c[0] })));
  }

  async function handleSaveConfirm(name: string, isFav: boolean, isPublic: boolean) {
    if (!saveTarget || !profile) return;
    const { error } = await saveRoute(profile.id, profile.name, saveTarget, name, terrain, isFav, isPublic);
    if (error) {
      showToast(error.message, true);
    } else {
      await refreshSavedRoutes();
      showToast(isFav ? `"${name}" en favori` : `"${name}" sauvegardé`, false, 3000, isFav ? 'star' : 'save');
    }
    setSaveTarget(null);
  }

  async function handleExport(route: GeneratedRoute) {
    try {
      await exportToGarmin(route);
    } catch (e) {
      showToast((e as Error).message, true);
    }
  }

  return (
    <View style={styles.flex}>
      <RouteMap
        ref={mapRef}
        initialRegion={initialRegion}
        routes={results.map((r, i) => ({ id: `r${i}`, coords: r.coords, color: r.color || tokens.secondary }))}
        onUserInteraction={() => snapTo(true)}
      />

      <Animated.View
        style={[
          styles.panel,
          {
            height: panelHeight,
            paddingBottom: insets.bottom,
            backgroundColor: tokens.bg,
            borderColor: tokens.border,
            transform: [{ translateY }],
          },
        ]}
      >
        <View {...panHandlers} style={styles.handleZone}>
          <View style={[styles.handleBar, { backgroundColor: tokens.border3 }]} />
        </View>

        {collapsed ? (
          <View style={styles.peekPillsRow}>
            {results.map((r, i) => (
              <Pressable
                key={i}
                onPress={() => selectRoute(i)}
                style={[
                  styles.peekPill,
                  { backgroundColor: tokens.surface2, borderColor: i === selectedIdx ? r.color || tokens.secondary : tokens.border },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Sélectionner ${r.name}, ${r.distKm.toFixed(1)} km`}
                accessibilityState={{ selected: i === selectedIdx }}
              >
                <View style={[styles.peekDot, { backgroundColor: r.color || tokens.secondary }]} />
                <Text style={[styles.peekPillText, { color: tokens.text, fontFamily: fonts.mono }]}>{r.distKm.toFixed(1)} km</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <>
            {results.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareRow}>
                {results.map((r, i) => (
                  <Pressable
                    key={i}
                    onPress={() => selectRoute(i)}
                    style={[
                      styles.compareChip,
                      { backgroundColor: tokens.surface, borderColor: i === selectedIdx ? r.color || tokens.secondary : tokens.border },
                    ]}
                  >
                    <View style={styles.compareHeader}>
                      <View style={[styles.compareDot, { backgroundColor: r.color || tokens.secondary }]} />
                      {results.length > 1 && i === recommendedIdx && <Icon name="award" size={11} color={tokens.text} />}
                    </View>
                    <Text style={[styles.compareVal, { color: tokens.text, fontFamily: fonts.mono }]}>{r.distKm.toFixed(1)} km</Text>
                    <Text style={[styles.compareSub, { color: tokens.text3, fontFamily: fonts.mono }]}>D+{r.elevation.totalAscent}m</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <ScrollView contentContainerStyle={styles.list}>
              {results.map((r, i) => (
                <RouteResultCard
                  key={i}
                  route={r}
                  terrain={terrain}
                  selected={i === selectedIdx}
                  recommended={results.length > 1 && i === recommendedIdx}
                  onSelect={() => setSelectedIdx(i)}
                  onCenter={() => mapRef.current?.fitToCoordinates(r.coords.map((c) => ({ lat: c[1], lng: c[0] })))}
                  onSave={() => setSaveTarget(r)}
                  onExportGpx={() => handleExport(r)}
                />
              ))}
            </ScrollView>
          </>
        )}
      </Animated.View>

      <SaveRouteModal
        visible={!!saveTarget}
        defaultName={saveTarget?.name || ''}
        onCancel={() => setSaveTarget(null)}
        onConfirm={handleSaveConfirm}
      />
      <GarminExportModal visible={garminModalVisible} filename={garminFilename} onClose={closeGarminModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 8 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  peekPillsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  peekPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.full, borderWidth: 1.5 },
  peekDot: { width: 8, height: 8, borderRadius: 4 },
  peekPillText: { fontSize: 13, fontWeight: '700' },
  compareRow: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 4 },
  compareChip: { width: 92, alignItems: 'center', gap: 3, paddingVertical: 10, borderRadius: radii.md, borderWidth: 1.5 },
  compareHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 12 },
  compareDot: { width: 8, height: 8, borderRadius: 4 },
  compareVal: { fontSize: 13, fontWeight: '700' },
  compareSub: { fontSize: 10 },
  list: { padding: 16, paddingTop: 8, gap: 12 },
});
