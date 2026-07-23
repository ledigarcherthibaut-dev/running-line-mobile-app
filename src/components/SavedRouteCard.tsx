import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { radii, fonts } from '../theme/tokens';
import { hapticSelect } from '../lib/haptics';
import { RoutePreviewSvg } from './routePreview/RoutePreviewSvg';
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
        <RoutePreviewSvg coords={route.coords} color={tokens.secondary} />
        <View style={[styles.colorBar, { backgroundColor: tokens.secondary }]} />
        {route.isFav && (
          <View style={styles.favBadge}>
            <Feather name="star" size={10} color={tokens.fav} />
            <Text style={styles.favBadgeText}>Favori</Text>
          </View>
        )}
        <Text style={styles.previewMeta}>
          {route.distKm.toFixed(1)} km · D+{route.elevation.totalAscent}m
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.name, { color: tokens.text, fontFamily: fonts.display }]} numberOfLines={1}>
          {route.name}
        </Text>
        <Text style={[styles.meta, { color: tokens.text3 }]}>{route.terrain || 'mixte'} · sauvegardé</Text>

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
  icon: keyof typeof Feather.glyphMap;
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
      <Feather name={icon} size={18} color={danger ? tokens.danger : active ? tokens.text : tokens.text2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.md, overflow: 'hidden', borderWidth: 1 },
  preview: { height: 90, backgroundColor: '#080d12', justifyContent: 'flex-end', padding: 8 },
  colorBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  favBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  favBadgeText: { fontSize: 10, color: '#fff', fontFamily: fonts.mono },
  previewMeta: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: fonts.mono, backgroundColor: 'rgba(0,0,0,0.35)', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  body: { padding: 12, gap: 4 },
  name: { fontSize: 14 },
  meta: { fontSize: 10, fontFamily: fonts.mono, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 40, height: 40, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
