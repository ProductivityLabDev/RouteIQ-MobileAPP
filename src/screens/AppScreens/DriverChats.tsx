import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, Modal, FlatList, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import { hp, wp } from '../../utils/constants';
import { AppColors } from '../../utils/color';
import { size } from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';
import {
  TabView,
  SceneMap,
  TabBar,
  NavigationState,
  Route,
  SceneRendererProps,
} from 'react-native-tab-view';
import { groups_data } from '../../utils/DummyData';
import VendorChat from '../../components/VendorChat';
import DriverAllChats from './DriverAllChats';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setChatTabIndex } from '../../store/driver/driverSlices';
import GroupChat from '../../components/GroupChat';
import GlobalIcon from '../../components/GlobalIcon';
import {
  fetchChatContacts,
  createConversation,
  setSelectedConversation,
  clearContacts,
  selectChatContacts,
  selectChatContactsStatus,
} from '../../store/chat/chatSlice';
import { setSelectedUserChatData } from '../../store/user/userSlices';
import type { ChatContact } from '../../store/chat/chatTypes';

export default function DriverChats() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const role = useAppSelector(state => state.userSlices.role);
  const chatTabIndex = useAppSelector(state => state.driverSlices.chatTabIndex);
  const selectedChatName = useAppSelector(
    state => (state.userSlices?.selectedUserChatData as any)?.name,
  );
  const selectedConversation = useAppSelector(
    state => state.chatSlices?.selectedConversation,
  );

  const [SchoolChattingScreen, setSchoolChattingScreen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [creatingConv, setCreatingConv] = useState(false);

  const contacts = useAppSelector(selectChatContacts);
  const contactsStatus = useAppSelector(selectChatContactsStatus);
  const contactsError = useAppSelector(state => state.chatSlices?.contactsError);

  useEffect(() => {
    if (showContactModal && role === 'Retail') {
      dispatch(clearContacts());
      dispatch(fetchChatContacts({ type: 'DRIVER' }));
      dispatch(fetchChatContacts({ type: 'VENDOR' }));
    }
  }, [showContactModal, role, dispatch]);

  const handleContactSelect = async (contact: ChatContact) => {
    if (creatingConv) return;
    setCreatingConv(true);
    try {
      if (contact.existingConversationId) {
        dispatch(setSelectedConversation({
          id: contact.existingConversationId,
          participants: [{ id: contact.id, name: contact.name, type: contact.participantType }],
        } as any));
        dispatch(setSelectedUserChatData({ name: contact.name || `ID ${contact.id}`, profile_image: contact.avatar ?? '' }));
        setShowContactModal(false);
        setSchoolChattingScreen(true);
      } else {
        const res = await dispatch(createConversation({
          type: 'DIRECT',
          participantId: contact.id,
          participantType: contact.participantType,
        })).unwrap();
        const convId = res?.conversationId ?? res?.id;
        if (convId) {
          dispatch(setSelectedConversation({ ...res, id: convId, participants: [{ id: contact.id, name: contact.name, type: contact.participantType }] }));
          dispatch(setSelectedUserChatData({ name: contact.name || `ID ${contact.id}`, profile_image: contact.avatar ?? '' }));
          setShowContactModal(false);
          setSchoolChattingScreen(true);
        } else {
          Alert.alert('Error', 'Failed to create conversation');
        }
      }
    } catch (error) {
      Alert.alert('Error', `Failed to start chat: ${error}`);
    } finally {
      setCreatingConv(false);
    }
  };

  // Get chat title from conversation or selected chat data
  const chatTitle = SchoolChattingScreen
    ? selectedConversation?.name?.trim() ||
      selectedChatName?.trim() ||
      (Array.isArray(selectedConversation?.participants) && selectedConversation.participants.length > 0
        ? selectedConversation.participants.map((p: any) => p.name || `ID ${p.id}`).join(', ')
        : 'Chat')
    : 'Chat';
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  

  useEffect(() => {
    setIndex(chatTabIndex);
  }, [chatTabIndex]);

  const filteredRoutes = useMemo(() => {
    if (role === 'Retail') {
      return [
        { key: 'first', title: 'Vendor' },
        { key: 'second', title: 'Driver' },
      ];
    }
    return [
      { key: 'first', title: 'Vendor' },
      { key: 'second', title: 'Guardian' },
      { key: 'third', title: 'School' },
      { key: 'fourth', title: 'Groups' }, 
    ];
  }, [role]);

  

  const FirstRoute = useMemo(
    () => () =>
      SchoolChattingScreen ? (
        <VendorChat />
      ) : (
        <DriverAllChats setSchoolChattingScreen={setSchoolChattingScreen} />
      ),
    [SchoolChattingScreen]
  );

  const SecondRoute = useMemo(
    () => () =>
      SchoolChattingScreen ? (
        <VendorChat />
      ) : (
        <DriverAllChats setSchoolChattingScreen={setSchoolChattingScreen} />
      ),
    [SchoolChattingScreen]
  );

  const ThirdRoute = useMemo(
    () => () =>
      SchoolChattingScreen ? (
        <VendorChat />
      ) : (
        <DriverAllChats setSchoolChattingScreen={setSchoolChattingScreen} />
      ),
    [SchoolChattingScreen]
  );


  const FourthRoute = useMemo(() => () => <GroupChat arrayData={groups_data} />, []);

  const handleTabChange = (newIndex: number) => {
    setIndex(newIndex);
    dispatch(setChatTabIndex(newIndex));
  };

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
    fourth: FourthRoute, 
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<Route> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: AppColors.red }}
      style={{
        paddingVertical: 0,
        backgroundColor: AppColors.white,
        height: hp(6),
        width: wp(100),
      }}
      labelStyle={styles.subTitle}
      activeColor={AppColors.red}
      inactiveColor="#666"
      renderLabel={({ route, focused }) => (
        <Text
          style={[
            styles.subTitle,
            {
              backgroundColor: 'transparent',
              fontFamily: AppFonts.NunitoSansBold,
              color: focused ? AppColors.red : AppColors.black,
            },
          ]}
        >
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{ backgroundColor: AppColors.veryLightGrey }}
    >
      <AppHeader
        role="Driver"
        title={chatTitle}
        backFunctionEnable={true}
        handleBack={() => {
          if (!SchoolChattingScreen) {
            dispatch(setChatTabIndex(0));
            navigation.goBack();
          } else {
            setSchoolChattingScreen(false);
          }
        }}
        enableBack={true}
        rightIcon={false}
      />

      <View style={styles.container}>
        <TabView
          style={{ width: '100%' }}
          navigationState={{ index, routes: filteredRoutes }}
          renderScene={renderScene}
          onIndexChange={handleTabChange}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />

        {role === 'Retail' && !SchoolChattingScreen && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowContactModal(true)}>
            <GlobalIcon
              library="MaterialCommunityIcons"
              name="message-plus"
              size={24}
              color={AppColors.white}
            />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start New Chat</Text>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <GlobalIcon library="MaterialIcons" name="close" size={24} color={AppColors.black} />
              </TouchableOpacity>
            </View>

            {contactsStatus === 'loading' ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AppColors.red} />
              </View>
            ) : contactsStatus === 'failed' ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Failed to load contacts</Text>
                <Text style={styles.errorText}>{contactsError || 'Unknown error'}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    dispatch(clearContacts());
                    dispatch(fetchChatContacts({ type: 'DRIVER' }));
                    dispatch(fetchChatContacts({ type: 'VENDOR' }));
                  }}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : contacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No contacts available</Text>
              </View>
            ) : (
              <FlatList
                data={contacts}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => handleContactSelect(item)}
                    disabled={creatingConv}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactInitial}>
                        {(item.name || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
                        <Text style={styles.contactName} numberOfLines={2}>{item.name || `ID ${item.id}`}</Text>
                        {item.participantType && (
                          <View style={[
                            styles.typeBadge,
                            item.participantType === 'DRIVER' && {backgroundColor: '#4CAF50'},
                            item.participantType === 'VENDOR' && {backgroundColor: '#FF9800'},
                          ]}>
                            <Text style={styles.typeBadgeText}>
                              {item.participantType === 'DRIVER' ? '🚗 Driver' :
                               item.participantType === 'VENDOR' ? '🚚 Vendor' : item.participantType}
                            </Text>
                          </View>
                        )}
                      </View>
                      {item.existingConversationId && (
                        <Text style={styles.existingLabel}>Already chatting</Text>
                      )}
                    </View>
                    {creatingConv && <ActivityIndicator size="small" color={AppColors.red} />}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
    fontSize: size.default,
  },
  subTitle: {
    backgroundColor: AppColors.yellow,
    padding: hp(0.5),
    borderRadius: hp(1),
    color: AppColors.black,
    fontSize: size.s,
    fontFamily: AppFonts.NunitoSansMedium,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
  },
  fab: {
    position: 'absolute',
    bottom: hp(3),
    right: hp(3),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.red,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: hp(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hp(2),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.inputColor,
  },
  modalTitle: {
    fontSize: size.lg,
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
  },
  loadingContainer: {padding: hp(4), alignItems: 'center'},
  emptyContainer: {padding: hp(4), alignItems: 'center'},
  emptyText: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: AppColors.black,
    marginBottom: hp(0.5),
  },
  errorText: {
    fontSize: size.s,
    fontFamily: AppFonts.NunitoSansMedium,
    color: AppColors.red,
    marginTop: hp(1),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: hp(2),
    backgroundColor: AppColors.red,
    paddingHorizontal: hp(3),
    paddingVertical: hp(1),
    borderRadius: 8,
  },
  retryText: {
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hp(2),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.inputColor,
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: AppColors.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hp(1.5),
  },
  contactInitial: {
    fontSize: size.lg,
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.white,
  },
  contactInfo: {flex: 1},
  contactName: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: AppColors.black,
    marginBottom: 2,
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: AppColors.gradientGrey,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.white,
  },
  existingLabel: {
    fontSize: size.xs,
    fontFamily: AppFonts.NunitoSansMedium,
    color: AppColors.gradientGrey,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
