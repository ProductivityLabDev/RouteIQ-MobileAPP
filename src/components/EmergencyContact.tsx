import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {hp} from '../utils/constants';
import {AppColors} from '../utils/color';
import AppStyles from '../styles/AppStyles';
import {size} from '../utils/responsiveFonts';
import AppFonts from '../utils/appFonts';
import GlobalIcon from './GlobalIcon';
import AppInput from './AppInput';
import {EmergencyContactProps} from '../types/types';
import {BlurView} from '@react-native-community/blur';

const getContactId = (item: any) =>
  item?.ContactId ?? item?.contactId ?? item?.id ?? item?.Id;
const getName = (item: any) =>
  item?.ContactName ?? item?.contactName ?? item?.name ?? '';
const getRelation = (item: any) =>
  item?.Relationship ?? item?.relationship ?? item?.relation ?? '';
const getPhone = (item: any) =>
  item?.PhoneNumber ?? item?.phoneNumber ?? item?.phone_number ?? '';

const EmergencyContact: React.FC<EmergencyContactProps> = ({
  item,
  index,
  onSave,
  onDelete,
}) => {
  const [editDetails, setEditDetails] = useState(false);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setName(getName(item));
    setRelation(getRelation(item));
    setPhone(getPhone(item));
  }, [item]);

  const contactId = getContactId(item);
  const handleSave = () => {
    if (onSave && contactId != null && name.trim() && relation.trim() && phone.trim()) {
      onSave(contactId, {
        contactName: name.trim(),
        relationship: relation.trim(),
        phoneNumber: phone.trim(),
      });
      setEditDetails(false);
    }
  };

  return (
    <Pressable
      onLongPress={() => {
        if (contactId != null) setShowDeleteOverlay(true);
      }}
      delayLongPress={350}
      onPress={() => {
        if (showDeleteOverlay) setShowDeleteOverlay(false);
      }}
      style={styles.container}>
      <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
        <Text
          style={[
            AppStyles.title,
            {fontSize: size.lg, fontFamily: AppFonts.NunitoSansBold},
          ]}>
          Emergency Contact {index + 1}:
        </Text>
        <View style={AppStyles.row}>
          {onDelete && editDetails && (
            <Pressable
              onPress={() => contactId != null && onDelete(contactId)}
              style={{marginRight: hp(1.5)}}>
              <GlobalIcon
                library="MaterialCommunityIcons"
                name="delete-outline"
                color={AppColors.red}
                size={22}
              />
            </Pressable>
          )}
          <Pressable
            onPress={() =>
              editDetails ? handleSave() : setEditDetails(!editDetails)
            }>
            {editDetails ? (
              <Text style={[AppStyles.title, {color: AppColors.red}]}>
                Save
              </Text>
            ) : (
              <GlobalIcon
                library="FontelloIcon"
                name={'frame-(3)'}
                color={AppColors.red}
              />
            )}
          </Pressable>
        </View>
      </View>
      <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
        <Text style={[AppStyles.title, AppStyles.halfWidth]}>Name</Text>
        {!editDetails ? (
          <Text style={[AppStyles.subTitle, AppStyles.halfWidth]} numberOfLines={1}>
            {name || '—'}
          </Text>
        ) : (
          <AppInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            containerStyle={AppStyles.halfWidth}
            container={[styles.inputContainer, {height: 40}]}
            inputStyle={styles.inputStyle}
          />
        )}
      </View>
      <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
        <Text style={[AppStyles.title, AppStyles.halfWidth]}>Relation</Text>
        {!editDetails ? (
          <Text style={[AppStyles.subTitle, AppStyles.halfWidth]} numberOfLines={1}>
            {relation || '—'}
          </Text>
        ) : (
          <AppInput
            value={relation}
            onChangeText={setRelation}
            placeholder="Relation"
            containerStyle={AppStyles.halfWidth}
            container={[styles.inputContainer, {height: 40}]}
            inputStyle={styles.inputStyle}
          />
        )}
      </View>
      <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
        <Text style={[AppStyles.title, AppStyles.halfWidth]}>Phone Number</Text>
        {!editDetails ? (
          <Text style={[AppStyles.subTitle, AppStyles.halfWidth]} numberOfLines={1}>
            {phone || '—'}
          </Text>
        ) : (
          <AppInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+923001234567"
            containerStyle={AppStyles.halfWidth}
            container={[styles.inputContainer, {height: 40}]}
            inputStyle={styles.inputStyle}
            keyboardType="phone-pad"
          />
        )}
      </View>
      {showDeleteOverlay && (
        <View style={styles.overlayWrap}>
          <BlurView
            style={StyleSheet.absoluteFillObject}
            blurType="light"
            blurAmount={6}
            reducedTransparencyFallbackColor="rgba(255,255,255,0.85)"
          />
          <View style={styles.overlayActions}>
            <Pressable
              style={styles.deleteBtn}
              onPress={() => {
                if (contactId != null && onDelete) onDelete(contactId);
                setShowDeleteOverlay(false);
              }}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setShowDeleteOverlay(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default EmergencyContact;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    paddingHorizontal: hp(2),
    paddingVertical: hp(2),
    marginBottom: hp(2),
    borderRadius: hp(1),
    overflow: 'hidden',
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
  overlayWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  overlayActions: {
    flexDirection: 'row',
    gap: hp(1.2),
  },
  deleteBtn: {
    backgroundColor: AppColors.red,
    paddingVertical: hp(1),
    paddingHorizontal: hp(2.2),
    borderRadius: hp(0.8),
  },
  deleteBtnText: {
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: size.default,
  },
  cancelBtn: {
    backgroundColor: AppColors.graySuit,
    paddingVertical: hp(1),
    paddingHorizontal: hp(2),
    borderRadius: hp(0.8),
  },
  cancelBtnText: {
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: size.default,
  },
});
