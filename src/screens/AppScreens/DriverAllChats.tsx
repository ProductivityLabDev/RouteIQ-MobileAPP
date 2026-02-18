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
  if (conv.name && String(conv.name).trim()) return String(conv.name).trim();
  const participants = conv.participants;
  if (Array.isArray(participants) && participants.length > 0) {
    return participants.map(p => p.name || `ID ${p.id}`).join(', ');
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
      dispatch(setSelectedConversation(item as ChatConversation));
      dispatch(
        setSelectedUserChatData({
          name: getConversationTitle(item),
          profile_image: item?.avatar ?? '',
        }),
      );
      if (setSchoolChattingScreen !== undefined) {
        setSchoolChattingScreen(true);
      }
    }
  };

  const renderRow = ({item}: {item: any}) => {
    const title = getConversationTitle(item);
    const lastMsg = item?.lastMessage;
    const message = typeof lastMsg === 'string'
      ? lastMsg
      : (lastMsg?.content ?? lastMsg?.text ?? '');
    const time = formatChatTime(item?.lastMessageAt ?? lastMsg?.createdAt);
    const avatar = item?.avatar ? {uri: item.avatar} : require('../../assets/images/profile_image.webp');

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
          <View style={{gap: hp(0.3)}}>
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
});
