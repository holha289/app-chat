import { StateCore } from "@app/features/types"

export interface CounterState extends StateCore {
    value: number
}