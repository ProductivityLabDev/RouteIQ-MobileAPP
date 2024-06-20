import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from 'react-native';
import moment, { months } from 'moment';
import GlobalIcon from './GlobalIcon';
import { AppColors } from '../utils/color';
import { hp, wp } from '../utils/constants';
import AppStyles from '../styles/AppStyles';
import AppFonts from '../utils/appFonts';
import { fontSize, size } from '../utils/responsiveFonts';
import TripCard from './TripCard';
import { tripData } from '../utils/DummyData';
import { useAppDispatch } from '../store/hooks';
import { setDriverHomeStatus } from '../store/user/userSlices';
import { DriverShiftInfoProps } from '../types/types';

const DriverShiftInfo: React.FC<DriverShiftInfoProps> = ({ trackingDetails }) => {
    const dispatch = useAppDispatch();
    const [selectedDate, setSelectedDate] = useState(moment());

    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewPosition, setviewPosition] = useState(0);
    const _spacing = 10;

    const changeMonth = (direction: any) => {
        setSelectedDate(prev => moment(prev).add(direction, 'months'));

    };

    const renderHeader = () => {
        return (
            <View style={[AppStyles.row, styles.header]}>
                <TouchableOpacity onPress={() => { changeMonth(-1); handleScrollToNext() }}>
                    <GlobalIcon
                        library="FontAwesome5"
                        name="chevron-left"
                        color={AppColors.black}
                        size={hp(2.5)}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => dispatch(setDriverHomeStatus(false))}>
                    <Text style={styles.headerText}>{selectedDate.format('YYYY')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { changeMonth(1); handleScrollToNext() }}>
                    <GlobalIcon
                        library="FontAwesome5"
                        name="chevron-right"
                        color={AppColors.black}
                        size={hp(2.5)}
                    />
                </TouchableOpacity>
            </View>
        );
    };
    const ITEM_WIDTH = 100; // Width of each item

    const getItemLayout = (_, index) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
    });

    const handleScrollToNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < months.length) {
            flatListRef.current.scrollToIndex({
                index: nextIndex, animated: true, viewOffset: viewPosition === 0.5 || viewPosition === 1 ? 0 : _spacing,
                viewPosition,
            });
            setCurrentIndex(nextIndex);
        }
    };

    const renderMonthSwitcher = () => {
        const months = moment.monthsShort();
        return (
            <View style={AppStyles.rowBetween}>
                <FlatList

                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={currentIndex}
                    ref={flatListRef}
                    horizontal
                    getItemLayout={getItemLayout}
                    scrollEnabled
                    data={months}

                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedDate(moment().month(item))}
                                style={
                                    selectedDate.format('MMM') === item
                                        ? styles.selectedMonthView
                                        : {
                                            paddingVertical: hp(1),
                                            paddingHorizontal: hp(0.5),
                                            marginHorizontal: hp(1),
                                        }
                                }>
                                <Text
                                    style={[
                                        styles.monthText,
                                        selectedDate.format('MMM') === item
                                            ? styles.selectedMonthText
                                            : null,
                                    ]}>
                                    {item}
                                </Text>
                                <View
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor:
                                                selectedDate.format('MMM') === item
                                                    ? AppColors.red
                                                    : AppColors.white,
                                        },
                                    ]}></View>
                            </TouchableOpacity>
                        )
                    }}
                />
            </View>
        );
    };

    const renderDays = () => {
        const startOfWeek = selectedDate.clone().startOf('month');
        const monthss = [];
        const startOfMonth = selectedDate.clone().startOf('month');
        const daysInMonth = selectedDate.daysInMonth();


        for (let i = 0; i < daysInMonth; i++) {
            monthss.push(startOfMonth.clone().add(i, 'days'));
        }

        return monthss.map((day, index) => (
            <View
                style={[
                    AppStyles.row,
                    styles.dayContainer,
                    { backgroundColor: AppColors.white, justifyContent: 'flex-start', gap: wp(4) },
                ]}
                key={day.format('D')}>
                <View style={styles.dateContainer}>
                    <Text style={[styles.dayText, { color: AppColors.red }]}>{day.format('DD')}</Text>
                    <Text style={styles.dayName}>{day.format('MMM').toLocaleUpperCase()}</Text>
                </View>
                <View style={[AppStyles.rowBetween, styles.tasksContainer, { gap: wp(1) }]}>
                    {renderTaskBlocksForDay(day)}
                </View>
            </View>
        ));
    };

    const renderTaskBlocksForDay = (day: any) => {
        const tasks: any = getTasksForDay(day);
        const timeSlots = ['09:10 AM', '09:11 AM', '05 hrs', '04 hrs'];

        return timeSlots.map((timeSlot, index) => (
            <View key={index} style={[styles.timeSlotContainer, { gap: hp(0.7) }]}>
                {tasks[timeSlot] ? (
                    <View
                        style={[
                            // AppStyles.alignJustifyCenter,
                            // styles.taskBlock,
                            {},
                        ]}><Text style={[AppStyles.title, { fontSize: size.s, color: AppColors.black }]}>{tasks[timeSlot].task}</Text></View>
                ) : (
                    <View style={styles.emptyTaskBlock} />
                )}
                {/* <Text style={[AppStyles.title, { fontSize: size.s, color: AppColors.black }]}>{tasks[index]}</Text> */}
                <Text style={[AppStyles.title, { fontSize: size.s, fontFamily: AppFonts.NunitoSansRegular, textAlign: 'left', }]}>{timeSlot}</Text>
            </View>
        ));
    };

    const getTasksForDay = (day: string) => {
        return {
            '09:10 AM': { task: 'Check In', color: AppColors.red },
            '09:11 AM': { task: 'Check Out', color: AppColors.silverBlue },
            '05 hrs': { task: 'Work Time', color: AppColors.vividOrange },
            '04 hrs': { task: 'Short Time', color: AppColors.vividOrange }
        };
    };

    return (
        <View style={[styles.container, { flex: trackingDetails ? 1 : 0 }]}>
            {renderHeader()}
            {renderMonthSwitcher()}

            {trackingDetails === true &&
                <ScrollView
                    style={{
                        marginTop: hp(2),
                        // paddingTop: hp(2),
                        // backgroundColor: '#EDEFF3',
                        backgroundColor: AppColors.white,
                    }}>

                    <View style={styles.daysContainer}>
                        {renderDays()}
                        <View style={AppStyles.driverContainer}>
                            <TripCard item={tripData[0]} />
                        </View>
                    </View>
                </ScrollView>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: AppColors.white,
    },
    header: {
        alignSelf: 'center',
        marginBottom: 10,
        gap: 30,
    },
    headerText: {
        fontSize: size.lg,
        fontFamily: AppFonts.NunitoSansBold,
        color: AppColors.black,
    },
    monthText: {
        fontSize: size.md,
        padding: 5,
        color: AppColors.black,
        fontFamily: AppFonts.NunitoSansBold,
    },
    selectedMonthText: {
        color: AppColors.red,
    },
    selectedMonthView: {
        backgroundColor: AppColors.lightRed,
        paddingVertical: hp(1.5),
        paddingHorizontal: hp(0.8),
        borderRadius: 10,
        marginHorizontal: hp(1),
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeSlotsRow: {
        marginBottom: 10,
        paddingRight: hp(2),
    },
    timeSlotText: {
        fontSize: fontSize(14),
        color: AppColors.black,
        fontFamily: AppFonts.NunitoSansSemiBold,
    },
    daysContainer: {
        flexWrap: 'wrap',
    },
    dayContainer: {
        width: '100%',
        paddingVertical: hp(1),
        paddingHorizontal: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E2E9',
    },
    dateContainer: {
        borderRadius: 5,
        width: '12%',
        height: hp(6),
        elevation: 10,
        marginLeft: wp(1),
        // borderWidth:1,
        backgroundColor: AppColors.white,
        // borderColor: AppColors.black,
        alignItems: 'center',
    },
    dayText: {
        fontSize: size.lg,
        color: AppColors.black,
        fontFamily: AppFonts.NunitoSansSemiBold,
    },
    dayName: {
        fontSize: size.s,
        color: AppColors.black,
        fontFamily: AppFonts.NunitoSansSemiBold,
    },
    tasksContainer: {
        width: '80%',
    },
    timeSlotContainer: {
        alignItems: 'flex-start',
        width: '25%',
        paddingVertical: hp(2),
        // backgroundColor: AppColors.white
    },
    taskBlock: {
        width: '100%',
        height: hp(3),
    },
    taskText: {
        fontSize: size.xs,
        color: AppColors.white,
        fontFamily: AppFonts.NunitoSansSemiBold,
    },
    emptyTaskBlock: {
        width: '100%',
        height: hp(3),
        borderRadius: 5,
        backgroundColor: '#EDEFF3',
    },
    dot: {
        height: hp(1),
        width: hp(1),
        borderRadius: hp(1),
    },
});

export default DriverShiftInfo;
