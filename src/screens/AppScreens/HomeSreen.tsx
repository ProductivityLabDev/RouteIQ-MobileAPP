import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Image, Pressable, StyleSheet, Switch, Text, View} from 'react-native';
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
import {hp} from '../../utils/constants';
import {leaveDropdownData} from '../../utils/DummyData';
import {size} from '../../utils/responsiveFonts';

export default function HomeSreen() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectAbsence, setSelectAbsence] = useState('');
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const snapPoints = useMemo(
    () => [selectAbsence == 'All Week' ? '80%' : '45%', '90%'],
    [selectAbsence],
  );
  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

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
          <Text style={styles.headerSubTitle}>Bus No.</Text>
          <Text style={[AppStyles.subHeading, {color: AppColors.white}]}>B456788</Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require('../../assets/images/auth_background.png')}
          />
        </View>
        <View style={{gap: hp(1)}}>
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

      <View style={styles.container}>
        <AppMapView />
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
          {selectAbsence == 'All Week' && <AppCalender />}
          <AppInput
            multiline
            numberOfLines={7}
            container={{height: hp(16), borderRadius: hp(0.5)}}
            label="Reason for Absence"
            placeholder="Descripton"
            labelStyle={{
              fontFamily: AppFonts.NunitoSansBold,
            }}
          />
          <View style={[AppStyles.rowBetween, {width: '100%'}]}>
            <AppButton
              title="Cancel"
              onPress={() => closeSheet()}
              style={styles.cancelButton}
              titleStyle={{color: AppColors.textLightGrey}}
            />
            <AppButton title="Submit" style={styles.submitButton} />
          </View>
        </View>
      </AppBottomSheet>
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
  },
  bottomContainer: {
    zIndex: 1,
    position: 'absolute',
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
});
