import { MsgState } from "../types/msg.type";


const initialMsgState: MsgState = {
  rooms: [],
  messages:{}, // sử dụng Map để lưu trữ messages
  status: 'idle', // or whatever default value fits your app
  message: '',    // default empty string
  error: null     // default null
};

export default initialMsgState;