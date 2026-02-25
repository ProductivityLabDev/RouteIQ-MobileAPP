import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import {useNavigation} from '@react-navigation/native';
import {Controller, useForm} from 'react-hook-form';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {fetchRetailProfile, updateRetailProfile} from '../../store/retailer/retailerSlice';

const UpdateRetailProfile = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const profile = useAppSelector(state => state.retailerSlices.profile);
  const profileUpdateStatus = useAppSelector(state => state.retailerSlices.profileUpdateStatus);

  const {control, handleSubmit, setValue, formState: {errors}} = useForm({
    defaultValues: {name: '', address: '', phoneNumber: '', email: ''},
  });

  useEffect(() => {
    if (!profile) {
      dispatch(fetchRetailProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      setValue('name', profile.Name || '');
      setValue('address', profile.Address || '');
      setValue('phoneNumber', profile.Phone || '');
      setValue('email', profile.Email || '');
    }
  }, [profile, setValue]);

  const onSubmit = async (values: any) => {
    if (profileUpdateStatus === 'loading') return;
    try {
      await dispatch(updateRetailProfile({
        name: values.name,
        address: values.address,
        phone: values.phoneNumber,
        email: values.email,
      })).unwrap();
      navigation.goBack();
    } catch (e) {
      // error shown via toast
    }
  };

  return (
    <AppLayout statusbackgroundColor={AppColors.red} style={{backgroundColor: AppColors.white}}>
      <AppHeader role="Retail" title="Edit Profile" enableBack={true} rightIcon={false} />
      <ScrollView
        contentContainerStyle={{padding: hp(2)}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
          <Text style={[AppStyles.title, AppStyles.halfWidth]}>Name</Text>
          <Controller
            name="name"
            control={control}
            rules={{required: 'Name is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                value={value}
                containerStyle={AppStyles.halfWidth}
                container={[styles.inputContainer, {height: 40}]}
                inputStyle={styles.inputStyle}
                onChangeText={text => onChange(text)}
                error={errors.name?.message}
              />
            )}
          />
        </View>

        <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
          <Text style={[AppStyles.title, AppStyles.halfWidth]}>Address</Text>
          <Controller
            name="address"
            control={control}
            rules={{required: 'Address is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                value={value}
                containerStyle={AppStyles.halfWidth}
                container={[styles.inputContainer, {height: 40}]}
                inputStyle={styles.inputStyle}
                multiline
                onChangeText={text => onChange(text)}
                error={errors.address?.message}
              />
            )}
          />
        </View>

        <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
          <Text style={[AppStyles.title, AppStyles.halfWidth]}>Phone Number</Text>
          <Controller
            name="phoneNumber"
            control={control}
            rules={{required: 'Phone number is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                value={value}
                containerStyle={AppStyles.halfWidth}
                container={[styles.inputContainer, {height: 40}]}
                inputStyle={styles.inputStyle}
                keyboardType="number-pad"
                onChangeText={text => onChange(text)}
                error={errors.phoneNumber?.message}
              />
            )}
          />
        </View>

        <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
          <Text style={[AppStyles.title, AppStyles.halfWidth]}>Email</Text>
          <Controller
            name="email"
            control={control}
            rules={{required: 'Email is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                value={value}
                containerStyle={AppStyles.halfWidth}
                container={[styles.inputContainer, {height: 40}]}
                inputStyle={styles.inputStyle}
                onChangeText={text => onChange(text)}
                error={errors.email?.message}
              />
            )}
          />
        </View>

        <AppButton
          title={profileUpdateStatus === 'loading' ? 'Saving...' : 'Update'}
          style={{width: '100%', alignSelf: 'center'}}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </AppLayout>
  );
};

export default UpdateRetailProfile;

const styles = StyleSheet.create({
  inputContainer: {
    borderColor: AppColors.graySuit,
    borderWidth: 1,
    paddingHorizontal: 2,
    borderRadius: 5,
  },
  inputStyle: {
    color: AppColors.graySuit,
  },
});
