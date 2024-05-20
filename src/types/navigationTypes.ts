export type RootStackParamList = {
    SplashScreen: undefined;
    LoginAs: undefined
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
