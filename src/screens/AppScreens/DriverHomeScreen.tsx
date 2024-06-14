import React, {useState} from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppHeader from '../../components/AppHeader';
import AppWeeklyCalendar from '../../components/AppWeeklyCalendar';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {fontSize} from '../../utils/responsiveFonts';
import TripCard from '../../components/TripCard';
import {tripData} from '../../utils/DummyData';
import {dayScene} from '../../utils/objects';
import DriverMonthlyCalendar from '../../components/DriverMonthlyCalendar';
import {useAppSelector} from '../../store/hooks';

const DriverHomeScreen = () => {
  const driverHomeStatus = useAppSelector(
    state => state.userSlices.driverHomeStatus,
  );
  const [selectedScene, setSelectedScene] = useState(2);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}
      alarmIcon={true}>
      <AppHeader
        role="Driver"
        enableBack={false}
        rightIcon={true}
        switchIcon={true}
      />
      <View style={{flex: 1}}>
        {driverHomeStatus ? (
          <DriverMonthlyCalendar />
        ) : (
          <>
            <AppWeeklyCalendar />
            <ScrollView>
              <View style={AppStyles.driverContainer}>
                <View style={AppStyles.rowBetween}>
                  <Text style={[AppStyles.title, {fontSize: fontSize(14)}]}>
                    Morning route starts at 8:00am
                  </Text>
                  <View style={AppStyles.row}>
                    {dayScene?.map((item, index) => {
                      return (
                        <Pressable
                          onPress={() => setSelectedScene(index)}
                          key={index}
                          style={[
                            styles.daySceneContainer,
                            {
                              backgroundColor:
                                selectedScene == index
                                  ? AppColors.black
                                  : AppColors.white,
                              borderTopLeftRadius: index == 0 ? 5 : 0,
                              borderTopRightRadius: index == 2 ? 5 : 0,
                              borderBottomLeftRadius: index == 0 ? 5 : 0,
                              borderBottomRightRadius: index == 2 ? 5 : 0,
                            },
                          ]}>
                          <Text
                            style={[
                              AppStyles.title,
                              {
                                fontSize: fontSize(14),
                                color:
                                  selectedScene == index
                                    ? AppColors.white
                                    : AppColors.black,
                              },
                            ]}>
                            {item}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View style={{marginTop: hp(1)}}>
                  <FlatList
                    scrollEnabled={false}
                    data={tripData}
                    renderItem={({item}) => <TripCard item={item} />}
                    contentContainerStyle={{marginBottom: hp(10)}}
                  />
                </View>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </AppLayout>
  );
};

export default DriverHomeScreen;

const styles = StyleSheet.create({
  daySceneContainer: {
    paddingHorizontal: hp(1),
    paddingVertical: hp(0.8),
    borderColor: AppColors.graySuit,
    borderWidth: 0.5,
  },
});
