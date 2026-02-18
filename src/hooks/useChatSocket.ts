/**
 * Custom hook to manage WebSocket chat connection
 * Auto-connects when user is logged in
 * Handles real-time messages and typing indicators
 */

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { chatSocket } from '../services/chatSocket';
import { addSocketMessage, setUserTyping, setUserStopTyping } from '../store/chat/chatSlice';

export function useChatSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.userSlices?.token);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      // No token - disconnect if connected
      if (isConnectedRef.current) {
        chatSocket.disconnect();
        isConnectedRef.current = false;
      }
      return;
    }

    // Token present - connect if not connected
    if (!isConnectedRef.current) {
      chatSocket.connect(token);
      isConnectedRef.current = true;

      // Listen to new messages
      const unsubscribeNewMessage = chatSocket.onNewMessage((message) => {
        dispatch(addSocketMessage(message));
      });

      // Listen to typing events
      const unsubscribeTyping = chatSocket.onUserTyping((data) => {
        dispatch(setUserTyping(data));
      });

      const unsubscribeStopTyping = chatSocket.onUserStopTyping((data) => {
        dispatch(setUserStopTyping(data));
      });

      // Cleanup on unmount
      return () => {
        unsubscribeNewMessage();
        unsubscribeTyping();
        unsubscribeStopTyping();
        chatSocket.disconnect();
        isConnectedRef.current = false;
      };
    }
  }, [token, dispatch]);

  return {
    isConnected: chatSocket.isConnected(),
    sendMessage: chatSocket.sendMessage.bind(chatSocket),
    sendTyping: chatSocket.sendTyping.bind(chatSocket),
    sendStopTyping: chatSocket.sendStopTyping.bind(chatSocket),
  };
}
