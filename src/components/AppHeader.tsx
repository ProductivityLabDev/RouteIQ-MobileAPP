import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View, Platform, Alert, Linking, PermissionsAndroid} from 'react-native';
import NotificationIcon from '../assets/svgs/NotificationIcon';
import AppStyles from '../styles/AppStyles';
import {AppHeaderProps} from '../types/types';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';
import {size} from '../utils/responsiveFonts';
import GlobalIcon from './GlobalIcon';
import AppSwitchButton from './AppSwitchButton';
import SelectDropdown from 'react-native-select-dropdown';
import {childDropDown} from '../utils/DummyData';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {setSelectedChild} from '../store/user/userSlices';
import Geolocation from '@react-native-community/geolocation';
import {fetchUnreadCount} from '../store/notifications/notificationsSlice';

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  greetTitle,
  enableBack,
  rightIcon = true,
  bookmarkIcon = false,
  onPressLeftIcon,
  onPressRightIcon,
  titleStyle,
  containerStyle,
  role = 'Parents',
  switchIcon = false,
  backFunctionEnable = false,
  handleBack,
  profile_image,
  createRightIcon,
}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const parentStudents = useAppSelector(state => state.userSlices.parentStudents);
  const selectedChild = useAppSelector(state => state.userSlices.selectedChild);
  const token = useAppSelector(state => state.userSlices.token);
  const unreadCount = useAppSelector(
    state => (state as any).notificationsSlices?.unreadCount ?? 0,
  );
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  useEffect(() => {
    if (!token) return;
    // Keep this light; thunk has internal throttling.
    dispatch(fetchUnreadCount());
  }, [dispatch, token]);

  // Check location service before going online
  const checkLocationBeforeOnline = async (): Promise<boolean> => {
    // First check permission
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        
        if (!hasPermission) {
          Alert.alert(
            'Location Permission Required',
            'Location permission is required to go online. Please enable location permission.',
            [
              {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ],
          );
          return false;
        }
      } catch (err) {
        if (__DEV__) console.warn('Permission check error:', err);
        return false;
      }
    }

    // Check if location service is enabled (fast check)
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => {
          if (__DEV__) console.log('Location service is ON - allowing online');
          resolve(true);
        },
        error => {
          if (error.code === 2 || error.code === 3) {
            if (__DEV__) console.log('Location service is OFF - blocking online');
            Alert.alert(
              '⚠️ Location Service is OFF',
              'Location/GPS service is currently OFF. Please enable it to go online.',
              [
                {
                  text: 'Open Settings',
                  onPress: () => {
                    if (Platform.OS === 'android') {
                      Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
                        Linking.openSettings();
                      });
                    } else {
                      Linking.openSettings();
                    }
                  },
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ],
              {cancelable: false},
            );
            resolve(false);
          } else {
            if (__DEV__) console.log('Location check error (non-critical) - allowing online');
            resolve(true);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 2000, // Reduced timeout for faster check
          maximumAge: 0,
        },
      );
    });
  };

  const handleToggle = async (newValue: boolean): Promise<boolean> => {
    // If going offline, directly update state (no check needed)
    if (newValue === false) {
      setIsSwitchOn(false);
      return true; // Allow toggle
    }

    if (newValue === true && role === 'Driver') {
      if (__DEV__) console.log('Going online - checking location service...');
      const locationOk = await checkLocationBeforeOnline();
      if (!locationOk) {
        if (__DEV__) console.log('Location check failed - not allowing online, keeping offline state');
        return false;
      }
      if (__DEV__) console.log('Location check passed - setting online');
      setIsSwitchOn(true);
      return true; // Allow toggle
    }
    
    // For non-driver roles or other cases, update state normally
    setIsSwitchOn(newValue);
    return true; // Allow toggle
  };

  const dropdownData = useMemo(() => {
    if (Array.isArray(parentStudents) && parentStudents.length > 0) {
      return parentStudents.map((student: any) => {
        const name =
          student?.studentName ||
          student?.StudentName ||
          student?.name ||
          [student?.firstName, student?.lastName].filter(Boolean).join(' ') ||
          [student?.FirstName, student?.LastName].filter(Boolean).join(' ') ||
          'Student';
        const studentId =
          student?.studentId ??
          student?.StudentId ??
          student?.id ??
          student?.Id ??
          student?.studentID ??
          null;
        const image =
          student?.image
            ? typeof student.image === 'string'
              ? {uri: student.image}
              : student.image
            : childDropDown?.[0]?.image;
        return {title: name, image, studentId};
      });
    }
    return childDropDown;
  }, [parentStudents]);

  useEffect(() => {
    if (role !== 'ParentsDropDown') return;
    if (!dropdownData.length) return;
    if (selectedChild?.studentId ?? selectedChild?.StudentId ?? selectedChild?.id) {
      return;
    }
    // Only set from API list so selectedChild has StudentId etc.; never set dummy when we have no API data
    const hasApiStudents = Array.isArray(parentStudents) && parentStudents.length > 0;
    if (hasApiStudents) {
      dispatch(setSelectedChild(parentStudents[0]));
    } else {
      dispatch(setSelectedChild(dropdownData[0]));
    }
  }, [dispatch, dropdownData, role, selectedChild, parentStudents]);

  return (
    <>
      {role == 'Parents' && (
        <View style={[styles.mainContainer, containerStyle]}>
          {greetTitle && <Text style={styles.greetTitle}>{greetTitle}</Text>}
          <View style={AppStyles.rowBetween}>
            <View style={styles.iconContainer}>
              {!enableBack && (
                <Pressable
                  style={[styles.icon, {marginBottom: hp(-1)}]}
                  onPress={onPressLeftIcon}>
                  <GlobalIcon
                    library="FontelloIcon"
                    name="settings"
                    color={AppColors.white}
                    size={hp(3.5)}
                  />
                </Pressable>
              )}
              {enableBack && (
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="chevron-back"
                    color={AppColors.white}
                    size={hp(3)}
                  />
                </Pressable>
              )}
            </View>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            <View style={[styles.iconContainer, {alignItems: 'flex-end'}]}>
              {!bookmarkIcon && rightIcon && (
                <Pressable style={styles.icon} onPress={onPressRightIcon}>
                  <NotificationIcon />
                </Pressable>
              )}
              {!rightIcon && bookmarkIcon && (
                <Pressable style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="bookmarks"
                    color={AppColors.black}
                    size={hp(2.5)}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {role == 'ParentsDropDown' && (
        <View style={[styles.mainContainer, containerStyle]}>
          {greetTitle && <Text style={styles.greetTitle}>{greetTitle}</Text>}
          <View style={AppStyles.rowBetween}>
            <View style={styles.iconContainer}>
              {!enableBack && (
                <Pressable
                  style={[styles.icon, {marginBottom: hp(-1)}]}
                  onPress={onPressLeftIcon}>
                  <GlobalIcon
                    library="FontelloIcon"
                    name="settings"
                    color={AppColors.white}
                    size={hp(3.5)}
                  />
                </Pressable>
              )}
              {enableBack && (
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="chevron-back"
                    color={AppColors.white}
                    size={hp(3)}
                  />
                </Pressable>
              )}
            </View>
            <View>
              <SelectDropdown
                data={dropdownData}
                defaultValue={selectedChild?.title ? selectedChild : dropdownData[0]}
                onSelect={(selectedItem, index) => {
                  const sid = selectedItem?.studentId ?? selectedItem?.StudentId;
                  const found = Array.isArray(parentStudents)
                    ? parentStudents.find((s: any) =>
                        String(s?.StudentId ?? s?.studentId ?? s?.id ?? s?.Id ?? '') === String(sid ?? ''),
                      )
                    : null;
                  if (found) {
                    dispatch(setSelectedChild(found));
                    if (__DEV__) console.log('Selected child (API):', found);
                  } else {
                    dispatch(setSelectedChild(selectedItem));
                    if (__DEV__) console.log('Selected child (dropdown item):', selectedItem);
                  }
                }}
                renderButton={(selectedItem, isOpened) => {
                  return (
                    <View style={styles.dropdownButtonStyle}>
                      <Text
                        style={styles.dropdownButtonTxtStyle}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {(selectedItem && selectedItem.title) ||
                          'Select your child'}
                      </Text>
                      <GlobalIcon library="FontAwesome" name="caret-down" />
                    </View>
                  );
                }}
                renderItem={(item, index, isSelected) => {
                  return (
                    <View
                      style={{
                        ...styles.dropdownItemStyle,
                        ...(isSelected && {backgroundColor: '#D2D9DF'}),
                      }}>
                      <Image
                        style={styles.dropdownImage}
                        source={item.image || childDropDown?.[0]?.image}
                      />
                      <Text style={styles.dropdownItemTxtStyle}>
                        {item.title}
                      </Text>
                    </View>
                  );
                }}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
              />
            </View>
            <View style={[styles.iconContainer, {alignItems: 'flex-end'}]}>
              {!bookmarkIcon && rightIcon && (
                <Pressable style={styles.icon} onPress={onPressRightIcon}>
                  <NotificationIcon />
                </Pressable>
              )}
              {!rightIcon && bookmarkIcon && (
                <Pressable style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="bookmarks"
                    color={AppColors.black}
                    size={hp(2.5)}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {role == 'Driver' && (
        <View style={[styles.driverMainContainer, containerStyle]}>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(-2)}]}>
            <View style={styles.iconContainer}>
              {enableBack && (
                <Pressable
                  onPress={() =>
                    backFunctionEnable ? handleBack() : navigation.goBack()
                  }
                  style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="chevron-back"
                    color={AppColors.white}
                    size={hp(3)}
                  />
                </Pressable>
              )}
              {profile_image && (
                <Pressable onPress={() => navigation.navigate('DriverProfile')} style={styles.icon}>
                  <Image
                    style={{height: hp(5), width: hp(5), borderRadius: 50}}
                    source={require('../assets/images/profile_image.webp')}
                  />
                </Pressable>
              )}
            </View>
            <View style={{width: '70%'}}>
              {title && !switchIcon && (
                <Text style={[styles.driverTitle, titleStyle]}>{title}</Text>
              )}
              {switchIcon && (
                <AppSwitchButton
                  isOn={isSwitchOn}
                  onToggle={handleToggle}
                  offTitle="Offline"
                  switchBackgroundColor={
                    isSwitchOn ? AppColors.black : '#d3d2d5'
                  }
                  circleBackgroundColor={
                    isSwitchOn ? AppColors.white : '#9f9ca3'
                  }
                  titleColor={isSwitchOn ? AppColors.white : AppColors.black}
                />
              )}
            </View>
            <View style={[styles.iconContainer, {alignItems: 'flex-end'}]}>
              {!bookmarkIcon && rightIcon && (
                <Pressable
                  style={styles.icon}
                  onPress={() => navigation.navigate('Notification')}>
                  <View>
                    <NotificationIcon />
                    {Number(unreadCount) > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                          {unreadCount > 99 ? '99+' : String(unreadCount)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              )}
              {!rightIcon && bookmarkIcon && (
                <Pressable style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="bookmarks"
                    color={AppColors.black}
                    size={hp(2.5)}
                  />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}

      {role == 'Create' && (
        <View style={[styles.mainContainer, containerStyle]}>
          {greetTitle && <Text style={styles.greetTitle}>{greetTitle}</Text>}
          <View style={AppStyles.rowBetween}>
            <View style={styles.iconContainer}>
              {!enableBack && (
                <Pressable
                  style={[styles.icon, {marginBottom: hp(-1)}]}
                  onPress={onPressLeftIcon}>
                  <GlobalIcon
                    library="FontelloIcon"
                    name="settings"
                    color={AppColors.white}
                    size={hp(3.5)}
                  />
                </Pressable>
              )}
              {enableBack && (
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="chevron-back"
                    color={AppColors.white}
                    size={hp(3)}
                  />
                </Pressable>
              )}
            </View>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            <View style={[styles.iconContainer, {alignItems: 'flex-end'}]}>
              {createRightIcon}
            </View>
          </View>
        </View>
      )}

      

      {role == 'Retail' && (
        <View style={[styles.driverMainContainer, containerStyle]}>
          {greetTitle && <Text style={styles.greetTitle}>{greetTitle}</Text>}
          <View style={AppStyles.rowBetween}>
            <View style={styles.iconContainer}>
              {!enableBack && (
                <Pressable
                  style={[styles.icon, {marginBottom: hp(-1)}]}
                  onPress={onPressLeftIcon}>
                  <GlobalIcon
                    library="FontelloIcon"
                    name="settings"
                    color={AppColors.white}
                    size={hp(3.5)}
                  />
                </Pressable>
              )}
              {enableBack && (
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.icon}>
                  <GlobalIcon
                    library="Ionicons"
                    name="chevron-back"
                    color={AppColors.white}
                    size={hp(3)}
                  />
                </Pressable>
              )}
            </View>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
            <View style={[styles.iconContainer, {alignItems: 'flex-end'}]}>
              {createRightIcon}
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    marginTop: hp(2.1),
    marginBottom: hp(2.1),
    backgroundColor: AppColors.black,
    paddingHorizontal: hp(1),
  },
  title: {
    width: '70%',
    textAlign: 'center',
    fontSize: size.vxlg,
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansBold,
  },
  iconContainer: {width: '15%'},
  icon: {padding: hp(1)},
  greetTitle: {
    textAlign: 'center',
    fontSize: size.md,
    color: AppColors.black,
  },
  driverMainContainer: {
    width: '100%',
    height: hp(11),
    backgroundColor: AppColors.red,
    paddingHorizontal: hp(1),
    justifyContent: 'center',
  },
  driverTitle: {
    textAlign: 'center',
    fontSize: size.lg,
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansBold,
  },

  dropdownButtonStyle: {
    width: '100%',
    backgroundColor: '#141516',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: size.lg,
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: AppColors.white,
    textAlign: 'center',
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
    marginTop: hp(-2),
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownImage: {
    height: hp(4),
    width: hp(4),
    borderRadius: hp(4),
    marginRight: hp(1),
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: size.sl,
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C62828',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: AppColors.white,
  },
  unreadBadgeText: {
    color: AppColors.white,
    fontSize: 10,
    fontFamily: AppFonts.NunitoSansBold,
  },
});
