import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Running Line',
  slug: 'running-line-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/0602e782-d98a-44e0-88ee-edc35282a7d4',
  },
  ios: {
    // Aucun écran n'est pensé pour un layout tablette dans cette passe — mieux vaut l'annoncer
    // honnêtement que de laisser une UI téléphone simplement étirée sur iPad.
    supportsTablet: false,
  },
  android: {
    package: 'com.runningline.app',
    adaptiveIcon: {
      backgroundColor: '#C9973F',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  extra: {
    eas: {
      projectId: '0602e782-d98a-44e0-88ee-edc35282a7d4',
    },
  },
  plugins: [
    '@maplibre/maplibre-react-native',
    'expo-sharing',
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Running Line utilise ta position pour générer des parcours de course autour de toi.',
      },
    ],
    'expo-font',
    [
      'expo-notifications',
      {
        color: '#C9973F',
      },
    ],
    [
      'expo-splash-screen',
      {
        // Fond du thème sombre (défaut de l'app depuis la refonte, palette Cold Luxury x Forest).
        backgroundColor: '#14171A',
        image: './assets/splash-icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
      },
    ],
  ],
};

export default config;
