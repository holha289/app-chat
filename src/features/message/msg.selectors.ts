

import { RootState } from "@app/store";


export const selectRooms = (state: RootState) => state.msg.rooms;
export const selectMsgStatus = (state: RootState) => state.msg.status;
export const selectMessage = (state: RootState) => state.msg.messages;
export const selectInputText = (state: RootState) => state.msg.messages;