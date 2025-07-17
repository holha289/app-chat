import { RootState } from '@app/store'

export const selectCount = (state: RootState) => state.counter.value;
export const selectCounterLoading = (state: RootState) => state.counter.status === 'pending';
export const selectCounterError = (state: RootState) => state.counter.error;
export const selectCounterState = (state: RootState) => state.counter;
