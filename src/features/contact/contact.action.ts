import { createAction } from "@reduxjs/toolkit";
import { Blocked, Friends, Groups, Pending } from "../types/contact.type";

const CONTACT_ACTIONS_TYPE = {
    FRIENDS_REQUEST: 'FRIENDS_REQUEST',
    FRIENDS_SUCCESS: 'FRIENDS_SUCCESS',
    FRIENDS_ERROR: 'FRIENDS_ERROR',
    GROUPS_REQUEST: 'GROUPS_REQUEST',
    GROUPS_SUCCESS: 'GROUPS_SUCCESS',
    GROUPS_ERROR: 'GROUPS_ERROR',
    BLOCKED_REQUEST: 'BLOCKED_REQUEST',
    BLOCKED_SUCCESS: 'BLOCKED_SUCCESS',
    BLOCKED_ERROR: 'BLOCKED_ERROR',
    PENDING_REQUEST: 'PENDING_REQUEST',
    PENDING_SUCCESS: 'PENDING_SUCCESS',
    PENDING_ERROR: 'PENDING_ERROR'
};

const ContactActions = {
  getListFriendsRequest: createAction(CONTACT_ACTIONS_TYPE.FRIENDS_REQUEST),
  getListFriendsSuccess: createAction<Friends[]>(CONTACT_ACTIONS_TYPE.FRIENDS_SUCCESS),
  getListFriendsError: createAction<string>(CONTACT_ACTIONS_TYPE.FRIENDS_ERROR),
  getListGroupsRequest: createAction(CONTACT_ACTIONS_TYPE.GROUPS_REQUEST),
  getListGroupsSuccess: createAction<Groups[]>(CONTACT_ACTIONS_TYPE.GROUPS_SUCCESS),
  getListGroupsError: createAction<string>(CONTACT_ACTIONS_TYPE.GROUPS_ERROR),
  getListBlockedRequest: createAction(CONTACT_ACTIONS_TYPE.BLOCKED_REQUEST),
  getListBlockedSuccess: createAction<Blocked[]>(CONTACT_ACTIONS_TYPE.BLOCKED_SUCCESS),
  getListBlockedError: createAction<string>(CONTACT_ACTIONS_TYPE.BLOCKED_ERROR),
  getListPendingRequest: createAction(CONTACT_ACTIONS_TYPE.PENDING_REQUEST),
  getListPendingSuccess: createAction<Pending[]>(CONTACT_ACTIONS_TYPE.PENDING_SUCCESS),
  getListPendingError: createAction<string>(CONTACT_ACTIONS_TYPE.PENDING_ERROR)
}


export default ContactActions;