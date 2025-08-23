import { disconnectSocket, getSocket, initSocket } from "@app/core/socketIo";
import { RootState, store } from "@app/store";

export const useSockerIo = () => {
  const socket = getSocket();

  const connectSocket = () => { initSocket(getAccessToken() || ""); };

  const disconnect = () => {
    disconnectSocket();
  };

  return {
    socket,
    connectSocket,
    disconnect,
  };
}


function getAccessToken(): string | null {
    const state: RootState = store.getState();
    return state.auth.tokens?.accessToken || null;
}
