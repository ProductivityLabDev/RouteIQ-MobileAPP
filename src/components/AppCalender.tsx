import React, {useEffect, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';

interface AppCalendarProps {
  setDates?: any;
  error?: string;
  selectionDays?: string;
}

const AppCalender: React.FC<AppCalendarProps> = ({
  setDates,
  error,
  selectionDays,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const today = new Date().toISOString().split('T')[0];

  const onDayPress = (day: any) => {
    const red = AppColors.red;
    if (!startDate || (startDate && endDate)) {
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          endingDay: true,
          color: red,
          textColor: 'white',
        },
      });
      setStartDate(day.dateString);
      setEndDate(null);
    } else {
      let marked = {} as any;
      let [start, end] = [startDate, day.dateString].sort();
      let current = new Date(start);
      let lastDate = new Date(end);

      while (current <= lastDate) {
        const key = current.toISOString().split('T')[0];
        if (key === start || key === end) {
          marked[key] = {
            color: red,
            textColor: 'white',
            startingDay: key === start,
            endingDay: key === end,
          };
        } else {
          marked[key] = {color: red, textColor: 'white'};
        }
        current.setDate(current.getDate() + 1);
      }
      setMarkedDates(marked);
      setEndDate(day.dateString);
    }
  };

  const onOneDayPress = (day: any) => {
    const red = AppColors.red;
    const newMarkedDates: any = {};

    if (selectedDate) {
      newMarkedDates[selectedDate] = {
        startingDay: false,
        endingDay: false,
        color: 'transparent',
      };
    }

    newMarkedDates[day.dateString] = {
      startingDay: true,
      endingDay: true,
      color: red,
      textColor: 'white',
    };

    setSelectedDate(day.dateString);
    setDates && setDates(day.dateString);
  };

  useEffect(() => {
    if (startDate && endDate && selectionDays == 'All Week') {
      setDates([startDate, endDate]);
    } else {
      setDates(selectedDate);
    }
  }, [startDate, endDate, selectedDate]);

  return (
    <>
      <Calendar
        style={styles.calendar}
        headerStyle={styles.headerStyle}
        current={Date()}
        minDate={today}
        maxDate={'2030-12-31'}
        onDayPress={selectionDays == 'All Week' ? onDayPress : onOneDayPress}
        markingType={'period'}
        markedDates={
          selectionDays != 'All Week'
            ? {
                [selectedDate]: {
                  startingDay: true,
                  endingDay: true,
                  color: AppColors.red,
                  textColor: 'white',
                },
              }
            : markedDates
        }
        hideExtraDays
        theme={{
          calendarBackground: 'white',
          textSectionTitleColor: '#fff',
          monthTextColor: '#fff',
          arrowColor: '#fff',
          textDayFontSize: 12,
          textMonthFontSize: 15,
          textDayHeaderFontSize: 12,
          weekVerticalMargin: 1,
          textDayStyle: {
            backgroundColor: 'red',
          },
          contentStyle: {
            backgroundColor: 'red',
          },
        }}
      />
      {error && <Text style={{color: AppColors.red}}>{error}</Text>}
    </>
  );
};

export default AppCalender;

const styles = StyleSheet.create({
  calendar: {
    margin: 0,
    marginBottom: hp(2),
  },
  headerStyle: {
    backgroundColor: AppColors.lightBlack,
    width: '100%',
  },
});
