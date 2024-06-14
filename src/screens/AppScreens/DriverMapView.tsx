import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import AppBottomSheet from '../../components/AppBottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {fontSize, size} from '../../utils/responsiveFonts';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import {hp} from '../../utils/constants';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {mapCustomStyle} from '../../utils/mapConfig';
import AppFonts from '../../utils/appFonts';
import GlobalIcon from '../../components/GlobalIcon';
import AlarmIcon from '../../assets/svgs/AlarmIcon';
import {useNavigation} from '@react-navigation/native';

const DriverMapView = () => {
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [endTrip, setEndTrip] = useState(false);
  const [tripEnd, setTripEnd] = useState(false);

  const snapPoints = useMemo(() => ['28%', '90%'], []);
  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const startLocation = {
    latitude: 37.7749,
    longitude: -122.4454,
  };

  const endLocation = {
    latitude: 37.7793,
    longitude: -122.426,
  };

  const mapView = () => (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={AppStyles.map}
      region={{
        latitude: (startLocation.latitude + endLocation.latitude) / 2,
        longitude: (startLocation.longitude + endLocation.longitude) / 2,
        latitudeDelta:
          Math.abs(startLocation.latitude - endLocation.latitude) * 1.5,
        longitudeDelta:
          Math.abs(startLocation.longitude - endLocation.longitude) * 1.5,
      }}
      customMapStyle={mapCustomStyle}
    />
  );

  useEffect(() => {
    openSheet();
  }, []);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}>
      <AppHeader
        role="Driver"
        title="Map View"
        enableBack={true}
        rightIcon={false}
      />
      <View style={[AppStyles.row, styles.durationContainer]}>
        <Text style={AppStyles.whiteSubTitle}>Duration: 37 min</Text>
        <Text style={AppStyles.whiteSubTitle}>Distance: 2 miles</Text>
        <Text style={AppStyles.whiteSubTitle}>Late: 15 min</Text>
      </View>
      <View style={[AppStyles.driverContainer, {paddingHorizontal: hp(0)}]}>
        {mapView()}

        <View style={[styles.absoluteContainer]}>
          <View style={[AppStyles.rowBetween, {alignItems: 'flex-end'}]}>
            <View style={{gap: 10}}>
              <View style={styles.firstContainer}>
                <Text style={styles.boardTitle}>Students</Text>
                <Text style={styles.boardTitle}>on board:</Text>
                <Text style={styles.boardDate}>10 / 12</Text>
              </View>
              {!endTrip && (
                <View style={styles.distanceContainer}>
                  <View style={AppStyles.row}>
                    <GlobalIcon
                      library="MaterialCommunityIcons"
                      name="arrow-right-top-bold"
                    />
                    <Text style={styles.boardDate}>50 Feet</Text>
                  </View>
                  <Text style={AppStyles.whiteSubTitle}>
                    Turn right on banker road
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              onPress={() => setEndTrip(true)}
              style={AppStyles.alarmIcon}>
              <AlarmIcon />
            </Pressable>
          </View>
          {endTrip && (
            <AppButton
              title="End Trip"
              onPress={() => {
                setTripEnd(true);
                openSheet();
              }}
              style={{width: '100%', marginTop: hp(2)}}
            />
          )}
        </View>
      </View>

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => closeSheet()}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View style={AppStyles.center}>
          <Text style={[AppStyles.titleHead, {fontSize: size.xlg}]}>
            {endTrip ? ' Enter End Mileage' : ' Enter Start Mileage'}
          </Text>
          <AppInput
            placeholder={
              endTrip ? ' Enter End Mileage' : ' Enter Start Mileage'
            }
            textAlignVertical="center"
            container={styles.inputContainer}
            inputStyle={styles.inputStyle}
            keyboardType="number-pad"
          />
          <View style={[AppStyles.rowBetween, AppStyles.widthFullPercent]}>
            <AppButton
              title="Back"
              style={styles.backButton}
              titleStyle={{color: AppColors.textLightGrey}}
              onPress={() => closeSheet()}
            />
            <AppButton
              title="Submit"
              style={styles.submitButton}
              onPress={() => {
                if (endTrip) {
                  closeSheet();
                  navigation.navigate('DriverHomeScreen');
                } else {
                  closeSheet();
                }
              }}
            />
          </View>
        </View>
      </AppBottomSheet>
    </AppLayout>
  );
};

export default DriverMapView;

const styles = StyleSheet.create({
  durationContainer: {
    backgroundColor: AppColors.black,
    justifyContent: 'space-around',
    paddingVertical: hp(1),
  },
  firstContainer: {
    backgroundColor: AppColors.black,
    width: hp(12),
    paddingHorizontal: hp(1),
    paddingVertical: hp(1),
    borderRadius: hp(1),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardDate: {
    fontSize: size.slg,
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
  boardTitle: {
    fontSize: fontSize(14),
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansMedium,
  },
  distanceContainer: {
    backgroundColor: AppColors.black,
    padding: hp(1.5),
    borderRadius: hp(1),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  absoluteContainer: {
    position: 'absolute',
    bottom: hp(1),
    width: '100%',
    paddingHorizontal: hp(2),
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: AppColors.dimGray,
    borderRadius: 5,
    width: '60%',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  inputStyle: {
    textAlign: 'center',
  },
  backButton: {width: '36%', backgroundColor: AppColors.screenColor},
  submitButton: {width: '60%'},
});
