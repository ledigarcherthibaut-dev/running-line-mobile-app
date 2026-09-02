import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { Icon, IconName } from '../components/ui/Icon';
import { useTheme } from '../theme/ThemeContext';
import { radii } from '../theme/tokens';
import { ExplorerStack } from './ExplorerStack';
import { GenerateStack } from './GenerateStack';
import { HomeStack } from './HomeStack';
import { MyRoutesStack } from './MyRoutesStack';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

type FeatherName = IconName;
const TAB_ICONS: Record<keyof AppTabParamList, FeatherName> = {
  Home: 'home',
  Generate: 'zap',
  MyRoutes: 'map',
  Explorer: 'compass',
};

/**
 * Bouton central surélevé pour "Générer" (action principale de l'app) — inspiré des barres de
 * navigation Strava/Bolt où l'action première ressort visuellement du reste des onglets.
 */
function GenerateTabButton({ onPress, accessibilityState }: BottomTabBarButtonProps) {
  const { tokens } = useTheme();
  const focused = !!accessibilityState?.selected;
  return (
    <Pressable onPress={onPress} style={styles.elevatedWrapper} accessibilityRole="button" accessibilityLabel="Générer">
      <Pressable
        onPress={onPress}
        style={[
          styles.elevatedButton,
          { backgroundColor: tokens.accent, borderColor: tokens.bg },
          focused && styles.elevatedButtonFocused,
        ]}
      >
        <Icon name="zap" size={26} color={tokens.onAccent} />
      </Pressable>
    </Pressable>
  );
}

export function AppTabs() {
  const { tokens } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text3,
        tabBarStyle: { backgroundColor: tokens.surface, borderTopColor: tokens.border2, height: Platform.OS === 'ios' ? 88 : 68 },
        tabBarIcon: ({ color, size }) => (
          <Icon name={TAB_ICONS[route.name as keyof AppTabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Accueil' }} />
      <Tab.Screen name="MyRoutes" component={MyRoutesStack} options={{ title: 'Mes parcours' }} />
      <Tab.Screen
        name="Generate"
        component={GenerateStack}
        options={{ title: 'Générer', tabBarButton: GenerateTabButton }}
      />
      <Tab.Screen name="Explorer" component={ExplorerStack} options={{ title: 'Explorer' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  elevatedWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  elevatedButton: {
    marginTop: -22,
    width: 58,
    height: 58,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  elevatedButtonFocused: { transform: [{ scale: 1.05 }] },
});
