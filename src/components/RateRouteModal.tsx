import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './ui/Icon';
import { TextField } from './ui/TextField';
import { Button } from './ui/Button';
import { useTheme } from '../theme/ThemeContext';
import { radii, fonts } from '../theme/tokens';
import { hapticSelect } from '../lib/haptics';

/** Port de #rate-modal (index.html:2244-2259). */
export function RateRouteModal({
  visible,
  routeName,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  routeName: string;
  onCancel: () => void;
  onSubmit: (score: number, comment: string) => void;
}) {
  const { tokens } = useTheme();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (visible) {
      setScore(0);
      setComment('');
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: tokens.surface }]}>
          <View style={styles.titleRow}>
            <Icon name="star" size={18} color={tokens.text} />
            <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.display }]}>Noter ce parcours</Text>
          </View>
          <Text style={[styles.routeName, { color: tokens.text }]}>{routeName}</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable
                key={i}
                onPress={() => {
                  hapticSelect();
                  setScore(i);
                }}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`${i} étoile${i > 1 ? 's' : ''}`}
                accessibilityState={{ selected: i <= score }}
              >
                <Icon name="star" size={28} color={i <= score ? tokens.fav : tokens.border3} />
              </Pressable>
            ))}
          </View>

          <TextField label="Commentaire (optionnel)" value={comment} onChangeText={setComment} placeholder="Commentaire" />

          <View style={styles.actions}>
            <Button title="Annuler" variant="secondary" onPress={onCancel} style={styles.actionBtn} />
            <Button title="Envoyer" onPress={() => onSubmit(score, comment.trim())} disabled={score === 0} style={styles.actionBtn} />
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
  routeName: { fontSize: 13, fontWeight: '700' },
  stars: { flexDirection: 'row', gap: 8 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
});
