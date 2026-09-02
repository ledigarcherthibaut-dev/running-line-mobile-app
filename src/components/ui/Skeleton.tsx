import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/** Bloc pulsant générique — respecte "réduire les animations" (opacité fixe, pas de pulsation). */
export function SkeletonBlock({ style }: { style?: ViewStyle }) {
  const { tokens } = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, opacity]);

  return <Animated.View style={[styles.block, { backgroundColor: tokens.surface3, opacity }, style]} />;
}

/**
 * Préfigure la mise en page de RouteDetailScreen/TrailDetailScreen (carte + titre + stats +
 * graphique + actions) pendant le chargement, plutôt qu'un simple texte "Chargement…" — évite le
 * saut de mise en page une fois les données arrivées.
 */
export function RouteDetailSkeleton({ statsCount = 4 }: { statsCount?: number }) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.flex, { backgroundColor: tokens.bg }]}>
      <SkeletonBlock style={styles.map} />
      <View style={styles.body}>
        <SkeletonBlock style={styles.title} />
        <View style={styles.statsRow}>
          {Array.from({ length: statsCount }).map((_, i) => (
            <SkeletonBlock key={i} style={styles.stat} />
          ))}
        </View>
        <SkeletonBlock style={styles.chart} />
        <View style={styles.actionsRow}>
          <SkeletonBlock style={styles.actionBtn} />
          <SkeletonBlock style={styles.actionBtn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { borderRadius: radii.sm },
  flex: { flex: 1 },
  map: { height: '35%' },
  body: { padding: 16, gap: 12 },
  title: { height: 22, width: '55%', borderRadius: radii.xs },
  statsRow: { flexDirection: 'row', gap: 6 },
  stat: { flex: 1, height: 50 },
  chart: { height: 50 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, height: 56, borderRadius: radii.full },
});
