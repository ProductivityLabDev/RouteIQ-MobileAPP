import React, {useEffect} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
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
import {setLogout} from '../../store/user/userSlices';
import {retailerSignup} from '../../store/retailer/retailerSlice';
import {Controller, useForm} from 'react-hook-form';
import {showErrorToast} from '../../utils/toast';

const Signup = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const signupStatus = useAppSelector(state => state.retailerSlices.signupStatus);

  useEffect(() => {
    dispatch(setLogout(false));
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (signupStatus === 'loading') return;
    if (values.password !== values.confirmPassword) {
      showErrorToast('Passwords do not match', 'Please re-check and try again');
      return;
    }
    try {
      await dispatch(retailerSignup(values)).unwrap();
      navigation.navigate('VerificationCode');
    } catch (e) {
      // error already shown via toast in thunk
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
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
                style={{height: hp(30), width: hp(40), resizeMode: 'contain'}}
                source={require('../../assets/images/Splash_icon.png')}
              />
              <View></View>
            </View>
            <View style={AppStyles.center}>
              <Text style={AppStyles.titleHead}>Sign Up</Text>
              <Text style={[AppStyles.subHeading, {marginBottom: hp(2)}]}>
                Just some details to get you in!
              </Text>
              <View style={styles.setMargin}>
                <Controller
                  name="name"
                  control={control}
                  rules={{required: 'Company name is required'}}
                  render={({field: {onChange, value}}) => (
                    <AppInput
                      label="Company Name"
                      value={value}
                      placeholderTextColor={AppColors.inputGrey}
                      inputStyle={styles.inputStyle}
                      placeholder="Enter company name"
                      container={styles.inputContainer}
                      labelStyle={styles.inputLabelStyle}
                      onChangeText={text => onChange(text)}
                      containerStyle={{marginBottom: hp(0)}}
                      error={errors.name?.message}
                      rightInnerIcon={
                        <GlobalIcon
                          size={20}
                          library="FontAwesome6"
                          color={AppColors.inputGrey}
                          name="building"
                        />
                      }
                    />
                  )}
                />
                <Controller
                  name="username"
                  control={control}
                  rules={{required: 'Username is required'}}
                  render={({field: {onChange, value}}) => (
                    <AppInput
                      label="Username"
                      value={value}
                      placeholderTextColor={AppColors.inputGrey}
                      inputStyle={styles.inputStyle}
                      placeholder="Enter username"
                      container={styles.inputContainer}
                      labelStyle={styles.inputLabelStyle}
                      onChangeText={text => onChange(text)}
                      containerStyle={{marginBottom: hp(0)}}
                      error={errors.username?.message}
                      rightInnerIcon={
                        <GlobalIcon
                          size={20}
                          library="FontAwesome6"
                          color={AppColors.inputGrey}
                          name="user-large"
                        />
                      }
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{required: 'Email is required'}}
                  render={({field: {onChange, value}}) => (
                    <AppInput
                      label="Email"
                      value={value}
                      placeholderTextColor={AppColors.inputGrey}
                      inputStyle={styles.inputStyle}
                      placeholder="Enter email address"
                      container={styles.inputContainer}
                      labelStyle={styles.inputLabelStyle}
                      onChangeText={text => onChange(text)}
                      error={errors.email?.message}
                      containerStyle={{marginBottom: hp(0)}}
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
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  rules={{required: 'Password is required', minLength: {value: 6, message: 'Min 6 characters'}}}
                  render={({field: {onChange, value}}) => (
                    <AppInput
                      label="Password"
                      value={value}
                      placeholderTextColor={AppColors.inputGrey}
                      inputStyle={styles.inputStyle}
                      containerStyle={{marginBottom: hp(0)}}
                      container={styles.inputContainer}
                      labelStyle={styles.inputLabelStyle}
                      placeholder="Enter password"
                      togglePasswordVisibility={true}
                      secureTextEntry={true}
                      onChangeText={text => onChange(text)}
                      error={errors.password?.message}
                      rightInnerIcon={
                        <GlobalIcon
                          size={20}
                          library="FontelloIcon"
                          color={AppColors.inputGrey}
                          name="lock"
                        />
                      }
                    />
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: 'Please confirm your password',
                    validate: val => val === watch('password') || 'Passwords do not match',
                  }}
                  render={({field: {onChange, value}}) => (
                    <AppInput
                      label="Confirm Password"
                      value={value}
                      placeholderTextColor={AppColors.inputGrey}
                      inputStyle={styles.inputStyle}
                      containerStyle={{marginBottom: hp(0)}}
                      container={styles.inputContainer}
                      labelStyle={styles.inputLabelStyle}
                      placeholder="Re-enter password"
                      togglePasswordVisibility={true}
                      secureTextEntry={true}
                      onChangeText={text => onChange(text)}
                      error={errors.confirmPassword?.message}
                      rightInnerIcon={
                        <GlobalIcon
                          size={20}
                          library="FontelloIcon"
                          color={AppColors.inputGrey}
                          name="lock"
                        />
                      }
                    />
                  )}
                />
                <AppButton
                  onPress={handleSubmit(onSubmit)}
                  title={signupStatus === 'loading' ? 'Creating...' : 'Sign Up'}
                  style={styles.signup_Btn}
                />
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.forgotPassword}>
                  <Text style={styles.forgotText}>
                    Already Registered?{' '}
                    <Text style={styles.loginText}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </AuthLayout>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;

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
    alignSelf: 'center',
    padding: hp(0.5),
    paddingRight: 0,
    marginTop: hp(0.5),
  },
  forgotText: {
    color: AppColors.lightBlack,
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: fontSize(14),
  },
  loginText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: fontSize(14),
  },
  signup_Btn: {
    marginTop: hp(1),
  },
});
