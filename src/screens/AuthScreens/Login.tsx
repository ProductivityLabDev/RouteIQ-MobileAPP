import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        <AuthLayout>
            <View>
                <View style={[AppStyles.rowBetween, { alignItems: 'flex-start', justifyContent: 'center' }]}>
                    <TouchableOpacity style={{position: 'absolute', left:0}} onPress={() => navigation.goBack()}>
                        <GlobalIcon library="Feather" name="chevron-left" />
                    </TouchableOpacity>
                    <Image source={require('../../assets/images/route_logo.png')} />
                    <View></View>
                </View>
                <View style={AppStyles.center}>
                    <Text style={AppStyles.titleHead}>Log In</Text>
                    <Text style={[AppStyles.subHeading, { marginBottom: hp(2) }]}>Enter your credential to login</Text>
                    <View style={styles.setMargin}>
                        <AppInput label='Email' placeholderTextColor={AppColors.inputGrey} inputStyle={{ height: hp(6), marginLeft: wp(2), fontSize: size.md }} placeholder='Email address' rightInnerIcon={<GlobalIcon size={20} library="CustomIcon" color={AppColors.inputGrey} name="-icon-_email" />}/>
                        <AppInput label='Password' placeholderTextColor={AppColors.inputGrey} inputStyle={{ height: hp(6),  marginLeft: wp(2), fontSize: size.md }} containerStyle={{marginBottom: hp(3)}} placeholder='Enter password' rightInnerIcon={<GlobalIcon size={20} library="CustomIcon" color={AppColors.inputGrey} name="-icon-_lock" />} />
                        <AppButton onPress={()=> navigation.navigate('HomeSreen')} title='Log In'  />
                    </View>
                </View>
            </View>
        </AuthLayout>
    );
};

export default Login;

const styles = StyleSheet.create({
    setMargin: {
        marginTop: hp(3),
        // gap: hp(1.4)
    }
});
