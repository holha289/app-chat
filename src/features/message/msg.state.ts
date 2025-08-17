import { MsgState } from "../types/msg.type";


const initialMsgState: MsgState = {
  rooms: [],
  messages: {},
  status: 'idle', // or whatever default value fits your app
  message: '',    // default empty string
  error: null     // default null
};

export default initialMsgState;