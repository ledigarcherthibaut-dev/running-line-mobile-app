import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { resetPassword } from '../../lib/supabase/auth';
import { useTheme } from '../../theme/ThemeContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setStatus('sending');
    const { error: resetError } = await resetPassword(email.trim());
    if (resetError) {
      setError(resetError.message);
      setStatus('idle');
      return;
    }
    setStatus('sent');
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Mot de passe oublié</Text>

      <TextInput
        style={[styles.input, { borderColor: tokens.border2, color: tokens.text }]}
        placeholder="Email"
        placeholderTextColor={tokens.text3}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {error ? <Text style={{ color: tokens.danger }}>{error}</Text> : null}
      {status === 'sent' ? (
        <Text style={{ color: tokens.success }}>Email de réinitialisation envoyé.</Text>
      ) : null}

      <Pressable
        style={[styles.button, { backgroundColor: tokens.accent }]}
        onPress={handleSubmit}
        disabled={status === 'sending'}
      >
        <Text style={styles.buttonText}>{status === 'sending' ? 'Envoi…' : 'Envoyer le lien'}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ color: tokens.text2 }}>Retour</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
