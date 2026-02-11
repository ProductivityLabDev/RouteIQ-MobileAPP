import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { AppColors } from '../utils/color'
import GlobalIcon from './GlobalIcon'
import { hp } from '../utils/constants'
import AppFonts from '../utils/appFonts'
import { size } from '../utils/responsiveFonts'
import { UploadDocProps } from '../types/types'

 const UploadDoc: React.FC<UploadDocProps> = ({
   title,
   containerStyle,
   textStyle,
   onPress,
   selectedFileName,
 }) => {
   const content = (
     <>
       <GlobalIcon library="FontelloIcon" name="group-(5)" color={AppColors.red} size={40} />
       <Text style={[styles.tapText, textStyle]}>
         {selectedFileName ? selectedFileName : title}
       </Text>
     </>
   );

   return (
     <View style={[styles.uploadDocBox, containerStyle]}>
       {onPress ? (
         <Pressable onPress={onPress} style={styles.pressable}>
           {content}
         </Pressable>
       ) : (
         content
       )}
     </View>
   );
 }

export default UploadDoc;

const styles = StyleSheet.create({
    uploadDocBox: {
        width: '100%',
        marginVertical: hp(3),
        marginTop: hp(2),
        height: hp(15),
        gap: hp(2.5),
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: AppColors.red,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.veryLightPink
    },

    tapText: {
        fontFamily: AppFonts.NunitoSansSemiBold,
        fontSize: size.s,
        color: AppColors.red,
        alignSelf: 'center',
    },
    pressable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});