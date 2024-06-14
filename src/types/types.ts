import {StyleProp, TextStyle, ViewStyle} from 'react-native';

export interface AuthLayoutProps {
  children?: any;
}

export interface AppLayoutProps {
  children?: any;
  style?: ViewStyle;
  statusbackgroundColor?: string;
  alarmIcon?: boolean;
}

export interface UpdateGuardianProfileProps {
  route: any;
}

export interface AppTabsViewProps {
  routes?: any;
  renderScene?: any;
}

export interface AppModalProps {
  visible?: boolean;
  setVisible?: any;
}

export interface RangeProps {
  onPress?: () => void;
}

export interface AppHeaderProps {
  title?: string;
  greetTitle?: string;
  enableBack?: any;
  rightIcon?: boolean;
  bookmarkIcon?: boolean;
  onPressLeftIcon?: any;
  onPressRightIcon?: any;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  role?: string;
  switchIcon?: boolean;
  backFunctionEnable?: boolean;
  handleBack?: any;
  profile_image?: boolean;
}

export interface AppButtonProps {
  title: any;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export interface AppDocProps {
  title: string;
}

export interface TripCardProps {
  item: any;
}

export interface AppIconProps {
  height?: number;
  width?: number;
  color?: string;
}

export interface AppSwitchButtonProps {
  isOn: boolean;
  onToggle: any;
  onTitle?: string;
  offTitle?: string;
  switchBackgroundStyle?: StyleProp<ViewStyle>;
  switchBackgroundColor?: string;
  outputRange?: any;
  circleStyle?: StyleProp<ViewStyle>;
}

export interface CleaningCardProps {
  mileage?: boolean;
}
