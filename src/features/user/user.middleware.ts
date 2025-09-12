import { startAppListening } from "@app/store";
import UserActions from "./user.action";
import apiService from "@app/services/api.service";
import { ApiResponse } from "@app/types/response";
import ContactActions from "../contact/contact.action";
import { useErrorResponse } from "@app/hooks/use-error";
import { getSocket } from "@app/core/socketIo";

const UserListenerMiddleware = () => {
    sendFriendRequest();
    acceptFriendRequest();
    rejectFriendRequest();
    call();
}


const sendFriendRequest = () => {
    startAppListening({
        actionCreator: UserActions.sendFriendRequest,
        effect: async (action, api) => {
            try {
                console.log("Sending friend request:", action.payload);
                const response = await apiService.post<ApiResponse<{ message: string }>>("/profile/send-friend-request", action.payload);
                api.dispatch(UserActions.sendFriendRequestSuccess());
                api.dispatch(ContactActions.removeFromSearchResults(action.payload.receiveId));
                action.payload.callback();
            } catch (error) {
                api.dispatch(UserActions.sendFriendRequestFailure(useErrorResponse(error)));
                action.payload.callback(useErrorResponse(error));
            }
        },
    });
}

const acceptFriendRequest = () => {
    startAppListening({
        actionCreator: UserActions.acceptFriendRequest,
        effect: async (action, api) => {
            try {
                const response = await apiService.post<ApiResponse<{ message: string }>>(`/profile/accept-friend-request/${action.payload.userId}`);
                api.dispatch(UserActions.acceptFriendRequestSuccess(action.payload.userId));
                api.dispatch(ContactActions.removeFromPendingList(action.payload.userId as unknown as number));
                action.payload.callback();
            } catch (error) {
                api.dispatch(UserActions.acceptFriendRequestFailure(useErrorResponse(error)));
                action.payload.callback(useErrorResponse(error));
            }
        },
    });
}

const rejectFriendRequest = () => {
    startAppListening({
        actionCreator: UserActions.rejectFriendRequest,
        effect: async (action, api) => {
            try {
                const response = await apiService.post<ApiResponse<{ message: string }>>(`/profile/reject-friend-request/${action.payload.userId}`);
                api.dispatch(UserActions.rejectFriendRequestSuccess(action.payload.userId as unknown as number));
                api.dispatch(ContactActions.removeFromPendingList(action.payload.userId as unknown as number));
            } catch (error) {
                api.dispatch(UserActions.rejectFriendRequestFailure(useErrorResponse(error)));
                action.payload.callback(useErrorResponse(error));
            }
        },
    });
}


const call = () => {
    startAppListening({
        actionCreator: UserActions.call,
        effect: async (action, api) => {
            try {
                const socket = getSocket();
                if (action.payload.category === 'reject') {
                    api.dispatch(UserActions.clearCall());
                    socket?.emit("call:reject", action.payload);
                } else if (action.payload.category === 'accept') {
                    socket?.emit("call:accept", action.payload);
                } else if (action.payload.category === 'request') {
                    socket?.emit("call:invite", action.payload);
                }
            } catch (error) {
                console.error("Error ending call:", error);
            }
        },
    });
}


export default UserListenerMiddleware;