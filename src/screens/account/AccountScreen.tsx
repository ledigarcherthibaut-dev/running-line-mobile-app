import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ChoiceGrid } from '../../components/ui/ChoiceGrid';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { TimeStepper } from '../../components/ui/TimeStepper';
import { useAuth } from '../../state/AuthContext';
import { useRoutes } from '../../state/RoutesContext';
import { useToast } from '../../state/ToastContext';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii, ThemeMode } from '../../theme/tokens';
import { savePhysicalData, updateProfilePreference } from '../../lib/supabase/profile';
import { signOut, updatePassword } from '../../lib/supabase/auth';
import { deleteAccountData } from '../../lib/supabase/account';
import { cancelDailyReminder, getReminderSettings, setDailyReminder } from '../../lib/notifications';
import { passwordStrength } from '../../lib/passwordStrength';
import { exportUserData } from '../../lib/exportUserData';
import { Level, Terrain, UserProfile } from '../../types';

type FeatherName = keyof typeof Feather.glyphMap;

const LEVEL_OPTIONS = [
  { value: 'beginner' as Level, icon: 'sunrise' as const, label: 'Débutant' },
  { value: 'intermediate' as Level, icon: 'activity' as const, label: 'Inter.' },
  { value: 'advanced' as Level, icon: 'zap' as const, label: 'Avancé' },
];
const TERRAIN_OPTIONS = [
  { value: 'road' as Terrain, icon: 'navigation' as const, label: 'Route' },
  { value: 'mixed' as Terrain, icon: 'git-merge' as const, label: 'Mixte' },
  { value: 'trail' as Terrain, icon: 'trending-up' as const, label: 'Trail' },
  { value: 'any' as Terrain, icon: 'shuffle' as const, label: 'Peu importe' },
];
const THEME_LABEL: Record<ThemeMode, string> = { dark: 'Sombre', auto: 'Auto', light: 'Clair' };
const THEME_ICON: Record<ThemeMode, FeatherName> = { dark: 'moon', auto: 'smartphone', light: 'sun' };

