import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import GlobalIcon from './GlobalIcon';
import {size} from '../utils/responsiveFonts';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {hp, wp} from '../utils/constants';
import {AppDocProps} from '../types/types';

const AppDoc: React.FC<AppDocProps> = ({
  title,
  containerStyle,
  onPress,
  showAttachment = true,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.docName, {fontSize: size.sl}]}>{title}</Text>
      {showAttachment && (
        <Pressable
          onPress={onPress}
          hitSlop={10}
          style={{transform: [{rotate: '-50deg'}]}}>
          <GlobalIcon
            library="MaterialIcons"
            name={'attachment'}
            color={AppColors.black}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    elevation: 10,
    justifyContent: 'space-between',
    width: '90%',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: AppColors.white,
  },
  docName: {
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: size.default,
    lineHeight: 20,
    color: AppColors.black,
  },
});

export default AppDoc;