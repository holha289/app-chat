import { createAction } from '@reduxjs/toolkit';
import { LoginPayload, RegisterPayload, tokensType, userType } from '../types/auth.type';
const AUTH_ACTIONS_TYPE = {
    LOGIN: 'AUTH_LOGIN',
    LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
    LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
    LOGOUT: 'AUTH_LOGOUT',
    REGISTER: 'AUTH_REGISTER',
    SET_FCM_TOKEN: 'AUTH_SET_FCM_TOKEN',
    CLEAR_FCM_TOKEN: 'AUTH_CLEAR_FCM_TOKEN',
};

const authActions = {
    login: createAction<LoginPayload>(AUTH_ACTIONS_TYPE.LOGIN),
    loginSuccess: createAction<{ tokens: tokensType, user: userType }>(AUTH_ACTIONS_TYPE.LOGIN_SUCCESS),
    loginFailed: createAction<string>(AUTH_ACTIONS_TYPE.LOGIN_FAILED),
    logout: createAction(AUTH_ACTIONS_TYPE.LOGOUT),
    register: createAction<RegisterPayload>(AUTH_ACTIONS_TYPE.REGISTER),
    registerSuccess: createAction<{ tokens: tokensType, user: userType }>('AUTH_REGISTER_SUCCESS'),
    registerFailed: createAction<string>('AUTH_REGISTER_FAILED'),
    setFcmToken: createAction<string>('AUTH_SET_FCM_TOKEN'),
    clearFcmToken: createAction('AUTH_CLEAR_FCM_TOKEN'),
};

export default authActions;
