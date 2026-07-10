import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoiceGrid } from '../../components/ui/ChoiceGrid';
import { SliderField } from '../../components/ui/SliderField';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/tokens';
import { useGenerate } from '../../state/GenerateContext';
import { useToast } from '../../state/ToastContext';
import { getUserLocation, LocationError } from '../../lib/location/location';
import { geocode } from '../../lib/api/geocode';
import { generateDirectRoute, generateLoopRoutes, randomStartNear } from '../../lib/routing/generateRoutes';
import { formatBRouterError } from '../../lib/routing/brouter';
import type { GenerateStackParamList } from '../../navigation/types';
import { Terrain } from '../../types';

type Props = NativeStackScreenProps<GenerateStackParamList, 'GenerateScreen'>;

const TERRAIN_OPTIONS = [
  { value: 'road' as Terrain, icon: '🛣️', label: 'Route' },
  { value: 'mixed' as Terrain, icon: '🌿', label: 'Mixte' },
  { value: 'trail' as Terrain, icon: '🏔️', label: 'Trail' },
  { value: 'any' as Terrain, icon: '🎲', label: 'Peu importe' },
];

/** Port de #page-generate (panneau de config, index.html:456-750). */
export function GenerateScreen({ navigation, route }: Props) {
  const { tokens } = useTheme();
  const { showToast } = useToast();
  const { terrain, setTerrain, distance, setDistance, elevation, setElevation, userCoords, setUserCoords, setResults } = useGenerate();

  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  /** Port de quickGenerate (index.html:3330-3342) — préréglage venant d'Accueil. */
  useEffect(() => {
    if (route.params?.presetKm) setDistance(route.params.presetKm);
    if (route.params?.presetTerrain) setTerrain(route.params.presetTerrain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  async function handleGeolocate() {
    try {
      const c = await getUserLocation();
      setUserCoords(c);
      showToast('📍 Position détectée');
    } catch (e) {
      showToast(e instanceof LocationError ? e.message : (e as Error).message, true);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      let center = userCoords;
      if (!startText && !center) {
        setProgressMsg('Géolocalisation…');
        center = await getUserLocation();
        setUserCoords(center);
      }

      let startCoords = center;
      if (startText.trim()) {
        setProgressMsg('Géocodage du départ…');
        startCoords = await geocode(startText.trim());
      } else if (center) {
        startCoords = randomStartNear(center);
      }
      if (!startCoords) throw new Error('Position de départ introuvable.');

      if (endText.trim()) {
        setProgressMsg("Géocodage de l'arrivée…");
        const endCoords = await geocode(endText.trim());
        setProgressMsg('Calcul BRouter…');
        const route_ = await generateDirectRoute(startCoords, endCoords, terrain);
        setResults([route_]);
      } else {
        const { routes, usedFallback } = await generateLoopRoutes(startCoords, distance, elevation, terrain, (_step, msg) => setProgressMsg(msg));
        if (!routes.length) {
          showToast(
            terrain === 'trail' ? 'Aucun sentier trouvé — essaie une autre zone ou réduis la distance.' : 'Aucun parcours généré — modifie les critères et réessaie.',
            true
          );
          return;
        }
        setResults(routes);
        if (usedFallback) showToast(terrain === 'trail' ? 'Zone peu boisée — meilleurs sentiers affichés.' : 'Dénivelé exact indisponible.', true);
      }
      navigation.navigate('GenerateResults');
    } catch (e) {
      showToast(formatBRouterError(e), true);
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <ChoiceGrid options={TERRAIN_OPTIONS} value={terrain} onSelect={setTerrain} columns={4} />

        <SliderField
          label="Distance"
          value={distance}
          onValueChange={setDistance}
          minimumValue={1}
          maximumValue={100}
          step={0.5}
          formatValue={(v) => `${v.toFixed(1)} km`}
        />
        <SliderField
          label="Dénivelé positif"
          value={elevation}
          onValueChange={setElevation}
          minimumValue={0}
          maximumValue={2000}
          step={25}
          formatValue={(v) => `${v} m`}
        />

        <TextField label="Départ" value={startText} onChangeText={setStartText} placeholder="Adresse ou ville (vide = position GPS)" />
        <Button title="📍 Me géolocaliser" variant="secondary" onPress={handleGeolocate} />
        <TextField label="Arrivée (optionnel)" value={endText} onChangeText={setEndText} placeholder="Pour un itinéraire direct A→B" />

        {generating && <Text style={[styles.progress, { color: tokens.text2, fontFamily: fonts.mono }]}>{progressMsg}</Text>}

        <Button title="Générer les parcours →" onPress={handleGenerate} loading={generating} />
        <Button title="✏️ Dessiner manuellement" variant="secondary" onPress={() => navigation.navigate('DrawRoute')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 40 },
  progress: { fontSize: 12, textAlign: 'center' },
});
