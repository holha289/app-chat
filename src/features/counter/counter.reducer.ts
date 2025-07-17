import { CounterState } from "../types/counter.type"
import initialState from "./counter.state"
import { createReducer } from "@reduxjs/toolkit"
import { counterActions } from "./counter.action"

interface Action {
  type: string
  payload?: any
}

const counterReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(counterActions.increment, (state, action) => {
      state.value++
    })
    .addCase(counterActions.decrement, (state, action) => {
      state.value--
    })
    .addCase(counterActions.incrementByAmount, (state, action) => {
      state.value += action.payload
    })
})

export { counterReducer };