import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { ExplorerStack } from './ExplorerStack';
import { GenerateStack } from './GenerateStack';
import { HomeStack } from './HomeStack';
import { MyRoutesStack } from './MyRoutesStack';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

type IoniconName = keyof typeof Ionicons.glyphMap;
const TAB_ICONS: Record<keyof AppTabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Generate: { active: 'flash', inactive: 'flash-outline' },
  MyRoutes: { active: 'map', inactive: 'map-outline' },
  Explorer: { active: 'compass', inactive: 'compass-outline' },
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
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof AppTabParamList];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Generate" component={GenerateStack} options={{ title: 'Générer' }} />
      <Tab.Screen name="MyRoutes" component={MyRoutesStack} options={{ title: 'Mes parcours' }} />
      <Tab.Screen name="Explorer" component={ExplorerStack} options={{ title: 'Explorer' }} />
    </Tab.Navigator>
  );
}
