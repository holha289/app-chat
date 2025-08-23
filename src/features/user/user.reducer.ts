import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import UserState from "./user.state";
import UserActions from "./user.action";
import { useUpdateStatusPending, useUpdateStatusSuccess, useUpdateStatusFailed } from "@app/hooks/use-state";


const userReducer = createReducer(UserState, (builder) => {
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
