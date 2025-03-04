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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveToken } from '../../store/user/userSlices';

const VerificationCode = () => {
  const navigation = useNavigation();
  const [otp, setOtp] = useState('');
    const dispatch = useAppDispatch();
    const role = useAppSelector(state => state.userSlices.role);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AuthLayout>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{marginHorizontal: hp(3)}}>
            <Text style={[AppStyles.titleHead, {textAlign: 'center'}]}>
             Verify Code
            </Text>
            <Text
              style={[
                AppStyles.subHeading,
                {marginBottom: hp(2), textAlign: 'center'},
              ]}>
              Please enter code we have just sent to email.
              email@example.com
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
            {/* <Text style={styles.timerText}>00:30</Text> */}
            <AppButton
              onPress={() => {
                if (role === 'Retail') {
                  navigation.navigate('HomeSreen');
                  dispatch(saveToken(true))
                } else {
                  navigation.navigate('NewPassword');
                }
              }}
              title="Verify"
              style={{marginTop: hp(2)}}
            />

            <Text style={{textAlign: 'center', marginTop: hp(1), color: AppColors.lightBlack}}>
              Didn’t receive OTP? {' '}
              <Text onPress={() => setOtp('')} style={styles.timerText}>
                Resend code
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
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: fontSize(14),
    textAlign: 'center',
  },
  otpContainer: {
    width: '80%',
    height: hp(8),
  },
  underlineStyleBase: {
    width: hp(6),
    height: hp(5),
    color: AppColors.black,
    borderRadius: 12,
    fontSize: size.slg,
    backgroundColor: AppColors.transparent,
    borderColor: '#6B6A6A',
    borderWidth: 1,
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
});
