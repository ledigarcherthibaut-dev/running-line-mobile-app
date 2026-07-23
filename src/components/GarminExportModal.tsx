import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { useTheme } from '../theme/ThemeContext';
import { radii, fonts } from '../theme/tokens';

const GARMIN_CONNECT_URL = 'https://connect.garmin.com/modern/courses/create';

/**
 * Port de #garmin-modal (index.html:2211-2220, sendToGarminMobile:4276-4280) : après export du
 * GPX, guide l'utilisateur pour l'importer dans Garmin Connect — la montre se synchronise ensuite
 * automatiquement. Il n'existe pas de transfert direct app tierce → montre Garmin en Bluetooth.
 */
export function GarminExportModal({
  visible,
  filename,
  onClose,
}: {
  visible: boolean;
  filename: string;
  onClose: () => void;
}) {
  const { tokens } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: tokens.surface }]}>
          <View style={styles.titleRow}>
            <Feather name="watch" size={18} color={tokens.sky} />
            <Text style={[styles.title, { color: tokens.sky, fontFamily: fonts.display }]}>Envoyer vers Garmin</Text>
          </View>
          <Text style={[styles.body, { color: tokens.text2 }]}>
            Le fichier <Text style={{ color: tokens.text, fontWeight: '700' }}>{filename}</Text> a été exporté.
          </Text>

          <Pressable
            style={[styles.openBtn, { backgroundColor: tokens.skyDim, borderColor: tokens.sky }]}
            onPress={() => Linking.openURL(GARMIN_CONNECT_URL)}
          >
            <Text style={[styles.openBtnText, { color: tokens.sky, fontFamily: fonts.display }]}>Ouvrir Garmin Connect</Text>
            <Feather name="arrow-right" size={16} color={tokens.sky} />
          </Pressable>

          <View style={styles.steps}>
            <Step index={1} text="Menu Plus → Entraînements → Parcours" color={tokens.text2} accent={tokens.text} />
            <Step index={2} text="Icône Importer → sélectionne le fichier GPX" color={tokens.text2} accent={tokens.text} />
          </View>

          <Button title="Compris" icon="check" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function Step({ index, text, color, accent }: { index: number; text: string; color: string; accent: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepIndex, { borderColor: accent }]}>
        <Text style={[styles.stepIndexText, { color: accent }]}>{index}</Text>
      </View>
      <Text style={[styles.stepText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: 24, gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18 },
  body: { fontSize: 13, lineHeight: 18 },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingVertical: 13,
  },
  openBtnText: { fontSize: 14 },
  steps: { gap: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIndex: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepIndexText: { fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 13 },
});
