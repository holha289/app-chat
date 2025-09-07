import { RootState } from "@app/store";

export const selectRooms = (state: RootState) => state.msg.rooms;
export const selectMsgStatus = (state: RootState) => state.msg.status;
// export const selectMessage = (state: RootState) => state.msg.messages;
export const selectMessage = (state: RootState, roomId: string) =>
  state.msg.messages[roomId];
export const replyToMsg = (state: RootState, roomId: string) =>
  state.msg.messages[roomId]?.replyToMsg;
export const selectInputText = (state: RootState, roomId: string) =>
  state.msg.messages[roomId]?.inputText || "";
