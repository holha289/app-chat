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
    PENDING_ERROR: 'PENDING_ERROR',
    CREATE_GROUP: 'CREATE_GROUP',
    CREATE_GROUP_SUCCESS: 'CREATE_GROUP_SUCCESS',
    CREATE_GROUP_ERROR: 'CREATE_GROUP_ERROR',
    SEARCH_CONTACT: 'SEARCH_CONTACT',
    SEARCH_CONTACT_SUCCESS: 'SEARCH_CONTACT_SUCCESS',
    SEARCH_CONTACT_ERROR: 'SEARCH_CONTACT_ERROR',
    REMOVE_FROM_PENDING_LIST: 'REMOVE_FROM_PENDING_LIST',
    REMOVE_FROM_SEARCH_RESULTS: 'REMOVE_FROM_SEARCH_RESULTS'
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
  getListPendingError: createAction<string>(CONTACT_ACTIONS_TYPE.PENDING_ERROR),
  createGroup: createAction<{ name: string; userIds: number[], callback: (error?: string) => void }>(CONTACT_ACTIONS_TYPE.CREATE_GROUP),
  createGroupSuccess: createAction(CONTACT_ACTIONS_TYPE.CREATE_GROUP_SUCCESS),
  createGroupError: createAction<string>(CONTACT_ACTIONS_TYPE.CREATE_GROUP_ERROR),
  searchContact: createAction<{ phone: string }>(CONTACT_ACTIONS_TYPE.SEARCH_CONTACT),
  searchContactSuccess: createAction<Friends[]>(CONTACT_ACTIONS_TYPE.SEARCH_CONTACT_SUCCESS),
  searchContactError: createAction<string>(CONTACT_ACTIONS_TYPE.SEARCH_CONTACT_ERROR),
  removeFromPendingList: createAction<number>(CONTACT_ACTIONS_TYPE.REMOVE_FROM_PENDING_LIST),
  removeFromSearchResults: createAction<string>(CONTACT_ACTIONS_TYPE.REMOVE_FROM_SEARCH_RESULTS)
}


export default ContactActions;