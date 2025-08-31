import { createReducer, isAnyOf } from "@reduxjs/toolkit";
import initialMsgState from "./msg.state";
import msgActions from "./msg.action";

// helper: loại trùng theo id (giữ thứ tự gặp trước)
const dedupeById = <T extends { id: string }>(arr: T[]) => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
};

const msgReducer = createReducer(initialMsgState, (builder) => {
  builder
    // ===== ROOMS =====
    .addCase(msgActions.getRoomSuccess, (state, { payload }) => {
      state.rooms = Array.isArray(payload) ? payload : [];

      // đảm bảo mỗi room đều có slot messages
      for (const room of state.rooms) {
        if (!state.messages[room.id]) {
          state.messages[room.id] = {
            items: [],
            nextCursor: null,
            lastMsgId: null,
          };
        }
      }
      // status/error đã xử lý ở matchers
    })

    // ===== MESSAGES (paginate + reset) =====
    .addCase(msgActions.getMsgByRoomSuccess, (state, { payload }) => {
      const { roomId, cursor, message } = payload;
      const items = Array.isArray(message?.items) ? message.items : [];
      const nextCursor = message?.nextCursor ?? null;

      // đảm bảo room tồn tại
      const target =
        state.messages[roomId] ??
        (state.messages[roomId] = {
          items: [],
          nextCursor: null,
          lastMsgId: null,
        });

      const isReset = !cursor; // '', null, undefined => reset
      if (isReset) {
        // thay mới toàn bộ (ví dụ load lần đầu hay refresh)
        target.items = dedupeById(items);
        target.nextCursor = nextCursor;
        return;
      }

      // nếu nextCursor trả về giống hiện tại -> bỏ qua để tránh nạp lại cùng trang
      if (target.nextCursor === nextCursor) return;

      // append phần trang (loại bản ghi trùng id)
      const seen = new Set(target.items.map((m: any) => m.id));
      for (const m of items) {
        if (!seen.has(m.id)) {
          target.items.push(m);
        }
      }
      target.nextCursor = nextCursor;
    })
    .addCase(msgActions.reciverMsgSuccess, (state, { payload }) => {
      const { roomId, message } = payload;
      // console.log("🚀 ~ message:", message)
      // đảm bảo room tồn tại
      const target =
        state.messages[roomId] ??
        (state.messages[roomId] = {
          items: [],
          nextCursor: null,
          lastMsgId: null,
        });

      // chỉ thêm nếu chưa tồn tại id này
      const exists = target.items.find(
        (m) => m.id?.toString() === message.id?.toString(),
      );
      if (!exists) {
        target.items.unshift(message);
      }
      target.lastMsgId = message.id;
    })
    .addCase(msgActions.readMarkSuccess, (state, { payload }) => {
      const { roomId, lastMsgId } = payload;
      // console.log("🚀 ~ payload:", payload);
      // đảm bảo room tồn tại
      const target =
        state.messages[roomId] ??
        (state.messages[roomId] = {
          items: [],
          nextCursor: null,
          lastMsgId: null,
        });
      target.lastMsgId = lastMsgId;
      target.items.forEach((i) => {
        if (i.id == lastMsgId) {
          i.isReadByMe = true;
        }
      });
      const room = state.rooms.find((r) => r.id == roomId);
      // console.log("🚀 ~ room:", room)
      if (room) {
        // set tạm thời
        room.is_read = true;
      }
    })
    .addCase(msgActions.updateLastMsg, (state, { payload }) => {
      const { roomId, message } = payload;
      // console.log("🚀 ~ payload:", payload)
      const room = state.rooms.find((r) => r.id == roomId);
      // console.log("🚀 ~ room:", room)
      if (room) {
        // console.log("Before update:", room);
        room.last_message = message;
        room.is_read = state.messages[roomId]?.lastMsgId == message?.msg_id;
        console.log(
          "After update:",
          state.messages[roomId]?.lastMsgId,
          "  ",
          message?.msg_id,
        );
      } else {
        console.warn("Room not found", roomId);
      }
    })

    // ===== PENDING =====
    .addMatcher(
      isAnyOf(
        msgActions.getRoom,
        msgActions.getMsgByRoom,
        msgActions.sendMsgByRoom,
        msgActions.reciverMsg,
        msgActions.readMark,
      ),
      (state) => {
        state.status = "pending";
        state.error = null;
        state.message = "";
      },
    )

    // ===== FAILED =====
    .addMatcher(
      isAnyOf(
        msgActions.getRoomsFailed, // giữ nguyên tên action như bạn đang dùng
        msgActions.getMsgByRoomFailed,
        msgActions.sendMsgByRoomFailed,
        msgActions.reciverMsgFailed,
        msgActions.readMarkFailed,
      ),
      (state, { payload }) => {
        state.status = "failed";
        state.error = payload;
      },
    )

    // ===== SUCCESS =====
    .addMatcher(
      isAnyOf(
        msgActions.getRoomSuccess,
        msgActions.getMsgByRoomSuccess,
        msgActions.sendMsgByRoomSuccess,
        msgActions.reciverMsgSuccess,
        msgActions.readMarkSuccess,
      ),
      (state) => {
        state.status = "success";
        state.error = null;
      },
    );
});

export default msgReducer;
