/* eslint-disable react/require-default-props */
import { Alert, Container } from "@mui/material"
import * as React from "react"
import { Redirect, useLocation } from "react-router-dom"
import { useCurrentUser } from "../hooks"
import CurrentUserInfo from "../models/current-user-info"

/**
 * Will render its children if the user is logged in, and redirect to the login page if not.
 * The login page will redirect back to the current URL if the user successfully logs in.
 *
 * Optionally, a function `validate` can be specified that will further validate the logged in user.
 * If the function does not return true, an error will be displayed instead of the children.
 * If the function is not specified, any logged in user will be allowed.
 *
 * @param props.as the function to use to validate the user, or undefined if no validation is needed
 */
export default function RequireLoggedIn({
    children,
    validate = undefined,
}: {
    children: React.ReactNode
    validate?: (currentUser: CurrentUserInfo & { logged_in: true }) => boolean
}): JSX.Element {
    const location = useLocation()
    const currentUser = useCurrentUser()

    if (!currentUser.logged_in) {
        // User is not logged in, redirect to login page
        return <Redirect to={`/login?next=${location.pathname}`} />
    }

    if (!validate || validate(currentUser)) {
        // User is logged in as a valid user, render children
        return <>{children}</>
    }

    // User is logged in as an invalid user, display error
    return (
        <Container maxWidth="sm">
            <Alert severity="error" sx={{ mt: 4 }}>
                <p>You are not authorized to view this page.</p>
            </Alert>
        </Container>
    )
}
