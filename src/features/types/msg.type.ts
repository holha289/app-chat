import { StateCore } from "@app/features/types";

export interface MsgState extends StateCore {
  rooms: Array<{
    is_read: boolean;
    id: number;
    type: "private" | "group";
    last_message: {};
    name: string;
    avatar: string;
  }>;
  messages:  Record<string, MessagePage>;
}
export interface MessageItem {
  id: string;        // nên để string (thường là ObjectId hoặc public id)
  senderId: string;  // idem
  content: string;
  timestamp: number; // hoặc Date -> number
}
export interface MessagePage {
  items: MessageItem[];
  nextCursor: string | null;
}
export type messageType = MessagePage;
export type roomTypes= MsgState['rooms']
export type msgTypes= MsgState['messages']

