export type RootStackParamList = {
    SplashScreen: undefined;
    LoginAs: undefined,
    Login: undefined,
    HomeSreen: undefined,
    Settings: undefined,
    ChildProfile: undefined,
    UpdateGuardianProfile: undefined,
    Notification: undefined,
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
