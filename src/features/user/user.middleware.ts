import { startAppListening } from "@app/store";
import UserActions from "./user.action";
import apiService from "@app/services/api.service";
import { ApiResponse } from "@app/types/response";
import ContactActions from "../contact/contact.action";
import { useErrorResponse } from "@app/hooks/use-error";

const UserListenerMiddleware = () => {
    sendFriendRequest();
    acceptFriendRequest();
    rejectFriendRequest();
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
                api.dispatch(ContactActions.removeFromPendingList(action.payload.userId));
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
                api.dispatch(UserActions.rejectFriendRequestSuccess(action.payload.userId));
                api.dispatch(ContactActions.removeFromPendingList(action.payload.userId));
            } catch (error) {
                api.dispatch(UserActions.rejectFriendRequestFailure(useErrorResponse(error)));
                action.payload.callback(useErrorResponse(error));
            }
        },
    });
}


export default UserListenerMiddleware;