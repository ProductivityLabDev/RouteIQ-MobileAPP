import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import moment from 'moment';

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
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentWeek.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={nextWeek}>
          <Text style={styles.arrow}>›</Text>
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
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  arrow: {
    fontSize: 20,
    color: '#333',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#d32f2f',
  },
  dayText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AppWeeklyCalendar;
