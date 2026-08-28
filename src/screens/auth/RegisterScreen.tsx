import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { signUp } from '../../lib/supabase/auth';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii, ThemeMode } from '../../theme/tokens';
import { passwordStrength } from '../../lib/passwordStrength';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type FeatherName = keyof typeof Feather.glyphMap;

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: FeatherName }[] = [
  { value: 'dark', label: 'Sombre', icon: 'moon' },
  { value: 'auto', label: 'Auto', icon: 'smartphone' },
  { value: 'light', label: 'Clair', icon: 'sun' },
];

/** Port de doRegister (index.html:3140-3152) + choix du thème initial (regThemeChoice). */
export function RegisterScreen({ navigation }: Props) {
  const { tokens, setMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Aligné sur le défaut réel de ThemeContext (sombre) — sinon valider sans toucher au
  // sélecteur appliquait silencieusement 'auto' à la place du sombre par défaut de l'app.
  const [themeChoice, setThemeChoice] = useState<ThemeMode>('dark');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(password);

  async function handleRegister() {
    setError('');
    if (!email.trim() || password.length < 6) {
      setError('Email valide et mot de passe 6 caractères min.');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // Applique le choix de thème fait à l'inscription ; repris tel quel par saveProfile() en fin d'onboarding.
    setMode(themeChoice);
    // AuthProvider détecte la session -> needsOnboarding=true -> RootNavigator route vers OnboardingStack.
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.brand, { color: tokens.text, fontFamily: fonts.display }]}>RUNNING LINE</Text>

          <View style={[styles.card, { backgroundColor: tokens.surface }]}>
            <Text style={[styles.cardTitle, { color: tokens.text, fontFamily: fonts.display }]}>CRÉER UN COMPTE</Text>
            <Text style={[styles.cardSubtitle, { color: tokens.text2 }]}>Rejoins Running Line gratuitement</Text>

            <TextField label="Prénom" value={name} onChangeText={setName} placeholder="Prénom" autoComplete="name" />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextField
              label="Mot de passe (6 caractères min.)"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password-new"
            />
            {strength && (
              <Text style={[styles.strength, { color: tokens[strength.color] }]}>Robustesse : {strength.label}</Text>
            )}

            <Text style={[styles.sectionLabel, { color: tokens.text3, fontFamily: fonts.mono }]}>THÈME</Text>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setThemeChoice(opt.value)}
                  style={[
                    styles.themeCard,
                    { backgroundColor: tokens.surface2, borderColor: 'transparent' },
                    themeChoice === opt.value && { borderColor: tokens.onAccent, backgroundColor: tokens.accent },
                  ]}
                >
                  <Feather name={opt.icon} size={20} color={themeChoice === opt.value ? tokens.onAccent : tokens.text} />
                  <Text style={[styles.themeLabel, { color: themeChoice === opt.value ? tokens.onAccent : tokens.text }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>

            {!!error && <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text>}

            <Button title="Créer mon compte" onPress={handleRegister} loading={loading} style={styles.submit} />

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: tokens.text2 }]}>Déjà un compte ? </Text>
              <Button title="Se connecter" variant="text" onPress={() => navigation.goBack()} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingTop: 24, gap: 8 },
  brand: { textAlign: 'center', fontSize: 26, marginBottom: 24 },
  card: { borderRadius: 28, padding: 24, gap: 14 },
  cardTitle: { fontSize: 22 },
  cardSubtitle: { fontSize: 14, marginBottom: 6 },
  strength: { fontSize: 11, marginTop: -4 },
  sectionLabel: { fontSize: 11, letterSpacing: 0.5, marginTop: 4 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeCard: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, borderRadius: radii.md, borderWidth: 1.5 },
  themeLabel: { fontSize: 13 },
  error: { fontSize: 13 },
  submit: { marginTop: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  footerText: { fontSize: 13 },
});
