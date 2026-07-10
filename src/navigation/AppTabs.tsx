import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { ExplorerStack } from './ExplorerStack';
import { GenerateStack } from './GenerateStack';
import { HomeStack } from './HomeStack';
import { MyRoutesStack } from './MyRoutesStack';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppTabs() {
  const { tokens } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.accent,
        tabBarInactiveTintColor: tokens.text3,
        tabBarStyle: { backgroundColor: tokens.surface, borderTopColor: tokens.border2 },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Generate" component={GenerateStack} options={{ title: 'Générer' }} />
      <Tab.Screen name="MyRoutes" component={MyRoutesStack} options={{ title: 'Mes parcours' }} />
      <Tab.Screen name="Explorer" component={ExplorerStack} options={{ title: 'Explorer' }} />
    </Tab.Navigator>
  );
}
