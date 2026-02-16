import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalIcon from '../../components/GlobalIcon';
import {AppColors} from '../../utils/color';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {hp, wp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';
import DeleteIcon from '../../assets/svgs/DeleteIcon';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markAllRead,
  markNotificationRead,
} from '../../store/notifications/notificationsSlice';
import {ActivityIndicator} from 'react-native';

const Notifications = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.userSlices.role);
  const token = useAppSelector(state => state.userSlices.token);
  const notifications = useAppSelector(state => state.notificationsSlices.items);
  const listStatus = useAppSelector(state => state.notificationsSlices.listStatus);
  const unreadCount = useAppSelector(state => state.notificationsSlices.unreadCount);

  React.useEffect(() => {
    if (!isFocused) return;
    if (!token) return;
    dispatch(fetchMyNotifications({limit: 50, offset: 0}));
    dispatch(fetchUnreadCount({force: true}));
  }, [dispatch, isFocused, token]);

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString();
  };

  return (
    <AppLayout
      statusbackgroundColor={role == 'Driver' ? AppColors.red : AppColors.red}
      style={{
        backgroundColor:
          role == 'Driver' ? AppColors.driverScreen : AppColors.black,
      }}>
      {role == 'Driver' ? (
        <AppHeader
          role="Retail"
          title="Notification"
          enableBack={true}
          rightIcon={false}
          containerStyle={styles.driverHeader}
          titleStyle={styles.titleStyle}
          createRightIcon={
            <Menu>
              <MenuTrigger>
                <View style={styles.icon}>
                  <GlobalIcon
                    library="Entypo"
                    name="dots-three-vertical"
                    color={AppColors.white}
                    size={hp(3)}
                  />
                </View>
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={styles.menuOptions}>
                <MenuOption
                  onSelect={() => {
                    dispatch(markAllRead());
                    dispatch(fetchUnreadCount({force: true}));
                  }}>
                  <Text style={AppStyles.title}>Mark all as read</Text>
                </MenuOption>
                <MenuOption
                  style={{marginBottom: hp(2)}}
                  onSelect={() => console.log('Delete all (not supported)')}>
                  <Text style={AppStyles.title}>Delete all</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          }
        />
      ) : (
        <AppHeader
          role="Retail"
          title="Notification"
          enableBack={true}
          rightIcon={false}
          containerStyle={styles.driverHeader}
          titleStyle={styles.titleStyle}
          createRightIcon={
            <Menu>
              <MenuTrigger>
                <View style={styles.icon}>
                  <GlobalIcon
                    library="Entypo"
                    name="dots-three-vertical"
                    color={AppColors.white}
                    size={hp(3)}
                  />
                </View>
              </MenuTrigger>
              <MenuOptions optionsContainerStyle={styles.menuOptions}>
                <MenuOption
                  onSelect={() => {
                    dispatch(markAllRead());
                    dispatch(fetchUnreadCount({force: true}));
                  }}>
                  <Text style={AppStyles.title}>Mark all as read</Text>
                </MenuOption>
                <MenuOption
                  style={{marginBottom: hp(2)}}
                  onSelect={() => console.log('Delete all (not supported)')}>
                  <Text style={AppStyles.title}>Delete all</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          }
        />
      )}
      <View
        style={[
          AppStyles.body,
          {
            flex: 1,
            paddingHorizontal: 0,
            backgroundColor:
              role == 'Driver' || role== 'Retail' ? AppColors.profileBg : AppColors.white,
            paddingTop: hp(2),
            marginTop: hp(-2)
          },
        ]}>
        {listStatus === 'loading' ? (
          <View style={[styles.noNotifContainer, {flex: 1}]}>
            <ActivityIndicator color={AppColors.red} />
            <Text style={[styles.textWhenEmptyNotifs, {marginTop: hp(1)}]}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length > 0 ? (
          <FlatList
            contentContainerStyle={{padding: hp(0)}}
            data={notifications}
            keyExtractor={(item: any, idx: number) =>
              String(item?.NotificationId ?? idx)
            }
            renderItem={({item}: {item: any}) => {
              const isRead = Number(item?.IsRead) === 1 || item?.IsRead === true;
              return (
                <Pressable
                  onPress={() => {
                    const id = Number(item?.NotificationId);
                    if (Number.isFinite(id) && !isRead) {
                      dispatch(markNotificationRead(id));
                      dispatch(fetchUnreadCount({force: true}));
                    }
                  }}
                  style={[
                    styles.column,
                    {
                      backgroundColor: isRead ? AppColors.profileBg : AppColors.lightRed,
                    },
                  ]}>
                  {item?.Title ? (
                    <View style={AppStyles.rowBetween}>
                      <Text
                        style={[
                          styles.bigtext,
                          {
                            alignSelf: 'flex-start',
                            width: '90%',
                          },
                        ]}>
                        {item?.Title}
                      </Text>
                      <TouchableOpacity onPress={() => console.log('Delete not supported')}>
                        <DeleteIcon />
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <View style={styles.row2}>
                    <View
                      style={[
                        AppStyles.rowBetween,
                        AppStyles.widthFullPercent,
                        {
                          alignItems: 'flex-start',
                        },
                      ]}>
                      <Text style={[styles.text, {width: '90%'}]}>
                        {item?.Message}
                      </Text>
                      {!item?.Title ? (
                        <TouchableOpacity onPress={() => console.log('Delete not supported')}>
                          <DeleteIcon />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>

                  {String(item?.RelatedEntityType || '').toLowerCase() === 'chat' && (
                    <TouchableOpacity
                      onPress={() => role == 'Driver' ? navigation.navigate('DriverChats') : navigation.navigate('ChatScreen')}>
                      <Text style={[styles.replyText]}>{'Reply'}</Text>
                    </TouchableOpacity>
                  )}

                  <View style={{}}>
                    <Text
                      style={[
                        styles.text,
                        {color: AppColors.grey, alignSelf: 'flex-end'},
                      ]}>
                      {formatTime(item?.CreatedAt)}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        ) : (
          <View style={styles.noNotifContainer}>
            <View style={{top: hp(4)}}>
              <GlobalIcon
                library="FontelloIcon"
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
            {unreadCount > 0 ? (
              <Text style={[styles.textWhenEmptyNotifs, {color: AppColors.grey}]}>
                Unread: {unreadCount}
              </Text>
            ) : null}
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
    flex: 0.9, //need fix here
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(1),
  },
  icon: {padding: hp(1)},
  menuOptions: {
    marginTop: hp(2.5),
    marginLeft: hp(-2.4),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    paddingHorizontal: hp(1),
    paddingVertical: hp(1.5),
  },
  driverHeader: {
    width: '100%',
    height: hp(11),
    backgroundColor: AppColors.red,
    paddingHorizontal: hp(1),
    justifyContent: 'center',
    marginTop: hp(0),
  },
  titleStyle: {
    textAlign: 'center',
    fontSize: size.lg,
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansBold,
  },
});
