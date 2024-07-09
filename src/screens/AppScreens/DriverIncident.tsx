import { View, Text, StyleSheet, useWindowDimensions, PressableAndroidRippleConfig, StyleProp, TextStyle, ViewStyle, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import AppHeader from '../../components/AppHeader'
import AppLayout from '../../layout/AppLayout'
import AppButton from '../../components/AppButton'
import { hp, wp } from '../../utils/constants'
import { AppColors } from '../../utils/color'
import { size } from '../../utils/responsiveFonts'
import AppFonts from '../../utils/appFonts'
import AppInput from '../../components/AppInput'
import AppStyles from '../../styles/AppStyles'
import GlobalIcon from '../../components/GlobalIcon'
import { TabView, SceneMap, TabBar, NavigationState, Route, SceneRendererProps, TabBarIndicatorProps, TabBarItemProps } from 'react-native-tab-view';
import { Scene, Event } from 'react-native-tab-view/lib/typescript/src/types'
import { SelectList } from 'react-native-dropdown-select-list'
import { leaveDropdownData } from '../../utils/DummyData';
import SelectDropdown from 'react-native-select-dropdown'
import { useNavigation } from '@react-navigation/native'

const FirstRoute = () => (
    <ScrollView contentContainerStyle={styles.subContainer}>

        <AppInput
            multiline
            numberOfLines={11}
            container={{ height: hp(25), borderRadius: hp(0.5), marginBottom: hp(2), borderColor: AppColors.grey }}

            label="Description"
            placeholder="Report Accident Details here..."
            placeholderTextColor={AppColors.black}

            labelStyle={{
                marginBottom: hp(2),
                fontFamily: AppFonts.NunitoSansBold,
            }}
        />

        <View style={{ width: '90%', alignSelf: 'center', marginBottom: hp(2)}}>
            <Text style={[AppStyles.titleHead, { fontSize: size.lg, alignSelf: 'flex-start' }]}>
                Attachments
            </Text>

            <View style={styles.uploadDocBox}>
                <GlobalIcon library='FontelloIcon' name={'group-(5)'} color={AppColors.red} size={40} />
                <Text style={styles.tapText} >Tap and Upload Files</Text>
            </View>


        </View>


    </ScrollView>
);







export default function DriverIncident() {
    const navigation = useNavigation();
    const [selectAbsence, setSelectAbsence] = useState('');

    const emojis = [
        'Ann Co',
        'Yu Hin',
        'Annie Harris'
    ];


    const SecondRoute = () => (
        <ScrollView contentContainerStyle={styles.subContainer}>



            <SelectDropdown
                data={emojis}
                onSelect={(selectedItem, index) => {
                    console.log(selectedItem, index);
                }}
                renderButton={(selectedItem, isOpen) => {
                    return (
                        <View style={styles.dropdownButtonStyle}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                                <Image source={require('../../assets/images/profile_image.webp')} resizeMode='cover' style={{ width: wp(7), height: wp(7), borderRadius: 100 }} />
                                <Text style={[styles.subTitle, { backgroundColor: 'transparent', fontSize: size.s }]}>{selectedItem || 'Mee Aao'}</Text>
                            </View>
                            <GlobalIcon library="Ionicons"
                                name="chevron-down" size={20} color={AppColors.black} />
                        </View>
                    );
                }}
                renderItem={(item, index, isSelected) => {
                    return (
                        <View
                            style={{
                                ...styles.dropdownItemStyle,
                                ...(isSelected && { backgroundColor: '#D2D9DF' }),
                            }}>
                            <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                        </View>
                    );
                }}
                dropdownStyle={styles.dropdownMenuStyle}
            />


            <AppInput
                multiline
                numberOfLines={11}
                container={{ height: hp(25), borderRadius: hp(0.5), marginBottom: hp(4), borderColor: AppColors.grey }}

                label="Description"
                placeholder="Report Accident Details here..."
                // placeholderTextColor={AppColors.black}
                inputStyle={{fontFamily: AppFonts.NunitoSansMedium}}

                labelStyle={{
                    marginBottom: hp(2),
                    fontFamily: AppFonts.NunitoSansBold,
                }}
            />
        </ScrollView>
    );

    const layout = useWindowDimensions();


    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: 'Report Accident' },
        { key: 'second', title: 'Disciplinary Issues' },
    ]);

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    const renderTabBar = (props: React.JSX.IntrinsicAttributes & SceneRendererProps & { navigationState: NavigationState<Route>; scrollEnabled?: boolean | undefined; bounces?: boolean | undefined; activeColor?: string | undefined; inactiveColor?: string | undefined; pressColor?: string | undefined; pressOpacity?: number | undefined; getLabelText?: ((scene: Scene<Route>) => string | undefined) | undefined; getAccessible?: ((scene: Scene<Route>) => boolean | undefined) | undefined; getAccessibilityLabel?: ((scene: Scene<Route>) => string | undefined) | undefined; getTestID?: ((scene: Scene<Route>) => string | undefined) | undefined; renderLabel?: ((scene: Scene<Route> & { focused: boolean; color: string }) => React.ReactNode) | undefined; renderIcon?: ((scene: Scene<Route> & { focused: boolean; color: string }) => React.ReactNode) | undefined; renderBadge?: ((scene: Scene<Route>) => React.ReactNode) | undefined; renderIndicator?: ((props: TabBarIndicatorProps<Route>) => React.ReactNode) | undefined; renderTabBarItem?: ((props: TabBarItemProps<Route> & { key: string }) => React.ReactElement<any, string | React.JSXElementConstructor<any>>) | undefined; onTabPress?: ((scene: Scene<Route> & Event) => void) | undefined; onTabLongPress?: ((scene: Scene<Route>) => void) | undefined; tabStyle?: StyleProp<ViewStyle>; indicatorStyle?: StyleProp<ViewStyle>; indicatorContainerStyle?: StyleProp<ViewStyle>; labelStyle?: StyleProp<TextStyle>; contentContainerStyle?: StyleProp<ViewStyle>; style?: StyleProp<ViewStyle>; gap?: number | undefined; testID?: string | undefined; android_ripple?: PressableAndroidRippleConfig | undefined }) => (
        <TabBar
            {...props}
            // pressColor={colors.blue}
            indicatorStyle={{ backgroundColor: AppColors.red }}
            style={{ paddingVertical: 0, backgroundColor: AppColors.white, height: hp(6), width: wp(100) }}
            labelStyle={styles.subTitle}
            activeColor={AppColors.red}
            inactiveColor="#666"
            renderLabel={({ route, focused, color }) => (
                <Text style={[styles.subTitle, { backgroundColor: 'transparent', 
                    fontFamily:  AppFonts.NunitoSansBold,
                        // fontFamily: focused? AppFonts.NunitoSansBold : AppFonts.NunitoSansSemiBold,
                // fontFamily: AppFonts.NunitoSansBold,
                color: focused?  AppColors.red: AppColors.black
                 }]}>
                    {route.title}
                    {/* {route.title.split(' ').map((word) => word[0].toUpperCase() + word.substring(1).toLowerCase()).join(' ')} */}
                </Text>
            )}
        />
    );


    return (
        <AppLayout statusbackgroundColor={AppColors.red}
            style={{ backgroundColor: AppColors.profileBg }}>
            <AppHeader role="Driver"
                title={'Incident'}
                enableBack={true}
                rightIcon={false} />



            <ScrollView contentContainerStyle={styles.container}>


                <TabView
                    style={{ width: '100%' }}
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={renderTabBar}
                />





                <AppButton
                    title="Send"
                    onPress={() => navigation.goBack()}
                    style={{
                        // width: '100%',
                        width: '90%',
                        backgroundColor: AppColors.red,
                        height: hp(6),
                        marginHorizontal: wp(7),
                        alignSelf: 'center',
                        position: 'relative',
                        bottom: 10
                    }}
                    titleStyle={{
                        fontSize: size.md
                    }}
                />

            </ScrollView>


        </AppLayout>
    )
}


const styles = StyleSheet.create({
    dropdownButtonStyle: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(1),
        paddingHorizontal: 12,
        marginVertical: hp(2),
        backgroundColor: AppColors.white,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: AppColors.grey
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#B1BDC8',
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
        textAlign: 'center',
    },

    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
        height: 150,
    },
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
    subContainer: {
        width: '100%',
        justifyContent: 'center',
        marginTop: hp(3),
        gap: hp(2),
        paddingHorizontal: wp(5)
    },
    uploadDocBox: {
        width: '100%',
        marginVertical: hp(3),
        marginTop: hp(2),
        height: hp(15),
        // gap: hp(1),
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: AppColors.red,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.veryLightPink
    },

    tapText: {

        fontFamily: AppFonts.NunitoSansSemiBold,
        fontSize: size.s,
        lineHeight: 20,
        color: AppColors.red,
        alignSelf: 'center',
    },

})