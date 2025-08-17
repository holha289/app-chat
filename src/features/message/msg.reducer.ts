import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import initialMsgState from "./msg.state";
import msgActions from "./msg.action";

const msgReducer = createReducer(initialMsgState, (builder) => {
  builder.addCase(msgActions.getRoom, (state, action) => {
    state.rooms = [];
    state.status = "pending";
    state.error = null;
    state.message = "";
    return state;
  });
    builder.addCase(msgActions.getMsgByRoom, (state, action) => {
    // state.isAuthenticated = false;
    // state.user = null;
    state.status = "pending";
    state.message = null;
    return state;
  });
  builder.addMatcher(isAnyOf(msgActions.getRoomSuccess), (state, action) => {
    state.rooms = action.payload;
    state.rooms.forEach((room) => {
      if (!state.messages[room.id]) {
        state.messages[room.id] = {
          items: [],
          nextCursor: null,
        };
      }
      state.messages[room.id] = {
        items: [],
        nextCursor: null,
      };
    });
    state.status = "success";
    state.error = null;
    state.message = "";
    return state;
  });
  builder.addMatcher(isAnyOf(msgActions.getRoomsFailed), (state, action) => {
    state.status = "failed";
    state.error = action.payload;
    state.message = "";
    return state;
  });

  builder.addMatcher(
    isAnyOf(msgActions.getMsgByRoomSuccess),
    (state, action) => {
      state.messages[action.payload.roomId] = action.payload.message;
      state.status = "success";
      state.error = null;
      state.message = "";
      return state;
    },
  );
  builder.addMatcher(
    isAnyOf(msgActions.getMsgByRoomFailed),
    (state, action) => {
      state.status = "failed";
      state.error = action.payload;
      state.message = "";
      return state;
    },
  );
});
export default msgReducer;
