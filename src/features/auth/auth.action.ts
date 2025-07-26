import { createAction } from '@reduxjs/toolkit';
import { LoginPayload, RegisterPayload } from '../types/auth.type';
const AUTH_ACTIONS_TYPE = {
    LOGIN: 'AUTH_LOGIN',
    LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
    LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
    LOGOUT: 'AUTH_LOGOUT',
    REGISTER: 'AUTH_REGISTER'
};

const authActions = {
    login: createAction<LoginPayload>(AUTH_ACTIONS_TYPE.LOGIN),
    loginSuccess: createAction<{ user: any }>(AUTH_ACTIONS_TYPE.LOGIN_SUCCESS),
    loginFailed: createAction<string>(AUTH_ACTIONS_TYPE.LOGIN_FAILED),
    logout: createAction(AUTH_ACTIONS_TYPE.LOGOUT),
    register: createAction<RegisterPayload>(AUTH_ACTIONS_TYPE.REGISTER),
    registerSuccess: createAction<{ user: any }>('AUTH_REGISTER_SUCCESS'),
    registerFailed: createAction<string>('AUTH_REGISTER_FAILED')
};

export default authActions;
