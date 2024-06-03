import {useNavigation} from '@react-navigation/native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import AppButton from '../../components/AppButton';
import AuthLayout from '../../layout/AuthLayout';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {fontSize, size} from '../../utils/responsiveFonts';

const VerificationCode = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AuthLayout>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{marginHorizontal: hp(3)}}>
            <Text style={[AppStyles.titleHead, {textAlign: 'center'}]}>
              Verification
            </Text>
            <Text
              style={[
                AppStyles.subHeading,
                {marginBottom: hp(2), textAlign: 'center'},
              ]}>
              Enter your 4 digits code that you received on your email.
            </Text>
          </View>
          <View style={[styles.setMargin, {alignItems: 'center'}]}>
            <OTPInputView
              style={styles.otpContainer}
              pinCount={4}
              keyboardType="number-pad"
              autoFocusOnLoad={false}
              codeInputFieldStyle={styles.underlineStyleBase}
              selectionColor={AppColors.black}
              onCodeFilled={(text: string) => setOtp(text)}
            />
            <Text style={styles.timerText}>00:30</Text>
            <AppButton
              onPress={() => navigation.navigate('NewPassword')}
              title="Continue"
              style={{marginTop: hp(10)}}
            />
            <Text style={{textAlign: 'center', marginTop: hp(1)}}>
              If you didn’t receive a code!{' '}
              <Text onPress={() => setOtp('')} style={styles.timerText}>
                Resend
              </Text>
            </Text>
          </View>
        </View>
      </AuthLayout>
    </ScrollView>
  );
};

export default VerificationCode;

const styles = StyleSheet.create({
  setMargin: {
    marginTop: hp(3),
  },
  timerText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: fontSize(14),
    textAlign: 'center',
  },
  otpContainer: {
    width: '75%',
    height: hp(8),
  },
  underlineStyleBase: {
    width: hp(7),
    height: hp(7),
    color: AppColors.black,
    borderRadius: 6,
    fontSize: size.slg,
    backgroundColor: AppColors.transparent,
    borderColor: '#cfcfcf',
    borderWidth: 1,
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
});
