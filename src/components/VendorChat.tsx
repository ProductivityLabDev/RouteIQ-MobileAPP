import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {Bubble, GiftedChat, InputToolbar, Send, Composer} from 'react-native-gifted-chat';
import type {IMessage} from 'react-native-gifted-chat';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
  selectSelectedConversation,
  selectMessages,
  selectMessagesStatus,
  selectSendStatus,
  selectTypingUsers,
  fetchMessages,
  sendChatMessage,
  markConversationRead,
} from '../store/chat/chatSlice';
import type {ChatMessage} from '../store/chat/chatTypes';
import {useChatSocket} from '../hooks/useChatSocket';

function apiMessageToGifted(
  msg: ChatMessage & { _isFromMe?: boolean },
  currentUserDisplayId: string,
  mySenderIds: string[],
): IMessage {
  const createdAt = msg.createdAt ?? msg.created_at;
  const rawSenderId = msg.senderId ?? msg.sender_id;
  const senderObj = (msg as any).sender;
  const senderIdStr = String(
    rawSenderId ?? senderObj?.id ?? senderObj?.userId ?? msg.id,
  );
  const isFromMeFlag = Boolean((msg as any)._isFromMe);
  const isMe =
    isFromMeFlag ||
    mySenderIds.some(id => String(id) === senderIdStr);
  const senderName =
    senderObj?.name ??
    msg.senderName ??
    msg.sender_name ??
    msg.senderType ??
    msg.sender_type ??
    'User';
  const messageText = msg.text ?? msg.content ?? msg.attachmentUrl ?? msg.attachment_url ?? '';

  return {
    _id: String(msg.id),
    text: messageText,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    user: {
      _id: isMe ? currentUserDisplayId : senderIdStr,
      name: isMe ? 'Me' : senderName,
    },
  };
}

