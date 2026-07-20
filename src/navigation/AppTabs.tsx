import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { ExplorerStack } from './ExplorerStack';
import { GenerateStack } from './GenerateStack';
import { HomeStack } from './HomeStack';
import { MyRoutesStack } from './MyRoutesStack';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

type FeatherName = keyof typeof Feather.glyphMap;
const TAB_ICONS: Record<keyof AppTabParamList, FeatherName> = {
  Home: 'home',
  Generate: 'zap',
  MyRoutes: 'map',
  Explorer: 'compass',
};

export function AppTabs() {
  const { tokens } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text3,
        tabBarStyle: { backgroundColor: tokens.surface, borderTopColor: tokens.border2 },
        tabBarIcon: ({ color, size }) => (
          <Feather name={TAB_ICONS[route.name as keyof AppTabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Generate" component={GenerateStack} options={{ title: 'Générer' }} />
      <Tab.Screen name="MyRoutes" component={MyRoutesStack} options={{ title: 'Mes parcours' }} />
      <Tab.Screen name="Explorer" component={ExplorerStack} options={{ title: 'Explorer' }} />
    </Tab.Navigator>
  );
}
