import { startAppListening } from "@app/store";
import ContactActions from "./contact.action";
import apiService from "@app/services/api.service";
import { ApiResponse } from "@app/types/response";
import { ContactState } from "../types/contact.type";
import { useErrorResponse } from "@app/hooks/use-error";


const ContactListenerMiddleware = () => {
    getListFriendsRequest();
    getListGroupsRequest();
    getListPendingRequest();
    createGroup();
    searchUserByPhoneNumber();
}


const getListFriendsRequest = () => {
    startAppListening({
        actionCreator: ContactActions.getListFriendsRequest,
        effect: async (action, api) => {
            try {
                const response = await apiService.get<ApiResponse<ContactState['friends']>>("/profile/get-list-friends", action.payload);
                api.dispatch(ContactActions.getListFriendsSuccess(response.metadata));
            } catch (error) {
                api.dispatch(ContactActions.getListFriendsError(useErrorResponse(error)));
            }
        }
    })
}

const getListGroupsRequest = () => {
    startAppListening({
        actionCreator: ContactActions.getListGroupsRequest,
        effect: async (action, api) => {
            try {
                const response = await apiService.get<ApiResponse<ContactState['groups']>>("/profile/get-list-groups", action.payload);
                api.dispatch(ContactActions.getListGroupsSuccess(response.metadata));
            } catch (error) {
                api.dispatch(ContactActions.getListGroupsError(useErrorResponse(error)));
            }
        }
    })
}

const getListPendingRequest = () => {
    startAppListening({
        actionCreator: ContactActions.getListPendingRequest,
        effect: async (action, api) => {
            try {
                const response = await apiService.get<ApiResponse<ContactState['pending']>>("/profile/get-list-pending-friend-requests", action.payload);
                api.dispatch(ContactActions.getListPendingSuccess(response.metadata));
            } catch (error) {
                api.dispatch(ContactActions.getListPendingError(useErrorResponse(error)));
            }
        }
    })
}

const createGroup = () => {
    startAppListening({
        actionCreator: ContactActions.createGroup,
        effect: async (action, api) => {
            try {
                const response = await apiService.post<ApiResponse<ContactState['groups']>>("/profile/create-group", action.payload);
                api.dispatch(ContactActions.createGroupSuccess());
                action.payload.callback();
            } catch (error) {
                api.dispatch(ContactActions.createGroupError(error instanceof Error ? error.message : String(error)));
                action.payload.callback(error instanceof Error ? error.message : String(error));
            }
        }
    })
}

const searchUserByPhoneNumber = () => {
    startAppListening({
        actionCreator: ContactActions.searchContact,
        effect: async (action, api) => {
            try {
                const response = await apiService.get<ApiResponse<ContactState['friends']>>("/profile/find-user-by-phone", {
                   phone: action.payload.phone,
                    type: "all"
                });
                api.dispatch(ContactActions.searchContactSuccess(response.metadata));
            } catch (error) {
                api.dispatch(ContactActions.searchContactError(error instanceof Error ? error.message : String(error)));
            }
        }
    })
}

export default ContactListenerMiddleware;

