import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteMap } from '../../components/map/RouteMap';
import { RouteMapHandle } from '../../components/map/RouteMap.types';
import { RouteResultCard } from '../../components/RouteResultCard';
import { SaveRouteModal } from '../../components/SaveRouteModal';
import { GarminExportModal } from '../../components/GarminExportModal';
import { useTheme } from '../../theme/ThemeContext';
import { useGenerate } from '../../state/GenerateContext';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useToast } from '../../state/ToastContext';
import { useGarminExport } from '../../hooks/useGarminExport';
import { saveRoute } from '../../lib/supabase/routes';
import type { GenerateStackParamList } from '../../navigation/types';
import { GeneratedRoute } from '../../types';

type Props = NativeStackScreenProps<GenerateStackParamList, 'GenerateResults'>;

const DEFAULT_REGION = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };

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
  const mapRef = useRef<RouteMapHandle>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [saveTarget, setSaveTarget] = useState<GeneratedRoute | null>(null);
  const { garminModalVisible, garminFilename, closeGarminModal, exportToGarmin } = useGarminExport();
  const recommendedIdx = findRecommendedIndex(results, distance);

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
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.mapArea}>
        <RouteMap
          ref={mapRef}
          initialRegion={DEFAULT_REGION}
          routes={results.map((r, i) => ({ id: `r${i}`, coords: r.coords, color: r.color || tokens.secondary }))}
        />
      </View>
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

      <SaveRouteModal
        visible={!!saveTarget}
        defaultName={saveTarget?.name || ''}
        onCancel={() => setSaveTarget(null)}
        onConfirm={handleSaveConfirm}
      />
      <GarminExportModal visible={garminModalVisible} filename={garminFilename} onClose={closeGarminModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapArea: { height: '35%' },
  list: { padding: 16, gap: 12 },
});
