import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {UpdateGuardianProfileProps} from '../../types/types';
import {updateGuardianDropdown} from '../../utils/DummyData';
import AppFonts from '../../utils/appFonts';
import {size} from '../../utils/responsiveFonts';

const UpdateGuardianProfile: React.FC<UpdateGuardianProfileProps> = ({
  route,
}) => {
  const route_data = route?.params;
  const navigation = useNavigation();
  const [selected, setSelected] = React.useState('');
  const [name, setName] = useState('Jacob Jones');
  const [address, setAddress] = useState('E301, 20 Cooper Square');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('New York State');
  const [zipCode, setZipCode] = useState('3132325');
  const [phone, setPhone] = useState('+93123132325');
  const [email, setEmail] = useState('jones234@gmail.com');

  return (
    <AppLayout>
      <AppHeader
        title={route_data?.title}
        enableBack={true}
        rightIcon={false}
      />
      <ScrollView
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          AppStyles.body,
          {
            justifyContent: 'space-between',
          },
        ]}>
        <View style={styles.container}>
          <AppInput
            containerStyle={styles.inputContainer}
            label="Name"
            value={name}
            onChangeText={(text: string) => setName(text)}
            editable={true}
          />

          <AppInput
            containerStyle={{marginBottom: hp(0)}}
            label="Relation with Child"
            container={{display: 'none'}}
          />
          <SelectList
            search={false}
            setSelected={(val: string) => setSelected(val)}
            data={updateGuardianDropdown}
            save="value"
            placeholder="Select"
            boxStyles={styles.boxStyle}
            dropdownStyles={{
              backgroundColor: AppColors.white,
              borderColor: AppColors.black,
            }}
            dropdownTextStyles={{
              color: AppColors.black,
              fontSize: size.sl,
              fontFamily: AppFonts.NunitoSansSemiBold,
            }}
            inputStyles={{
              fontSize: size.sl,
              color: AppColors.black,
              fontFamily: AppFonts.NunitoSansSemiBold,
            }}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Address"
            value={address}
            onChangeText={(text: string) => setAddress(text)}
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="City"
            value={city}
            onChangeText={(text: string) => setCity(text)}
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="State"
            value={state}
            onChangeText={(text: string) => setState(text)}
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Zip Code"
            value={zipCode}
            onChangeText={(text: string) => setZipCode(text)}
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Phone"
            value={phone}
            onChangeText={(text: string) => setPhone(text)}
            editable={true}
            keyboardType="number-pad"
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Email"
            value={email}
            onChangeText={(text: string) => setEmail(text)}
            editable={true}
          />
        </View>

        <AppButton
          onPress={() => navigation.goBack()}
          title="Update"
          style={styles.button}
        />
      </ScrollView>
    </AppLayout>
  );
};

export default UpdateGuardianProfile;

const styles = StyleSheet.create({
  container: {marginTop: hp(3)},
  inputContainer: {
    marginBottom: hp(1.6),
  },
  button: {
    alignSelf: 'center',
    width: '100%',
    backgroundColor: AppColors.black,
    marginBottom: hp(8),
  },
  boxStyle: {
    marginBottom: hp(1.6),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    borderColor: AppColors.black,
  },
});
