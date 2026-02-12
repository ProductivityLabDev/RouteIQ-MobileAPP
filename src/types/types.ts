import React from 'react';
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

export interface RetailRequestQuote {
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
  createRightIcon?: React.ReactElement;
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
  loaderStyle?: StyleProp<ViewStyle>;
}

export interface AppDocProps {
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  showAttachment?: boolean;
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
  circleBackgroundColor?: string;
  titleColor?: string;
}

export interface CleaningCardProps {
  mileage?: boolean;
}

export interface UploadDocProps {
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  selectedFileName?: string | null;
}

export interface StudentCardProps {
  position?: string;
  item: any;
  index?: number;
  onAttendanceChange?: (
    studentId: number | string,
    status: 'present' | 'absent',
  ) => void;
}

export interface DriverShiftInfoProps {
  trackingDetails: Boolean;
  timeOff?: Boolean;
}

export interface FuelCardProps {
  glNumber: string;
  date: string;
  price: number;
  gallons: number;
  pricePerGallon: number;
  location: string;
}
export interface DriverHistoryInfoProps {
  trackingDetails: Boolean;
}

interface ChatItem {
  title: string;
  message: string;
  time: string;
}
export interface DriverAllChatsProps {
  arrayData?: ChatItem[];
  setSchoolChattingScreen?: (value: boolean) => void;
}

export interface EmergencyContactProps {
  item: any;
  index: number;
  onSave?: (id: number | string, body: { contactName: string; relationship: string; phoneNumber: string }) => void;
  onDelete?: (id: number | string) => void;
}

export interface CleaningCollapsableCardProps {
  item: any;
  checkedItemIds?: number[];
  onToggleItem?: (itemId: number) => void;
}