import { createAction } from "@reduxjs/toolkit";

const COUNTER_ACTION_TYPES = {
  INCREMENT: '@counter/INCREMENT',
  DECREMENT: '@counter/DECREMENT',
  INCREMENT_BY_AMOUNT: '@counter/INCREMENT_BY_AMOUNT',
} as const

const increment = createAction<number>(COUNTER_ACTION_TYPES.INCREMENT);
const decrement = createAction<number>(COUNTER_ACTION_TYPES.DECREMENT);
const incrementByAmount = createAction<number>(COUNTER_ACTION_TYPES.INCREMENT_BY_AMOUNT);

export const counterActions = {
  increment,
  decrement,
  incrementByAmount,
};
