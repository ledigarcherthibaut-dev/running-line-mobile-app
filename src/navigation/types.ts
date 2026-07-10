import type { NavigatorScreenParams } from '@react-navigation/native';
import { Terrain } from '../types';

export type RouteDetailParams = { routeId: string };
export type TrailDetailParams = { trailId: number; trailName: string };

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  RouteDetail: RouteDetailParams;
};

export type GenerateStackParamList = {
  /** presetKm/presetTerrain : port de quickGenerate() (index.html:3330-3342), venant d'Accueil. */
  GenerateScreen: { presetKm?: number; presetTerrain?: Terrain } | undefined;
  DrawRoute: undefined;
  GenerateResults: undefined;
  RouteDetail: RouteDetailParams;
};

export type MyRoutesStackParamList = {
  MyRoutesScreen: undefined;
  RouteDetail: RouteDetailParams;
};

export type ExplorerStackParamList = {
  ExplorerScreen: undefined;
  TrailDetail: TrailDetailParams;
  RouteDetail: RouteDetailParams;
};

export type AppTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Generate: NavigatorScreenParams<GenerateStackParamList>;
  MyRoutes: NavigatorScreenParams<MyRoutesStackParamList>;
  Explorer: NavigatorScreenParams<ExplorerStackParamList>;
};

export type RootStackParamList = {
  AppTabs: undefined;
  Account: undefined;
};
