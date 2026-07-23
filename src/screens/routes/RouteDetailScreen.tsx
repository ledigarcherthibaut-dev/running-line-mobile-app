import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RouteMap } from '../../components/map/RouteMap';
import { RouteMapHandle } from '../../components/map/RouteMap.types';
import { ElevationChart } from '../../components/charts/ElevationChart';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { RateRouteModal } from '../../components/RateRouteModal';
import { GarminExportModal } from '../../components/GarminExportModal';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useToast } from '../../state/ToastContext';
import { useGarminExport } from '../../hooks/useGarminExport';
import { estimateDurationLabel } from '../../lib/routing/pace';
import { fetchCommunityRouteDetail, saveRoute, submitRating } from '../../lib/supabase/routes';
import type { RouteDetailParams } from '../../navigation/types';
import { SavedRoute } from '../../types';

type RouteDetailRouteProp = RouteProp<{ RouteDetail: RouteDetailParams }, 'RouteDetail'>;
const DEFAULT_REGION = { latitude: 46.5, longitude: 2.5, latitudeDelta: 6, longitudeDelta: 6 };

/** Détail d'un parcours possédé (Mes parcours) ou communautaire (Explorer) — même écran, deux sources de données. */
export function RouteDetailScreen() {
  const { tokens } = useTheme();
  const navigation = useNavigation();
  const { params } = useRoute<RouteDetailRouteProp>();
  const { session, profile } = useAuth();
  const { savedRoutes, toggleFavorite, togglePublic, rename, remove, refresh } = useRoutes();
  const { showToast } = useToast();
  const mapRef = useRef<RouteMapHandle>(null);
  const [communityRoute, setCommunityRoute] = useState<SavedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateVisible, setRateVisible] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [renaming, setRenaming] = useState(false);
  const { garminModalVisible, garminFilename, closeGarminModal, exportToGarmin } = useGarminExport();

  const owned = savedRoutes.find((r) => r.id === params.routeId);
  const route = owned ?? communityRoute;

  useEffect(() => {
    if (owned) return;
    let cancelled = false;
    setLoading(true);
    fetchCommunityRouteDetail(params.routeId)
      .then((r) => !cancelled && setCommunityRoute(r))
      .catch((e) => !cancelled && showToast(e.message, true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.routeId, owned]);

  useEffect(() => {
    if (route) {
      requestAnimationFrame(() => mapRef.current?.fitToCoordinates(route.coords.map((c) => ({ lat: c[1], lng: c[0] }))));
    }
  }, [route]);

  async function handleSaveToMine() {
    if (!route || !profile) return;
    const { error } = await saveRoute(profile.id, profile.name, route, route.name, route.terrain, false, false);
    if (error) showToast(error.message, true);
    else {
      await refresh();
      showToast('Ajouté à tes parcours', false, 3000, 'save');
    }
  }

  async function handleRate(score: number, comment: string) {
    if (!route || !session?.user) return;
    const { error } = await submitRating(session.user.id, route.id, score, comment);
    if (error) showToast(error.message, true);
    else showToast(`Note ${score}/5 envoyée !`, false, 3000, 'star');
    setRateVisible(false);
  }

  function startRename() {
    if (!owned) return;
    setNameInput(owned.name);
    setEditingName(true);
  }

  async function handleRename() {
    if (!owned) return;
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === owned.name) {
      setEditingName(false);
      return;
    }
    setRenaming(true);
    try {
      await rename(owned.id, trimmed);
      setEditingName(false);
      showToast('Parcours renommé', false, 2500, 'edit-2');
    } catch (e) {
      showToast((e as Error).message, true);
    } finally {
      setRenaming(false);
    }
  }

  function confirmDelete() {
    if (!owned) return;
    Alert.alert('Supprimer ce parcours ?', owned.name, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await remove(owned.id);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loading || !route) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={{ color: tokens.text2 }}>{loading ? 'Chargement…' : 'Parcours introuvable.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const duration = estimateDurationLabel(route.distKm, profile?.vma);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <View style={styles.mapArea}>
        <RouteMap
          ref={mapRef}
          initialRegion={DEFAULT_REGION}
          routes={[{ id: 'r', coords: route.coords, color: tokens.secondary }]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {editingName ? (
          <View style={styles.renameRow}>
            <View style={styles.renameField}>
              <TextField label="Nom" value={nameInput} onChangeText={setNameInput} autoFocus />
            </View>
            <Button title="OK" icon="check" onPress={handleRename} loading={renaming} style={styles.renameBtn} />
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: tokens.text, fontFamily: fonts.display }]}>{route.name}</Text>
            {owned && (
              <Pressable onPress={startRename} hitSlop={8} accessibilityRole="button" accessibilityLabel="Renommer ce parcours">
                <Feather name="edit-2" size={16} color={tokens.text3} />
              </Pressable>
            )}
          </View>
        )}
        {!!duration && (
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

        <ElevationChart elevations={route.elevation.elevations} color={tokens.secondary} height={50} />

        <View style={styles.actions}>
          <Button title="Noter" icon="star" variant="secondary" onPress={() => setRateVisible(true)} style={styles.actionBtn} />
          <Button title="Envoyer vers Garmin" icon="watch" onPress={() => exportToGarmin(route).catch((e) => showToast(e.message, true))} style={styles.actionBtn} />
        </View>

        {owned ? (
          <>
            <View style={styles.actions}>
              <Button
                title={owned.isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                icon="heart"
                variant="secondary"
                onPress={() => toggleFavorite(owned.id)}
                style={styles.actionBtn}
              />
              <Button
                title={owned.isPublic ? 'Rendre privé' : 'Partager'}
                icon={owned.isPublic ? 'lock' : 'globe'}
                variant="secondary"
                onPress={() => togglePublic(owned.id)}
                style={styles.actionBtn}
              />
            </View>
            <Button title="Supprimer ce parcours" icon="trash-2" variant="secondary" onPress={confirmDelete} style={{ borderColor: 'rgba(229,62,62,0.3)' }} />
          </>
        ) : (
          <Button title="Sauvegarder dans mes parcours" icon="save" onPress={handleSaveToMine} />
        )}
      </ScrollView>

      <RateRouteModal visible={rateVisible} routeName={route.name} onCancel={() => setRateVisible(false)} onSubmit={handleRate} />
      <GarminExportModal visible={garminModalVisible} filename={garminFilename} onClose={closeGarminModal} />
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: tokens.surface2, borderColor: tokens.border }]}>
      <Text style={[styles.statVal, { color: tokens.text, fontFamily: fonts.mono }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: tokens.text3, fontFamily: fonts.mono }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapArea: { height: '35%' },
  body: { padding: 16, gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontSize: 20 },
  renameRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  renameField: { flex: 1 },
  renameBtn: { height: 50 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -6 },
  durationText: { fontSize: 11 },
  statsRow: { flexDirection: 'row', gap: 6 },
  stat: { flex: 1, borderRadius: radii.xs, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  statVal: { fontSize: 14, fontWeight: '700' },
  statLabel: { fontSize: 9 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1 },
});
