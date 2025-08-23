import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import ContactActions from "./contact.action";
import { useUpdateStatusFailed, useUpdateStatusPending, useUpdateStatusSuccess } from "@app/hooks/use-state";
import contactState from './contact.state';

const ContactReducer = createReducer(contactState, (builder) => {
    builder.addCase(ContactActions.removeFromPendingList, (state, action) => {
        const userAcceptIndex = state.pending.findIndex(user => user.id === action.payload);
        if (userAcceptIndex !== -1) {
            const userAccept = state.pending[userAcceptIndex];
            // Remove user from pending list
            state.pending.splice(userAcceptIndex, 1);
            // Add to friends list
            state.friends.push(userAccept as any);
        }
        return state;
    });
    builder.addCase(ContactActions.removeFromSearchResults, (state, action) => {
        const searchResultIndex = state.searchResults.findIndex(user => user.id === Number(action.payload));
        if (searchResultIndex !== -1) {
            state.searchResults.splice(searchResultIndex, 1);
        }
        return state;
    });
    builder.addMatcher(
        isAnyOf(
            ContactActions.getListFriendsRequest,
            ContactActions.getListGroupsRequest,
            ContactActions.getListBlockedRequest,
            ContactActions.getListPendingRequest,
            ContactActions.createGroup,
            ContactActions.searchContact
        ),
        (state, action) => useUpdateStatusPending(state));
    builder.addMatcher(
        isAnyOf(
            ContactActions.getListFriendsSuccess,
            ContactActions.getListGroupsSuccess,
            ContactActions.getListBlockedSuccess,
            ContactActions.getListPendingSuccess,
            ContactActions.createGroupSuccess,
            ContactActions.searchContactSuccess
        ),
        (state, action) => {
            if (action.type === ContactActions.getListFriendsSuccess.type) {
                return useUpdateStatusSuccess(state, {
                    friends: action.payload,
                });
            } else if (action.type === ContactActions.getListGroupsSuccess.type) {
                return useUpdateStatusSuccess(state, {
                    groups: action.payload,
                });
            } else if (action.type === ContactActions.getListBlockedSuccess.type) {
                return useUpdateStatusSuccess(state, {
                    blocked: action.payload,
                });
            } else if (action.type === ContactActions.getListPendingSuccess.type) {
                return useUpdateStatusSuccess(state, {
                    pending: action.payload,
                });
            } else if (action.type === ContactActions.createGroupSuccess.type) {
                return useUpdateStatusSuccess(state, {
                    groups: [...state.groups, action.payload],
                });
            } else if (action.type === ContactActions.searchContactSuccess.type) {
                return useUpdateStatusSuccess(state, {
                    searchResults: action.payload,
                });
            }
            return state;
        });
    builder.addMatcher(
        isAnyOf(
            ContactActions.getListFriendsError,
            ContactActions.getListGroupsError,
            ContactActions.getListBlockedError,
            ContactActions.getListPendingError,
            ContactActions.createGroupError,
            ContactActions.searchContactError
        ),
        (state, action) => useUpdateStatusFailed(state, action.payload));
});


export { ContactReducer};