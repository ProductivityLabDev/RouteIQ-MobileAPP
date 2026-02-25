import React, {useCallback, useEffect, useState} from 'react';
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
import {
  loginUser,
  setForgotType,
  setLogout,
  resetAuthLoading,
} from '../../store/user/userSlices';
import {Controller, useForm} from 'react-hook-form';
import {showErrorToast, showSuccessToast} from '../../utils/toast';
import {saveApiBaseUrl} from '../../utils/apiConfig';

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.userSlices.role);
  const authStatus = useAppSelector(state => state.userSlices.authStatus);
  const authError = useAppSelector(state => state.userSlices.authError);
  const [showServer, setShowServer] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(setLogout(false));
  }, []);

  // Agar 12 sec se loading atka rahe to button unstick karo (safety)
  useEffect(() => {
    if (authStatus !== 'loading') return;
    const t = setTimeout(() => {
      dispatch(resetAuthLoading());
      showErrorToast('Request timed out', 'Check WiFi and apiConfig.ts');
    }, 12000);
    return () => clearTimeout(t);
  }, [authStatus, dispatch]);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSaveServer = useCallback(async () => {
    const url = serverUrl.trim();
    if (!url) return;
    setSaving(true);
    try {
      const full = url.startsWith('http') ? url : `http://${url}`;
      await saveApiBaseUrl(full);
      showSuccessToast('Server saved', 'Ab login try karo');
      setShowServer(false);
      setServerUrl('');
    } catch (_e) {
      showErrorToast('Save failed', '');
    } finally {
      setSaving(false);
    }
  }, [serverUrl]);

  const onSubmit = useCallback(
    ({email, password}: {email: string; password: string}) => {
      if (authStatus === 'loading') {
        return;
      }
      console.log('[Login] Button pressed. Role:', role, 'Email length:', email?.trim?.()?.length ?? 0);
      dispatch(loginUser({email: email.trim(), password}));
    },
    [authStatus, dispatch, role],
  );

  React.useEffect(() => {
    if (authStatus === 'failed') {
      showErrorToast('Login failed', authError || undefined);
    }
  }, [authError, authStatus]);

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
            <Text style={AppStyles.titleHead}>
              {role === 'Driver'
                ? 'Driver'
                : role === 'Parents'
                ? 'Parent'
                : 'Retail'}
            </Text>
            <Text style={[AppStyles.subHeading, {marginBottom: hp(2)}]}>
              Enter your credential to login
            </Text>
            <View style={styles.setMargin}>
              <Controller
                name="email"
                control={control}
                rules={{required: 'Email is required'}}
                render={({field: {onChange, value}}) => (
                  <AppInput
                    label={
                      role === 'Driver' || role === 'Retail'
                        ? 'Email / Username'
                        : 'Email'
                    }
                    value={value}
                    placeholderTextColor={AppColors.inputGrey}
                    inputStyle={styles.inputStyle}
                    placeholder="Email Address"
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
              {(role === 'Driver' || role === 'Retail') && (
                <TouchableOpacity
                  onPress={() => {
                    dispatch(setForgotType('username'));
                    navigation.navigate('ResetPassword');
                  }}
                  style={[
                    styles.forgotPassword,
                    {marginTop: 0, marginBottom: 0},
                  ]}>
                  <Text style={styles.forgotText}>Forgot Username?</Text>
                </TouchableOpacity>
              )}
              <Controller
                name="password"
                control={control}
                rules={{required: 'Password is required'}}
                render={({field: {onChange, value}}) => (
                  <AppInput
                    label="Password"
                    value={value}
                    placeholderTextColor={AppColors.inputGrey}
                    inputStyle={styles.inputStyle}
                    containerStyle={{marginBottom: hp(0)}}
                    container={styles.inputContainer}
                    labelStyle={styles.inputLabelStyle}
                    placeholder="Enter Password"
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
              <TouchableOpacity
                onPress={() => {
                  dispatch(setForgotType('password'));
                  navigation.navigate('ResetPassword');
                }}
                style={styles.forgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {authStatus === 'failed' && authError ? (
                <Text style={[styles.errorText, {marginBottom: hp(1)}]}>{authError}</Text>
              ) : null}
              <AppButton
                onPress={handleSubmit(onSubmit)}
                title={authStatus === 'loading' ? 'Logging in...' : 'Log In'}
                disabled={authStatus === 'loading'}
              />

              <TouchableOpacity
                onPress={() => setShowServer(s => !s)}
                style={styles.serverToggle}>
                <Text style={styles.serverToggleText}>
                  {showServer ? '▼' : '▶'} Server URL (PC IP)
                </Text>
              </TouchableOpacity>
              {showServer && (
                <View style={styles.serverSection}>
                  <AppInput
                    placeholder="192.168.1.5:3000"
                    value={serverUrl}
                    onChangeText={setServerUrl}
                    container={styles.inputContainer}
                    inputStyle={styles.inputStyle}
                  />
                  <AppButton
                    onPress={handleSaveServer}
                    title={saving ? 'Saving...' : 'Save'}
                    disabled={saving || !serverUrl.trim()}
                    style={{marginTop: hp(1)}}
                  />
                </View>
              )}

              {role == 'Retail' && (
                <TouchableOpacity
                  onPress={() => {
                    dispatch(setForgotType('password'));
                    navigation.navigate('Signup');
                  }}
                  style={styles.DontHaveAc}>
                  <Text style={styles.DontAcText}>
                    Didn’t have an account.?{' '}
                    <Text style={styles.signupText}>Signup..</Text>
                  </Text>
                </TouchableOpacity>
              )}
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
  signupText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: fontSize(14),
  },
  errorText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: fontSize(12),
    textAlign: 'center',
  },
  DontHaveAc: {
    marginTop: hp(1),
  },
  DontAcText: {
    color: AppColors.lightBlack,
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: fontSize(14),
    textAlign: 'center',
    alignSelf: 'center',
  },
  serverToggle: {
    marginTop: hp(2),
    paddingVertical: hp(1),
  },
  serverToggleText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: fontSize(13),
  },
  serverSection: {
    marginTop: hp(1),
    marginBottom: hp(1),
  },
});
