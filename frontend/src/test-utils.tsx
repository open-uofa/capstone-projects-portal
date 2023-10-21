import * as React from "react"
import { useLocation, useParams } from "react-router-dom"
import { screen, waitFor } from "@testing-library/react"
import { useCurrentUser } from "./hooks"

/**
 * Component to display the login status of the user
 */
export const LoginStatus = (): JSX.Element => {
    const currentUser = useCurrentUser()
    return (
        <div>
            {currentUser.logged_in
                ? `Logged in as ${currentUser.name}`
                : "Not logged in"}
        </div>
    )
}

/**
 * Mock home page that shows the login status
 */
export const MockHomePage = (): JSX.Element => (
    <div>
        Home page
        <LoginStatus />
    </div>
)

/**
 * Mock profile page that shows user ID
 */
export const MockProfilePage = (): JSX.Element => {
    const { id } = useParams<{ id: string }>()
    return <div>Profile page for {id}</div>
}

/**
 * Component that displays each query parameter in a list of "key=value" pairs
 * Requires the use of the `useLocation` hook
 */
export const QueryParamsDisplay = (): JSX.Element => {
    const { search } = useLocation()
    const params = new URLSearchParams(search)
    return (
        <div>
            <ul>
                {Array.from(params.entries()).map(([key, value]) => (
                    <li key={key}>
                        {key}={value}
                    </li>
                ))}
            </ul>
        </div>
    )
}

/**
 * Waits for a query parameter `name` to be set to `value`, or unset.
 * Requires a `QueryParamsDisplay` component to be rendered on the screen.
 * @param name the name of the query parameter
 * @param value the value of the query parameter, or `null` if it should not be present
 */
export const waitForQueryParam = async (
    name: string,
    value: string | null
): Promise<void> =>
    waitFor(() => {
        const text = `${name}=${value}`
        if (value !== null) screen.getByText(text)
        else expect(screen.queryByText(text)).toBeNull()
    })

/**
 * Mock login page that shows where it will redirect to after login
 */
export const MockLoginPage = (): JSX.Element => {
    const location = useLocation()
    const next = new URLSearchParams(location.search).get("next") ?? "/"
    return <div>Login page, will redirect to {next}</div>
}
