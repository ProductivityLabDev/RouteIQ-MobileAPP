import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native'
import React, { useState } from 'react'
import Collapsible from 'react-native-collapsible'
import AppCheckBox from './AppCheckBox';
import { AppColors } from '../utils/color';
import { hp } from '../utils/constants';
import GlobalIcon from './GlobalIcon';
import AppStyles from '../styles/AppStyles';
import AppFonts from '../utils/appFonts';
import { size } from '../utils/responsiveFonts';
import { CleaningCollapsableCardProps } from '../types/types';

const CleaningCollapsableCard: React.FC<CleaningCollapsableCardProps> = ({
    item,
    checkedItemIds = [],
    onToggleItem,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    
    
    const RenderCheckBox = ({option}: any) => {
        const optionId = Number(option?.itemId);
        const isChecked = checkedItemIds.includes(optionId);
        return (
            <AppCheckBox
            isChecked={isChecked}
            onClick={() => onToggleItem?.(optionId)}
            rightText={String(option?.itemName ?? '')}
            style={{ marginBottom: hp(1) }}
            unCheckedImage={<View style={styles.checkContainer}></View>}
            checkedImage={
                <View style={styles.checkContainer}>
                    <GlobalIcon
                        library="Feather"
                        name="check"
                        color={AppColors.green}
                        size={hp(2)}
                    />
                </View>
            }
        />
        )
    }

    return (
        <>
            <Pressable onPress={() => setIsCollapsed(!isCollapsed)} style={[AppStyles.rowBetween, styles.container, isCollapsed && { borderRadius: 10 }]}>
                <Text style={styles.title}>{item.title}</Text>
                <GlobalIcon library='FontAwesome5' name={isCollapsed ? 'chevron-down' : 'chevron-up'} />
            </Pressable>
            <Collapsible collapsed={isCollapsed}>
                <View style={{ backgroundColor: AppColors.white, padding: hp(1.5) }}>
                    <FlatList
                        data={Array.isArray(item.options) ? item.options : []}
                        keyExtractor={(option: any, idx) => String(option?.itemId ?? idx)}
                        renderItem={({ item: option }) => <RenderCheckBox option={option} />}
                        contentContainerStyle={{ gap: hp(2) }}
                    />
                </View>
            </Collapsible>
        </>
    )
}

export default CleaningCollapsableCard

const styles = StyleSheet.create({
    container: { backgroundColor: AppColors.red, padding: hp(1.5), borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    checkContainer: {
        height: hp(2.5),
        width: hp(2.5),
        borderWidth: 2,
        borderColor: AppColors.grey,
        borderRadius: 5,
        backgroundColor: AppColors.profileBg,
    },
    title: {
        fontFamily: AppFonts.NunitoSansSemiBold,
        fontSize: size.xlg,
        color: AppColors.white,
    }
})