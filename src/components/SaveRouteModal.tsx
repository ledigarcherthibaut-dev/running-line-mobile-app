import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Icon } from './ui/Icon';
import { TextField } from './ui/TextField';
import { Button } from './ui/Button';
import { useTheme } from '../theme/ThemeContext';
import { radii, fonts } from '../theme/tokens';

/** Port de #save-modal (index.html:2222-2242). */
export function SaveRouteModal({
  visible,
  defaultName,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  defaultName: string;
  onCancel: () => void;
  onConfirm: (name: string, isFav: boolean, isPublic: boolean) => void;
}) {
  const { tokens } = useTheme();
  const [name, setName] = useState(defaultName);
  const [isFav, setIsFav] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (visible) {
      setName(defaultName);
      setIsFav(false);
      setIsPublic(true);
    }
  }, [visible, defaultName]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: tokens.surface }]}>
          <View style={styles.titleRow}>
            <Icon name="save" size={18} color={tokens.text} />
            <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.display }]}>Enregistrer le parcours</Text>
          </View>
          <TextField label="Nom" value={name} onChangeText={setName} placeholder="Ex: Tour de la forêt" />

          <Pressable style={styles.checkRow} onPress={() => setIsFav((v) => !v)}>
            <Switch value={isFav} onValueChange={setIsFav} />
            <Icon name="star" size={14} color={tokens.text2} />
            <Text style={[styles.checkLabel, { color: tokens.text2 }]}>Marquer en favori</Text>
          </Pressable>

          <Pressable
            style={[styles.publicBox, { backgroundColor: tokens.accentDim, borderColor: tokens.accent }]}
            onPress={() => setIsPublic((v) => !v)}
          >
            <Switch value={isPublic} onValueChange={setIsPublic} />
            <View style={styles.publicText}>
              <View style={styles.checkRow}>
                <Icon name="globe" size={14} color={tokens.text} />
                <Text style={[styles.publicTitle, { color: tokens.text }]}>Partager à la communauté</Text>
              </View>
              <Text style={[styles.publicSub, { color: tokens.text2 }]}>Visible dans l'explorateur pour tous</Text>
            </View>
          </Pressable>

          <View style={styles.actions}>
            <Button title="Annuler" variant="secondary" onPress={onCancel} style={styles.actionBtn} />
            <Button title="Enregistrer" onPress={() => onConfirm(name.trim() || defaultName, isFav, isPublic)} style={styles.actionBtn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 24, gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkLabel: { fontSize: 13 },
  publicBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: radii.md, padding: 14 },
  publicText: { flex: 1 },
  publicTitle: { fontSize: 13, fontWeight: '600' },
  publicSub: { fontSize: 11, fontFamily: fonts.mono, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
});
