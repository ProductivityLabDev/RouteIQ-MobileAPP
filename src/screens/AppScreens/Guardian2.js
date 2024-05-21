
import { View, Text, Pressable, StyleSheet, Image, Switch, ScrollView } from 'react-native';
import React, { useState } from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import { hp, screenHeight, wp } from '../../utils/constants';
import { AppColors } from '../../utils/color';
import GlobalIcon from '../../components/GlobalIcon';
import AppButton from '../../components/AppButton';
import { useNavigation } from '@react-navigation/native';
import AppInput from '../../components/AppInput';
import { SelectList } from 'react-native-dropdown-select-list'

export default function Guardian2() {
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
            <AppHeader title="Guardian 2" enableBack={true} rightIcon={false} />
            <ScrollView scrollEnabled={true}
                contentContainerStyle={{
                    paddingHorizontal: hp(2),
                    backgroundColor: AppColors.screenColor,
                    justifyContent: 'space-between'
                }}>

                <View style={{marginTop: hp(3)}}>

                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='Name' value='Sarah Jones' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />

                    <AppInput containerStyle={{ marginBottom: hp(0) }} label='Relation with Child' labelStyle={{ color: AppColors.black }} container={{ display: 'none' }} />

                    <SelectList
                        search={false}
                        setSelected={(val) => setSelected(val)}
                        data={data}
                        save="value"
                        placeholder='Select'
                        boxStyles={{ marginBottom: hp(3), backgroundColor: AppColors.white, height: hp(7), alignItems: 'center' }}
                    // inputStyles={{backgroundColor: AppColors.white}}
                    />



                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='Address' value='E301, 20 Cooper Square' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />

                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='City' value='New York' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />
                   
                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='State' value='New York State' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />
                   
                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='Zip Code' value='3132325' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />
                   
                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='Phone' value='+93123132325' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />

                    <AppInput containerStyle={{ marginBottom: hp(3) }} label='Email' value='jones234@gmail.com' labelStyle={{ color: AppColors.black }} inputStyle={{ color: AppColors.black }} editable={true} container={{ borderColor: AppColors.black }} />


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
