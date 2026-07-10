import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/tokens';
import { RouteMapHandle, RouteMapProps } from './RouteMap.types';

/**
 * react-native-maps n'a pas de rendu web. La cible réelle est Android (EAS build) ;
 * ce placeholder ne sert qu'à pouvoir vérifier la mise en page autour de la carte
 * pendant le développement dans le navigateur.
 */
export const RouteMap = forwardRef<RouteMapHandle, RouteMapProps>(function RouteMap({ routes = [], markers = [] }, ref) {
  const { tokens } = useTheme();

  useImperativeHandle(ref, () => ({
    fitToCoordinates: () => {},
    animateToRegion: () => {},
  }));

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface3 }]}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={[styles.text, { color: tokens.text3 }]}>Carte non disponible sur le web{'\n'}(aperçu Android via EAS)</Text>
      {routes.length > 0 && <Text style={[styles.meta, { color: tokens.text3 }]}>{routes.length} tracé(s)</Text>}
      {markers.length > 0 && <Text style={[styles.meta, { color: tokens.text3 }]}>{markers.length} marqueur(s)</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 6 },
  icon: { fontSize: 32 },
  text: { fontFamily: fonts.mono, fontSize: 11, textAlign: 'center' },
  meta: { fontFamily: fonts.mono, fontSize: 10 },
});
