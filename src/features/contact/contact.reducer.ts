import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import ContactState from "./contact.state";
import ContactActions from "./contact.action";
import { useUpdateStatusFailed, useUpdateStatusPending, useUpdateStatusSuccess } from "@app/hooks/use-state";

const ContactReducer = createReducer(ContactState, (builder) => {
    builder.addMatcher(
        isAnyOf(
            ContactActions.getListFriendsRequest,
            ContactActions.getListGroupsRequest,
            ContactActions.getListBlockedRequest,
            ContactActions.getListPendingRequest
        ),
        (state, action) => useUpdateStatusPending(state));
    builder.addMatcher(
        isAnyOf(
            ContactActions.getListFriendsSuccess,
            ContactActions.getListGroupsSuccess,
            ContactActions.getListBlockedSuccess,
            ContactActions.getListPendingSuccess
        ),
        (state, action) => useUpdateStatusSuccess(state, action.payload));
    builder.addMatcher(
        isAnyOf(
            ContactActions.getListFriendsError,
            ContactActions.getListGroupsError,
            ContactActions.getListBlockedError,
            ContactActions.getListPendingError
        ),
        (state, action) => useUpdateStatusFailed(state, action.payload));
});
