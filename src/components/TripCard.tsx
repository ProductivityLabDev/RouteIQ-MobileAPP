import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import BulletIcon from '../assets/svgs/BulletIcon';
import BusIcon from '../assets/svgs/BusIcon';
import MapViewIcon from '../assets/svgs/MapViewIcon';
import AppStyles from '../styles/AppStyles';
import {TripCardProps} from '../types/types';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';
import {handleSetColor} from '../utils/functions';
import {fontSize, size} from '../utils/responsiveFonts';
import AppButton from './AppButton';
import GlobalIcon from './GlobalIcon';
import AppBottomSheet from './AppBottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import AppInput from './AppInput';
import {useNavigation} from '@react-navigation/native';

const TripCard: React.FC<TripCardProps> = ({item}) => {
  const navigation = useNavigation();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [accept, setAccept] = useState(false);

  const snapPoints = useMemo(() => ['38%', '90%'], []);
  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  return (
    <View style={{marginVertical: hp(1)}}>
      <View style={[styles.container, {zIndex: 1}]}>
        <View style={styles.innerContainer}>
          <View style={AppStyles.rowBetween}>
            <View style={styles.tripHead}>
              <Text style={[AppStyles.titleHead, {fontSize: size.md}]}>
                {item?.title}
              </Text>
            </View>
            <View style={AppStyles.row}>
              <Text
                style={[
                  AppStyles.subTitle,
                  {fontSize: size.sl, color: AppColors.white},
                ]}>
                {item?.time}
              </Text>
              <Text
                style={[
                  AppStyles.subTitle,
                  {
                    fontSize: size.sl,
                    color: AppColors.white,
                    marginLeft: hp(2),
                  },
                ]}>
                {item?.date}
              </Text>
            </View>
          </View>
          <View
            style={[
              AppStyles.rowBetween,
              {marginTop: hp(1.5), marginBottom: hp(0.5)},
            ]}>
            <View style={{gap: 5}}>
              <View style={AppStyles.row}>
                <BulletIcon />
                <Text style={styles.bulletText}>{item?.start_location}</Text>
              </View>
              <View style={AppStyles.row}>
                <BulletIcon />
                <Text style={styles.bulletText}>{item?.end_location}</Text>
              </View>
            </View>
            <View>
              <Text
                style={[
                  AppStyles.whiteTitle,
                  {
                    fontSize: size.sl,
                    textAlign: 'right',
                    top: -5,
                  },
                ]}>
                TRIP NO.
              </Text>
              <Text style={AppStyles.whiteTitle}>{item?.trip_no}</Text>
            </View>
          </View>
          {!declined && (
            <View style={AppStyles.rowBetween}>
              <View style={[AppStyles.row, {width: '30%'}]}>
                {/* <MapViewIcon /> */}
                <GlobalIcon library="FontelloIcon" name="frame" color={AppColors.white} size={hp(2.6)} />
                <TouchableOpacity
                  onPress={() => navigation.navigate('DriverMapView')}
                  style={{marginLeft: hp(0.5), padding: hp(0.5), top: hp(-.4)}}>
                  <Text
                    style={[
                      AppStyles.whiteSubTitle,
                      {textDecorationLine: 'underline'},
                    ]}>
                    Mapview
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  AppStyles.row,
                  {width: '70%', justifyContent: 'flex-end'},
                ]}>
                {!accept ? (
                  <>
                    <AppButton
                      title="Decline"
                      style={styles.declineButton}
                      titleStyle={{color: AppColors.black}}
                      onPress={() => openSheet()}
                    />
                    <AppButton
                      title="Accept"
                      style={styles.acceptButton}
                      onPress={() => setAccept(true)}
                    />
                  </>
                ) : (
                  <AppButton
                    title="Start"
                    style={[styles.acceptButton, {width: '90%'}]}
                    onPress={() => navigation.navigate('DriverInspection')}
                  />
                )}
              </View>
            </View>
          )}
        </View>
        <Pressable
          onPress={() => setIsCollapsed(!isCollapsed)}
          style={[AppStyles.rowBetween, styles.detailIcon]}>
          <Text style={AppStyles.whiteSubTitle}>Details</Text>
          <GlobalIcon library="AntDesign" name="down" />
        </Pressable>
      </View>
      <Collapsible collapsed={!isCollapsed}>
        <View style={styles.collapseContainer}>
          <FlatList
            scrollEnabled={false}
            data={item?.trip_plan}
            renderItem={({item: trip}) => (
              <View
                style={[
                  AppStyles.row,
                  {marginVertical: hp(1.5), width: '100%'},
                ]}>
                <View style={styles.busContainer}>
                <GlobalIcon library="FontelloIcon" name="group-(1)" color={handleSetColor(trip?.status)} size={hp(4.5)} />
                  {/* <BusIcon color={handleSetColor(trip?.status)} /> */}
                  <Text
                    style={[
                      AppStyles.title,
                      {fontFamily: AppFonts.NunitoSansBold, marginTop: hp(-1.5)},
                    ]}>
                    {trip?.status}
                  </Text>
                </View>
                <View style={{marginLeft: hp(1), gap: 3, width: '70%'}}>
                  <Text
                    style={[
                      AppStyles.title,
                      {
                        fontSize: size.sl,
                      },
                    ]}>
                    {trip?.time} {trip?.date}
                  </Text>
                  <Text
                    style={[
                      AppStyles.title,
                      {
                        fontSize: size.md,
                      },
                    ]}>
                    {trip?.title}
                  </Text>
                  <Text
                    style={[
                      AppStyles.subTitle,
                      {
                        fontSize: fontSize(14),
                        color: AppColors.black,
                      },
                    ]}>
                    {trip?.location}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </Collapsible>

      {declined && (
        <View
          style={[
            AppStyles.alignJustifyCenter,
            AppStyles.widthHeightFullPercent,
            styles.declinedContainer,
          ]}>
          <AppButton
            title="DECLINED"
            style={[AppStyles.halfWidth, styles.button]}
            titleStyle={{color: AppColors.black}}
            onPress={() => setDeclined(false)}
          />
        </View>
      )}

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => closeSheet()}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View>
          <View style={styles.sheetTitleCont}>
            <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
              Reason for Decline
            </Text>
            <Text style={[AppStyles.whiteSubTitle, {color: AppColors.black}]}>
              You can only{' '}
              <Text style={{fontFamily: AppFonts.NunitoSansExtraBold}}>
                Decline 30 mins prior
              </Text>{' '}
              to the Trip time.
            </Text>
          </View>
          <AppInput
            placeholder="Reason"
            multiline={true}
            inputStyle={styles.inputStyle}
            container={styles.inputContainer}
          />
          <View style={[AppStyles.rowBetween, AppStyles.widthFullPercent]}>
            <AppButton
              title="Cancel"
              style={styles.cancelButton}
              titleStyle={{color: AppColors.textLightGrey}}
              onPress={() => closeSheet()}
            />
            <AppButton
              title="Submit"
              style={{width: '58%'}}
              onPress={() => {
                setDeclined(true);
                closeSheet();
              }}
            />
          </View>
        </View>
      </AppBottomSheet>
    </View>
  );
};

