import { createAction } from "@reduxjs/toolkit";

const USER_ACTIONS = {
    SEND_FRIEND_REQUEST: "SEND_FRIEND_REQUEST",
    ACCEPT_FRIEND_REQUEST: "ACCEPT_FRIEND_REQUEST",
    REJECT_FRIEND_REQUEST: "REJECT_FRIEND_REQUEST",
    SEND_FRIEND_REQUEST_SUCCESS: "SEND_FRIEND_REQUEST_SUCCESS",
    SEND_FRIEND_REQUEST_FAILURE: "SEND_FRIEND_REQUEST_FAILURE",
    ACCEPT_FRIEND_REQUEST_SUCCESS: "ACCEPT_FRIEND_REQUEST_SUCCESS",
    ACCEPT_FRIEND_REQUEST_FAILURE: "ACCEPT_FRIEND_REQUEST_FAILURE",
    REJECT_FRIEND_REQUEST_SUCCESS: "REJECT_FRIEND_REQUEST_SUCCESS",
    REJECT_FRIEND_REQUEST_FAILURE: "REJECT_FRIEND_REQUEST_FAILURE"
};

const UserActions = {
  sendFriendRequest: createAction<{ receiveId: string, message: string, callback: (error?: string) => void }>(USER_ACTIONS.SEND_FRIEND_REQUEST),
  acceptFriendRequest: createAction<{ userId: string, callback: (error?: string) => void }>(USER_ACTIONS.ACCEPT_FRIEND_REQUEST),
  rejectFriendRequest: createAction<{ userId: string, callback: (error?: string) => void }>(USER_ACTIONS.REJECT_FRIEND_REQUEST),
  sendFriendRequestSuccess: createAction(USER_ACTIONS.SEND_FRIEND_REQUEST_SUCCESS),
  sendFriendRequestFailure: createAction<string>(USER_ACTIONS.SEND_FRIEND_REQUEST_FAILURE),
  acceptFriendRequestSuccess: createAction<string>(USER_ACTIONS.ACCEPT_FRIEND_REQUEST_SUCCESS),
  acceptFriendRequestFailure: createAction<string>(USER_ACTIONS.ACCEPT_FRIEND_REQUEST_FAILURE),
  rejectFriendRequestSuccess: createAction<string>(USER_ACTIONS.REJECT_FRIEND_REQUEST_SUCCESS),
  rejectFriendRequestFailure: createAction<string>(USER_ACTIONS.REJECT_FRIEND_REQUEST_FAILURE)
};

export default UserActions;
