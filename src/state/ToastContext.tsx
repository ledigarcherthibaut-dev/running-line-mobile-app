import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radii } from '../theme/tokens';

/**
 * Confirmation non bloquante pour les actions mineures (favori, sauvegarde, note envoyée) —
 * Alert.alert reste réservé aux confirmations destructives (suppression, déconnexion).
 */
type ToastContextValue = {
  showToast: (message: string, isError?: boolean, ms?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { tokens } = useTheme();
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback(
    (message: string, isError = false, ms = 3000) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, isError });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      hideTimer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
      }, ms);
    },
    [opacity]
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
            <Text style={[styles.text, { color: tokens.bg }]}>{toast.message}</Text>
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
  text: { fontSize: 13, fontFamily: 'RobotoMono_400Regular', textAlign: 'center' },
});
