import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect} from 'react';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {size} from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';
import {FlatList} from 'react-native-gesture-handler';
import GlobalIcon from '../../components/GlobalIcon';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {hp} from '../../utils/constants';
import AppInput from '../../components/AppInput';
import {DriverAllChatsProps} from '../../types/types';
import {
  fetchConversations,
  setSelectedConversation,
  selectConversations,
  selectConversationsStatus,
} from '../../store/chat/chatSlice';
import {setSelectedUserChatData} from '../../store/user/userSlices';
import type {ChatConversation} from '../../store/chat/chatTypes';

function formatChatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getConversationTitle(conv: ChatConversation): string {
  // 1. Try conversation name
  if (conv.name && String(conv.name).trim()) return String(conv.name).trim();

  // 2. Try participant (singular) - backend uses this for DIRECT chats
  const participant = (conv as any).participant;
  if (participant?.name && String(participant.name).trim()) {
    return String(participant.name).trim();
  }

  // 3. Try participants array (plural) - for GROUP chats or manually set
  const participants = conv.participants;
  if (Array.isArray(participants) && participants.length > 0) {
    return participants.map(p => p.name || `ID ${p.id}`).join(', ');
  }

  // 4. Try last message sender as fallback
  const lastMsg = conv.lastMessage;
  if (lastMsg) {
    const sender = (lastMsg as any).sender;
    const senderName =
      sender?.name ??
      (lastMsg as any).senderName ??
      (lastMsg as any).sender_name;
    if (senderName && String(senderName).trim()) {
      return String(senderName).trim();
    }
  }

  return 'Chat';
}

