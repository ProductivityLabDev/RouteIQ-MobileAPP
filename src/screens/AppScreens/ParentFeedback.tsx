import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import AppModal from '../../components/AppModal';
import {useNavigation} from '@react-navigation/native';

const ParentFeedback = () => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const handleSubmit = () => {
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
      navigation.navigate('HomeSreen');
    }, 2000);
  };

  return (
    <AppLayout>
      <AppHeader enableBack={true} title="Parent Feedback" rightIcon={false} />
      <View style={[AppStyles.container, styles.container]}>
        <View>
          <AppInput label="Driver Name" placeholder="Driver Name" />
          <AppInput
            label="Reason"
            placeholder="Description"
            multiline={true}
            inputStyle={styles.inputStyle}
          />
        </View>
        <AppButton
          title="Submit"
          onPress={handleSubmit}
          style={styles.button}
        />
      </View>

      <AppModal visible={visible} setVisible={setVisible} />
    </AppLayout>
  );
};

export default ParentFeedback;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    paddingTop: hp(4),
    justifyContent: 'space-between',
    paddingBottom: hp(2),
  },
  inputStyle: {
    minHeight: hp(18),
    maxHeight: hp(20),
  },
  button: {backgroundColor: AppColors.black, width: '100%'},
});
