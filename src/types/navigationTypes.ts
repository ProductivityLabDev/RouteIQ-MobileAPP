export type RootStackParamList = {
    SplashScreen: undefined;
    LoginAs: undefined,
    LoginAs2: undefined,
    HomeSreen: undefined,
    Settings: undefined,
    ChildProfile: undefined,
    Guardian1: undefined,
    Guardian2: undefined,
    Notification: undefined,
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
