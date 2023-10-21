/* eslint-disable react/require-default-props */
import * as React from "react"
import { Redirect } from "react-router-dom"
import { useCurrentUser } from "../hooks"

/**
 * Will render its children if the user is not logged in,
 * and redirect to the home page or specified URL if they are.
 */
export default function RequireNotLoggedIn({
    children,
    redirectTo = "/",
}: {
    children: React.ReactNode
    redirectTo?: string
}): JSX.Element {
    return useCurrentUser().logged_in ? (
        <Redirect to={redirectTo} />
    ) : (
        <>{children}</>
    )
}
