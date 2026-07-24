import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoiceGrid } from '../../components/ui/ChoiceGrid';
import { SliderField } from '../../components/ui/SliderField';
import { AddressAutocompleteField } from '../../components/ui/AddressAutocompleteField';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/tokens';
import { useGenerate } from '../../state/GenerateContext';
import { useToast } from '../../state/ToastContext';
import { getUserLocation } from '../../lib/location/location';
import { geocode, PlaceSuggestion } from '../../lib/api/geocode';
import { generateDirectRoute, generateLoopRoutes, randomStartNear } from '../../lib/routing/generateRoutes';
import { formatBRouterError } from '../../lib/routing/brouter';
import type { GenerateStackParamList } from '../../navigation/types';
import { Terrain } from '../../types';

type Props = NativeStackScreenProps<GenerateStackParamList, 'GenerateScreen'>;

const TERRAIN_OPTIONS = [
  { value: 'road' as Terrain, icon: 'navigation' as const, label: 'Route' },
  { value: 'mixed' as Terrain, icon: 'git-merge' as const, label: 'Mixte' },
  { value: 'trail' as Terrain, icon: 'trending-up' as const, label: 'Trail' },
  { value: 'any' as Terrain, icon: 'shuffle' as const, label: 'Peu importe' },
];

/** Port de #page-generate (panneau de config, index.html:456-750). */
export function GenerateScreen({ navigation, route }: Props) {
  const { tokens } = useTheme();
  const { showToast } = useToast();
  const { terrain, setTerrain, distance, setDistance, elevation, setElevation, userCoords, setUserCoords, setResults } = useGenerate();

  const [startText, setStartText] = useState('');
  const [startPlace, setStartPlace] = useState<PlaceSuggestion | null>(null);
  const [endText, setEndText] = useState('');
  const [endPlace, setEndPlace] = useState<PlaceSuggestion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  /** Port de quickGenerate (index.html:3330-3342) — préréglage venant d'Accueil. */
  useEffect(() => {
    if (route.params?.presetKm) setDistance(route.params.presetKm);
    if (route.params?.presetTerrain) setTerrain(route.params.presetTerrain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  /**
   * Géolocalisation automatique dès l'arrivée sur l'écran (au lieu d'un bouton à cliquer) :
   * sert de base par défaut si aucune adresse n'est saisie, et de zone privilégiée pour
   * l'autocomplétion. Échec silencieux (pas de GPS/permission refusée) — l'utilisateur peut
   * toujours saisir une adresse manuellement, generateRoutes() re-tente la géolocalisation
   * au moment de générer si besoin.
   */
  useEffect(() => {
    if (userCoords) return;
    getUserLocation()
      .then(setUserCoords)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        startCoords = startPlace?.coords ?? (await geocode(startText.trim()));
      } else if (center) {
        startCoords = randomStartNear(center);
      }
      if (!startCoords) throw new Error('Position de départ introuvable.');

      if (endText.trim()) {
        setProgressMsg("Géocodage de l'arrivée…");
        const endCoords = endPlace?.coords ?? (await geocode(endText.trim()));
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={12}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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

          <AddressAutocompleteField
            label="Départ"
            value={startText}
            onChangeText={setStartText}
            onSelectPlace={setStartPlace}
            placeholder="Adresse ou ville (vide = position GPS)"
            biasCoords={userCoords}
          />
          <AddressAutocompleteField
            label="Arrivée (optionnel)"
            value={endText}
            onChangeText={setEndText}
            onSelectPlace={setEndPlace}
            placeholder="Pour un itinéraire direct A→B"
            biasCoords={startPlace?.coords ?? userCoords}
          />

          {generating && <Text style={[styles.progress, { color: tokens.text2, fontFamily: fonts.mono }]}>{progressMsg}</Text>}

          <Button title="Générer les parcours" icon="arrow-right" iconPosition="right" onPress={handleGenerate} loading={generating} />
          <Button title="Dessiner manuellement" icon="edit-3" variant="secondary" onPress={() => navigation.navigate('DrawRoute')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 40 },
  progress: { fontSize: 12, textAlign: 'center' },
});
