import {View, StyleSheet, TouchableOpacity, Text, Modal, FlatList, ActivityIndicator} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import DriverAllChats from './DriverAllChats';
import VendorChat from '../../components/VendorChat';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  fetchChatContacts,
  createConversation,
  setSelectedConversation,
  selectChatContacts,
  selectChatContactsStatus,
} from '../../store/chat/chatSlice';
import type {ChatContact} from '../../store/chat/chatTypes';
import GlobalIcon from '../../components/GlobalIcon';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import AppFonts from '../../utils/appFonts';
import {size} from '../../utils/responsiveFonts';

const ChatScreen = () => {
  const [showThread, setShowThread] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [creatingConv, setCreatingConv] = useState(false);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const selectedChatName = useAppSelector(
    state => (state.userSlices?.selectedUserChatData as any)?.name,
  );
  const selectedConversation = useAppSelector(
    state => state.chatSlices?.selectedConversation,
  );
  const contacts = useAppSelector(selectChatContacts);
  const contactsStatus = useAppSelector(selectChatContactsStatus);

  useEffect(() => {
    if (showContactModal) {
      dispatch(fetchChatContacts());
    }
  }, [showContactModal, dispatch]);

  // Get chat title from conversation or selected chat data
  const chatTitle = showThread
    ? selectedConversation?.name?.trim() ||
      selectedChatName?.trim() ||
      (Array.isArray(selectedConversation?.participants) && selectedConversation.participants.length > 0
        ? selectedConversation.participants.map((p: any) => p.name || `ID ${p.id}`).join(', ')
        : 'Chat')
    : 'Chat';

  const handleContactSelect = async (contact: ChatContact) => {
    if (creatingConv) return;
    setCreatingConv(true);
    try {
      // Check if conversation already exists
      if (contact.existingConversationId) {
        dispatch(setSelectedConversation({ id: contact.existingConversationId } as any));
        setShowContactModal(false);
        setShowThread(true);
      } else {
        // Create new conversation
        const res = await dispatch(
          createConversation({
            type: 'DIRECT',
            participantId: contact.id,
            participantType: contact.participantType,
          }),
        ).unwrap();
        if (res?.id) {
          dispatch(setSelectedConversation(res));
          setShowContactModal(false);
          setShowThread(true);
        }
      }
    } finally {
      setCreatingConv(false);
    }
  };

  return (
    <AppLayout>
      <AppHeader
        enableBack={true}
        title={chatTitle}
        rightIcon={false}
        backFunctionEnable={true}
        handleBack={showThread ? () => setShowThread(false) : () => navigation.goBack()}
      />
      <View style={{flex: 1}}>
        {showThread ? (
          <VendorChat />
        ) : (
          <DriverAllChats setSchoolChattingScreen={setShowThread} />
        )}

        {/* Floating Action Button - New Chat */}
        {!showThread && (
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

      {/* Contact Selection Modal */}
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
                <GlobalIcon
                  library="MaterialIcons"
                  name="close"
                  size={24}
                  color={AppColors.black}
                />
              </TouchableOpacity>
            </View>

            {contactsStatus === 'loading' ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={AppColors.red} />
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
                      <Text style={styles.contactName}>{item.name || `ID ${item.id}`}</Text>
                      <Text style={styles.contactType}>{item.participantType || 'User'}</Text>
                    </View>
                    {item.existingConversationId && (
                      <Text style={styles.existingBadge}>Existing</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
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
    maxHeight: '80%',
    paddingBottom: hp(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hp(2),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGrey,
  },
  modalTitle: {
    fontSize: size.lg,
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
  },
  loadingContainer: {
    padding: hp(4),
    alignItems: 'center',
  },
  emptyContainer: {
    padding: hp(4),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansMedium,
    color: AppColors.gradientGrey,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: AppColors.black,
    marginBottom: 2,
  },
  contactType: {
    fontSize: size.s,
    fontFamily: AppFonts.NunitoSansMedium,
    color: AppColors.gradientGrey,
  },
  existingBadge: {
    fontSize: size.xs,
    fontFamily: AppFonts.NunitoSansMedium,
    color: AppColors.red,
    backgroundColor: AppColors.inputColor,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
