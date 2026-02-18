/**
 * Chat backend enums & types.
 * Backend: ConversationType DIRECT | GROUP; ParticipantType DRIVER | GUARDIAN | SCHOOL | VENDOR; MessageType TEXT | IMAGE | FILE.
 */

export const ConversationType = {
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
} as const;
export type ConversationType = (typeof ConversationType)[keyof typeof ConversationType];

export const ParticipantType = {
  DRIVER: 'DRIVER',
  GUARDIAN: 'GUARDIAN',
  SCHOOL: 'SCHOOL',
  VENDOR: 'VENDOR',
} as const;
export type ParticipantType = (typeof ParticipantType)[keyof typeof ParticipantType];

export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

/** App role / contact type → backend ParticipantType (PARENT→GUARDIAN, INSTITUTE→SCHOOL). */
export function toParticipantType(roleOrType: string): ParticipantType {
  const u = (roleOrType || '').toUpperCase();
  if (u === 'PARENT' || u === 'PARENTS' || u === 'GUARDIAN') return 'GUARDIAN';
  if (u === 'INSTITUTE' || u === 'SCHOOL') return 'SCHOOL';
  if (u === 'DRIVER') return 'DRIVER';
  if (u === 'VENDOR') return 'VENDOR';
  return 'GUARDIAN';
}

export type ChatContact = {
  id: string | number;
  participantType?: string;
  name?: string;
  avatar?: string | null;
  /** Backend: agar pehle se direct chat hai to id; start chat me use karo */
  existingConversationId?: number | null;
  [key: string]: any;
};

export type ChatParticipant = {
  id: string | number;
  type?: ParticipantType | string;
  participantType?: string;
  name?: string;
  avatar?: string | null;
  [key: string]: any;
};

export type ChatConversation = {
  id: string | number;
  name?: string | null;
  avatar?: string | null;
  type?: 'DIRECT' | 'GROUP' | 'direct' | 'group';
  lastMessage?: { text?: string; content?: string; createdAt?: string } | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  participants?: ChatParticipant[];
  [key: string]: any;
};

export type ChatMessage = {
  id: string | number;
  conversationId?: string | number;
  conversation_id?: string | number;
  content?: string | null;
  text?: string | null;
  messageType?: MessageType | string;
  attachmentUrl?: string | null;
  attachment_url?: string | null;
  sender?: { id?: number; userId?: number; type?: string; name?: string };
  senderId?: string | number;
  sender_id?: string | number;
  senderType?: string;
  sender_name?: string;
  senderName?: string;
  createdAt: string;
  created_at?: string;
  status?: string;
  deliveredTo?: any;
  readBy?: any;
  [key: string]: any;
};

export type GetMessagesResult = {
  messages: ChatMessage[];
  hasMore: boolean;
  total?: number;
};
