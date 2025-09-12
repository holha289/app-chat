import { use, useEffect } from "react";
import { startAppListening } from "@app/store";
import msgActions from "./msg.action";
import { MessagePage, MsgState } from "../types/msg.type";
import { ApiResponse } from "@app/types/response";
import apiService from "@app/services/api.service";
import { useSelector } from "react-redux";
import { selectMessage } from "./msg.selectors";
import { useSockerIo } from "@app/hooks/use-socketio";

export const MsgListenerMiddleware = () => {
  GetRoomsListener();
  GetMsgByRoomListener();
  HandleSocketReciveMsgListener();

  HandleSocketSendMsgListener();
};

const GetRoomsListener = () => {
  startAppListening({
    actionCreator: msgActions.getRoom,
    effect: async (action, listenerApi) => {
      try {
        const response =
          await apiService.get<ApiResponse<MsgState["rooms"]>>(
            "/message/rooms",
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
          }),
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
        const { socket } = useSockerIo();
        const payload = action.payload;
        console.log("🚀 ~ HandleSocketSendMsgListener ~ payload:", payload);
        socket?.emit("room:send:message", payload);
        listenerApi.dispatch(msgActions.sendMsgByRoomSuccess());
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
        listenerApi.dispatch(msgActions.reciverMsgSuccess(payload));
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
