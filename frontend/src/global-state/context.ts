import { type Context, createContext, type Dispatch } from "react"
import type Action from "./action"
import type State from "./state"
import { initialState } from "./state"

const GlobalContext: Context<{
    globalState: State
    dispatch: Dispatch<Action>
}> = createContext({ globalState: initialState, dispatch: (_: Action) => {} }) // eslint-disable-line @typescript-eslint/no-unused-vars

export default GlobalContext
