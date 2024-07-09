import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import NotificationIcon from '../assets/svgs/NotificationIcon';
import AppStyles from '../styles/AppStyles';
import {AppHeaderProps} from '../types/types';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';
import {size} from '../utils/responsiveFonts';
import GlobalIcon from './GlobalIcon';
import AppSwitchButton from './AppSwitchButton';

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
}) => {
  const navigation = useNavigation();
  const [isSwitchOn, setIsSwitchOn] = useState(true);

  const handleToggle = (newValue: boolean) => {
    setIsSwitchOn(newValue);
  };

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
                <Pressable style={styles.icon}>
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
});
