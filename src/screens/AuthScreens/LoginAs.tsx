import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import GlobalIcon from '../../components/GlobalIcon';
import AuthLayout from '../../layout/AuthLayout';
import AppStyles from '../../styles/AppStyles';
import AppButton from '../../components/AppButton';
import { hp, wp } from '../../utils/constants';
import { useNavigation } from '@react-navigation/native';

const LoginAs = () => {
  const navigation =  useNavigation();
  return (
    <AuthLayout>
      <View>
          <Image style={{alignSelf: 'center'}} source={require('../../assets/images/route_logo.png')} />
        <View style={[AppStyles.center, {marginTop: hp(3)}]}>
          <Text style={AppStyles.titleHead}>Log In As</Text>
          <View style={styles.setMargin}>
            <AppButton onPress={()=>navigation.navigate('Login')} title='Driver' leftIcon={<GlobalIcon library="CustomIcon" name="Group-1961" size={20} />} />
            <AppButton onPress={()=>navigation.navigate('Login')} title='Parent' leftIcon={<GlobalIcon library="CustomIcon" name="Group" size={20} />} />
          </View>
        </View>
      </View>
    </AuthLayout>
  );
};

export default LoginAs;

const styles = StyleSheet.create({
  setMargin: {
    marginTop: hp(3),
    gap: hp(1.2)
  }
});
