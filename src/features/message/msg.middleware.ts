import { startAppListening } from "@app/store";
import msgActions from "./msg.action";
import { MessagePage,  MsgState,} from "../types/msg.type";
import { ApiResponse } from "@app/types/response";
import apiService from "@app/services/api.service";
import { useSelector } from "react-redux";
import { selectMessage } from "./msg.selectors";

export const MsgListenerMiddleware = () => {
  GetRoomsListener();
  GetMsgByRoomListener();
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
        const cursorQuery = cursor ? `&cursor=${cursor}` : "";
        const response = await apiService.get<
          ApiResponse<MsgState["messages"]>
        >(`/message/rooms/${roomId}?limit=10${cursorQuery}`);
        listenerApi.dispatch(
          msgActions.getMsgByRoomSuccess({
            roomId,
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
