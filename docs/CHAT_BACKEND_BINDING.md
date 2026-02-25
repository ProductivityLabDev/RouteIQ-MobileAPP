# Chat – Frontend ↔ Backend binding

Yeh doc batata hai app ka chat module backend ke saath **kahan aur kaise** bind ho raha hai (endpoints, bodies, response shape, errors). Backend current state doc ke hisaab.

---

## 0. Enums (align)

| Backend | Frontend |
|--------|----------|
| ConversationType: `DIRECT`, `GROUP` | `chatTypes.ts`: `ConversationType.DIRECT`, `ConversationType.GROUP` |
| ParticipantType: `DRIVER`, `GUARDIAN`, `SCHOOL`, `VENDOR` | `chatTypes.ts`: `ParticipantType.*` + `toParticipantType(role)` (PARENT→GUARDIAN, INSTITUTE→SCHOOL) |
| MessageType: `TEXT`, `IMAGE`, `FILE` | `chatTypes.ts`: `MessageType.*` |

---

## 1. REST – endpoint ↔ slice

| Backend | Frontend (chatSlice) | Response parse |
|---------|----------------------|----------------|
| `GET /chat/contacts?type=` | `fetchChatContacts({ type })` | `data.contacts` \|\| `data.data` \|\| array → `ChatContact[]` |
| `GET /chat/conversations?type=` | `fetchConversations({ type })` | `data.conversations` \|\| `data.data` \|\| array → `ChatConversation[]` |
| `POST /chat/conversations` | `createConversation(body)` | `data.data` \|\| `data.conversation` \|\| data → conversation |
| `GET /chat/conversations/:id/messages?page=&limit=` | `fetchMessages({ conversationId, page?, limit? })` | `data.messages`, `data.hasMore`, `data.total` |
| `POST /chat/messages` | `sendChatMessage({ conversationId, text?, attachmentUrl?, attachmentType? })` | `data.data` \|\| `data.message` \|\| data → message |
| `PATCH /chat/conversations/:id/read` | `markConversationRead(conversationId)` | — |
| `POST /chat/conversations/:id/participants` | `addParticipant({ conversationId, participantId, participantType })` | — |
| `DELETE .../participants/:participantId/:participantType` | `removeParticipant({ conversationId, participantId, participantType })` | — |
| `PATCH /chat/conversations/:id` | `updateConversation({ conversationId, name?, avatar? })` | `data.data` \|\| `data.conversation` \|\| data |

- **Create body:** Direct = `{ type: "DIRECT", participantId, participantType }`; Group = `{ type: "GROUP", name, avatar?, participants: [{ id, type }] }`. Slice `participantIds`/`participantTypes` se `participants` banata hai aur `toParticipantType()` use karta hai.
- **participantType** (add/remove): Backend ko `DRIVER`|`GUARDIAN`|`SCHOOL`|`VENDOR` chahiye; UI se call karte waqt `toParticipantType()` use karein.

---

## 2. Response shapes (frontend expect)

- **Contacts:** `{ ok?, contacts: [{ id, participantType?, name?, avatar?, existingConversationId? }] }`. `existingConversationId` = pehle se direct chat ho to us conversation ki id; "start chat" me use karo (open existing ya create).
- **Conversations:** `{ ok?, conversations: [{ id, type, name?, avatar?, participants?, lastMessage?, lastMessageAt?, unreadCount? }] }`. `lastMessage` me backend `content` bhej sakta hai; UI me `lastMessage?.content ?? lastMessage?.text` use karo.
- **Messages:** `{ ok?, messages: [{ id, content, messageType?, attachmentUrl?, sender?, createdAt, status?, deliveredTo?, readBy? }], hasMore, total }`. Normal chat me delivery/read; monitoring me nahi.
- **Send message:** Same message object; optional `attachmentUrl` / `attachmentType`. File upload abhi JSON-only; multipart (S3) baad me add ho sakta hai.

---

## 3. Kahan bind ho raha hai (screens/components)

- **DriverAllChats:** `fetchConversations()` → list; item press → `setSelectedConversation(item)`; title = conversation name/participants; last message = `lastMessage?.content ?? lastMessage?.text`; time = `lastMessageAt`.
- **DriverChats (tabs):** Vendor / Guardian / School / Groups – sab same list (DriverAllChats) + VendorChat thread; Groups tab = GroupChat.
- **VendorChat:** `selectedConversation` → `fetchMessages({ conversationId })`, `markConversationRead(conversationId)`, `sendChatMessage({ conversationId, text })`. Messages map: `content`, `sender` object (id, userId, name), `attachmentUrl` → GiftedChat.
- **GroupChat:** `fetchConversations()` + `fetchChatContacts()` (create group); `createConversation({ type: 'group', name, participantIds, participantTypes })` → success par `setSelectedConversation(res)`. Group list = conversations with `type === 'GROUP' || type === 'group'`.

**existingConversationId:** Contacts me aata hai; abhi koi screen "contacts list → tap contact → open existing ya create direct" use nahi karti. Agar aisa flow add karo to: contact tap → `existingConversationId` hai to `setSelectedConversation` (conversation list me se ya fetch by id) / nahi to `createConversation({ type: 'DIRECT', participantId: contact.id, participantType })` then open.

---

## 4. Monitoring (Vendor/School)

- `fetchMonitoredConversations({ sourceType?, targetType?, page?, limit? })` → `GET /chat/monitoring/conversations?sourceType=...&targetType=...`
- `fetchMonitoredMessages({ conversationId, page?, limit? })` → `GET /chat/monitoring/conversations/:id/messages`
- 403: "Monitoring not available for your role" / "Conversation not in your monitoring scope" → thunk reject; UI me error dikhao.

---

## 5. Errors (normal chat)

- 403 "You are not a participant of this conversation" → messages/send/read jab user us conversation me nahi. Thunk reject; UI me show karo.

---

## 6. WebSocket (future)

- Namespace `/chat`; auth JWT; events: `send_message`, `typing`, `stop_typing`; `new_message`, `user_typing`, `user_stop_typing`. Abhi app sirf REST use karti hai.

---

## 7. Short checklist

- [x] Enums + toParticipantType
- [x] Contacts/conversations/messages/create/send/read/participants/update
- [x] Response parsing (contacts, conversations, messages, hasMore, total)
- [x] lastMessage me `content` support (DriverAllChats, GroupChat)
- [x] Group list filter `GROUP` / `group`
- [x] Monitoring thunks (sourceType, targetType)
- [ ] Send message file upload (multipart) – optional
- [ ] existingConversationId use in "start direct chat" flow – optional
- [ ] WebSocket connect + events – optional
