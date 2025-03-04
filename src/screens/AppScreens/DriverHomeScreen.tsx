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
import {hp, wp} from '../../utils/constants';
import {fontSize, size} from '../../utils/responsiveFonts';
import TripCard from '../../components/TripCard';
import {tripData} from '../../utils/DummyData';
import {dayScene} from '../../utils/objects';
import DriverMonthlyCalendar from '../../components/DriverMonthlyCalendar';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import AppInput from '../../components/AppInput';
import {Controller, useForm} from 'react-hook-form';
import GlobalIcon from '../../components/GlobalIcon';
import AppFonts from '../../utils/appFonts';

const DriverHomeScreen = () => {
  const driverHomeStatus = useAppSelector(
    state => state.userSlices.driverHomeStatus,
  );
  const [selectedScene, setSelectedScene] = useState(2);
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.userSlices.role);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      search: '',
    },
  });

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}
      alarmIcon={false}>
      {role == 'Retail' ? (
        <AppHeader
          role="Driver"
          enableBack={false}
          rightIcon={true}
          switchIcon={false}
          title="Home"
        />
      ) : (
        <AppHeader
          role="Driver"
          enableBack={false}
          rightIcon={true}
          switchIcon={true}
        />
      )}

      <View style={{flex: 1}}>
        {driverHomeStatus ? (
          <DriverMonthlyCalendar />
        ) : (
          <>
            <AppWeeklyCalendar />
            
            <ScrollView>

            {role=='Retail' && (
              <View style={styles.setMargin}>
              <Controller
                name="search"
                control={control}
                render={({field: {onChange, value}}) => (
                  <AppInput
                    value={value}
                    placeholderTextColor={AppColors.inputGrey}
                    inputStyle={styles.inputStyle}
                    placeholder="Search"
                    container={styles.inputContainer}
                    onChangeText={text => onChange(text)}
                    containerStyle={{marginBottom: hp(0)}}
                    rightInnerIcon={
                      <GlobalIcon
                        size={20}
                        library="Fontisto"
                        color={AppColors.black}
                        name="search"
                      />
                    }
                  />
                )}
              />
              </View>
            )}
            
            {role=='Retail' && (
                <View style={styles.tripView}>
                <View style={styles.tripBg}>
                <Text style={styles.tripNumber}>89</Text>
                <Text style={styles.tripText}>Total Trip</Text>
                </View>
                <View style={styles.tripBg}>
                <Text style={styles.tripNumber}>08</Text>
                <Text style={styles.tripText}>Pending Trip</Text>
                </View>
               </View>
            )}
          
              <View style={AppStyles.driverContainer}>
                <View style={AppStyles.rowBetween}>
                  <Text style={[AppStyles.title, {fontSize: fontSize(14)}]}>
                    Morning route starts at 8 AM
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
  inputStyle: {
    height: hp(6),
    marginLeft: wp(2),
    fontSize: size.md,
  },
  inputContainer: {
    borderColor: '#cfcfcf',
    borderWidth: 1,
  },
  setMargin: {
    marginTop: hp(2),
    width: '95%',
    alignSelf:'center'
  },
  tripView:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    alignItems: 'center',
    textAlign:'center',
  },
  tripBg:{
    backgroundColor:AppColors.white,
    width: '40%',
    padding: 6,
    borderRadius: 10,
    marginTop: hp(2)
  },
  tripNumber:{
    color: AppColors.red,
    fontSize: 24,
    fontFamily: AppFonts.NunitoSansBold,
    textAlign: 'center'
  },
  tripText:{
    color: AppColors.red,
    fontSize: 16,
    fontFamily: AppFonts.NunitoSansBold,
    textAlign: 'center'
  }
});
