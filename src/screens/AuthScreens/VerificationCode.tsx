import {useNavigation} from '@react-navigation/native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import AppButton from '../../components/AppButton';
import AuthLayout from '../../layout/AuthLayout';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp, wp} from '../../utils/constants';
import {fontSize, size} from '../../utils/responsiveFonts';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {verifyOtp} from '../../store/user/userSlices';
import {
  retailerVerifySignupOtp,
  retailerVerifyResetOtp,
} from '../../store/retailer/retailerSlice';

const VerificationCode = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
  const dispatch = useAppDispatch();

  const role = useAppSelector(state => state.userSlices.role);
  const resetEmail = useAppSelector(state => state.userSlices.resetEmail);

  const retailSignupEmail = useAppSelector(state => state.retailerSlices.signupEmail);
  const retailForgotEmail = useAppSelector(state => state.retailerSlices.forgotEmail);
  const retailVerifyOtpStatus = useAppSelector(state => state.retailerSlices.verifyOtpStatus);
  const retailVerifyResetStatus = useAppSelector(state => state.retailerSlices.verifyResetStatus);

  const otpStatus = useAppSelector(state => state.userSlices.otpStatus);

  const isRetail = role === 'Retail';
  const isRetailSignup = isRetail && !!retailSignupEmail;
  const isRetailForgot = isRetail && !!retailForgotEmail && !retailSignupEmail;

  const loading =
    otpStatus === 'loading' ||
    retailVerifyOtpStatus === 'loading' ||
    retailVerifyResetStatus === 'loading';

  const handleContinue = useCallback(async () => {
    if (!otp || otp.length < 4) return;
    if (loading) return;

    // Retailer signup OTP
    if (isRetailSignup) {
      try {
        await dispatch(
          retailerVerifySignupOtp({email: retailSignupEmail!, otp}),
        ).unwrap();
        navigation.navigate('Login');
      } catch (e) {
        // error shown via toast
      }
      return;
    }

    // Retailer forgot password OTP
    if (isRetailForgot) {
      try {
        await dispatch(
          retailerVerifyResetOtp({email: retailForgotEmail!, otp}),
        ).unwrap();
        navigation.navigate('NewPassword');
      } catch (e) {
        // error shown via toast
      }
      return;
    }

    // Non-retail password reset OTP (Driver / Parent)
    if (resetEmail) {
      try {
        await dispatch(verifyOtp({email: resetEmail, otp})).unwrap();
        navigation.navigate('NewPassword');
      } catch (e) {
        console.log('verify-otp failed', e);
      }
      return;
    }
  }, [
    dispatch,
    isRetailForgot,
    isRetailSignup,
    loading,
    navigation,
    otp,
    resetEmail,
    retailForgotEmail,
    retailSignupEmail,
  ]);

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
              Enter your 4 digit code that you received on your email.
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
              onPress={handleContinue}
              title={loading ? 'Verifying...' : 'Continue'}
              style={{marginTop: hp(10)}}
            />
            <Text
              style={{
                textAlign: 'center',
                marginTop: hp(1),
                color: AppColors.lightBlack,
              }}>
              If you didn't receive a code!{' '}
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
    marginTop: hp(1),
  },
  timerText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: fontSize(16),
    textAlign: 'center',
    marginTop: hp(2),
  },
  otpContainer: {
    height: hp(8),
    marginTop: hp(2),
    width: '90%',
  },
  underlineStyleBase: {
    width: wp(18),
    height: hp(8),
    color: AppColors.black,
    borderRadius: 5,
    fontSize: size.slg,
    backgroundColor: AppColors.transparent,
    borderColor: '#9BADCA',
    borderWidth: 1,
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
});
