
import { View, Text, Pressable, StyleSheet, Image, Switch, ScrollView } from 'react-native';
import React, { useState } from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import AppFonts from '../../utils/appFonts';
import AppStyles from '../../styles/AppStyles';
import { size } from '../../utils/responsiveFonts';
import { hp, screenHeight, wp } from '../../utils/constants';
import { AppColors } from '../../utils/color';
import GlobalIcon from '../../components/GlobalIcon';
import AppButton from '../../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import AppInput from '../../components/AppInput';
import { SelectList } from 'react-native-dropdown-select-list'

export default function ChildProfile() {
    const navigation = useNavigation();
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const [selected, setSelected] = React.useState("");

    const data = [
        { key: '1', value: 'Mobiles', disabled: true },
        { key: '2', value: 'Appliances' },
        { key: '3', value: 'Cameras' },
        { key: '4', value: 'Computers', disabled: true },
        { key: '5', value: 'Vegetables' },
        { key: '6', value: 'Diary Products' },
        { key: '7', value: 'Drinks' },
    ]
    return (
        <AppLayout>
            <AppHeader title="Child Profile" enableBack={true} rightIcon={false} />
            <ScrollView scrollEnabled={true}
                contentContainerStyle={{
                    //   position: 'relative',
                    // flex: 1,
                    paddingHorizontal: hp(2),
                    backgroundColor: AppColors.screenColor,
                    justifyContent: 'space-between'
                }}>

                <View>

                    {/* <View style={styles.imageContainer}>
                        <Image
                            style={styles.image}
                            source={require('../../assets/images/auth_background.png')}
                        />
                    </View> */}

                    <View style={{ position: 'relative' }}>
                        <View style={styles.imageContainer}>
                            <Image
                                style={styles.image}
                                source={require('../../assets/images/auth_background.png')}
                            />
                        </View>
                        <View style={styles.cameraIcon}>
                            <GlobalIcon
                                library="CustomIcon"
                                name="Group-183"
                                color={AppColors.black}
                                size={hp(2.5)}
                            />
                        </View>
                    </View>

                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='Name' value='Jacob Jones' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />


                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='Emergency Contacts' value='+93123132325' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />


                    <AppInput containerStyle={{ marginBottom: hp(3) }} multiline
                        numberOfLines={7}
                        container={{ height: hp(16), borderColor: AppColors.black }} label='Medical Details' placeholder='Descripton' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} />


                    <AppInput containerStyle={{ marginBottom: hp(3) }} multiline
                        numberOfLines={7}
                        container={{ height: hp(16), borderColor: AppColors.black }} label='Note' labelStyle={{ color: AppColors.black }} placeholder='Descripton' />


                    <AppInput containerStyle={{ marginBottom: hp(0) }} label='Transportation Preference' labelStyle={{ color: AppColors.black }} container={{ display: 'none' }} />

                    <SelectList
                        search={false}
                        setSelected={(val) => setSelected(val)}
                        data={data}
                        save="value"
                        placeholder='Select'
                        boxStyles={{marginBottom: hp(3), backgroundColor: AppColors.white, height: hp(7), alignItems: 'center'}}
                        // inputStyles={{backgroundColor: AppColors.white}}
                    />

                </View>



                <AppButton
                    onPress={() => navigation.navigate('HomeSreen')}
                    title="Update"
                    style={{
                        alignSelf: 'center',
                        width: '100%',
                        // position: 'absolute',
                        // bottom: 40,
                        backgroundColor: AppColors.black,

                        marginBottom: hp(6)
                    }}
                />
            </ScrollView>
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: AppColors.inputColor,
        padding: hp(1.5),
        borderRadius: hp(1.5),
        marginVertical: hp(1),
    },
    imageContainer: {
        height: hp(18),
        width: hp(18),
        borderRadius: hp(20),
        borderColor: AppColors.white,
        borderWidth: 2,
        alignSelf: 'center',
        marginVertical: hp(4),
        // height: hp(16),
        // width: hp(16),
        // borderRadius: hp(20),
        // borderColor: AppColors.white,
        // borderWidth: 2,
        // alignSelf: 'center',
    },
    image: {
        height: '100%',
        width: '100%',
        borderRadius: hp(16),
    },
    cameraIcon: {
        padding: hp(1),
        // borderColor: AppColors.red,
        borderWidth: 1,
        borderRadius: 20,
        position: 'absolute',
        top: 125,
        right: 120,
        backgroundColor: AppColors.white,
    },
});
