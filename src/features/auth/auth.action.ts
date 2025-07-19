import { createAction } from '@reduxjs/toolkit';
import { LoginPayload } from '../types/auth.type';
const AUTH_ACTIONS_TYPE = {
    LOGIN: 'AUTH_LOGIN',
    LOGOUT: 'AUTH_LOGOUT',
    REGISTER: 'AUTH_REGISTER'
};

const authActions = {
    login: createAction<LoginPayload>(AUTH_ACTIONS_TYPE.LOGIN),
    logout: createAction(AUTH_ACTIONS_TYPE.LOGOUT),
    register: createAction(AUTH_ACTIONS_TYPE.REGISTER)
};

export default authActions;
