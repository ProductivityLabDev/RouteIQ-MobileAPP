import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AttendanceHistory from '../screens/AppScreens/AttendanceHistory';
import ChangePassword from '../screens/AppScreens/ChangePassword';
import ChatScreen from '../screens/AppScreens/ChatScreen';
import ChildProfile from '../screens/AppScreens/ChildProfile';
import DriverProfileInfo from '../screens/AppScreens/DriverProfileInfo';
import HomeSreen from '../screens/AppScreens/HomeSreen';
import Notification from '../screens/AppScreens/Notification';
import OnBoarding from '../screens/AppScreens/OnBoarding';
import ParentFeedback from '../screens/AppScreens/ParentFeedback';
import Settings from '../screens/AppScreens/Settings';
import UpdateDriveProfile from '../screens/AppScreens/UpdateDriveProfile';
import UpdateGuardianProfile from '../screens/AppScreens/UpdateGuardianProfile';
import Login from '../screens/AuthScreens/Login';
import LoginAs from '../screens/AuthScreens/LoginAs';
import NewPassword from '../screens/AuthScreens/NewPassword';
import ResetPassword from '../screens/AuthScreens/ResetPassword';
import SuccessScreen from '../screens/AuthScreens/SuccessScreen';
import VerificationCode from '../screens/AuthScreens/VerificationCode';
import { useAppSelector } from '../store/hooks';
import { RootStackParamList } from '../types/navigationTypes';
import DriverBottomTabs from './DriverBottomTabs';
import AlertScreen from '../screens/AppScreens/AlertScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeSreen" component={HomeSreen} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ChildProfile" component={ChildProfile} />
      <Stack.Screen name="UpdateGuardianProfile" component={UpdateGuardianProfile} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
      <Stack.Screen name="ParentFeedback" component={ParentFeedback} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
    </Stack.Navigator>
  );
};

export const AuthStack = () => {
  const logout = useAppSelector(state => state.userSlices.logout);
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {!logout && <Stack.Screen name="OnBoarding" component={OnBoarding} />}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="LoginAs" component={LoginAs} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="VerificationCode" component={VerificationCode} />
      <Stack.Screen name="NewPassword" component={NewPassword} />
      <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
      <Stack.Screen name="DriverProfileInfo" component={DriverProfileInfo} />
      <Stack.Screen name="UpdateDriveProfile" component={UpdateDriveProfile} />
    </Stack.Navigator>
  );
};

export const DriverStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DriverBottomTabs" component={DriverBottomTabs} />
      <Stack.Screen name="AlertScreen" component={AlertScreen} />
      <Stack.Screen name="Notification" component={Notification} />
      {/* <Stack.Screen name="DriverProfile" component={DriverProfile} />
      <Stack.Screen name="DriverProfileInfo" component={DriverProfileInfo} />
      <Stack.Screen name="UpdateDriveProfile" component={UpdateDriveProfile} />
      <Stack.Screen name="DriverCertification" component={DriverCertification} />
      <Stack.Screen name="DriverChangePassword" component={DriverChangePassword} />
      <Stack.Screen name="DriverMedicalRecord" component={DriverMedicalRecord} />
      <Stack.Screen name="DriverHistory" component={DriverHistory} />
      <Stack.Screen name="DriverIncident" component={DriverIncident} />
      <Stack.Screen name="AlertScreen" component={AlertScreen} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="DriverEmergencyContact" component={DriverEmergencyContact} />
      <Stack.Screen name="DriverQualifications" component={DriverQualifications} />
      <Stack.Screen name="DriverShiftTracking" component={DriverShiftTracking} />
      <Stack.Screen name="DriverShiftTrackingDetails" component={DriverShiftTrackingDetails} />
      <Stack.Screen name="DriverChats" component={DriverChats} />
      <Stack.Screen name="DriverAllChats" component={DriverAllChats} /> */}
    </Stack.Navigator>
  );
};