import {ViewStyle} from 'react-native';

export interface AuthLayoutProps {
  children?: any;
}

export interface AppLayoutProps {
  children?: any;
  style?: ViewStyle;
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
