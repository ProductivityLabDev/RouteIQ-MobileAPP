/**
 * ChatSocketProvider - Initializes WebSocket connection globally
 * Place this near the root of your app (after Redux Provider)
 */

import React, { useEffect } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';

export const ChatSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This hook automatically connects/disconnects based on auth token
  useChatSocket();

  return <>{children}</>;
};
