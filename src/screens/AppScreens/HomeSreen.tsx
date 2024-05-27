import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import AppBottomSheet from '../../components/AppBottomSheet';
import AppButton from '../../components/AppButton';
import AppCalender from '../../components/AppCalender';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppMapView from '../../components/AppMapView';
import GlobalIcon from '../../components/GlobalIcon';
import RouteSlider from '../../components/RouteSlider';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp, screenHeight, screenWidth} from '../../utils/constants';
import {leaveDropdownData} from '../../utils/DummyData';
import {size} from '../../utils/responsiveFonts';

export default function HomeSreen() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectAbsence, setSelectAbsence] = useState('');
  const [preview, setPreview] = useState(false);
  const [reasonOfAbsence, setReasonOfAbsence] = useState('');
  const [getDates, setGetDates] = useState([]);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const snapPoints = useMemo(
    () => [
      selectAbsence == 'All Week' ? '80%' : preview ? '55%' : '45%',
      '90%',
    ],
    [selectAbsence, preview],
  );
  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const handleSubmit = () => {
    if (reasonOfAbsence && getDates.length > 0 && !preview) {
      setPreview(true);
      setSelectAbsence('');
    }
    if (reasonOfAbsence && getDates.length > 0 && preview) {
      closeSheet();
      setGetDates([]);
      setPreview(false);
      setReasonOfAbsence('');
      setSelectAbsence('');
    }
  };

  return (
    <AppLayout style={styles.layoutContainer}>
      <View style={{height: screenHeight, width: screenWidth}}>
        <AppMapView />
      </View>
      <ImageBackground
        style={styles.headerImage}
        source={require('../../assets/images/rectangle.png')}>
        <AppHeader
          title="Mark Tommay"
          rightIcon={true}
          onPressLeftIcon={() => {
            navigation.navigate('Settings');
          }}
          onPressRightIcon={() => navigation.navigate('Notification')}
          containerStyle={{backgroundColor: '#141516'}}
        />
        <View style={[AppStyles.rowBetween, styles.headerBottomContainer]}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerSubTitle}>Bus No.</Text>
            <Text style={[AppStyles.subHeading, {color: AppColors.white}]}>
              B456788
            </Text>
          </View>
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require('../../assets/images/auth_background.png')}
            />
          </View>
          <View style={styles.headerTitle}>
            <Text style={styles.headerSubTitle}>Geofenced</Text>
            <Switch
              onValueChange={toggleSwitch}
              value={isEnabled}
              trackColor={{false: '#767577', true: AppColors.red}}
              thumbColor={isEnabled ? AppColors.white : '#f4f3f4'}
              style={{transform: [{scale: 1.3}]}}
            />
          </View>
        </View>
      </ImageBackground>

      {/* <View style={styles.container}>
        <View style={styles.bottomContainer}>
          <RouteSlider />
          <View style={[AppStyles.rowBetween, {marginTop: hp(3)}]}>
            <Pressable
              onPress={() => navigation.navigate('ChatScreen')}
              style={[AppStyles.rowCenter, styles.bottomButton]}>
              <GlobalIcon
                library="CustomIcon"
                name="Chat"
                color={AppColors.red}
              />
            </Pressable>
            <AppButton
              title="Report Student Absence"
              onPress={() => openSheet()}
              style={{backgroundColor: AppColors.lightBlack}}
            />
          </View>
        </View>
      </View> */}

      <View style={styles.bottomContainer}>
        <RouteSlider />
        <View style={[AppStyles.rowBetween, {marginTop: hp(3)}]}>
          <Pressable
            onPress={() => navigation.navigate('ChatScreen')}
            style={[AppStyles.rowCenter, styles.bottomButton]}>
            <GlobalIcon
              library="CustomIcon"
              name="Chat"
              color={AppColors.red}
            />
          </Pressable>
          <AppButton
            title="Report Student Absence"
            onPress={() => openSheet()}
            style={{backgroundColor: AppColors.lightBlack}}
          />
        </View>
      </View>

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => closeSheet()}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.7)'}]}
          />
        )}>
        <View>
          <AppInput
            containerStyle={{marginBottom: 0}}
            label="Child Absence"
            container={{display: 'none'}}
            labelStyle={{
              fontFamily: AppFonts.NunitoSansBold,
            }}
          />
          <SelectList
            search={false}
            setSelected={(val: string) => setSelectAbsence(val)}
            data={leaveDropdownData}
            save="value"
            placeholder="Select"
            boxStyles={styles.boxStyle}
            dropdownTextStyles={{color: AppColors.black}}
          />
          {preview && (
            <AppInput
              value={
                moment(getDates[0]).format('Do MMMM YYYY') +
                ' - ' +
                moment(getDates[1]).format('Do MMMM YYYY')
              }
            />
          )}
          {selectAbsence == 'All Week' && !preview && (
            <AppCalender setDates={setGetDates} />
          )}
          {!preview ? (
            <AppInput
              multiline
              numberOfLines={7}
              container={{height: hp(16), borderRadius: hp(0.5)}}
              label="Reason for Absence"
              placeholder="Descripton"
              value={reasonOfAbsence}
              onChangeText={(text: string) => setReasonOfAbsence(text)}
              labelStyle={{
                fontFamily: AppFonts.NunitoSansBold,
              }}
            />
          ) : (
            <>
              <Text style={styles.label}>Reason for Absence</Text>
              <View style={styles.reasonContainer}>
                <Text style={AppStyles.subHeading}>{reasonOfAbsence}</Text>
              </View>
            </>
          )}
          <View style={[AppStyles.rowBetween, {width: '100%'}]}>
            <AppButton
              title="Cancel"
              onPress={() => {
                closeSheet();
                setGetDates([]);
                setPreview(false);
                setReasonOfAbsence('');
                setSelectAbsence('');
              }}
              style={styles.cancelButton}
              titleStyle={{color: AppColors.textLightGrey}}
            />
            <AppButton
              title="Submit"
              onPress={() => handleSubmit()}
              style={styles.submitButton}
            />
          </View>
        </View>
      </AppBottomSheet>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 220,
    width: screenWidth,
    paddingTop: hp(4),
    position: 'absolute',
  },
  layoutContainer: {backgroundColor: 'rgba(16, 35, 53, 0)', paddingTop: 0},
  headerBottomContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: hp(2),
    height: hp(10),
    marginTop: hp(0),
    zIndex: 1,
  },
  imageContainer: {
    height: hp(14),
    width: hp(14),
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 0,
  },
  reactangleIcon: {
    height: 100,
    width: screenWidth,
    backgroundColor: 'rgba(16, 35, 53, 0)',
    position: 'absolute',
    top: 60,
    elevation: 0,
    opacity: 1,
  },
  headerTitle: {gap: hp(1), paddingTop: hp(1)},
  headerSubTitle: {
    fontFamily: AppFonts.NunitoSansLight,
    fontSize: size.sl,
    lineHeight: 20,
    color: AppColors.white,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: hp(10),
    position: 'absolute',
    top: 15,
  },
  bottomContainer: {
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
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
  boxStyle: {
    marginBottom: hp(1.6),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    borderColor: AppColors.black,
    height: hp(6),
    borderRadius: hp(0.5),
  },
  cancelButton: {width: '35%', backgroundColor: AppColors.lightGrey},
  submitButton: {width: '60%', backgroundColor: AppColors.black},
  label: {
    marginBottom: 5,
    color: AppColors.black,
    fontSize: size.md,
    alignSelf: 'flex-start',
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
  reasonContainer: {
    padding: hp(2),
    backgroundColor: '#dddde1',
    borderRadius: hp(1),
    marginBottom: hp(3),
  },
});
