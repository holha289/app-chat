import { StateCore } from "../types";


const UserState: StateCore & {
    friendRequestPending: []
} = {
    friendRequestPending: [],
    status: "idle",
    message: null,
    error: null
}

export default UserState;