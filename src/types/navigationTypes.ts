export type RootStackParamList = {
    SplashScreen: undefined,
    LoginAs: undefined,
    Login: undefined,
    HomeSreen: undefined,
    Settings: undefined,
    ChildProfile: undefined,
    UpdateGuardianProfile: undefined,
    Notification: undefined,
    ChatScreen: undefined,
    AttendanceHistory: undefined,
    OnBoarding: undefined,
    ParentFeedback: undefined
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
