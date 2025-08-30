import { createAction } from "@reduxjs/toolkit";
import { LastMsg, MessageItem, MessagePage, MsgState, msgTypes, roomTypes } from "../types/msg.type";

const Room_ACTIONS_TYPES = {
  // get list room
  GETROOM: "GET_ROOM",
  GETROOM_SUCCESS: "GET_ROOM_SUCCESS",
  GETROOMS_FAILED: "GET_ROOMS_FAILED",
  // get all messages by room id
  GETMSGBYROOM: "GET_MSG_BY_ROOM",
  GETMSGBYROOM_SUCCESS: "GET_MSG_BY_ROOM_SUCCESS",
  GETMSGBYROOM_FAILED: "GET_MSG_BY_ROOM_FAILED",
  // send message
  SENDMSGBYROOM: "SEND_MSG_BY_ROOM",
  SENDMSGBYROOM_FAILED: "SEND_MSG_BY_ROOM_FAILED",
  SENDMSGBYROOM_SUCCESS: "SEND_MSG_BY_ROOM_SUCCESS",

  //resiver message
  RECEIVEMSG: "RECEIVE_MSG",
  RECEIVEMSG_SUCCESS: "RECEIVE_MSG_SUCCESS",
  RECEIVEMSG_FAILED: "RECEIVE_MSG_FAILED",
  UPDATELASTMSG: "UPDATE_LAST_MSG",
  // msg read mark
  READMARK: "READ_MARK",
  READMARK_SUCCESS: "READ_MARK_SUCCESS",
  READMARK_FAILED: "READ_MARK_FAILED",
};

const msgActions = {
  // get list room
  getRoom: createAction(Room_ACTIONS_TYPES.GETROOM),
  getRoomSuccess: createAction<MsgState["rooms"]>(
    Room_ACTIONS_TYPES.GETROOM_SUCCESS,
  ),
  getRoomsFailed: createAction<string>(Room_ACTIONS_TYPES.GETROOMS_FAILED),

  // get message by room
  getMsgByRoom: createAction<{ roomId: string; cursor: string | null }>(
    Room_ACTIONS_TYPES.GETMSGBYROOM,
  ),
  getMsgByRoomSuccess: createAction<{
    // lastMsgId: string | null;
    roomId: string;
    cursor: string;
    message: MessagePage;
  }>(Room_ACTIONS_TYPES.GETMSGBYROOM_SUCCESS),
  getMsgByRoomFailed: createAction<string>(
    Room_ACTIONS_TYPES.GETMSGBYROOM_FAILED,
  ),

  // send message
  sendMsgByRoom: createAction<{ roomId: string; content: string; type: string }>(
    Room_ACTIONS_TYPES.SENDMSGBYROOM,
  ),
  sendMsgByRoomSuccess: createAction(Room_ACTIONS_TYPES.SENDMSGBYROOM_SUCCESS),
  sendMsgByRoomFailed: createAction<string>(
    Room_ACTIONS_TYPES.SENDMSGBYROOM_FAILED,
  ),

  // recive message

  reciverMsg:createAction<{roomId:string, message:MessageItem}>(Room_ACTIONS_TYPES.RECEIVEMSG),
  reciverMsgSuccess:createAction<{roomId:string, message:MessageItem}>(Room_ACTIONS_TYPES.RECEIVEMSG_SUCCESS),
  reciverMsgFailed:createAction<string>(Room_ACTIONS_TYPES.RECEIVEMSG_FAILED),
  updateLastMsg:createAction<{roomId:string, message:LastMsg}>(Room_ACTIONS_TYPES.UPDATELASTMSG),

  // read mark

  readMark:createAction<{roomId:string, lastMsgId:string}>(Room_ACTIONS_TYPES.READMARK),
  readMarkSuccess:createAction<{roomId:string, lastMsgId:string}>(Room_ACTIONS_TYPES.READMARK_SUCCESS),
  readMarkFailed:createAction<string>(Room_ACTIONS_TYPES.READMARK_FAILED),

};
export default msgActions;
