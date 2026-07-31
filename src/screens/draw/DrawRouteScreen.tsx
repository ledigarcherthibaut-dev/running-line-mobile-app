import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File } from 'expo-file-system';
import { RouteMap } from '../../components/map/RouteMap';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/tokens';
import { useGenerate } from '../../state/GenerateContext';
import { useToast } from '../../state/ToastContext';
import { useDrawRoute } from '../../hooks/useDrawRoute';
import { parseGPX } from '../../lib/storage/gpx';
import type { GenerateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GenerateStackParamList, 'DrawRoute'>;

const DEFAULT_REGION = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };

/**
 * Port du mode dessin manuel (index.html:4568-4721) — tap carte → BRouter par segment.
 * Étendu avec l'import d'un tracé GPX existant (simplifié en points modifiables) : comme
 * l'annotation MapLibre RN ne propose pas de drag natif, déplacer un point se fait en deux
 * temps — le sélectionner (tap dessus), puis toucher sa nouvelle position sur la carte —
 * plutôt qu'un vrai glisser-déposer.
 */
export function DrawRouteScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const { terrain, setResults } = useGenerate();
  const { showToast } = useToast();
  const draw = useDrawRoute(terrain);
  const [name, setName] = useState('');
  const [importing, setImporting] = useState(false);

  function handleFinish() {
    const route = draw.finish(name);
    if (!route) {
      showToast('Trace au moins 2 points', true);
      return;
    }
    setResults([route]);
    navigation.replace('GenerateResults');
  }

  function handleMapPress(coord: { lat: number; lng: number }) {
    if (draw.selectedIndex !== null) {
      draw.moveSelected(coord);
    } else {
      draw.addPoint(coord);
    }
  }

  async function handleImportGpx() {
    setImporting(true);
    try {
      const picked = await File.pickFileAsync({ mimeTypes: ['*/*'] });
      if (picked.canceled) return;
      if (!picked.result.name.toLowerCase().endsWith('.gpx')) {
        showToast('Choisis un fichier .gpx', true);
        return;
      }
      const xml = await picked.result.text();
      const coords = parseGPX(xml);
      await draw.importGpx(coords);
      showToast('Tracé importé — modifie les points si besoin.', false);
    } catch (e) {
      showToast((e as Error).message || "Import GPX impossible.", true);
    } finally {
      setImporting(false);
    }
  }

  const hint = draw.selectedIndex !== null
    ? 'Touche la carte pour déplacer ce point (ou retouche-le pour annuler)'
    : draw.points.length > 0
      ? `${draw.points.length} point(s) · ${draw.distKm.toFixed(1)} km — touche un point pour le déplacer`
      : 'Touche la carte pour ajouter un point, ou importe un tracé GPX';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.mapArea}>
        <RouteMap
          initialRegion={DEFAULT_REGION}
          onMapPress={handleMapPress}
          onMarkerPress={(id) => draw.selectPoint(Number(id.replace('pt-', '')))}
          markers={draw.points.map((p, i) => ({
            id: `pt-${i}`,
            coord: p,
            color: i === draw.selectedIndex ? tokens.accent : '#BEA3FE',
          }))}
          routes={draw.allCoords.length ? [{ id: 'draw', coords: draw.allCoords, color: '#BEA3FE' }] : []}
        />
      </View>
      <View style={styles.panel}>
        <Text style={[styles.hint, { color: tokens.text3, fontFamily: fonts.mono }]}>{hint}</Text>
        {draw.routing && <Text style={[styles.hint, { color: tokens.text3, fontFamily: fonts.mono }]}>Calcul du segment…</Text>}
        {!!draw.error && <Text style={[styles.error, { color: tokens.danger }]}>{draw.error}</Text>}

        {draw.points.length >= 2 && !draw.isClosed && (
          <Button title="Boucler jusqu'au départ" icon="repeat" variant="secondary" onPress={draw.closeLoop} loading={draw.routing} />
        )}

        <View style={styles.actionsRow}>
          <Button title="Annuler" icon="corner-up-left" variant="secondary" onPress={draw.undo} style={styles.actionBtn} />
          <Button title="Effacer" icon="x" variant="secondary" onPress={draw.clear} style={styles.actionBtn} />
        </View>
        <Button title="Importer un GPX" icon="upload" variant="secondary" onPress={handleImportGpx} loading={importing} />
        <TextField label="Nom du parcours" value={name} onChangeText={setName} placeholder="Mon parcours" />
        <Button title="Terminer" icon="check" onPress={handleFinish} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapArea: { flex: 1 },
  panel: { padding: 16, gap: 10 },
  hint: { fontSize: 12 },
  error: { fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1 },
});
