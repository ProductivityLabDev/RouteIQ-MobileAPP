import {StyleProp, TextStyle, ViewStyle} from 'react-native';

export interface AuthLayoutProps {
  children?: any;
}

export interface AppLayoutProps {
  children?: any;
  style?: ViewStyle;
  statusbackgroundColor?: string;
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
}

export interface AppButtonProps {
  title: string;
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
