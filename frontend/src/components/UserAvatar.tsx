import { Avatar } from "@mui/material"
import * as React from "react"
import UserShort from "../models/user-short"

export default function UserAvatar(props: {
    user: UserShort | null
}): JSX.Element {
    const { user } = props
    if (!user) return <Avatar />

    let { image: profileImage } = user
    if (!profileImage && user.github_user_id) {
        profileImage = `https://avatars.githubusercontent.com/u/${user.github_user_id}`
    }

    return (
        <Avatar alt={user.name} src={profileImage}>
            {user.name[0]}
        </Avatar>
    )
}
