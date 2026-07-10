import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TextField } from './ui/TextField';
import { Button } from './ui/Button';
import { useTheme } from '../theme/ThemeContext';
import { radii, fonts } from '../theme/tokens';

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
          <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.display }]}>⭐ Noter ce parcours</Text>
          <Text style={[styles.routeName, { color: tokens.text }]}>{routeName}</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Pressable key={i} onPress={() => setScore(i)}>
                <Text style={[styles.star, i <= score && styles.starActive]}>⭐</Text>
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
  title: { fontSize: 18 },
  routeName: { fontSize: 13, fontWeight: '700' },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 28, opacity: 0.3 },
  starActive: { opacity: 1 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
});
