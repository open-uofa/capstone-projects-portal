import { type ReactElement, type ReactNode, useReducer } from "react"
import GlobalContext from "./context"
import Reducer from "./reducer"
import type State from "./state"
import { initialState as defaultInitialState } from "./state"

export default function GlobalStateProvider({
    children,
    initialState = defaultInitialState,
}: {
    children: ReactNode
    initialState?: State
}): ReactElement {
    const [globalState, dispatch] = useReducer(Reducer, initialState)

    return (
        <GlobalContext.Provider value={{ globalState, dispatch }}>
            {children}
        </GlobalContext.Provider>
    )
}
