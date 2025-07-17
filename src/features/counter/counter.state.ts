import { CounterState } from "../types/counter.type";

const initialState: CounterState = {
  value: 0,
  status: 'pending',
  error: null
}

export default initialState;