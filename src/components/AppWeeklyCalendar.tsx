import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import moment from 'moment';
import GlobalIcon from './GlobalIcon';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';

const AppWeeklyCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(moment());

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
        <Text style={styles.monthText}>{currentWeek.format('MMMM YYYY')}</Text>
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
        {daysOfWeek.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            <Text style={styles.dateText}>{day.format('DD')}</Text>
            <Text style={styles.dayText}>{day.format('ddd')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: hp(1.5),
    paddingTop: hp(2),
    paddingBottom: hp(3),
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
    marginBottom: hp(2),
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
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.black,
  },
  dayText: {
    fontSize: 14,
    color: AppColors.black,
  },
});

export default AppWeeklyCalendar;
