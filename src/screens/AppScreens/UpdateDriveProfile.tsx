import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import {useNavigation} from '@react-navigation/native';

const UpdateDriveProfile = () => {
  const navigation = useNavigation();
  const [fields, setFields] = useState({
    name: 'Mark Tommay',
    age: '32',
    email: 'marktommay@gmail.com',
    phoneNumber: '+1-424-271-8337',
    address: '802 E Frierson Ave, Tampa, FL 33603',
  });

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.white}}>
      <AppHeader
        role="Driver"
        title="Profile Info"
        enableBack={true}
        rightIcon={false}
      />
      <ScrollView contentContainerStyle={[AppStyles.driverContainer, AppStyles.flexBetween]}>
        <View>
          <View style={[AppStyles.rowBetween]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Name</Text>
            <AppInput
              value={fields.name}
              containerStyle={AppStyles.halfWidth}
              container={[styles.inputContainer, {height: 40}]}
              inputStyle={styles.inputStyle}
              onChangeText={text => {
                setFields({
                  ...fields,
                  name: text,
                });
              }}
            />
          </View>
          <View style={[AppStyles.rowBetween]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Age</Text>
            <AppInput
              value={fields.age}
              containerStyle={AppStyles.halfWidth}
              keyboardType="number-pad"
              container={[styles.inputContainer, {height: 40}]}
              inputStyle={styles.inputStyle}
              onChangeText={text => {
                setFields({
                  ...fields,
                  age: text,
                });
              }}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Email</Text>
            <AppInput
              value={fields.email}
              containerStyle={[AppStyles.halfWidth]}
              container={styles.inputContainer}
              inputStyle={styles.inputStyle}
              multiline={true}
              onChangeText={text => {
                setFields({
                  ...fields,
                  email: text,
                });
              }}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Phone Number
            </Text>
            <AppInput
              value={fields.phoneNumber}
              containerStyle={AppStyles.halfWidth}
              keyboardType="number-pad"
              container={[styles.inputContainer, {height: 40}]}
              inputStyle={styles.inputStyle}
              onChangeText={text => {
                setFields({
                  ...fields,
                  phoneNumber: text,
                });
              }}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Address</Text>
            <AppInput
              value={fields.address}
              containerStyle={[AppStyles.halfWidth]}
              container={styles.inputContainer}
              inputStyle={styles.inputStyle}
              multiline={true}
              onChangeText={text => {
                setFields({
                  ...fields,
                  address: text,
                });
              }}
            />
          </View>
        </View>
        <View>
          <AppButton
            title="Update"
            style={{width: '100%', alignSelf: 'center'}}
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default UpdateDriveProfile;

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.red,
    borderWidth: 1.5,
    marginBottom: hp(2),
  },
  buttonTitle: {
    color: AppColors.black,
  },
  inputContainer: {
    borderColor: AppColors.graySuit,
    borderWidth: 1,
    paddingHorizontal: 2,
    borderRadius: 5,
  },
  inputStyle: {color: AppColors.graySuit},
});
