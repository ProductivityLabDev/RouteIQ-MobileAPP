import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import AppHeader from '../../components/AppHeader';
import AppWeeklyCalendar from '../../components/AppWeeklyCalendar';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {fontSize} from '../../utils/responsiveFonts';

const DriverHomeScreen = () => {
  const [selectedScene, setSelectedScene] = useState(2);
  const dayScene = ['AM', 'PM', 'All'];

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: '#e6e3d8'}}>
      <AppHeader
        role="Driver"
        enableBack={false}
        rightIcon={true}
        switchIcon={true}
      />
      <View>
        <AppWeeklyCalendar />
        <ScrollView>
          <View style={AppStyles.driverContainer}>
            <View style={AppStyles.rowBetween}>
              <Text style={[AppStyles.title, {fontSize: fontSize(14)}]}>
                Morning route starts at 8:00am
              </Text>
              <View style={AppStyles.row}>
                {dayScene.map((item, index) => {
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
          </View>
        </ScrollView>
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
