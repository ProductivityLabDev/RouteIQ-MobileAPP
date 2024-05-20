import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import GlobalIcon from '../../components/GlobalIcon';
import AuthLayout from '../../layout/AuthLayout';
import AppStyles from '../../styles/AppStyles';

const LoginAs = () => {
  return (
    <AuthLayout>
      <View>
        <View style={[AppStyles.rowBetween, {alignItems: 'flex-start'}]}>
          <GlobalIcon library="Feather" name="chevron-left" />
          <Image source={require('../../assets/images/route_logo.png')} />
          <View></View>
        </View>
        <View style={AppStyles.center}>
          <Text style={AppStyles.titleHead}>Log In As</Text>
        </View>
      </View>
    </AuthLayout>
  );
};

export default LoginAs;

const styles = StyleSheet.create({});
