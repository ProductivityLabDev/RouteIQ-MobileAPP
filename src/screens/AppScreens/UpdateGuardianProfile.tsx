import {useNavigation} from '@react-navigation/native';
import React from 'react';
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

const UpdateGuardianProfile: React.FC<UpdateGuardianProfileProps> = ({
  route,
}) => {
  const route_data = route?.params;
  const navigation = useNavigation();
  const [selected, setSelected] = React.useState('');

  return (
    <AppLayout>
      <AppHeader
        title={route_data?.title}
        enableBack={true}
        rightIcon={false}
      />
      <ScrollView
        scrollEnabled={true}
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
            value="Jacob Jones"
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
            inputStyles={{
              color: AppColors.black,
            }}
            boxStyles={styles.boxStyle}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Address"
            value="E301, 20 Cooper Square"
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="City"
            value="New York"
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="State"
            value="New York State"
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Zip Code"
            value="3132325"
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Phone"
            value="+93123132325"
            editable={true}
          />

          <AppInput
            containerStyle={styles.inputContainer}
            label="Email"
            value="jones234@gmail.com"
            editable={true}
          />
        </View>

        <AppButton
          onPress={() => navigation.navigate('HomeSreen')}
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
