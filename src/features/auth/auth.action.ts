import { createAction } from '@reduxjs/toolkit';
import { LoginPayload, RegisterPayload, tokensType, userType } from '../types/auth.type';
const AUTH_ACTIONS_TYPE = {
    LOGIN: 'AUTH_LOGIN',
    LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
    LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
    LOGOUT: 'AUTH_LOGOUT',
    REGISTER: 'AUTH_REGISTER',
    REGISTER_SUCCESS: 'AUTH_REGISTER_SUCCESS',
    REGISTER_FAILED: 'AUTH_REGISTER_FAILED',
    SET_FCM_TOKEN: 'AUTH_SET_FCM_TOKEN',
    CLEAR_FCM_TOKEN: 'AUTH_CLEAR_FCM_TOKEN',
    UPDATE_PROFILE: 'AUTH_UPDATE_PROFILE',
    UPDATE_PROFILE_SUCCESS: 'AUTH_UPDATE_PROFILE_SUCCESS',
    UPDATE_PROFILE_FAILED: 'AUTH_UPDATE_PROFILE_FAILED',
};

const authActions = {
    login: createAction<LoginPayload>(AUTH_ACTIONS_TYPE.LOGIN),
    loginSuccess: createAction<{ tokens: tokensType, user: userType }>(AUTH_ACTIONS_TYPE.LOGIN_SUCCESS),
    loginFailed: createAction<string>(AUTH_ACTIONS_TYPE.LOGIN_FAILED),
    logout: createAction(AUTH_ACTIONS_TYPE.LOGOUT),
    register: createAction<RegisterPayload>(AUTH_ACTIONS_TYPE.REGISTER),
    registerSuccess: createAction<{ tokens: tokensType, user: userType }>(AUTH_ACTIONS_TYPE.REGISTER_SUCCESS),
    registerFailed: createAction<string>(AUTH_ACTIONS_TYPE.REGISTER_FAILED),
    setFcmToken: createAction<string>(AUTH_ACTIONS_TYPE.SET_FCM_TOKEN),
    clearFcmToken: createAction(AUTH_ACTIONS_TYPE.CLEAR_FCM_TOKEN),
    updateProfile: createAction<{ user: Omit<userType, 'id' | 'avatar' | 'slug' | 'dateOfBirth'>, callback: () => void }>(AUTH_ACTIONS_TYPE.UPDATE_PROFILE),
    updateProfileSuccess: createAction<{ user: userType }>(AUTH_ACTIONS_TYPE.UPDATE_PROFILE_SUCCESS),
    updateProfileFailed: createAction<string>(AUTH_ACTIONS_TYPE.UPDATE_PROFILE_FAILED),
};

export default authActions;
