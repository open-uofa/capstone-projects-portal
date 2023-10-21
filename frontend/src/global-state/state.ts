import CurrentUserInfo from "../models/current-user-info"

export default interface State {
    currentUser: CurrentUserInfo
}

export const initialState: State = {
    currentUser: { logged_in: false },
}
