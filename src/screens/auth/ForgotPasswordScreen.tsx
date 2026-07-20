import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { resetPassword } from '../../lib/supabase/auth';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

/** Port de doForgot (index.html:3154-3166). */
export function ForgotPasswordScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim()) {
      setError('Entre ton email.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
    setTimeout(() => navigation.goBack(), 2000);
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: tokens.surface }]}>
            <Text style={[styles.cardTitle, { color: tokens.text, fontFamily: fonts.display }]}>MOT DE PASSE OUBLIÉ</Text>
            <Text style={[styles.cardSubtitle, { color: tokens.text2 }]}>On t'envoie un lien de réinitialisation par email.</Text>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!sent}
            />

            {!!error && <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text>}
            {sent && (
              <View style={styles.successRow}>
                <Feather name="mail" size={14} color={tokens.success} />
                <Text style={[styles.success, { color: tokens.success }]}>Email envoyé !</Text>
              </View>
            )}

            <Button title="Envoyer le lien" onPress={handleSubmit} loading={loading} disabled={sent} style={styles.submit} />
            <Button title="Retour à la connexion" icon="arrow-left" variant="text" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  card: { borderRadius: 28, padding: 24, gap: 14 },
  cardTitle: { fontSize: 20 },
  cardSubtitle: { fontSize: 14 },
  error: { fontSize: 13 },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  success: { fontSize: 13 },
  submit: { marginTop: 8 },
});
