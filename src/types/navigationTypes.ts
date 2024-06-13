export type RootStackParamList = {
  SplashScreen: undefined;
  LoginAs: undefined;
  Login: undefined;
  HomeSreen: undefined;
  Settings: undefined;
  ChildProfile: undefined;
  UpdateGuardianProfile: undefined;
  Notification: undefined;
  ChatScreen: undefined;
  AttendanceHistory: undefined;
  OnBoarding: undefined;
  ParentFeedback: undefined;
  ResetPassword: undefined;
  VerificationCode: undefined;
  NewPassword: undefined;
  SuccessScreen: undefined;
  ChangePassword: undefined;

  // Driver Stack
  DriverBottomTabs: undefined;
  DriverProfileInfo: undefined;
  UpdateDriveProfile: undefined;
  DriverHomeScreen: undefined;
  DriverTasksScreen: undefined;
  DriverStudentsScreen: undefined;
  DriverChatScreen: undefined;
  DriverProfile: undefined;
  DriverCertification: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