export default TripCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.charcoal,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  innerContainer: {paddingHorizontal: hp(2), paddingTop: hp(2)},
  tripHead: {
    backgroundColor: AppColors.white,
    paddingVertical: hp(0.5),
    paddingHorizontal: hp(3),
    borderRadius: 50,
  },
  bulletText: {
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: fontSize(14),
    color: AppColors.white,
    marginLeft: hp(1),
  },
  declineButton: {
    backgroundColor: AppColors.white,
    width: '45%',
    height: hp(4.5),
    borderRadius: 5,
  },
  acceptButton: {
    width: '45%',
    height: hp(4.5),
    marginLeft: hp(1),
    borderRadius: 5,
  },
  detailIcon: {
    backgroundColor: AppColors.black,
    marginTop: hp(2),
    paddingHorizontal: hp(2),
    paddingVertical: hp(1),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  collapseContainer: {
    backgroundColor: AppColors.white,
    marginTop: hp(-2),
    paddingHorizontal: hp(2),
    paddingVertical: hp(3),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B8B9BC',
  },
  busContainer: {
    backgroundColor: AppColors.screenColor,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(16),
    width: hp(12),
    borderRadius: 5,
    gap: 5,
  },
  declinedContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
    borderRadius: 10,
  },
  button: {
    backgroundColor: AppColors.transparent,
    borderColor: AppColors.black,
    borderWidth: 1,
    borderRadius: 50,
  },
  sheetTitleCont: {gap: 5, marginBottom: hp(2)},
  cancelButton: {width: '38%', backgroundColor: AppColors.screenColor},
  inputStyle: {
    height: hp(14),
  },
  inputContainer: {
    backgroundColor: AppColors.screenColor,
    borderWidth: 0,
    borderRadius: 5,
  },
});
