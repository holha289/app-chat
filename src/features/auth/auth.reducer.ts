import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import initialState from "./auth.state";
import authActions from "./auth.action";
import { useResetStateAuth } from "@app/hooks/use-auth";
import { useUpdateStatusFailed, useUpdateStatusPending, useUpdateStatusSuccess } from "@app/hooks/use-state";

const authReducer = createReducer(initialState, (builder) => {
    builder.addCase(authActions.login, (state, action) => useUpdateStatusPending(state));
    builder.addCase(authActions.register, (state, action) => useUpdateStatusPending(state));
    builder.addCase(authActions.updateProfile, (state, action) => useUpdateStatusPending(state));
    builder.addCase(authActions.logout, (state, action) => useResetStateAuth(state));
    builder.addCase(authActions.setFcmToken, (state, action) => {
        state.tokens.fcmToken = action.payload;
        state.error = null;
        state.message = null;
        return state;
    });
    builder.addCase(authActions.clearFcmToken, (state, action) => {
        state.tokens.fcmToken = null;
        state.error = null;
        state.message = null;
        return state;
    });
    builder.addCase(authActions.setTokens, (state, action) => {
        state.tokens = {
            ...state.tokens,
            accessToken: action.payload.accessToken,
            refreshToken: action.payload.refreshToken,
            expiresIn: action.payload.expiresIn,
        };
        state.error = null;
        state.message = null;
        return state;
    });
    builder.addMatcher(
        isAnyOf(
            authActions.registerSuccess, 
            authActions.loginSuccess,
            authActions.updateProfileSuccess
        ),
        (state, action) => useUpdateStatusSuccess(state, action.payload)
    );
    builder.addMatcher(
        isAnyOf(
            authActions.registerFailed, 
            authActions.loginFailed,
            authActions.updateProfileFailed
        ),
        (state, action) => useUpdateStatusFailed(state, action.payload)
    );
});

export { authReducer };
