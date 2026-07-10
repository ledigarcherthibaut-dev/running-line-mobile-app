export type RouteDetailParams = { routeId: string };
export type TrailDetailParams = { trailId: string };

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
  OnboardingStep3: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  RouteDetail: RouteDetailParams;
};

export type GenerateStackParamList = {
  GenerateScreen: undefined;
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
  Home: undefined;
  Generate: undefined;
  MyRoutes: undefined;
  Explorer: undefined;
};

export type RootStackParamList = {
  AppTabs: undefined;
  Account: undefined;
};
