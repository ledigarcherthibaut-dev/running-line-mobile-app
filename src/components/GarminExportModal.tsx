import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './ui/Icon';
import { Button } from './ui/Button';
import { useTheme } from '../theme/ThemeContext';
import { radii, fonts } from '../theme/tokens';

const GARMIN_CONNECT_WEB_URL = 'https://connect.garmin.com/modern/courses/create';

/**
 * Port de #garmin-modal (index.html:2211-2220, sendToGarminMobile:4276-4280) : après export du
 * GPX, guide l'utilisateur pour l'importer dans Garmin Connect — la montre se synchronise ensuite
 * automatiquement. Il n'existe pas de transfert direct app tierce → montre Garmin en Bluetooth,
 * ni de partage direct app tierce → appli Garmin Connect : elle ne s'inscrit pas comme
 * destinataire dans la feuille de partage Android/iOS (ce n'est pas une limite de cette app),
 * d'où les deux étapes distinctes ci-dessous plutôt qu'un simple "envoyer".
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
            <Icon name="watch" size={18} color={tokens.sky} />
            <Text style={[styles.title, { color: tokens.sky, fontFamily: fonts.display }]}>Importer dans Garmin</Text>
          </View>
          <Text style={[styles.body, { color: tokens.text2 }]}>
            <Text style={{ color: tokens.text, fontWeight: '700' }}>{filename}</Text> a été enregistré. Garmin Connect
            n'apparaît jamais dans la fenêtre de partage qui vient de s'ouvrir (ce n'est pas un bug — l'appli ne
            reçoit pas de fichiers par ce biais) : choisis-y « Fichiers »/« Drive »/« Téléchargements » pour garder
            le GPX quelque part, puis importe-le avec l'une des deux méthodes ci-dessous.
          </Text>

          <Pressable
            style={[styles.openBtn, { backgroundColor: tokens.skyDim, borderColor: tokens.sky }]}
            onPress={() => Linking.openURL(GARMIN_CONNECT_WEB_URL)}
          >
            <Text style={[styles.openBtnText, { color: tokens.sky, fontFamily: fonts.display }]}>Ouvrir Garmin Connect (web)</Text>
            <Icon name="arrow-right" size={16} color={tokens.sky} />
          </Pressable>

          <View style={styles.steps}>
            <Step index={1} text="Connecte-toi sur connect.garmin.com" color={tokens.text2} accent={tokens.text} />
            <Step index={2} text="Créer un parcours → Importer un fichier → sélectionne le GPX enregistré" color={tokens.text2} accent={tokens.text} />
          </View>

          <Text style={[styles.altLabel, { color: tokens.text3, fontFamily: fonts.mono }]}>OU DEPUIS L'APPLI GARMIN CONNECT</Text>
          <View style={styles.steps}>
            <Step index={1} text="Plus → Entraînement → Parcours" color={tokens.text2} accent={tokens.text} />
            <Step index={2} text="Icône Importer → sélectionne le fichier GPX enregistré" color={tokens.text2} accent={tokens.text} />
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
  altLabel: { fontSize: 10, letterSpacing: 0.8, marginTop: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIndex: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepIndexText: { fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 13 },
});
