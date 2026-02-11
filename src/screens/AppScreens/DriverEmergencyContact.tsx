import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp, wp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import {useNavigation} from '@react-navigation/native';
import GlobalIcon from '../../components/GlobalIcon';
import {size} from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';
import AppInput from '../../components/AppInput';
import EmergencyContact from '../../components/EmergencyContact';
import UploadDoc from '../../components/UploadDoc';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  fetchEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../../store/driver/driverSlices';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

const DriverEmergencyContact = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const emergencyContacts = useAppSelector(
    state => state.driverSlices.emergencyContacts,
  );
  const listStatus = useAppSelector(
    state => state.driverSlices.emergencyContactsStatus,
  );
  const listError = useAppSelector(
    state => state.driverSlices.emergencyContactsError,
  );
  const mutateStatus = useAppSelector(
    state => state.driverSlices.emergencyContactMutateStatus,
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRelation, setAddRelation] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addAddress, setAddAddress] = useState('');

  useEffect(() => {
    dispatch(fetchEmergencyContacts());
  }, [dispatch]);

  const handleSaveContact = useCallback(
    (
      id: number | string,
      body: {
        contactName: string;
        relationship: string;
        phoneNumber: string;
      },
    ) => {
      dispatch(updateEmergencyContact({id, ...body}))
        .unwrap()
        .then(() => {
          showSuccessToast('Updated', 'Emergency contact updated');
          dispatch(fetchEmergencyContacts());
        })
        .catch((err: string) => {
          showErrorToast('Update failed', err || 'Could not update contact');
        });
    },
    [dispatch],
  );

  const handleDeleteContact = useCallback(
    (id: number | string) => {
      dispatch(deleteEmergencyContact(id))
        .unwrap()
        .then(() => {
          showSuccessToast('Deleted', 'Emergency contact removed');
        })
        .catch((err: string) => {
          showErrorToast('Delete failed', err || 'Could not delete contact');
        });
    },
    [dispatch],
  );

  const handleAddNew = useCallback(() => {
    if (!addName.trim() || !addRelation.trim() || !addPhone.trim()) {
      showErrorToast('Required', 'Name, Relation and Phone are required');
      return;
    }
    dispatch(
      addEmergencyContact({
        contactName: addName.trim(),
        relationship: addRelation.trim(),
        phoneNumber: addPhone.trim(),
        email: addEmail.trim() ? addEmail.trim() : null,
        address: addAddress.trim() ? addAddress.trim() : null,
      }),
    )
      .unwrap()
      .then(() => {
        showSuccessToast('Added', 'Emergency contact added');
        setAddName('');
        setAddRelation('');
        setAddPhone('');
        setAddEmail('');
        setAddAddress('');
        setShowAddForm(false);
        dispatch(fetchEmergencyContacts());
      })
      .catch((err: string) => {
        if (__DEV__) {
          console.warn('❌ handleAddNew error:', err);
          console.log('🧾 Add payload was:', {
            contactName: addName.trim(),
            relationship: addRelation.trim(),
            phoneNumber: addPhone.trim(),
            email: addEmail.trim() ? addEmail.trim() : null,
            address: addAddress.trim() ? addAddress.trim() : null,
          });
        }
        showErrorToast('Add failed', err || 'Could not add contact');
      });
  }, [dispatch, addName, addRelation, addPhone, addEmail, addAddress]);

  const renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => (
      <EmergencyContact
        item={item}
        index={index}
        onSave={handleSaveContact}
        onDelete={handleDeleteContact}
      />
    ),
    [handleSaveContact, handleDeleteContact],
  );

  const list = Array.isArray(emergencyContacts) ? emergencyContacts : [];

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.white}}>
      <AppHeader
        role="Driver"
        title="Emrgency Contact"
        enableBack={true}
        rightIcon={false}
      />
      <ScrollView
        style={[
          AppStyles.driverContainer,
          AppStyles.flex,
          {backgroundColor: AppColors.profileBg, paddingHorizontal: 0},
        ]}
        showsVerticalScrollIndicator={false}>
        {listStatus === 'loading' && list.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={AppColors.red} />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : listError ? (
          <View style={styles.loadingBox}>
            <Text style={styles.errorText}>{listError}</Text>
            <AppButton
              title="Retry"
              onPress={() => dispatch(fetchEmergencyContacts())}
              style={{marginTop: hp(2)}}
            />
          </View>
        ) : list.length === 0 ? (
          <View style={styles.loadingBox}>
            <Text style={styles.emptyText}>No emergency contacts yet.</Text>
            <Text style={styles.emptySubtext}>Tap "Add New" below to add one.</Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={list}
            keyExtractor={item =>
              String(
                item?.ContactId ?? item?.contactId ?? item?.id ?? item?.Id ?? Math.random(),
              )
            }
            renderItem={renderItem}
          />
        )}

        <Pressable
          onPress={() => setShowAddForm(true)}
          style={styles.addNewWrap}>
          <UploadDoc
            title="Add New"
            containerStyle={styles.addNewBox}
            textStyle={{fontSize: size.default, marginTop: hp(-3)}}
          />
        </Pressable>
      </ScrollView>

      <Modal
        visible={showAddForm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddForm(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddForm(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            <AppInput
              value={addName}
              onChangeText={setAddName}
              placeholder="Name"
              containerStyle={styles.modalInput}
              inputStyle={styles.inputStyle}
            />
            <AppInput
              value={addRelation}
              onChangeText={setAddRelation}
              placeholder="Relation"
              containerStyle={styles.modalInput}
              inputStyle={styles.inputStyle}
            />
            <AppInput
              value={addPhone}
              onChangeText={setAddPhone}
              placeholder="+923001234567"
              keyboardType="phone-pad"
              containerStyle={styles.modalInput}
              inputStyle={styles.inputStyle}
            />
            <AppInput
              value={addEmail}
              onChangeText={setAddEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.modalInput}
              inputStyle={styles.inputStyle}
            />
            <AppInput
              value={addAddress}
              onChangeText={setAddAddress}
              placeholder="Address"
              containerStyle={styles.modalInput}
              inputStyle={styles.inputStyle}
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                onPress={() => setShowAddForm(false)}
                style={[styles.modalBtn, {backgroundColor: AppColors.graySuit}]}
                titleStyle={{color: AppColors.white}}
              />
              <AppButton
                title={mutateStatus === 'loading' ? 'Adding...' : 'Save'}
                onPress={handleAddNew}
                style={styles.modalBtn}
                disabled={mutateStatus === 'loading'}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppLayout>
  );
};

export default DriverEmergencyContact;

const styles = StyleSheet.create({
  loadingBox: {
    padding: hp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: size.md,
    color: AppColors.textLightGrey,
    marginTop: hp(1),
  },
  errorText: {
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: size.md,
    color: AppColors.red,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.md,
    color: AppColors.black,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: size.sl,
    color: AppColors.textLightGrey,
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  addNewWrap: {
    marginHorizontal: hp(2),
    alignSelf: 'center',
    width: '80%',
  },
  addNewBox: {
    marginHorizontal: hp(2),
    alignSelf: 'center',
    width: '100%',
    borderRadius: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: hp(3),
  },
  modalCard: {
    backgroundColor: AppColors.white,
    borderRadius: hp(2),
    padding: hp(3),
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: size.lg,
    color: AppColors.black,
    marginBottom: hp(2),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: AppColors.graySuit,
    borderRadius: 5,
    marginBottom: hp(1.5),
  },
  inputStyle: {color: AppColors.black},
  modalActions: {
    flexDirection: 'row',
    gap: hp(2),
    marginTop: hp(2),
  },
  modalBtn: {
    flex: 1,
  },
});
