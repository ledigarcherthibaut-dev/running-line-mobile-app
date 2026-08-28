import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/ui/Icon';
import { useTheme } from '../theme/ThemeContext';
import { radii } from '../theme/tokens';
import { hapticError, hapticSuccess } from '../lib/haptics';
import { useReducedMotion } from '../hooks/useReducedMotion';

type FeatherName = IconName;

/**
 * Confirmation non bloquante pour les actions mineures (favori, sauvegarde, note envoyée) —
 * Alert.alert reste réservé aux confirmations destructives (suppression, déconnexion).
 */
type ToastContextValue = {
  showToast: (message: string, isError?: boolean, ms?: number, icon?: FeatherName) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  const [toast, setToast] = useState<{ message: string; isError: boolean; icon?: FeatherName } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reducedMotion = useReducedMotion();

  const showToast = useCallback(
    (message: string, isError = false, ms = 3000, icon?: FeatherName) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, isError, icon });
      if (isError) hapticError();
      else hapticSuccess();
      if (reducedMotion) {
        opacity.setValue(1);
      } else {
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      }
      hideTimer.current = setTimeout(() => {
        if (reducedMotion) {
          opacity.setValue(0);
          setToast(null);
          return;
        }
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
          // `finished` est false si un nouveau showToast() a interrompu ce fade-out (nouvelle
          // animation démarrée sur la même valeur) — sans cette vérification, le toast qui vient
          // d'apparaître était aussitôt effacé par le callback de l'ancien.
          if (finished) setToast(null);
        });
      }, ms);
    },
    [opacity, reducedMotion]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <SafeAreaView edges={['bottom']} style={styles.wrapper} pointerEvents="none">
          <Animated.View
            style={[
              styles.toast,
              { backgroundColor: toast.isError ? tokens.danger : tokens.text },
              { opacity },
            ]}
          >
            <View style={styles.row}>
              {toast.icon && <Icon name={toast.icon} size={14} color={tokens.bg} />}
              <Text style={[styles.text, { color: tokens.bg }]}>{toast.message}</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingBottom: 12 },
  toast: {
    borderRadius: radii.full,
    paddingVertical: 10,
    paddingHorizontal: 18,
    maxWidth: '90%',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 13, fontFamily: 'RobotoMono_400Regular', textAlign: 'center' },
});
