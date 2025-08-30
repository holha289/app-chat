import { StateCore } from "@app/features/types";

export interface Room {
  is_read: boolean;
  id: string;
  type: "private" | "group";
  last_message: LastMsg;
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
export type LastMsg={
  msg_id:string,
  createdAt:string,
  msg_content:string
}
export type MessagePage = {
  items: MessageItem[];
  nextCursor: string | null; // null = hết trang
  lastMsgId: string | null; // id của tin nhắn mới đã đọc
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
