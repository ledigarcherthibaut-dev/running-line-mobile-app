import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ChoiceGrid } from '../../components/ui/ChoiceGrid';
import { SliderField } from '../../components/ui/SliderField';
import { AddressAutocompleteField } from '../../components/ui/AddressAutocompleteField';
import { Button } from '../../components/ui/Button';
import { RouteMap } from '../../components/map/RouteMap';
import { RouteMapHandle } from '../../components/map/RouteMap.types';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { useGenerate } from '../../state/GenerateContext';
import { useToast } from '../../state/ToastContext';
import { getUserLocation } from '../../lib/location/location';
import { geocode, PlaceSuggestion } from '../../lib/api/geocode';
import { generateDirectRoute, generateLoopRoutes, randomStartNear } from '../../lib/routing/generateRoutes';
import { formatBRouterError } from '../../lib/routing/brouter';
import type { MapRegion } from '../../lib/routing/geo';
import type { GenerateStackParamList } from '../../navigation/types';
import { Terrain } from '../../types';

type Props = NativeStackScreenProps<GenerateStackParamList, 'GenerateScreen'>;

const TERRAIN_OPTIONS = [
  { value: 'road' as Terrain, icon: 'navigation' as const, label: 'Route' },
  { value: 'mixed' as Terrain, icon: 'git-merge' as const, label: 'Mixte' },
  { value: 'trail' as Terrain, icon: 'trending-up' as const, label: 'Trail' },
  { value: 'any' as Terrain, icon: 'shuffle' as const, label: 'Peu importe' },
];

const FALLBACK_REGION: MapRegion = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };
const PEEK_HEIGHT = 96;
/** Seuil de bascule vers l'état réduit — 40% du parcours de la poignée, sinon la vitesse du geste tranche. */
const COLLAPSE_RATIO = 0.4;
const FLICK_VELOCITY = 0.8;

/** Port de #page-generate (panneau de config, index.html:456-750) — désormais en volet
 * rétractable au-dessus d'une carte plein écran (au lieu d'un simple formulaire scrollable). */
export function GenerateScreen({ navigation, route }: Props) {
  const { tokens } = useTheme();
  const { showToast } = useToast();
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { terrain, setTerrain, distance, setDistance, elevation, setElevation, userCoords, setUserCoords, setResults } = useGenerate();

  const [startText, setStartText] = useState('');
  const [startPlace, setStartPlace] = useState<PlaceSuggestion | null>(null);
  const [endText, setEndText] = useState('');
  const [endPlace, setEndPlace] = useState<PlaceSuggestion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const mapRef = useRef<RouteMapHandle>(null);
  const panelHeight = Math.round(screenHeight * 0.5);
  const peekHeight = PEEK_HEIGHT + insets.bottom;
  const maxTranslate = Math.max(panelHeight - peekHeight, 0);

  const translateY = useRef(new Animated.Value(0)).current;
  const dragStartRef = useRef(0);

  function snapTo(toCollapsed: boolean) {
    setCollapsed(toCollapsed);
    if (toCollapsed) Keyboard.dismiss();
    Animated.spring(translateY, {
      toValue: toCollapsed ? maxTranslate : 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartRef.current = collapsed ? maxTranslate : 0;
        translateY.stopAnimation();
      },
      onPanResponderMove: (_e, g) => {
        const next = Math.min(Math.max(dragStartRef.current + g.dy, 0), maxTranslate);
        translateY.setValue(next);
      },
      onPanResponderRelease: (_e, g) => {
        const isTap = Math.abs(g.dy) < 6 && Math.abs(g.dx) < 6;
        if (isTap) {
          snapTo(!collapsed);
          return;
        }
        const current = dragStartRef.current + g.dy;
        const shouldCollapse = current > maxTranslate * COLLAPSE_RATIO || g.vy > FLICK_VELOCITY;
        snapTo(shouldCollapse);
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ).current;

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

  const initialRegion = useMemo<MapRegion>(() => {
    if (userCoords) return { latitude: userCoords.lat, longitude: userCoords.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 };
    return FALLBACK_REGION;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focusCoords = startPlace?.coords ?? userCoords;

  /** Recentre la carte dès qu'on a une position exploitable (GPS ou départ choisi). */
  useEffect(() => {
    if (focusCoords) {
      mapRef.current?.animateToRegion({ latitude: focusCoords.lat, longitude: focusCoords.lng, latitudeDelta: 0.06, longitudeDelta: 0.06 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusCoords?.lat, focusCoords?.lng]);

  const markers = useMemo(
    () => (focusCoords ? [{ id: 'start', coord: focusCoords, color: tokens.accent }] : []),
    [focusCoords, tokens.accent]
  );

  async function handleGenerate() {
    snapTo(false);
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

  const terrainLabel = TERRAIN_OPTIONS.find((t) => t.value === terrain)?.label ?? '';

  return (
    <View style={styles.flex}>
      <RouteMap ref={mapRef} initialRegion={initialRegion} markers={markers} />

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
        <View {...panResponder.panHandlers} style={styles.handleZone}>
          <View style={[styles.handleBar, { backgroundColor: tokens.border3 }]} />
          {collapsed ? (
            <View style={styles.peekRow}>
              <Feather name="sliders" size={13} color={tokens.text2} />
              <Text style={[styles.peekText, { color: tokens.text, fontFamily: fonts.mono }]}>
                {distance.toFixed(1)} km · {terrainLabel}
              </Text>
              <Feather name="chevron-up" size={16} color={tokens.text3} />
            </View>
          ) : (
            <View style={styles.peekRow}>
              <Text style={[styles.panelTitle, { color: tokens.text3, fontFamily: fonts.mono }]}>OPTIONS DE GÉNÉRATION</Text>
              <Feather name="chevron-down" size={16} color={tokens.text3} />
            </View>
          )}
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={12}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" scrollEnabled={!collapsed}>
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
      </Animated.View>
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
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 6, gap: 8 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  peekRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  peekText: { fontSize: 12, flex: 1, textAlign: 'center' },
  panelTitle: { fontSize: 10.5, letterSpacing: 1, flex: 1, textAlign: 'center' },
  container: { padding: 16, paddingTop: 4, gap: 14, paddingBottom: 40 },
  progress: { fontSize: 12, textAlign: 'center' },
});
