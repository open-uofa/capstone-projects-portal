import CurrentUserInfo from "../models/current-user-info"

type Action = {
    type: "SET_CURRENT_USER"
    value: CurrentUserInfo
}

export default Action
