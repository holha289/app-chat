import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import initialState from "./auth.state";
import authActions from "./auth.action";


const authReducer = createReducer(initialState, (builder) => {
    builder.addCase(authActions.login, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = "pending";
        state.message = null;
        return state;
    });
    builder.addCase(authActions.register, (state, action) => {
        state.status = "pending";
        state.message = null;
        return state;
    });
    builder.addCase(authActions.logout, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = "idle";
        state.message = null;
        return state;
    });
    builder.addCase(authActions.setFcmToken, (state, action) => {
        state.tokens.fcmToken = action.payload;
        return state;
    });
    builder.addMatcher(
        isAnyOf(authActions.registerSuccess, authActions.loginSuccess),
        (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.tokens = action.payload.tokens;
            state.status = "success";
            return state;
        }
    );
    builder.addMatcher(
        isAnyOf(authActions.registerFailed, authActions.loginFailed),
        (state, action) => {
            state.isAuthenticated = false;
            state.user = null;
            state.status = "failed";
            state.error = action.payload;
            return state;
        }
    );
});

export { authReducer };
