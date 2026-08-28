import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import {
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUUpLeft,
  CaretDown,
  CaretRight,
  CaretUp,
  ChartBar,
  ChatCircle,
  Check,
  Clock,
  Compass,
  Crosshair,
  DeviceMobile,
  DownloadSimple,
  EnvelopeSimple,
  Feather as PhosphorFeather,
  Flag,
  FloppyDisk,
  GitMerge,
  Globe,
  Heart,
  House,
  Lightning,
  Lock,
  MapPin,
  MapTrifold,
  Moon,
  NavigationArrow,
  PencilSimple,
  Pulse,
  Repeat,
  Shuffle,
  SignOut,
  SlidersHorizontal,
  Star,
  Sun,
  SunHorizon,
  TrashSimple,
  TrendUp,
  Trophy,
  UploadSimple,
  Warning,
  Watch,
  WifiSlash,
  Wind,
  X,
} from 'phosphor-react-native';

/**
 * Remplace Feather (@expo/vector-icons) par Phosphor (phosphor-react-native) — même API
 * `name`/`size`/`color`/`style` que Feather pour ne pas retoucher les ~100 sites d'appel, juste
 * la source de l'icône. Phosphor n'a pas de nom identique à chaque nom Feather : cette table fait
 * la correspondance vers l'équivalent visuel/sémantique le plus proche (vérifié dans les exports
 * du paquet, pas deviné).
 */
const ICONS = {
  activity: Pulse,
  'alert-triangle': Warning,
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  award: Trophy,
  'bar-chart-2': ChartBar,
  check: Check,
  'chevron-down': CaretDown,
  'chevron-right': CaretRight,
  'chevron-up': CaretUp,
  clock: Clock,
  compass: Compass,
  'corner-up-left': ArrowUUpLeft,
  crosshair: Crosshair,
  download: DownloadSimple,
  'edit-2': PencilSimple,
  'edit-3': PencilSimple,
  feather: PhosphorFeather,
  flag: Flag,
  'git-merge': GitMerge,
  globe: Globe,
  heart: Heart,
  home: House,
  'log-out': SignOut,
  lock: Lock,
  mail: EnvelopeSimple,
  map: MapTrifold,
  'map-pin': MapPin,
  'message-circle': ChatCircle,
  moon: Moon,
  navigation: NavigationArrow,
  repeat: Repeat,
  save: FloppyDisk,
  shuffle: Shuffle,
  sliders: SlidersHorizontal,
  smartphone: DeviceMobile,
  star: Star,
  sun: Sun,
  sunrise: SunHorizon,
  'trash-2': TrashSimple,
  'trending-up': TrendUp,
  upload: UploadSimple,
  watch: Watch,
  'wifi-off': WifiSlash,
  wind: Wind,
  x: X,
  zap: Lightning,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle | Omit<TextStyle, 'cursor'>>;
}) {
  const Component = ICONS[name];
  return <Component size={size} color={color} style={style} weight="regular" />;
}
