import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import GlobalIcon from '../../components/GlobalIcon';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';

export default function ChildProfile() {
  const navigation = useNavigation();
  const [selected, setSelected] = React.useState('');

  const data = [
    {key: '1', value: 'Mobiles', disabled: true},
    {key: '2', value: 'Appliances'},
    {key: '3', value: 'Cameras'},
    {key: '4', value: 'Computers', disabled: true},
    {key: '5', value: 'Vegetables'},
    {key: '6', value: 'Diary Products'},
    {key: '7', value: 'Drinks'},
  ];
  return (
    <AppLayout>
      <AppHeader title="Child Profile" enableBack={true} rightIcon={false} />
      <ScrollView
        scrollEnabled={true}
        contentContainerStyle={{
          paddingHorizontal: hp(2),
          backgroundColor: AppColors.screenColor,
          justifyContent: 'space-between',
        }}>
        <View>
          <View style={{position: 'relative'}}>
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={require('../../assets/images/auth_background.png')}
              />
            </View>
            <View style={styles.cameraIcon}>
              <GlobalIcon
                library="CustomIcon"
                name="Group-183"
                color={AppColors.black}
                size={hp(2.5)}
              />
            </View>
          </View>

          <AppInput
            containerStyle={styles.inputContainerStyle}
            label="Name"
            value="Jacob Jones"
            inputStyle={{color: AppColors.black}}
            editable={true}
          />
          <AppInput
            containerStyle={styles.inputContainerStyle}
            label="Emergency Contacts"
            value="+93123132325"
            inputStyle={{color: AppColors.black}}
            editable={true}
          />
          <AppInput
            containerStyle={styles.inputContainerStyle}
            multiline
            numberOfLines={7}
            container={{height: hp(16)}}
            label="Medical Details"
            placeholder="Descripton"
            inputStyle={{color: AppColors.black}}
            editable={true}
          />
          <AppInput
            containerStyle={styles.inputContainerStyle}
            multiline
            numberOfLines={7}
            container={{height: hp(16)}}
            label="Note"
            placeholder="Descripton"
          />
          <AppInput
            containerStyle={{marginBottom: 0}}
            label="Transportation Preference"
            container={{display: 'none'}}
          />
          <SelectList
            search={false}
            setSelected={(val: string) => setSelected(val)}
            data={data}
            save="value"
            placeholder="Select"
            boxStyles={styles.boxStyle}
          />
        </View>

        <AppButton
          onPress={() => navigation.navigate('HomeSreen')}
          title="Update"
          style={{
            alignSelf: 'center',
            width: '100%',
            backgroundColor: AppColors.black,
            marginBottom: hp(10),
          }}
        />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: AppColors.inputColor,
    padding: hp(1.5),
    borderRadius: hp(1.5),
    marginVertical: hp(1),
  },
  imageContainer: {
    height: hp(18),
    width: hp(18),
    borderRadius: hp(20),
    borderColor: AppColors.white,
    borderWidth: 2,
    alignSelf: 'center',
    marginVertical: hp(4),
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: hp(16),
  },
  cameraIcon: {
    padding: hp(1),
    borderWidth: 1,
    borderRadius: 20,
    position: 'absolute',
    top: 125,
    right: 120,
    backgroundColor: AppColors.white,
  },
  inputContainerStyle: {marginBottom: hp(1.4)},
  boxStyle: {
    marginBottom: hp(3),
    backgroundColor: AppColors.white,
    height: hp(7),
    alignItems: 'center',
    borderColor: AppColors.black,
  },
});
