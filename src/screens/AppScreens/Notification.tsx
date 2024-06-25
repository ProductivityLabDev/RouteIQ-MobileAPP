import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import GlobalIcon from '../../components/GlobalIcon';
import {AppColors} from '../../utils/color';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {useAppSelector} from '../../store/hooks';
import AppStyles from '../../styles/AppStyles';
import {NotificationData} from '../../utils/DummyData';
import AppFonts from '../../utils/appFonts';
import {hp, wp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';

const Notifications = () => {
  const role = useAppSelector(state => state.userSlices.role);
  const [selected, setSelected] = React.useState<Array<number | string>>([3]);

  return (
    <AppLayout
      statusbackgroundColor={role == 'Driver' ? AppColors.red : AppColors.black}
      style={{
        backgroundColor:
          role == 'Driver' ? AppColors.driverScreen : AppColors.black,
      }}>
      {role == 'Driver' ? (
        <AppHeader
          role="Driver"
          title="Notification"
          enableBack={true}
          rightIcon={false}
        />
      ) : (
        <AppHeader enableBack={true} rightIcon={false} title={`Notification`} />
      )}
      <View
        style={[
          AppStyles.body,
          {
            flex: 1,
            paddingHorizontal: 0,
            backgroundColor:
              role == 'Driver' ? AppColors.driverScreen : AppColors.white,
            paddingTop: hp(2),
          },
        ]}>
        {NotificationData.length <= 0 ? (
          <FlatList
            contentContainerStyle={{padding: hp(0)}}
            data={NotificationData}
            renderItem={({item}: {item: any}) => {
              return (
                <TouchableOpacity
                  onPress={() => {}}
                  style={[
                    styles.column,
                    {
                      backgroundColor: selected.includes(item.id)
                        ? AppColors.lightRed
                        : AppColors.white,
                    },
                  ]}>
                  {item.from !== undefined && (
                    <Text style={[styles.bigtext, {alignSelf: 'flex-start'}]}>
                      {item?.from}
                    </Text>
                  )}

                  <View style={styles.row2}>
                    <View>
                      <Text style={[styles.text, {marginRight: wp(20)}]}>
                        {item.title}
                      </Text>
                    </View>
                  </View>

                  {item.new === true && (
                    <Text style={[styles.replyText]}>{'Reply'}</Text>
                  )}

                  <View style={{}}>
                    <Text
                      style={[
                        styles.text,
                        {color: AppColors.grey, alignSelf: 'flex-end'},
                      ]}>
                      {item.timeWhenArrived}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <View style={styles.noNotifContainer}>
            <View>
            <GlobalIcon
              library="CustomIcon"
              name="checkmark-1"
              color={role == 'Driver' ? AppColors.red : AppColors.black}
              size={80}
              />
              </View>
            <Text
              style={[
                styles.textWhenEmptyNotifs,
                {fontFamily: AppFonts.NunitoSansBold},
              ]}>
              All Caught Up
            </Text>
            <Text
              style={[
                styles.textWhenEmptyNotifs,
                {color: AppColors.black, fontFamily: AppFonts.NunitoSansMedium},
              ]}>
              No new notifications yet for you
            </Text>
          </View>
        )}
      </View>
    </AppLayout>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  column: {
    paddingHorizontal: wp(3.5),
    borderRadius: 0,
    padding: hp(2),
    backgroundColor: AppColors.lightRed,
    paddingVertical: hp(2),
    gap: hp(0.5),
  },
  row2: {
    padding: hp(0),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: AppColors.black,
  },

  column2: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  text: {
    fontSize: size.sl,
    color: AppColors.black,
    fontFamily: AppFonts.NunitoSansMedium,
    // width: wp(90),
    textAlign: 'left',
    verticalAlign: 'top',
    lineHeight: 20,
  },
  bigtext: {
    fontSize: size.md,
    color: AppColors.black,
    fontFamily: AppFonts.NunitoSansSemiBold,
    // width: wp(90),
    textAlign: 'left',
    verticalAlign: 'top',
    lineHeight: 20,
  },

  replyText: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansSemiBold,
    textAlign: 'left',
    verticalAlign: 'top',
    lineHeight: 20,
    alignSelf: 'flex-start',
    color: AppColors.red,
    marginTop: hp(0.5),
  },
  smallCircle: {
    // borderRadius: 100,
    // width: 7,
    // height:7,
    // backgroundColor: AppColors.red
    // alignSelf: 'center'
    // justifyContent: 'flex-end',
    // alignItems: 'center',
    // borderWidth: 1,
    // borderColor: AppColors.blue
  },

  textWhenEmptyNotifs: {
    fontSize: 14,
    color: AppColors.black,
    fontFamily: AppFonts.NunitoSansRegular,
  },

  noNotifContainer: {
    flex: 1, //need fix here
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(1),
  },
});



