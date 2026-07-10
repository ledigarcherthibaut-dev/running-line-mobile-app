import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text } from 'react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { RouteDetailScreen } from '../screens/routes/RouteDetailScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Accueil',
          // Account is a root-stack screen, not a tab — reached via this header icon from any tab.
          headerRight: () => (
            <Pressable onPress={() => navigation.getParent()?.navigate('Account' as never)}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Parcours' }} />
    </Stack.Navigator>
  );
}
