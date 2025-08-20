import { createAction } from "@reduxjs/toolkit";
import { MessagePage,MsgState, msgTypes, roomTypes } from "../types/msg.type";

const Room_ACTIONS_TYPES = {
  GETROOM: "GET_ROOM",
  GETROOM_SUCCESS: "GET_ROOM_SUCCESS",
  GETROOMS_FAILED: "GET_ROOMS_FAILED",
  GETMSGBYROOM: "GET_MSG_BY_ROOM",
  GETMSGBYROOM_SUCCESS: "GET_MSG_BY_ROOM_SUCCESS",
  GETMSGBYROOM_FAILED: "GET_MSG_BY_ROOM_FAILED",
};

const msgActions = {
  getRoom: createAction(Room_ACTIONS_TYPES.GETROOM),
  getRoomSuccess: createAction<MsgState["rooms"]>(
    Room_ACTIONS_TYPES.GETROOM_SUCCESS,
  ),
  getRoomsFailed: createAction<string>(Room_ACTIONS_TYPES.GETROOMS_FAILED),
  getMsgByRoom: createAction<{ roomId: string; cursor: string | null }>(
    Room_ACTIONS_TYPES.GETMSGBYROOM,
  ),
  getMsgByRoomSuccess: createAction<{ roomId: string; message: MessagePage }>(
    Room_ACTIONS_TYPES.GETMSGBYROOM_SUCCESS,
  ),
  getMsgByRoomFailed: createAction<string>(
    Room_ACTIONS_TYPES.GETMSGBYROOM_FAILED,
  ),
};
export default msgActions;
