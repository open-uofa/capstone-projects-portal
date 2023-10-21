import { useContext } from "react"
import GlobalContext from "./global-state/context"
import CurrentUserInfo from "./models/current-user-info"

// eslint-disable-next-line import/prefer-default-export
export const useCurrentUser = (): CurrentUserInfo =>
    useContext(GlobalContext).globalState.currentUser