/** Port de screen-account (index.html:2119-2171). */
export function AccountScreen() {
  const { session, profile, setProfile } = useAuth();
  const { savedRoutes } = useRoutes();
  const { tokens, mode, cycleMode } = useTheme();
  const { showToast } = useToast();
  const [vma, setVma] = useState(profile?.vma ? String(profile.vma) : '');
  const [fcMax, setFcMax] = useState(profile?.fc_max ? String(profile.fc_max) : '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPhysical, setSavingPhysical] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState({ hour: 18, minute: 0 });
  const [reminderBusy, setReminderBusy] = useState(false);

  useEffect(() => {
    getReminderSettings().then((s) => {
      setReminderEnabled(s.enabled);
      setReminderTime({ hour: s.hour, minute: s.minute });
    });
  }, []);

  if (!session?.user || !profile) return null;

  async function toggleReminder(value: boolean) {
    setReminderBusy(true);
    try {
      if (value) {
        await setDailyReminder(reminderTime.hour, reminderTime.minute);
        setReminderEnabled(true);
      } else {
        await cancelDailyReminder();
        setReminderEnabled(false);
      }
    } catch (e) {
      showToast((e as Error).message, true);
    } finally {
      setReminderBusy(false);
    }
  }

  async function changeReminderTime(hour: number, minute: number) {
    setReminderTime({ hour, minute });
    if (!reminderEnabled) return;
    try {
      await setDailyReminder(hour, minute);
    } catch (e) {
      showToast((e as Error).message, true);
    }
  }

  async function selectPref(pref: 'level' | 'terrain', value: string) {
    const { data, error } = await updateProfilePreference(profile!, {
      [pref === 'level' ? 'level' : 'preferred_terrain']: value,
    } as Partial<UserProfile>);
    if (error) showToast(error.message, true);
    else if (data) setProfile(data as UserProfile);
  }

  async function handleSavePhysical() {
    setSavingPhysical(true);
    const { data, error } = await savePhysicalData(profile!, vma ? parseFloat(vma) : null, fcMax ? parseInt(fcMax, 10) : null);
    setSavingPhysical(false);
    if (error) showToast(error.message, true);
    else if (data) setProfile(data as UserProfile);
  }

  async function handleUpdatePassword() {
    if (newPassword.length < 6) {
      showToast('Mot de passe trop court', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', true);
      return;
    }
    setUpdatingPassword(true);
    const { error } = await updatePassword(newPassword);
    setUpdatingPassword(false);
    if (error) {
      showToast(error.message, true);
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    showToast('Mot de passe mis à jour', false, 3000, 'check');
  }

  function confirmLogout() {
    Alert.alert('Se déconnecter', 'Confirmer la déconnexion ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Supprimer mon compte',
      'Tes parcours, notes et ton profil seront supprimés définitivement. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  }

  async function handleExportData() {
    setExportingData(true);
    try {
      await exportUserData(profile!, savedRoutes);
    } catch (e) {
      showToast((e as Error).message, true);
    } finally {
      setExportingData(false);
    }
  }

  async function handleDeleteAccount() {
    if (!session?.user) return;
    setDeletingAccount(true);
    try {
      await deleteAccountData(session.user.id);
      await signOut();
    } catch (e) {
      showToast((e as Error).message, true);
      setDeletingAccount(false);
    }
  }

  const initial = (profile.name?.[0] || session.user.email?.[0] || '?').toUpperCase();
  const strength = passwordStrength(newPassword);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.avatar, { backgroundColor: tokens.accent }]}>
          <Text style={[styles.avatarText, { color: tokens.text, fontFamily: fonts.display }]}>{initial}</Text>
        </View>
        <Text style={[styles.name, { color: tokens.text, fontFamily: fonts.display }]}>{profile.name || '—'}</Text>
        <Text style={[styles.email, { color: tokens.text3 }]}>{session.user.email}</Text>

        <View style={[styles.row, { borderBottomColor: tokens.border }]}>
          <Text style={[styles.rowLabel, { color: tokens.text2 }]}>Thème</Text>
          <Button title={THEME_LABEL[mode]} icon={THEME_ICON[mode]} variant="secondary" onPress={cycleMode} style={styles.themeBtn} />
        </View>

        <Section title="Niveau">
          <ChoiceGrid options={LEVEL_OPTIONS} value={profile.level} onSelect={(v) => selectPref('level', v)} columns={3} />
        </Section>

        <Section title="Terrain préféré">
          <ChoiceGrid options={TERRAIN_OPTIONS} value={profile.preferred_terrain} onSelect={(v) => selectPref('terrain', v)} columns={2} />
        </Section>

        <Section title="Données physiques (optionnel)">
          <View style={styles.physicalRow}>
            <View style={styles.physicalField}>
              <TextField label="VMA (km/h)" value={vma} onChangeText={setVma} onBlur={handleSavePhysical} keyboardType="numeric" placeholder="—" />
            </View>
            <View style={styles.physicalField}>
              <TextField label="FC max (bpm)" value={fcMax} onChangeText={setFcMax} onBlur={handleSavePhysical} keyboardType="numeric" placeholder="—" />
            </View>
          </View>
          {savingPhysical && <Text style={[styles.saving, { color: tokens.text3 }]}>Enregistrement…</Text>}
        </Section>

        <View style={[styles.row, { borderBottomColor: tokens.border }]}>
          <Text style={[styles.rowLabel, { color: tokens.text2 }]}>Parcours sauvegardés</Text>
          <Text style={[styles.rowValue, { color: tokens.text }]}>{savedRoutes.length} parcours</Text>
        </View>

        <Section title="Rappel d'entraînement">
          <View style={[styles.row, { borderBottomColor: tokens.border }]}>
            <Text style={[styles.rowLabel, { color: tokens.text2 }]}>Notification quotidienne</Text>
            <Switch value={reminderEnabled} onValueChange={toggleReminder} disabled={reminderBusy} />
          </View>
          {reminderEnabled && (
            <View style={styles.reminderTimeRow}>
              <Text style={[styles.rowLabel, { color: tokens.text2 }]}>Heure du rappel</Text>
              <TimeStepper hour={reminderTime.hour} minute={reminderTime.minute} onChange={changeReminderTime} />
            </View>
          )}
        </Section>

        <Section title="Modifier le mot de passe">
          <TextField label="Nouveau mot de passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="••••••••" />
          {strength && (
            <Text style={[styles.strength, { color: tokens[strength.color] }]}>Robustesse : {strength.label}</Text>
          )}
          <TextField label="Confirmer le mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="••••••••" />
          <Button title="Mettre à jour" onPress={handleUpdatePassword} loading={updatingPassword} style={styles.updatePwdBtn} />
        </Section>

        <Section title="Mes données">
          <Button title="Exporter mes données" icon="download" variant="secondary" onPress={handleExportData} loading={exportingData} />
        </Section>

        <View style={[styles.dangerZone, { borderColor: 'rgba(229,62,62,0.3)' }]}>
          <View style={styles.dangerLabelRow}>
            <Feather name="alert-triangle" size={14} color={tokens.danger} />
            <Text style={[styles.dangerLabel, { color: tokens.danger }]}>Zone dangereuse</Text>
          </View>
          <Button title="Se déconnecter" icon="log-out" variant="secondary" onPress={confirmLogout} style={{ borderColor: 'rgba(229,62,62,0.3)' }} />
          <Button
            title="Supprimer mon compte"
            icon="trash-2"
            variant="secondary"
            onPress={confirmDeleteAccount}
            loading={deletingAccount}
            style={{ borderColor: 'rgba(229,62,62,0.3)' }}
          />
          <Text style={[styles.dangerHint, { color: tokens.text3 }]}>
            Supprime tes parcours, notes et ton profil. Contacte-nous pour la suppression complète de ton compte de connexion.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: tokens.text3, fontFamily: fonts.mono }]}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 24, gap: 4 },
  avatar: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 24 },
  name: { fontSize: 20, textAlign: 'center' },
  email: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 13 },
  themeBtn: { height: 36, paddingHorizontal: 14 },
  section: { marginTop: 18, gap: 8 },
  sectionTitle: { fontSize: 9.5, letterSpacing: 1 },
  physicalRow: { flexDirection: 'row', gap: 10 },
  physicalField: { flex: 1 },
  saving: { fontSize: 11 },
  reminderTimeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  strength: { fontSize: 11, marginTop: -4 },
  updatePwdBtn: { marginTop: 4 },
  dangerZone: { marginTop: 24, padding: 16, borderRadius: radii.md, borderWidth: 1, gap: 10 },
  dangerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dangerLabel: { fontSize: 13 },
  dangerHint: { fontSize: 11, lineHeight: 15 },
});
