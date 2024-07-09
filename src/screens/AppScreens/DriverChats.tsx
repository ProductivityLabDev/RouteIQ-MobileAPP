import { View, Text, StyleSheet, useWindowDimensions, PressableAndroidRippleConfig, StyleProp, TextStyle, ViewStyle, Image, Pressable } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import AppHeader from '../../components/AppHeader'
import AppLayout from '../../layout/AppLayout'
import { hp, wp } from '../../utils/constants'
import { AppColors } from '../../utils/color'
import { size } from '../../utils/responsiveFonts'
import AppFonts from '../../utils/appFonts'
import { TabView, SceneMap, TabBar, NavigationState, Route, SceneRendererProps, TabBarIndicatorProps, TabBarItemProps } from 'react-native-tab-view';
import { Scene, Event } from 'react-native-tab-view/lib/typescript/src/types'
import { chats_data } from '../../utils/DummyData';
import VendorChat from '../../components/VendorChat'
import DriverAllChats from './DriverAllChats'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setChatTabIndex } from '../../store/driver/driverSlices'


export default function DriverChats() {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const chatTabIndex = useAppSelector(state => state.driverSlices.chatTabIndex);
    const [SchoolChattingScreen, setSchoolChattingScreen] = useState(false);

    const FirstRoute = useMemo(
        () => () => <VendorChat />,
        []
    );



    const SecondRoute = useMemo(
        () => () => (
            SchoolChattingScreen ? (
                <VendorChat />
            ) : (
                <DriverAllChats arrayData={chats_data.slice(0, 10)} setSchoolChattingScreen={setSchoolChattingScreen}/>
            )
        ),
        [SchoolChattingScreen]
    );



    const ThirdRoute = useMemo(
        () => () => (
            SchoolChattingScreen ? (
                <VendorChat />
            ) : (
                <DriverAllChats
                    arrayData={chats_data.slice(10, 14)}
                    setSchoolChattingScreen={setSchoolChattingScreen}
                />
            )
        ),
        [SchoolChattingScreen]
    );


    const layout = useWindowDimensions();

    const [index, setIndex] = React.useState(0);
    useEffect(() => {
        if (chatTabIndex) {
            setIndex(chatTabIndex)
        }
        else {
            setIndex(0)
        }
    }, [chatTabIndex])

    const [routes] = React.useState([
        { key: 'first', title: 'Vendor' },
        { key: 'second', title: 'Parent' },
        { key: 'third', title: 'School' },
    ]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
        third: ThirdRoute,
    });

    const renderTabBar = (props: React.JSX.IntrinsicAttributes & SceneRendererProps & { navigationState: NavigationState<Route>; scrollEnabled?: boolean | undefined; bounces?: boolean | undefined; activeColor?: string | undefined; inactiveColor?: string | undefined; pressColor?: string | undefined; pressOpacity?: number | undefined; getLabelText?: ((scene: Scene<Route>) => string | undefined) | undefined; getAccessible?: ((scene: Scene<Route>) => boolean | undefined) | undefined; getAccessibilityLabel?: ((scene: Scene<Route>) => string | undefined) | undefined; getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined; renderLabel?: ((scene: Scene<Route> & { focused: boolean; color: string }) => React.ReactNode) | undefined; renderIcon?: ((scene: Scene<Route> & { focused: boolean; color: string }) => React.ReactNode) | undefined; renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined; renderIndicator?: ((props: TabBarIndicatorProps<Route>) => React.ReactNode) | undefined; renderTabBarItem?: ((props: TabBarItemProps<Route> & { key: string }) => React.ReactElement<any, string | React.JSXElementConstructor<any>>) | undefined; onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined; onTabLongPress?: ((scene: Scene<Route>) => void) | undefined; tabStyle?: StyleProp<ViewStyle>; indicatorStyle?: StyleProp<ViewStyle>; indicatorContainerStyle?: StyleProp<ViewStyle>; labelStyle?: StyleProp<TextStyle>; contentContainerStyle?: StyleProp<ViewStyle>; style?: StyleProp<ViewStyle>; gap?: number | undefined; testID?: string | undefined; android_ripple?: PressableAndroidRippleConfig | undefined }) => (
        <TabBar
            {...props}

            indicatorStyle={{ backgroundColor: AppColors.red }}
            style={{ paddingVertical: 0, backgroundColor: AppColors.white, height: hp(6), width: wp(100) }}
            labelStyle={styles.subTitle}
            activeColor={AppColors.red}
            inactiveColor="#666"
            renderLabel={({ route, focused, color }) => (
                <Text style={[styles.subTitle, { backgroundColor: 'transparent', fontFamily: AppFonts.NunitoSansBold, color: focused ? AppColors.red : AppColors.black }]}>
                    {route.title}
                </Text>
            )}
        />
    );


    return (

        <AppLayout statusbackgroundColor={AppColors.red}
            style={{ backgroundColor: AppColors.veryLightGrey }}>
            <AppHeader role="Driver"
                title={'Chat'}
                backFunctionEnable={true}
                handleBack={() => {
                    if (!SchoolChattingScreen) {
                        dispatch(setChatTabIndex(0));
                        navigation.goBack()
                    }
                    else {
                        setSchoolChattingScreen(false)
                    }
                }}
                enableBack={true}
                rightIcon={false} />


            <View style={styles.container}>

                <TabView
                    style={{ width: '100%' }}
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={renderTabBar}
                />

            </View>

        </AppLayout>
    )
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

})