const VendorChat = () => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const conversationId = selectedConversation?.id;
  const messagesStatus = useAppSelector(selectMessagesStatus);
  const sendStatus = useAppSelector(selectSendStatus);
  const userId = useAppSelector(state => state.userSlices?.userId);
  const employeeId = useAppSelector(state => state.userSlices?.employeeId);
  const currentUserDisplayId = String(userId ?? employeeId ?? 1);
  const typingUsers = useAppSelector(
    conversationId != null ? selectTypingUsers(conversationId) : () => ({}),
  );

  // WebSocket connection
  const { isConnected, sendMessage: sendSocketMessage, sendTyping, sendStopTyping } = useChatSocket();

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mySenderIds = useMemo(
    () =>
      [userId, employeeId]
        .filter(v => v != null && v !== '')
        .map(v => String(v)),
    [userId, employeeId],
  );

  const apiMessages = useAppSelector(
    conversationId != null ? selectMessages(conversationId) : () => [],
  );

  const giftedMessages: IMessage[] = useMemo(() => {
    if (!conversationId) return [];
    return apiMessages
      .map(m => apiMessageToGifted(m, currentUserDisplayId, mySenderIds))
      .sort((a, b) => {
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : b.createdAt?.getTime?.() ?? 0;
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : a.createdAt?.getTime?.() ?? 0;
        return timeB - timeA;
      });
  }, [apiMessages, conversationId, currentUserDisplayId, mySenderIds]);

  // Initial fetch (no polling - WebSocket handles real-time)
  useEffect(() => {
    if (conversationId == null) return;
    dispatch(fetchMessages({conversationId}));
    dispatch(markConversationRead(conversationId));
  }, [conversationId, dispatch]);

  // Typing indicator text
  const typingIndicator = useMemo(() => {
    if (!conversationId) return '';
    const typing = Object.entries(typingUsers)
      .filter(([uid]) => !mySenderIds.includes(uid))
      .map(([, utype]) => utype);
    if (typing.length === 0) return '';
    if (typing.length === 1) return `${typing[0]} is typing...`;
    return `${typing.length} people are typing...`;
  }, [typingUsers, conversationId, mySenderIds]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!conversationId || newMessages.length === 0) return;
      const first = newMessages[0];
      const text = first?.text?.trim();
      if (!text) return;

      // Stop typing indicator
      if (isTyping) {
        sendStopTyping(Number(conversationId));
        setIsTyping(false);
      }

      // Try WebSocket first, fallback to REST
      if (isConnected) {
        try {
          const result = await sendSocketMessage({
            conversationId: Number(conversationId),
            content: text,
            messageType: 'TEXT',
          });
          if (result.success) {
            console.log('[VendorChat] Message sent via WebSocket');
            return;
          }
        } catch (e) {
          console.warn('[VendorChat] WebSocket send failed, fallback to REST');
        }
      }

      // Fallback to REST
      dispatch(
        sendChatMessage({
          conversationId,
          text,
        }),
      );
    },
    [conversationId, dispatch, isConnected, sendSocketMessage, sendStopTyping, isTyping],
  );

  // Handle typing - use ref to avoid stale closure
  const onInputTextChanged = useCallback(
    (text: string) => {
      if (!conversationId) return;

      const hasText = text && text.trim().length > 0;

      // Start typing indicator
      if (hasText && !isTyping) {
        setIsTyping(true);
        sendTyping(Number(conversationId));
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Only set timeout if there's text
      if (hasText) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          sendStopTyping(Number(conversationId));
        }, 3000);
      } else if (isTyping) {
        // If text cleared, stop typing immediately
        setIsTyping(false);
        sendStopTyping(Number(conversationId));
      }
    },
    [conversationId, isTyping, sendTyping, sendStopTyping],
  );

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && conversationId) {
        sendStopTyping(Number(conversationId));
      }
    };
  }, [isTyping, conversationId, sendStopTyping]);

  const renderMessage = (props: any) => {
    const {currentMessage} = props;
    const messageTextStyle = {
      left: {
        fontFamily: AppFonts.NunitoSansMedium,
        fontSize: 12,
        color: AppColors.black,
      },
      right: {
        fontFamily: AppFonts.NunitoSansMedium,
        fontSize: 12,
        color:
          currentMessage.type === 'date' ? AppColors.black : AppColors.white,
      },
    };

    return (
      <Bubble
        key={currentMessage._id}
        {...props}
        renderTime={() => <Text style={{position: 'absolute'}} />}
        wrapperStyle={{
          left: {
            maxWidth: '80%',
            backgroundColor:
              currentMessage.type === 'date'
                ? AppColors.transparent
                : AppColors.inputColor,
            marginBottom: 20,
            fontFamily: AppFonts.NunitoSansMedium,
            alignSelf: 'left',
            paddingVertical: hp(1),
          },
          right: {
            maxWidth: '80%',
            backgroundColor:
              currentMessage.type === 'date'
                ? AppColors.transparent
                : AppColors.darkRed,
            fontFamily: AppFonts.NunitoSansMedium,
            marginBottom: 20,
            alignSelf: 'right',
            paddingVertical: hp(1),
          },
        }}
        textStyle={messageTextStyle}
      />
    );
  };

  if (conversationId == null) {
    return (
      <View style={[styles.placeholder, styles.container]}>
        <Text style={styles.placeholderText}>Select a conversation to start chatting</Text>
      </View>
    );
  }

  if (messagesStatus === 'loading' && giftedMessages.length === 0) {
    return (
      <View style={[styles.placeholder, styles.container]}>
        <ActivityIndicator size="large" color={AppColors.red} />
      </View>
    );
  }

  const conversationTitle =
    selectedConversation?.name ??
    (Array.isArray(selectedConversation?.participants)
      ? selectedConversation.participants.map((p: any) => p.name || p.id).join(', ')
      : 'Chat');

  return (
    <View style={styles.container}>
      <View style={styles.chatWithBar}>
        <Text style={styles.chatWithText} numberOfLines={1}>
          Chat with: {conversationTitle}
        </Text>
        {typingIndicator ? (
          <Text style={styles.typingText}>{typingIndicator}</Text>
        ) : null}
      </View>
      <GiftedChat
        renderMessage={renderMessage}
        messagesContainerStyle={{
          paddingHorizontal: 20,
          backgroundColor: AppColors.profileBg,
          paddingTop: hp(1),
          paddingBottom: hp(5),
        }}
        renderAvatar={null}
        inverted={true}
        messages={giftedMessages}
        onSend={onSend}
        onInputTextChanged={onInputTextChanged}
        user={{
          _id: currentUserDisplayId,
          name: 'Me',
        }}
        listViewProps={{showsVerticalScrollIndicator: false}}
        isLoadingEarlier={sendStatus === 'loading'}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={styles.inputToolbarContainer}
            primaryStyle={styles.inputToolbarPrimary}
          />
        )}
        renderComposer={(props) => (
          <View style={styles.composerWrap}>
            <Composer
              {...props}
              textInputStyle={styles.textInput}
            />
          </View>
        )}
        renderSend={(props) => (
          <Send {...props} containerStyle={styles.sendContainer}>
            <Text style={styles.sendLabel}>Send</Text>
          </Send>
        )}
        textInputProps={{
          placeholderTextColor: AppColors.gradientGrey,
        }}
      />
    </View>
  );
};

export default React.memo(VendorChat);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.screenColor,
  },
  chatWithBar: {
    paddingVertical: hp(1),
    paddingHorizontal: 20,
    backgroundColor: AppColors.inputColor,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGrey,
  },
  chatWithText: {
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: 14,
    color: AppColors.black,
  },
  typingText: {
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: 11,
    color: AppColors.gradientGrey,
    fontStyle: 'italic',
    marginTop: 2,
  },
  inputToolbarContainer: {
    paddingHorizontal: 12,
    paddingVertical: hp(1),
    backgroundColor: AppColors.profileBg,
  },
  inputToolbarPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  composerWrap: {
    flex: 1,
    minWidth: 0,
  },
  textInput: {
    minHeight: 40,
    maxHeight: 100,
    color: AppColors.black,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 14,
    minHeight: 40,
    backgroundColor: AppColors.red,
    borderRadius: 20,
  },
  sendLabel: {
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansSemiBold,
    fontSize: 14,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: 14,
    color: AppColors.gradientGrey,
  },
});
