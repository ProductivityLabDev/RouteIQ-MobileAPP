import {setRole} from '../store/user/userSlices';
import {AppColors} from './color';

export const handleSetRole = (role: string, navigation: any, dispatch: any) => {
  switch (role) {
    case 'Driver':
      dispatch(setRole('Driver'));
      navigation.navigate('Login');
      return;
    case 'Parents':
      dispatch(setRole('Parents'));
      navigation.navigate('Login');
      return;
  }
};

export const handleSetColor = (status: string) => {
  switch (status) {
    case 'Pre-Trip':
      return '#026634';
    case 'Spot':
      return '#FB8021';
    default:
      return AppColors.red;
  }
};
