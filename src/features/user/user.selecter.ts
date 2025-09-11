import { RootState } from "@app/store";

const selectCall = (state: RootState) => state.user.call;

export {
  selectCall
};