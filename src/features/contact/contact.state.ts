import { type ContactState } from "../types/contact.type";


const contactState: ContactState = {
    groups: [],
    friends: [],
    pending: [],
    blocked: [],
    searchResults: [],
    status: "idle",
    message: null,
    error: null
}


export default contactState;