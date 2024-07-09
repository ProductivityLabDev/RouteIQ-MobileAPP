import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import ChatIcon from '../assets/svgs/ChatIcon';
import HomeIcon from '../assets/svgs/HomeIcon';
import ProfileIcon from '../assets/svgs/ProfileIcon';
import StudentIcon from '../assets/svgs/StudentIcon';
import TaskIcon from '../assets/svgs/TaskIcon';
import {useAppSelector} from '../store/hooks';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';
import {size} from '../utils/responsiveFonts';
import {
  ChatStack,
  HomeStack,
  ProfileStack,
  StudentStack,
  TasksStack,
} from './DriverTabStack';
import GlobalIcon from '../components/GlobalIcon';

const Tab = createBottomTabNavigator();

type DriverBottomTabsProps = {
  children?: React.ReactNode;
  focused: any;
  title: string;
};

const BottomIcon: React.FC<DriverBottomTabsProps> = ({
  focused,
  children,
  title,
}) => {
  return (
    <View style={[styles.container, focused ? styles.activeTab : null]}>
      <View style={[styles.bottomContainer]}>{children}</View>
      <Text
        style={[
          styles.textStyle,
          {
            color: focused ? AppColors.primary : AppColors.charcoal,
            fontFamily: focused
              ? AppFonts.NunitoSansBold
              : AppFonts.NunitoSansSemiBold,
          },
        ]}>
        {title}
      </Text>
    </View>
  );
};

function DriverBottomTabs() {
  const driverHomeStatus = useAppSelector(
    state => state.userSlices.driverHomeStatus,
  );
  const screens = [
    {
      name: 'HomeStack',
      component: HomeStack,
      headerShown: false,
      label: '',
    },
    {
      name: 'TasksStack',
      component: TasksStack,
      headerShown: false,
      label: '',
    },
    {
      name: 'StudentStack',
      component: StudentStack,
      headerShown: false,
      label: '',
    },
    {
      name: 'ChatStack',
      component: ChatStack,
      headerShown: false,
      label: '',
    },
    {
      name: 'ProfileStack',
      component: ProfileStack,
      headerShown: false,
      label: '',
    },
  ];

  return (
    <Tab.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarActiveTintColor: '#16E6EF',
        tabBarHideOnKeyboard: true,
      }}>
      {screens.map(({name, component, headerShown, label}, index) => {
        return (
          <Tab.Screen
            key={`bottom-tabs-${index}`}
            name={name}
            component={component}
            options={({route}) => ({
              headerShown,
              tabBarLabel: label,
              tabBarStyle: {
                display: [
                  'DriverInspection',
                  driverHomeStatus == true && 'DriverHomeScreen',
                  'DriverStudentDetail',
                ].includes(getFocusedRouteNameFromRoute(route) as any)
                  ? 'none'
                  : 'flex',
                borderTopWidth: 0,
                zIndex: 0,
                alignItems: 'center',
                justifyContent: 'center',
                height: Platform.OS === 'ios' ? hp(12) : hp(9),
                backgroundColor: AppColors.white,
                paddingHorizontal: hp(1),
              },
              tabBarIcon: ({color, focused}: any) => {
                if (name.includes('HomeStack')) {
                  return (
                    <BottomIcon
                      focused={focused}
                      title="Home"
                      children={
                        focused ? (
                          <HomeIcon color={AppColors.red} />
                        ) : (
                          <HomeIcon />
                        )
                      }
                    />
                  );
                }
                if (name.includes('TasksStack')) {
                  return (
                    <BottomIcon
                      focused={focused}
                      title="Tasks"
                      children={
                        focused ? (
                          <TaskIcon color={AppColors.red} />
                        ) : (
                          <TaskIcon />
                        )
                      }
                    />
                  );
                }
                if (name.includes('StudentStack')) {
                  return (
                    <BottomIcon
                      focused={focused}
                      title="Students"
                      children={
                        focused ? (
                          <StudentIcon color={AppColors.red} />
                        ) : (
                          <StudentIcon />
                        )
                      }
                    />
                  );
                }
                if (name.includes('ChatStack')) {
                  return (
                    <BottomIcon
                      focused={focused}
                      title="Chat"
                      children={
                        focused ? (
                          <GlobalIcon
                            library="Ionicons"
                            name="chatbubble-ellipses"
                            color={AppColors.red}
                          />
                          // <ChatIcon color={AppColors.red} />
                        ) : (
                          <GlobalIcon
                            library="Ionicons"
                            name="chatbubble-ellipses"
                            color={AppColors.charcoal}
                          />
                          // <ChatIcon color={AppColors.charcoal} />
                        )
                      }
                    />
                  );
                }
                if (name.includes('ProfileStack')) {
                  return (
                    <BottomIcon
                      focused={focused}
                      title="My Profile"
                      children={
                        focused ? (
                          <ProfileIcon color={AppColors.red} />
                        ) : (
                          <ProfileIcon />
                        )
                      }
                    />
                  );
                }
              },
            })}
          />
        );
      })}
    </Tab.Navigator>
  );
}

export default DriverBottomTabs;

const styles = StyleSheet.create({
  textStyle: {
    fontSize: size.s,
    lineHeight: size.vxlg,
    width: '100%',
    fontFamily: AppFonts.NunitoSansSemiBold,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? hp(2) : hp(3),
    paddingBottom: hp(1),
    borderTopWidth: 2,
    borderTopColor: AppColors.white,
    width: '90%',
  },
  bottomContainer: {
    borderRadius: 50,
  },
  imageContainer: {
    height: hp(3.2),
    width: hp(3.2),
    backgroundColor: AppColors.white,
    borderRadius: hp(3.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: hp(3),
    width: hp(3),
    borderRadius: hp(3),
  },
  activeTab: {borderTopWidth: 2, borderTopColor: AppColors.red},
});
