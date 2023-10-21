import * as React from "react"
import { ReactNode, ReactElement, useReducer } from "react"
import GlobalContext from "./context"
import Reducer from "./reducer"
import State, { initialState as defaultInitialState } from "./state"

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
GlobalStateProvider.defaultProps = {
    initialState: defaultInitialState,
}
