import { Context, createContext, Dispatch } from "react"
import Action from "./action"
import State, { initialState } from "./state"

const GlobalContext: Context<{
    globalState: State
    dispatch: Dispatch<Action>
}> = createContext({ globalState: initialState, dispatch: (_: Action) => {} }) // eslint-disable-line @typescript-eslint/no-unused-vars

export default GlobalContext
