/**
 * WebSocket service for real-time chat using Socket.IO
 * Backend namespace: /chat
 * Events: new_message, user_typing, user_stop_typing
 */

import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../utils/apiConfig';
import type { ChatMessage } from '../store/chat/chatTypes';

type NewMessageCallback = (message: ChatMessage) => void;
type TypingCallback = (data: { conversationId: number; userId: number; userType: string }) => void;
type StopTypingCallback = (data: { conversationId: number }) => void;

class ChatSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private listeners: {
    newMessage: NewMessageCallback[];
    userTyping: TypingCallback[];
    userStopTyping: StopTypingCallback[];
  } = {
    newMessage: [],
    userTyping: [],
    userStopTyping: [],
  };

  /**
   * Connect to WebSocket server
   */
  connect(token: string) {
    if (this.socket?.connected) {
      console.log('[ChatSocket] Already connected');
      return;
    }

    this.token = token;
    const baseUrl = getApiBaseUrl();

    console.log('[ChatSocket] Connecting to:', baseUrl + '/chat');

    this.socket = io(baseUrl + '/chat', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[ChatSocket] ✅ Connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[ChatSocket] ❌ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('[ChatSocket] Connection error:', error.message);
    });

    // Listen to server events
    this.socket.on('new_message', (message: ChatMessage) => {
      console.log('[ChatSocket] 📩 New message:', message.id);
      this.listeners.newMessage.forEach(cb => cb(message));
    });

    this.socket.on('user_typing', (data: { conversationId: number; userId: number; userType: string }) => {
      console.log('[ChatSocket] ⌨️ User typing:', data);
      this.listeners.userTyping.forEach(cb => cb(data));
    });

    this.socket.on('user_stop_typing', (data: { conversationId: number }) => {
      console.log('[ChatSocket] 🛑 User stop typing:', data);
      this.listeners.userStopTyping.forEach(cb => cb(data));
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      console.log('[ChatSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
      this.listeners = { newMessage: [], userTyping: [], userStopTyping: [] };
    }
  }

  /**
   * Send message via WebSocket (text only or text + already-uploaded attachment)
   */
  sendMessage(data: {
    conversationId: number;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'FILE';
    attachmentUrl?: string;
  }): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ success: false, error: 'Socket not connected' });
        return;
      }

      this.socket.emit('send_message', data, (response: any) => {
        console.log('[ChatSocket] Send message response:', response);
        resolve(response);
      });
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: number) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', { conversationId });
  }

  /**
   * Send stop typing indicator
   */
  sendStopTyping(conversationId: number) {
    if (!this.socket?.connected) return;
    this.socket.emit('stop_typing', { conversationId });
  }

  /**
   * Listen to new messages
   */
  onNewMessage(callback: NewMessageCallback) {
    this.listeners.newMessage.push(callback);
    return () => {
      this.listeners.newMessage = this.listeners.newMessage.filter(cb => cb !== callback);
    };
  }

  /**
   * Listen to typing events
   */
  onUserTyping(callback: TypingCallback) {
    this.listeners.userTyping.push(callback);
    return () => {
      this.listeners.userTyping = this.listeners.userTyping.filter(cb => cb !== callback);
    };
  }

  /**
   * Listen to stop typing events
   */
  onUserStopTyping(callback: StopTypingCallback) {
    this.listeners.userStopTyping.push(callback);
    return () => {
      this.listeners.userStopTyping = this.listeners.userStopTyping.filter(cb => cb !== callback);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const chatSocket = new ChatSocketService();
