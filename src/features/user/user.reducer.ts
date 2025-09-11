import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import UserState from "./user.state";
import UserActions from "./user.action";
import { useUpdateStatusPending, useUpdateStatusSuccess, useUpdateStatusFailed } from "@app/hooks/use-state";


const resetReceiveState = (state: any) => {
    state.call.receive = {
        incoming: null,
        accepted: null,
        rejected: null
    };
    return state;
};

const resetSendState = (state: any) => {
    state.call.send = {
        calling: null,
        accept: null,
        reject: null
    };
    return state;
};

const userReducer = createReducer(UserState, (builder) => {
    builder.addCase(UserActions.call, (state, action) => {
        state.call = action.payload;
        return state;
    });
    builder.addCase(UserActions.clearCall, (state) => {
        state.call = {
            roomId: "",
            from: null,
            to: null,
            data: null,
            isVideoCall: false,
            category: 'idle'
        };
        return state;
    });
    builder.addMatcher(
        isAnyOf(
            UserActions.sendFriendRequest,
            UserActions.acceptFriendRequest,
            UserActions.rejectFriendRequest
        )
    , (state, action) => useUpdateStatusPending(state));
    builder.addMatcher(
        isAnyOf(
            UserActions.sendFriendRequestSuccess,
            UserActions.acceptFriendRequestSuccess,
            UserActions.rejectFriendRequestSuccess
        )
    , (state, action) => useUpdateStatusSuccess(state, {}));
    builder.addMatcher(
        isAnyOf(
            UserActions.sendFriendRequestFailure,
            UserActions.acceptFriendRequestFailure,
            UserActions.rejectFriendRequestFailure
        )
    , (state, action) => useUpdateStatusFailed(state, action.payload));
})


export default userReducer;
