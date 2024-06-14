import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {RootStackParamList} from '../types/navigationTypes';
import LoginAs from '../screens/AuthScreens/LoginAs';
import HomeSreen from '../screens/AppScreens/HomeSreen';
import Settings from '../screens/AppScreens/Settings';
import ChildProfile from '../screens/AppScreens/ChildProfile';
import Notification from '../screens/AppScreens/Notification';
import Login from '../screens/AuthScreens/Login';
import UpdateGuardianProfile from '../screens/AppScreens/UpdateGuardianProfile';
import ChatScreen from '../screens/AppScreens/ChatScreen';
import AttendanceHistory from '../screens/AppScreens/AttendanceHistory';
import OnBoarding from '../screens/AppScreens/OnBoarding';
import ParentFeedback from '../screens/AppScreens/ParentFeedback';
import ResetPassword from '../screens/AuthScreens/ResetPassword';
import VerificationCode from '../screens/AuthScreens/VerificationCode';
import NewPassword from '../screens/AuthScreens/NewPassword';
import SuccessScreen from '../screens/AuthScreens/SuccessScreen';
import ChangePassword from '../screens/AppScreens/ChangePassword';
import { useAppSelector } from '../store/hooks';
import DriverProfileInfo from '../screens/AppScreens/DriverProfileInfo';
import UpdateDriveProfile from '../screens/AppScreens/UpdateDriveProfile';
import DriverBottomTabs from './DriverBottomTabs';
import DriverProfile from '../screens/AppScreens/DriverProfile';
import DriverCertification from '../screens/AppScreens/DriverCertification';
import DriverChangePassword from '../screens/AppScreens/DriverChangePassword';
import DriverMedicalRecord from '../screens/AppScreens/DriverMedicalRecord';
import DriverHistory from '../screens/AppScreens/DriverHistory';
import DriverIncident from '../screens/AppScreens/DriverIncident';

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
    </Stack.Navigator>
  );
};

export const DriverStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DriverBottomTabs" component={DriverBottomTabs} />
      <Stack.Screen name="DriverProfileInfo" component={DriverProfileInfo} />
      <Stack.Screen name="UpdateDriveProfile" component={UpdateDriveProfile} />
      <Stack.Screen name="DriverProfile" component={DriverProfile} />
      <Stack.Screen name="DriverCertification" component={DriverCertification} />
      <Stack.Screen name="DriverChangePassword" component={DriverChangePassword} />
      <Stack.Screen name="DriverMedicalRecord" component={DriverMedicalRecord} />
      <Stack.Screen name="DriverHistory" component={DriverHistory} />
      <Stack.Screen name="DriverIncident" component={DriverIncident} />
    </Stack.Navigator>
  );
};