import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import GlobalIcon from './GlobalIcon';
import {AppColors} from '../utils/color';
import AppStyles from '../styles/AppStyles';
import {useNavigation} from '@react-navigation/native';
import {hp} from '../utils/constants';
import {size} from '../utils/responsiveFonts';
import AppFonts from '../utils/appFonts';
import NotificationIcon from '../assets/svgs/NotificationIcon';

interface AppHeaderProps {
  title?: string;
  greetTitle?: string;
  enableBack?: any;
  rightIcon?: boolean;
  bookmarkIcon?: boolean;
  onPressLeftIcon?: any;
  onPressRightIcon?: any;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
}

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
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.mainContainer, containerStyle]}>
      {greetTitle && <Text style={styles.greetTitle}>{greetTitle}</Text>}
      <View style={AppStyles.rowBetween}>
        <View style={styles.iconContainer}>
          {!enableBack && (
            <Pressable style={styles.icon} onPress={onPressLeftIcon}>
              <GlobalIcon
                library="CustomIcon"
                name="settings"
                color={AppColors.white}
                size={hp(3.5)}
              />
            </Pressable>
          )}
          {enableBack && (
            <Pressable onPress={() => navigation.goBack()} style={styles.icon}>
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
});
