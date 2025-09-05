import { use, useEffect } from "react";
import { startAppListening } from "@app/store";
import msgActions from "./msg.action";
import { MessagePage, MsgState } from "../types/msg.type";
import { ApiResponse } from "@app/types/response";
import apiService from "@app/services/api.service";
import { useSelector } from "react-redux";
import { selectMessage } from "./msg.selectors";
import { getSocket } from "@app/core/socketIo";
import { create } from "axios";

export const MsgListenerMiddleware = () => {
  GetRoomsListener();
  GetMsgByRoomListener();
  HandleSocketReciveMsgListener();

  HandleSocketSendMsgListener();
  HandleSoketReadMarMsgListener();
};

const GetRoomsListener = () => {
  startAppListening({
    actionCreator: msgActions.getRoom,
    effect: async (action, listenerApi) => {
      try {
        const response = await apiService.get<ApiResponse<MsgState["rooms"]>>(
          "/message/rooms"
        );
        console.log("🚀 ~ GetRoomsListener ~ response:", response);
        listenerApi.dispatch(msgActions.getRoomSuccess(response.metadata));
      } catch (error) {
        console.error("Get rooms failed:", error);
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error);
        listenerApi.dispatch(msgActions.getRoomsFailed(errorMessage));
      }
    },
  });
};

const GetMsgByRoomListener = () => {
  startAppListening({
    actionCreator: msgActions.getMsgByRoom,
    effect: async (action, listenerApi) => {
      try {
        const { roomId, cursor } = action.payload;
        console.log("🚀 ~ GetMsgByRoomListener ~ cursor:", cursor);
        const cursorQuery = cursor ? `&cursor=${cursor}` : "";
        const response = await apiService.get<
          ApiResponse<MsgState["messages"]>
        >(`/message/rooms/${roomId}?limit=100${cursorQuery}`);
        listenerApi.dispatch(
          msgActions.getMsgByRoomSuccess({
            roomId,
            cursor: cursor ?? "",
            message: response.metadata as unknown as MessagePage,
          })
        );
      } catch (error) {
        console.error("Get messages by room failed:", error);
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error);
        listenerApi.dispatch(msgActions.getMsgByRoomFailed(errorMessage));
      }
    },
  });
};

const HandleSocketSendMsgListener = () => {
  startAppListening({
    actionCreator: msgActions.sendMsgByRoom,
    effect: async (action, listenerApi) => {
      try {
        const socket = getSocket();
        const payload = action.payload;
        // console.log("🚀 ~ HandleSocketSendMsgListener ~ payload:", payload);
        socket?.emit("room:send:message", payload.message);

        const message = {
          id: payload.message.id,
          content: payload.message.content,
          type: payload.message.type,
          isReadByMe: true,
          readCount: 0,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          sender: payload.sender,
        };
        const roomId = payload.message.roomId;
        listenerApi.dispatch(msgActions.sendMsgByRoomSuccess());
        listenerApi.dispatch(
          msgActions.reciverMsgSuccess({
            roomId,
            message,
            replytoId: payload.message?.replytoId
              ? payload.message.replytoId
              : null,
          })
        );
      } catch (error) {
        console.error("Get messages by room failed:", error);
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error);
        listenerApi.dispatch(msgActions.getMsgByRoomFailed(errorMessage));
      }
    },
  });
};

const HandleSocketReciveMsgListener = () => {
  startAppListening({
    actionCreator: msgActions.reciverMsg,
    effect: async (action, listenerApi) => {
      try {
        const payload = action.payload;
        listenerApi.dispatch(
          msgActions.reciverMsgSuccess({
            ...payload,
            replytoId: null,
          })
        );
      } catch (error) {
        console.error("Get messages by room failed:", error);
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error);
        listenerApi.dispatch(msgActions.getMsgByRoomFailed(errorMessage));
      }
    },
  });
};

const HandleSoketReadMarMsgListener = () => {
  startAppListening({
    actionCreator: msgActions.readMark,
    effect: async (action, listenerApi) => {
      try {
        const { roomId, lastMsgId } = action.payload;
        const socket = getSocket();
        socket?.emit("room:read:message", { roomId, lastMsgId });
        listenerApi.dispatch(msgActions.readMarkSuccess({ roomId, lastMsgId }));
      } catch (error) {
        console.error("Read mark failed:", error);
        const errorMessage =
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error);
        listenerApi.dispatch(msgActions.readMarkFailed(errorMessage));
      }
    },
  });
};
