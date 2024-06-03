import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlobalIcon from '../../components/GlobalIcon';
import AuthLayout from '../../layout/AuthLayout';
import AppStyles from '../../styles/AppStyles';
import AppButton from '../../components/AppButton';
import { hp, wp } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';
import AppInput from '../../components/AppInput';
import { AppColors } from '../../utils/color';
import { size } from '../../utils/responsiveFonts';

const Login = () => {
    const navigation = useNavigation();
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
        <AuthLayout>
             <View>
                <View style={[AppStyles.rowBetween, { alignItems: 'flex-start', justifyContent: 'center' }]}>
                    <TouchableOpacity style={{position: 'absolute', left:0, top: 15}} onPress={() => navigation.goBack()}>
                        <GlobalIcon library="Feather" name="chevron-left" color={AppColors.red} />
                    </TouchableOpacity>
                    <Image source={require('../../assets/images/route_logo.png')} />
                    <View></View>
                </View>
                <View style={AppStyles.center}>
                    <Text style={AppStyles.titleHead}>Log In</Text>
                    <Text style={[AppStyles.subHeading, { marginBottom: hp(2) }]}>Enter your credential to login</Text>
                    <View style={styles.setMargin}>
                        <AppInput label='Email' placeholderTextColor={AppColors.inputGrey} inputStyle={styles.inputStyle} placeholder='Enter Email Address' container={styles.inputContainer} labelStyle={styles.inputLabelStyle} rightInnerIcon={<GlobalIcon size={20} library="CustomIcon" color={AppColors.inputGrey} name="-icon-_email" />}/>
                        <AppInput label='Password' placeholderTextColor={AppColors.inputGrey} inputStyle={styles.inputStyle} containerStyle={{marginBottom: hp(3) }} container={styles.inputContainer} labelStyle={styles.inputLabelStyle} placeholder='Enter Password' rightInnerIcon={<GlobalIcon size={20} library="CustomIcon" color={AppColors.inputGrey} name="-icon-_lock" />} />
                        <AppButton onPress={()=> navigation.navigate('HomeSreen')} title='Log In'  />
                    </View>
                </View>
            </View>
        </AuthLayout>
        </ScrollView>
    );
};

export default Login;

const styles = StyleSheet.create({
    setMargin: {
        marginTop: hp(3),
    },
    inputStyle: { 
        height: hp(6), 
        marginLeft: wp(2), 
        fontSize: size.md 
    },
    inputContainer: {
        borderColor: AppColors.white
    },
    inputLabelStyle: {
        color: AppColors.lightBlack
    }
});
