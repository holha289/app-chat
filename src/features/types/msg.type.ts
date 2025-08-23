import { StateCore } from "@app/features/types";

export interface Room {
  is_read: boolean;
  id: string;
  type: "private" | "group";
  last_message: Record<string, unknown>;
  name: string;
  avatar: string;
}
export type MessageItem = {
  id: string; // nên string
  sender: {};
  content: string;
  updatedAt: string;
  createdAt: string;
  readCount: number;
  isReadByMe: boolean; // ms kể từ epoch
};
export type MessagePage = {
  items: MessageItem[];
  nextCursor: string | null; // null = hết trang
};

export type MessagesByRoom = Record<string, MessagePage>;
export interface MsgState extends StateCore {
  rooms: Room[];
  messages: MessagesByRoom;
}

// {messages:{
// "dsfsf":{

// }
// messages[roomId].

export type roomTypes = MsgState["rooms"];
export type msgTypes = MsgState["messages"];
