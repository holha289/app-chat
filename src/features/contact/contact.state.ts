import { type ContactState } from "../types/contact.type";


const ContactState: ContactState = {
    groups: [],
    friends: [],
    pending: [],
    blocked: [],
    status: "idle",
    message: null,
    error: null
}


export default ContactState;