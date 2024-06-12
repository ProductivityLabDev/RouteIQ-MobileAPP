import {setRole} from '../store/user/userSlices';

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
