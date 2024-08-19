import React, { useState } from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import { AppColors } from '../../utils/color';
import { useAppSelector } from '../../store/hooks';
import AppStyles from '../../styles/AppStyles';
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AppInput from '../../components/AppInput';
import { hp, wp } from '../../utils/constants';
import AppFonts from '../../utils/appFonts';
import FuelCard from '../../components/FuelCard';
import AnimatedDriverMapView from '../../components/AnimatedDriverMapView';

const FuelRecordsScreen = () => {



    return (
        <AppLayout
            statusbackgroundColor={AppColors.red}
            style={{ backgroundColor: AppColors.driverScreen }}
            alarmIcon={true}>

            <AppHeader
                role="Driver"
                title={'Fuel'}
                enableBack={true}
                rightIcon={true}
            />
            <View style={{ paddingHorizontal: wp(3) , paddingTop:hp(2) }}>
                <AppInput placeholder='Search' />
            </View>
            <ScrollView>
                <FuelCard
                    glNumber="GL#112-01"
                    date="31-08-2024"
                    price={42.909}
                    gallons={9.74}
                    pricePerGallon={4.405}
                    location="San Francisco, ExampleCorp"
                />
                <FuelCard
                    glNumber="GL#112-01"
                    date="31-08-2024"
                    price={42.909}
                    gallons={9.74}
                    pricePerGallon={4.405}
                    location="San Francisco, ExampleCorp"
                />
               
            </ScrollView>

            <AnimatedDriverMapView />

        </AppLayout>
    );
};

export default FuelRecordsScreen;

const styles = StyleSheet.create({
    containerStyle: {
        backgroundColor: AppColors.white,
        padding: hp(2),
        borderRadius: 16,
    },
    inputStyle: {
        height: hp(5.5),
    },
    labelStyle: {
        fontFamily: AppFonts.NunitoSansSemiBold,
    },
    image: {
        height: hp(30),
        width: '100%',
        resizeMode: 'contain',
        marginTop: hp(1),
    },
});
