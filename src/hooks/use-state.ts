import { StateCore } from "@app/features/types";



export const useUpdateStatusPending = (state: StateCore): any => {
   return {
       ...state,
       status: "pending",
       error: null,
       message: null
   }
}; 

export const useUpdateStatusSuccess = (state: StateCore, data: any, message: string | null = null): any => {
    return {
        ...state,
        status: "success",
        error: null,
        message,
        ...data
    }
}

export const useUpdateStatusFailed = (state: StateCore, error: any): any => {
    return {
        ...state,
        status: "failed",
        error: error,
        message: null
    }
}