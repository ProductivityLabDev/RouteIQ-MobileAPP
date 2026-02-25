import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {fetchRetailProfile} from '../../store/retailer/retailerSlice';

const Row = ({label, value}: {label: string; value?: string | null}) => (
  <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
    <Text style={[AppStyles.title, AppStyles.halfWidth]}>{label}</Text>
    <Text style={[AppStyles.subTitle, AppStyles.halfWidth]}>{value || '—'}</Text>
  </View>
);

const RetailProfileInfo = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const profile = useAppSelector(state => state.retailerSlices.profile);
  const profileStatus = useAppSelector(state => state.retailerSlices.profileStatus);

  useEffect(() => {
    if (profileStatus === 'idle' || profileStatus === 'failed') {
      dispatch(fetchRetailProfile());
    }
  }, [dispatch, profileStatus]);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.profileBg}}>
      <AppHeader role="Retail" title="Profile Info" enableBack={true} rightIcon={false} />

      {profileStatus === 'loading' && !profile ? (
        <ActivityIndicator color={AppColors.red} size="large" style={{marginTop: hp(4)}} />
      ) : (
        <View style={AppStyles.flexBetween}>
          <View style={{backgroundColor: AppColors.white, paddingHorizontal: hp(2), paddingVertical: hp(2)}}>
            <Row label="Name" value={profile?.Name} />
            <Row label="Company Name" value={profile?.companyName} />
            <Row label="Address" value={profile?.Address} />
            <Row label="Phone Number" value={profile?.Phone} />
            <Row label="Email" value={profile?.Email} />
          </View>
          <View>
            <AppButton
              onPress={() => navigation.navigate('UpdateRetailProfile')}
              title="Edit Info"
              style={styles.button}
              titleStyle={styles.buttonTitle}
            />
          </View>
        </View>
      )}
    </AppLayout>
  );
};

export default RetailProfileInfo;

const styles = StyleSheet.create({
  button: {
    width: '95%',
    backgroundColor: AppColors.white,
    borderColor: AppColors.red,
    borderWidth: 1.5,
    marginBottom: hp(2),
    alignSelf: 'center',
  },
  buttonTitle: {
    color: AppColors.black,
  },
});
