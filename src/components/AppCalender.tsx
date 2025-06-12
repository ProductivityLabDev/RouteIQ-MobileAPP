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
  const [multiSelectedDates, setMultiSelectedDates] = useState<any>({});


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

 const onMultidaysDayPress = (day: any) => {
  const red = AppColors.red;
  const date = day.dateString;

  const updatedDates = {...multiSelectedDates};

  if (updatedDates[date]) {
    // Deselect if already selected
    delete updatedDates[date];
  } else {
    // Select new day
    updatedDates[date] = {
      selected: true,
      color: red,
      textColor: 'white',
    };
  }

  setMultiSelectedDates(updatedDates);

  const selectedKeys = Object.keys(updatedDates);
  setDates && setDates(selectedKeys); // Pass selected dates to parent if needed
};

useEffect(() => {
  if (selectionDays === 'All Week' && startDate && endDate) {
    setDates([startDate, endDate]);
  } else if (selectionDays === 'Multi Days') {
    const selectedKeys = Object.keys(multiSelectedDates);
    setDates(selectedKeys);
  } else {
    setDates(selectedDate);
  }
}, [startDate, endDate, selectedDate, selectionDays, multiSelectedDates]);

  return (
    <>
      <Calendar
        style={styles.calendar}
        headerStyle={styles.headerStyle}
        current={Date()}
        minDate={today}
        maxDate={'2030-12-31'}
        onDayPress={
  selectionDays === 'All Week'
    ? onDayPress
    : selectionDays === 'Multi Days'
    ? onMultidaysDayPress
    : onOneDayPress
}
        markingType={'period'}
       markedDates={
  selectionDays === 'All Week'
    ? markedDates
    : selectionDays === 'Multi Days'
    ? multiSelectedDates
    : {
        [selectedDate]: {
          startingDay: true,
          endingDay: true,
          color: AppColors.red,
          textColor: 'white',
        },
      }
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
