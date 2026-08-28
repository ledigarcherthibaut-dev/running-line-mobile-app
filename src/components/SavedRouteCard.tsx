import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from './ui/Icon';
import { useTheme } from '../theme/ThemeContext';
import { radii, fonts } from '../theme/tokens';
import { hapticSelect } from '../lib/haptics';
import { RouteSatellitePreview } from './routePreview/RouteSatellitePreview';
import { SavedRoute } from '../types';

/** Port de buildSavedHTML (index.html:3604-3667). */
export function SavedRouteCard({
  route,
  onOpen,
  onToggleFavorite,
  onTogglePublic,
  onRate,
  onExportGpx,
  onDelete,
}: {
  route: SavedRoute;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onTogglePublic: () => void;
  onRate: () => void;
  onExportGpx: () => void;
  onDelete: () => void;
}) {
  const { tokens } = useTheme();

  function confirmDelete() {
    Alert.alert('Supprimer ce parcours ?', route.name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <Pressable onPress={onOpen} style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      <View style={styles.preview}>
        <RouteSatellitePreview coords={route.coords} color={tokens.accent} />
        {route.isFav && (
          <View style={styles.favBadge}>
            <Icon name="star" size={10} color={tokens.fav} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={[styles.name, { color: tokens.text, fontFamily: fonts.display }]} numberOfLines={1}>
          {route.name}
        </Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statVal, { color: tokens.accent, fontFamily: fonts.mono }]}>{route.distKm.toFixed(1)} km</Text>
          <View style={[styles.statSep, { backgroundColor: tokens.border2 }]} />
          <Text style={[styles.statVal, { color: tokens.accent, fontFamily: fonts.mono }]}>D+{route.elevation.totalAscent}m</Text>
          <Text style={[styles.meta, { color: tokens.text3 }]}> · {route.terrain || 'mixte'}</Text>
        </View>

        <View style={styles.actions}>
          <ActionBtn
            icon="star"
            active={route.isFav}
            onPress={onToggleFavorite}
            label={route.isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          />
          <ActionBtn icon="message-circle" onPress={onRate} label="Noter ce parcours" />
          <ActionBtn
            icon={route.isPublic ? 'globe' : 'lock'}
            active={route.isPublic}
            onPress={onTogglePublic}
            label={route.isPublic ? 'Rendre privé' : 'Partager à la communauté'}
          />
          <ActionBtn icon="watch" onPress={onExportGpx} label="Envoyer vers Garmin" />
          <ActionBtn icon="trash-2" danger onPress={confirmDelete} label="Supprimer ce parcours" />
        </View>
      </View>
    </Pressable>
  );
}

function ActionBtn({
  icon,
  active,
  danger,
  onPress,
  label,
}: {
  icon: IconName;
  active?: boolean;
  danger?: boolean;
  onPress: () => void;
  label: string;
}) {
  const { tokens } = useTheme();
  return (
    <Pressable
      onPress={() => {
        hapticSelect();
        onPress();
      }}
      style={[
        styles.actionBtn,
        { backgroundColor: tokens.surface2, borderColor: tokens.border },
        active && { backgroundColor: tokens.accentDim, borderColor: tokens.accent },
      ]}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active !== undefined ? { selected: active } : undefined}
    >
      <Icon name={icon} size={18} color={danger ? tokens.danger : active ? tokens.text : tokens.text2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.md, overflow: 'hidden', borderWidth: 1 },
  preview: { height: 130 },
  favBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radii.full,
    padding: 6,
  },
  body: { padding: 12, gap: 6 },
  name: { fontSize: 15 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statVal: { fontSize: 13, fontWeight: '700' },
  statSep: { width: 3, height: 3, borderRadius: 1.5 },
  meta: { fontSize: 11 },
  actions: { flexDirection: 'row', gap: 6, marginTop: 2 },
  actionBtn: { width: 40, height: 40, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
