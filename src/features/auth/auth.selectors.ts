import { RootState } from "@app/store";

const selectAuthState = (state: RootState) => state.auth;

const selectIsAuthenticated = (state: RootState) => selectAuthState(state).isAuthenticated;

const selectUser = (state: RootState) => selectAuthState(state).user;

const selectAuthStatus = (state: RootState) => selectAuthState(state).status;

const selectAuthMessage = (state: RootState) => selectAuthState(state).message || null;
const selectAuthError = (state: RootState) => selectAuthState(state).error || null;

const selectAuthLoading = (state: RootState) => selectAuthState(state).status === "pending";
const selectAuthLoaded = (state: RootState) => selectAuthState(state).status === "success" || selectAuthState(state).status === "failed";


export {
    selectAuthState,
    selectIsAuthenticated,
    selectUser,
    selectAuthStatus,
    selectAuthMessage,
    selectAuthLoading,
    selectAuthLoaded,
    selectAuthError
};