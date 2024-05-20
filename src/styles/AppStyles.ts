import {StyleSheet} from 'react-native';
import { hp, screenHeight, screenWidth } from '../utils/constants';

const AppStyles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: screenHeight,
  },
});

export default AppStyles;
