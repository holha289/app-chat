import { RootState } from "@app/store";

const selectAuthState = (state: RootState) => state.auth;

const selectIsAuthenticated = (state: RootState) => selectAuthState(state).isAuthenticated;

const selectUser = (state: RootState) => selectAuthState(state).user;

const selectAuthStatus = (state: RootState) => selectAuthState(state).status;

const selectAuthError = (state: RootState) => selectAuthState(state).error;


export {
    selectAuthState,
    selectIsAuthenticated,
    selectUser,
    selectAuthStatus,
    selectAuthError
};