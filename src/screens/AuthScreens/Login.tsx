import React, {useEffect} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalIcon from '../../components/GlobalIcon';
import AuthLayout from '../../layout/AuthLayout';
import AppStyles from '../../styles/AppStyles';
import AppButton from '../../components/AppButton';
import {hp, wp} from '../../utils/constants';
import {useNavigation} from '@react-navigation/native';
import AppInput from '../../components/AppInput';
import {AppColors} from '../../utils/color';
import {fontSize, size} from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {saveToken, setLogout} from '../../store/user/userSlices';

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.userSlices.role);

  useEffect(() => {
    dispatch(setLogout(false));
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AuthLayout>
        <View>
          <View
            style={[
              AppStyles.rowBetween,
              {alignItems: 'flex-start', justifyContent: 'center'},
            ]}>
            <TouchableOpacity
              style={{position: 'absolute', left: 0, top: 15}}
              onPress={() => navigation.navigate('LoginAs')}>
              <GlobalIcon
                library="Feather"
                name="chevron-left"
                color={AppColors.red}
              />
            </TouchableOpacity>
            <Image
              style={{height: hp(40), width: hp(40), resizeMode: 'contain'}}
              source={require('../../assets/images/Splash_icon.png')}
            />
            <View></View>
          </View>
          <View style={AppStyles.center}>
            <Text style={AppStyles.titleHead}>Log In</Text>
            <Text style={[AppStyles.subHeading, {marginBottom: hp(2)}]}>
              Enter your credential to login
            </Text>
            <View style={styles.setMargin}>
              <AppInput
                label="Email"
                placeholderTextColor={AppColors.inputGrey}
                inputStyle={styles.inputStyle}
                placeholder="Enter Email Address"
                container={styles.inputContainer}
                labelStyle={styles.inputLabelStyle}
                rightInnerIcon={
                  <View style={{marginBottom: hp(-0.4)}}>
                    <GlobalIcon
                      size={20}
                      library="FontelloIcon"
                      color={AppColors.inputGrey}
                      name="-icon-_email"
                    />
                  </View>
                }
              />
              <AppInput
                label="Password"
                placeholderTextColor={AppColors.inputGrey}
                inputStyle={styles.inputStyle}
                containerStyle={{marginBottom: hp(0)}}
                container={styles.inputContainer}
                labelStyle={styles.inputLabelStyle}
                placeholder="Enter Password"
                togglePasswordVisibility={true}
                secureTextEntry={true}
                rightInnerIcon={
                  <GlobalIcon
                    size={20}
                    library="FontelloIcon"
                    color={AppColors.inputGrey}
                    name="lock"
                  />
                  // <GlobalIcon
                  //   size={20}
                  //   library="CustomIcon"
                  //   color={AppColors.inputGrey}
                  //   name="-icon-_lock"
                  // />
                }
              />
              <TouchableOpacity
                onPress={() => navigation.navigate('ResetPassword')}
                style={styles.forgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
              <AppButton
                onPress={() => {
                  role == 'Driver'
                    ? navigation.navigate('DriverProfileInfo')
                    : dispatch(saveToken(1));
                }}
                title="Log In"
              />
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
    fontSize: size.md,
  },
  inputContainer: {
    borderColor: '#cfcfcf',
    borderWidth: 1,
  },
  inputLabelStyle: {
    color: AppColors.lightBlack,
  },
  forgotPassword: {
    marginBottom: hp(2.5),
    alignSelf: 'flex-end',
    padding: hp(0.5),
    paddingRight: 0,
    marginTop: hp(0.5),
  },
  forgotText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: fontSize(14),
  },
});
