import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import { hp, wp } from '../../utils/constants';
import { AppColors } from '../../utils/color';
import { size } from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';
import {
  TabView,
  SceneMap,
  TabBar,
  NavigationState,
  Route,
  SceneRendererProps,
} from 'react-native-tab-view';
import { groups_data } from '../../utils/DummyData';
import VendorChat from '../../components/VendorChat';
// Chat list ab API se aati hai: GET /chat/conversations (DriverAllChats fetchConversations use karta hai)
import DriverAllChats from './DriverAllChats';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setChatTabIndex } from '../../store/driver/driverSlices';
import GroupChat from '../../components/GroupChat';

export default function DriverChats() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const role = useAppSelector(state => state.userSlices.role);
  const chatTabIndex = useAppSelector(state => state.driverSlices.chatTabIndex);
  const selectedChatName = useAppSelector(
    state => (state.userSlices?.selectedUserChatData as any)?.name,
  );
  const selectedConversation = useAppSelector(
    state => state.chatSlices?.selectedConversation,
  );

  const [SchoolChattingScreen, setSchoolChattingScreen] = useState(false);

  // Get chat title from conversation or selected chat data
  const chatTitle = SchoolChattingScreen
    ? selectedConversation?.name?.trim() ||
      selectedChatName?.trim() ||
      (Array.isArray(selectedConversation?.participants) && selectedConversation.participants.length > 0
        ? selectedConversation.participants.map((p: any) => p.name || `ID ${p.id}`).join(', ')
        : 'Chat')
    : 'Chat';
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  

  useEffect(() => {
    setIndex(chatTabIndex);
  }, [chatTabIndex]);

  const filteredRoutes = useMemo(() => {
    if (role === 'Retail') {
      return [
        { key: 'first', title: 'Vendor' },
        { key: 'second', title: 'Driver' },
      ];
    }
    return [
      { key: 'first', title: 'Vendor' },
      { key: 'second', title: 'Guardian' },
      { key: 'third', title: 'School' },
      { key: 'fourth', title: 'Groups' }, 
    ];
  }, [role]);

  

  const FirstRoute = useMemo(
    () => () =>
      SchoolChattingScreen ? (
        <VendorChat />
      ) : (
        <DriverAllChats setSchoolChattingScreen={setSchoolChattingScreen} />
      ),
    [SchoolChattingScreen]
  );

  const SecondRoute = useMemo(
    () => () =>
      SchoolChattingScreen ? (
        <VendorChat />
      ) : (
        <DriverAllChats setSchoolChattingScreen={setSchoolChattingScreen} />
      ),
    [SchoolChattingScreen]
  );

  const ThirdRoute = useMemo(
    () => () =>
      SchoolChattingScreen ? (
        <VendorChat />
      ) : (
        <DriverAllChats setSchoolChattingScreen={setSchoolChattingScreen} />
      ),
    [SchoolChattingScreen]
  );


  const FourthRoute = useMemo(() => () => <GroupChat arrayData={groups_data} />, []);

  const handleTabChange = (newIndex: number) => {
    setIndex(newIndex);
    dispatch(setChatTabIndex(newIndex));
  };

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
    fourth: FourthRoute, 
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<Route> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: AppColors.red }}
      style={{
        paddingVertical: 0,
        backgroundColor: AppColors.white,
        height: hp(6),
        width: wp(100),
      }}
      labelStyle={styles.subTitle}
      activeColor={AppColors.red}
      inactiveColor="#666"
      renderLabel={({ route, focused }) => (
        <Text
          style={[
            styles.subTitle,
            {
              backgroundColor: 'transparent',
              fontFamily: AppFonts.NunitoSansBold,
              color: focused ? AppColors.red : AppColors.black,
            },
          ]}
        >
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{ backgroundColor: AppColors.veryLightGrey }}
    >
      <AppHeader
        role="Driver"
        title={chatTitle}
        backFunctionEnable={true}
        handleBack={() => {
          if (!SchoolChattingScreen) {
            dispatch(setChatTabIndex(0));
            navigation.goBack();
          } else {
            setSchoolChattingScreen(false);
          }
        }}
        enableBack={true}
        rightIcon={false}
      />

      <View style={styles.container}>
        <TabView
          style={{ width: '100%' }}
          navigationState={{ index, routes: filteredRoutes }}
          renderScene={renderScene}
          onIndexChange={handleTabChange}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
    fontSize: size.default,
  },
  subTitle: {
    backgroundColor: AppColors.yellow,
    padding: hp(0.5),
    borderRadius: hp(1),
    color: AppColors.black,
    fontSize: size.s,
    fontFamily: AppFonts.NunitoSansMedium,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
  },
});
