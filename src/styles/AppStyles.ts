import {StyleSheet} from 'react-native';
import {hp, screenHeight, screenWidth} from '../utils/constants';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {size} from '../utils/responsiveFonts';

const AppStyles = StyleSheet.create({
  body: {
    paddingHorizontal: hp(2),
    backgroundColor: AppColors.screenColor,
  },
  container: {
    flex: 1,
    paddingHorizontal: hp(2),
  },
  driverContainer: {
    flex: 1,
    paddingVertical: hp(2),
    paddingHorizontal: hp(2),
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  flexBetween: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
  },
  alignJustifyCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  widthFullPercent: {
    width: '100%',
  },
  screenWidthHeight: {
    width: screenWidth,
    height: screenHeight - hp(6),
  },
  titleHead: {
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: size.xxvlg,
    color: AppColors.black,
  },
  subHeading: {
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: size.md,
    color: AppColors.black,
  },
  title: {
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.md,
    color: AppColors.black,
  },
  subTitle: {
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: size.md,
    color: AppColors.taupeGray,
  },
  halfWidth: {
    width: '50%'
  }
});

export default AppStyles;
