import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import moment from 'moment';
import GlobalIcon from './GlobalIcon';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';
import AppFonts from '../utils/appFonts';
import {fontSize, size} from '../utils/responsiveFonts';
import {useAppDispatch} from '../store/hooks';
import {setDriverHomeStatus} from '../store/user/userSlices';

const AppWeeklyCalendar = () => {
  const dispatch = useAppDispatch();
  const [currentWeek, setCurrentWeek] = useState(moment());
  const today = moment();

  const generateWeek = (date: any) => {
    const startOfWeek = date.startOf('week');
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(moment(startOfWeek).add(i, 'days'));
    }
    return days;
  };

  const nextWeek = () => {
    setCurrentWeek(currentWeek.clone().add(1, 'weeks'));
  };

  const previousWeek = () => {
    setCurrentWeek(currentWeek.clone().subtract(1, 'weeks'));
  };

  const daysOfWeek = generateWeek(currentWeek);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={previousWeek}>
          <GlobalIcon
            library="FontAwesome5"
            name="chevron-left"
            color={AppColors.black}
            size={hp(2.5)}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch(setDriverHomeStatus(true))}>
          <Text style={styles.monthText}>
            {currentWeek.format('MMMM YYYY')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={nextWeek}>
          <GlobalIcon
            library="FontAwesome5"
            name="chevron-right"
            color={AppColors.black}
            size={hp(2.5)}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.weekContainer}>
        {daysOfWeek.map((day, index) => {
          const isToday = day.isSame(today, 'day');
          return (
            <View
              key={index}
              style={[
                styles.dayContainer,
                isToday && styles.highlightedDayContainer,
              ]}>
              <Text
                style={[
                  styles.dateText,
                  {color: isToday ? AppColors.red : AppColors.black},
                ]}>
                {day.format('DD')}
              </Text>
              <Text
                style={[
                  styles.dayText,
                  {color: isToday ? AppColors.red : AppColors.black},
                ]}>
                {day.format('ddd')}
              </Text>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isToday ? AppColors.red : AppColors.white,
                  },
                ]}></View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: hp(1.5),
    paddingTop: hp(1),
    paddingBottom: hp(1.5),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  arrow: {
    fontSize: 20,
    color: '#333',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.black,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
    height: hp(10),
    gap: 4,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
  },
  dayText: {
    fontSize: fontSize(14),
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: AppColors.black,
  },
  dot: {
    height: hp(1),
    width: hp(1),
    borderRadius: hp(1),
  },
  highlightedDayContainer: {
    backgroundColor: AppColors.lightRed,
    borderRadius: 5,
  },
});

export default AppWeeklyCalendar;
