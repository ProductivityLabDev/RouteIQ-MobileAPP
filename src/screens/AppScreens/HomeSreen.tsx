import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, StyleSheet, Switch, Text, View} from 'react-native';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppMapView from '../../components/AppMapView';
import GlobalIcon from '../../components/GlobalIcon';
import RouteSlider from '../../components/RouteSlider';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';

export default function HomeSreen() {
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <AppLayout>
      <AppHeader
        title="Mark Tommay"
        rightIcon={true}
        onPressLeftIcon={() => {
          navigation.navigate('Settings');
        }}
        onPressRightIcon={() => navigation.navigate('Notification')}
      />

      <View style={[AppStyles.rowBetween, styles.headerBottomContainer]}>
        <View style={{gap: hp(1)}}>
          <Text
            style={[
              AppStyles.subHeading,
              {
                fontFamily: AppFonts.NunitoSansLight,
                fontSize: size.sl,
                lineHeight: 20,
              },
            ]}>
            Bus No.
          </Text>
          <Text style={AppStyles.subHeading}>B456788</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require('../../assets/images/auth_background.png')}
          />
        </View>
        <View style={{gap: hp(1)}}>
          <Text
            style={[
              AppStyles.subHeading,
              {
                fontFamily: AppFonts.NunitoSansLight,
                fontSize: size.sl,
                lineHeight: 20,
              },
            ]}>
            Geofenced
          </Text>
          <Switch
            onValueChange={toggleSwitch}
            value={isEnabled}
            trackColor={{false: '#767577', true: AppColors.red}}
            thumbColor={isEnabled ? AppColors.white : '#f4f3f4'}
            style={{transform: [{scale: 1.3}]}}
          />
        </View>
      </View>

      <View style={styles.container}>
        <AppMapView />
        <View style={styles.bottomContainer}>
          <RouteSlider />
          <View style={[AppStyles.rowBetween, {marginTop: hp(3)}]}>
            <View style={[AppStyles.rowCenter, styles.bottomButton]}>
              <GlobalIcon
                library="CustomIcon"
                name="Chat"
                color={AppColors.red}
              />
            </View>
            <AppButton
              title="Report Student Absence"
              style={{backgroundColor: AppColors.lightBlack}}
            />
          </View>
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  headerBottomContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: hp(2),
    height: hp(10),
    marginTop: hp(0),
    zIndex: 1,
  },
  imageContainer: {
    height: hp(16),
    width: hp(16),
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: hp(10),
  },
  bottomContainer: {
    zIndex: 1,
    position: 'absolute',
    bottom: hp(5),
    width: '100%',
    backgroundColor: 'white',
    height: hp(20),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: hp(2),
  },
  bottomButton: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: AppColors.black,
    height: hp(6),
    width: hp(6),
  },
});
