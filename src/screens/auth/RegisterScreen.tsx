import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { signUp } from '../../lib/supabase/auth';
import { useTheme } from '../../theme/ThemeContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    const { error: signUpError } = await signUp(email.trim(), password);
    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    navigation.navigate('OnboardingStep1');
  }

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Créer un compte</Text>

      <TextInput
        style={[styles.input, { borderColor: tokens.border2, color: tokens.text }]}
        placeholder="Email"
        placeholderTextColor={tokens.text3}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { borderColor: tokens.border2, color: tokens.text }]}
        placeholder="Mot de passe"
        placeholderTextColor={tokens.text3}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={{ color: tokens.danger }}>{error}</Text> : null}

      <Pressable
        style={[styles.button, { backgroundColor: tokens.accent }]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Création…' : "Créer le compte"}</Text>
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ color: tokens.text2 }}>J'ai déjà un compte</Text>
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
    fontSize: 24,
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