const DriverAllChats: React.FC<DriverAllChatsProps> = ({
  setSchoolChattingScreen,
  arrayData,
}) => {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector(selectConversations);
  const status = useAppSelector(selectConversationsStatus);

  useEffect(() => {
    // Initial fetch only - WebSocket handles real-time updates
    dispatch(fetchConversations());
  }, [dispatch]);

  // Debug: Check API response
  useEffect(() => {
    console.log('[DriverAllChats] API conversations:', conversations);
    console.log('[DriverAllChats] API status:', status);
  }, [conversations, status]);

  // Use API data or passed arrayData - NO dummy data fallback
  const list = arrayData && arrayData.length > 0 ? arrayData : conversations;

  const onPressItem = (item: any) => {
    if (item?.id != null) {
      // Extract participant info - backend uses singular "participant" for DIRECT chats
      let conversationWithParticipants = item;
      const participant = item.participant;

      // Convert singular participant to participants array for consistency
      if (participant && (!item.participants || item.participants.length === 0)) {
        conversationWithParticipants = {
          ...item,
          participants: [{
            id: participant.id,
            name: participant.name,
            type: participant.type
          }]
        };
      }

      dispatch(setSelectedConversation(conversationWithParticipants as ChatConversation));
      dispatch(
        setSelectedUserChatData({
          name: getConversationTitle(conversationWithParticipants),
          profile_image: participant?.avatar ?? item?.avatar ?? '',
        }),
      );
      if (setSchoolChattingScreen !== undefined) {
        setSchoolChattingScreen(true);
      }
    }
  };

  const renderRow = ({item}: {item: any}) => {
    // Debug: Log conversation item to understand structure
    if (item?.id) {
      console.log('[DriverAllChats] Conversation item:', {
        id: item.id,
        name: item.name,
        participants: item.participants,
        lastMessage: item.lastMessage ? {
          sender: (item.lastMessage as any).sender,
          senderName: (item.lastMessage as any).senderName,
          sender_name: (item.lastMessage as any).sender_name,
          senderType: (item.lastMessage as any).senderType,
          sender_type: (item.lastMessage as any).sender_type,
        } : null,
      });
    }

    const title = getConversationTitle(item);
    const lastMsg = item?.lastMessage;
    const message = typeof lastMsg === 'string'
      ? lastMsg
      : (lastMsg?.content ?? lastMsg?.text ?? '');
    const time = formatChatTime(item?.lastMessageAt ?? lastMsg?.createdAt);
    const avatar = item?.avatar ? {uri: item.avatar} : require('../../assets/images/profile_image.webp');

    // Get participant type from participant (singular) - backend uses this
    let participantType = null;
    const participant = (item as any).participant;
    if (participant?.type) {
      participantType = participant.type;
    } else if (item.participants && item.participants.length > 0) {
      participantType = item.participants[0]?.type;
    } else if (lastMsg) {
      const sender = (lastMsg as any).sender;
      participantType = sender?.type ?? (lastMsg as any).senderType ?? (lastMsg as any).sender_type;
    }

    return (
      <Pressable
        onPress={() => onPressItem(item)}
        style={[AppStyles.row, AppStyles.widthFullPercent, {paddingVertical: hp(1.6)}]}>
        <Image style={styles.image} source={avatar} />
        <View
          style={[
            AppStyles.rowBetween,
            {marginLeft: hp(2), width: '80%', alignItems: 'flex-start'},
          ]}>
          <View style={{gap: hp(0.3), flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Text
                style={[
                  AppStyles.title,
                  {
                    fontSize: size.md,
                    fontFamily: AppFonts.NunitoSansSemiBold,
                  },
                ]}>
                {title}
              </Text>
              {participantType && (
                <View
                  style={[
                    styles.typeBadge,
                    participantType === 'DRIVER' && {backgroundColor: '#4CAF50'},
                    participantType === 'SCHOOL' && {backgroundColor: '#2196F3'},
                    participantType === 'VENDOR' && {backgroundColor: '#FF9800'},
                    participantType === 'GUARDIAN' && {backgroundColor: '#9C27B0'},
                  ]}>
                  <Text style={styles.typeBadgeText}>
                    {participantType === 'DRIVER' ? '🚗' :
                     participantType === 'SCHOOL' ? '🏫' :
                     participantType === 'VENDOR' ? '🚚' :
                     participantType === 'GUARDIAN' ? '👨‍👩‍👧' : ''}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                AppStyles.title,
                {
                  fontSize: size.s,
                  color: AppColors.gradientGrey,
                  fontFamily: AppFonts.NunitoSansMedium,
                },
              ]}
              numberOfLines={1}>
              {message}
            </Text>
          </View>
          <Text
            style={[
              AppStyles.title,
              {
                fontSize: size.s,
                marginTop: hp(0.5),
                color: AppColors.gradientGrey,
                fontFamily: AppFonts.NunitoSansMedium,
              },
            ]}>
            {time}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header} />
      <Pressable style={styles.headerCenterItem}>
        <AppInput
          placeholder="Search..."
          container={[{borderWidth: 0, backgroundColor: AppColors.profileBg}]}
          inputStyle={{paddingLeft: hp(1), paddingVertical: hp(1.8)}}
          containerStyle={{marginBottom: hp(-1)}}
          rightInnerIcon={
            <GlobalIcon
              library="Fontisto"
              name="search"
              color={AppColors.black}
              size={hp(2.5)}
            />
          }
        />
      </Pressable>
      <View style={styles.container}>
        {status === 'loading' && list.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={AppColors.red} />
          </View>
        ) : list.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No conversations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a new conversation to see it here
            </Text>
          </View>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={list}
            keyExtractor={(item, idx) => String(item?.id ?? idx)}
            renderItem={renderRow}
          />
        )}
      </View>
    </View>
  );
};

export default React.memo(DriverAllChats);

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: AppColors.white,
    flex: 1,
  },
  header: {
    height: hp(3),
  },
  container: {
    backgroundColor: AppColors.inputColor,
    flex: 1,
    borderTopEndRadius: hp(5),
    borderTopStartRadius: hp(5),
    paddingHorizontal: hp(2),
    paddingTop: hp(2),
  },
  image: {
    height: hp(6),
    width: hp(6),
    borderRadius: hp(3),
  },
  headerCenterItem: {
    width: '100%',
    paddingHorizontal: hp(2),
    marginBottom: hp(1),
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: hp(4),
  },
  emptyStateText: {
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: size.md,
    color: AppColors.black,
    marginBottom: hp(1),
  },
  emptyStateSubtext: {
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: size.s,
    color: AppColors.gradientGrey,
    textAlign: 'center',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: AppColors.gradientGrey,
  },
  typeBadgeText: {
    fontSize: 11,
    color: AppColors.white,
  },
});
