import { RootState } from "@app/store";
import { createSelector } from "@reduxjs/toolkit";

const selectContactState = (state: RootState) => state.contact;

const selectListFriends = createSelector(selectContactState, (state) => state.friends);
const selectListGroups = createSelector(selectContactState, (state) => state.groups);
const selectListPending = createSelector(selectContactState, (state) => state.pending);
const selectListSearchResults = createSelector(selectContactState, (state) => state.searchResults);

const selectContactLoading = createSelector(selectContactState, (state) => state.status === "pending");

export {
    selectListFriends,
    selectListGroups,
    selectListPending,
    selectContactLoading,
    selectListSearchResults
}
