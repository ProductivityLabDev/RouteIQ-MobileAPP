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
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {mapCustomStyle} from '../../utils/mapConfig';
import AppFonts from '../../utils/appFonts';
import GlobalIcon from '../../components/GlobalIcon';
import AlarmIcon from '../../assets/svgs/AlarmIcon';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Image} from 'react-native';
import {useKeyboard} from '../../utils/keyboard';
import {useAppSelector} from '../../store/hooks';
import {googleMapsApiKey} from '../../utils/mapConfig';

const DriverMapView = () => {
  const navigation = useNavigation();
  const keyboardHeight = useKeyboard();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const mapViewRouteBackOn = useAppSelector(
    state => state.userSlices.mapViewRouteBackOn,
  );
  const [endTrip, setEndTrip] = useState(false);
  const [tripEnd, setTripEnd] = useState(false);
  const showStartMileAgeSheet = useAppSelector(
    state => state.userSlices.showStartMileAgeSheet,
  );
  const [tripStarted, setTripStarted] = useState(false); // new
  const [durationMin, setDurationMin] = useState<number | null>(37);
  const [distanceMi, setDistanceMi] = useState<number | null>(2);
  const mapRef = useRef<MapView>(null);

  const route = useRoute();
  const isFromMapView = route.params?.FromMapView ?? false;

  useEffect(() => {
    console.log('Route params:', route.params);
  }, []);

  const role = useAppSelector(state => state.userSlices.role);

  const snapPoints = useMemo(
    () => [keyboardHeight ? '30%' : '23%', '10%'],
    [keyboardHeight],
  );
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
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={AppStyles.map}
      initialRegion={{
        latitude: (startLocation.latitude + endLocation.latitude) / 2,
        longitude: (startLocation.longitude + endLocation.longitude) / 2,
        latitudeDelta:
          Math.abs(startLocation.latitude - endLocation.latitude) * 1.5,
        longitudeDelta:
          Math.abs(startLocation.longitude - endLocation.longitude) * 1.5,
      }}
      customMapStyle={mapCustomStyle}
    >
      <Marker coordinate={startLocation} />
      <Marker coordinate={endLocation} />
      <MapViewDirections
        origin={startLocation}
        destination={endLocation}
        apikey={googleMapsApiKey}
        strokeWidth={4}
        strokeColor={AppColors.black}
        optimizeWaypoints={true}
        onReady={result => {
          setDurationMin(Math.round(result.duration));
          // MapViewDirections distance is in km; convert to miles for existing UI label
          setDistanceMi(Number((result.distance * 0.621371).toFixed(1)));
          mapRef.current?.fitToCoordinates(result.coordinates, {
            edgePadding: {top: 60, right: 60, bottom: 240, left: 60},
            animated: true,
          });
        }}
      />
    </MapView>
  );

  useEffect(() => {
    if (showStartMileAgeSheet) {
      openSheet();
    }
  }, [showStartMileAgeSheet]);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}>
      <AppHeader
        role="Driver"
        title="Map View"
        enableBack={true}
        rightIcon={true}
      />
      <View style={[AppStyles.row, styles.durationContainer]}>
        <Text style={AppStyles.whiteSubTitle}>
          Duration: {durationMin != null ? `${durationMin} min` : '—'}
        </Text>
        <Text style={AppStyles.whiteSubTitle}>
          Distance: {distanceMi != null ? `${distanceMi} miles` : '—'}
        </Text>
        <Text style={AppStyles.whiteSubTitle}>Late: 15 min</Text>
      </View>
      <View style={[AppStyles.driverContainer, {paddingHorizontal: hp(0)}]}>
        {mapView()}

        <Pressable
          style={[
            styles.bottomContainers,
            {bottom: hp(20), justifyContent: 'center'},
          ]}>
          <Image source={require('../../assets/images/mappic.png')} />
        </Pressable>

        <View style={[styles.absoluteContainer]}>
          <View style={[AppStyles.rowBetween, {alignItems: 'flex-end'}]}>
            <View style={{gap: 10}}>
              <View style={styles.firstContainer}>
                <Text style={styles.boardTitle}>Trip# 03</Text>
                <Text style={styles.boardTitle}>Students on board</Text>
                {/* <Text style={styles.boardTitle}>on board:</Text> */}
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
              onPress={() => navigation.navigate('AlertScreen')}
              style={AppStyles.alarmIcon}>
              <AlarmIcon />
            </Pressable>
          </View>
          {/* {role === 'Driver' && 
          <AppButton
            title="End Trip"
            onPress={() => {
              setTripEnd(true);
              openSheet();
            }}
            style={{width: '100%', marginTop: hp(2)}}
          />
          } */}

          {role === 'Driver' && !isFromMapView && !tripStarted && (
            <AppButton
              title="Start Trip"
              onPress={() => {
                setTripStarted(true);
                openSheet();
              }}
              style={{width: '100%', marginTop: hp(2)}}
            />
          )}

          {role === 'Driver' && !isFromMapView && tripStarted && (
            <AppButton
              title="End Trip"
              onPress={() => {
                setTripEnd(true);
                openSheet();
              }}
              style={{width: '100%', marginTop: hp(2)}}
            />
          )}

          {/* {endTrip && (
            <AppButton
              title="End Trip"
              onPress={() => {
                setTripEnd(true);
                openSheet();
              }}
              style={{width: '100%', marginTop: hp(2)}}
            />
          )} */}
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
          <Text
            style={[
              AppStyles.titleHead,
              {fontSize: size.xlg, marginTop: hp(2)},
            ]}>
            {tripEnd ? ' Enter End Mileage*' : ' Enter Start Mileage*'}
          </Text>
          <AppInput
            placeholder={
              tripEnd ? ' Enter End Mileage' : ' Enter Start Mileage'
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
                if (tripEnd) {
                  // Ending trip
                  navigation.navigate('DriverHomeScreen');
                } else {
                  // Starting trip
                  setTripStarted(true);
                  closeSheet(); // close and stay on map
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
    width: hp(20),
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
    fontSize: 14,
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
  backButton: {
    width: '36%',
    backgroundColor: AppColors.screenColor,
  },

  submitButton: {width: '60%'},
  bottomContainers: {
    position: 'absolute',
    bottom: hp(28),
    paddingHorizontal: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-end',
  },
});
