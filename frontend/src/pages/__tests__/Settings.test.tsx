import * as React from "react"
import { render, waitFor, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { MemoryRouter, Route } from "react-router-dom"
import { setupServer } from "msw/node"
import { ResponseComposition, rest } from "msw"
import GlobalStateProvider from "../../global-state/provider"
import State from "../../global-state/state"
import SettingsPage from "../Settings"
import CurrentUserInfo from "../../models/current-user-info"
import { LoginResult } from "../../models/login"
import requestConfig from "../../api/config"
import { MockLoginPage } from "../../test-utils"

/**
 * Renders the Settings page in a router with a GlobalStateProvider.
 * @param initialState initial state to set for the GlobalStateProvider. If undefined, the state will be the default.
 * @returns the return value of the render function
 */
const renderSettingsPage = (initialState?: State) =>
    render(
        <GlobalStateProvider initialState={initialState}>
            <MemoryRouter initialEntries={["/settings"]}>
                <Route path="/settings" exact component={SettingsPage} />
                <Route path="/login" exact component={MockLoginPage} />
                <Route path="/reset-password" exact>
                    Reset password page
                </Route>
            </MemoryRouter>
        </GlobalStateProvider>
    )

const userWithPassword: CurrentUserInfo = {
    logged_in: true,
    is_superuser: false,
    has_password: true,
    id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
    name: "Guy User",
    image: "https://example.com/image.jpg",
}

const userWithoutPassword: CurrentUserInfo = {
    logged_in: true,
    is_superuser: false,
    has_password: false,
    id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
    name: "Guy User",
    image: "https://example.com/image.jpg",
}

const userReturnedAfterLoggingOutOtherSessions: CurrentUserInfo = {
    logged_in: true,
    is_superuser: false,
    has_password: true,
    id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
    name: "Guy User 2",
    image: "https://example.com/image.jpg",
}

const server = setupServer(
    rest.post(
        `${requestConfig.baseURL}/logout-all/`,
        (req, res: ResponseComposition<LoginResult>, ctx) =>
            res(
                ctx.json({
                    success: true,
                    token: "HEREISYOURNEWTOKEN",
                    user: userReturnedAfterLoggingOutOtherSessions,
                })
            )
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())

it("matches snapshot while logged in", async () => {
    const { container } = renderSettingsPage({ currentUser: userWithPassword })
    expect(container).toMatchSnapshot()
})

it("redirects to login page if not logged in", async () => {
    renderSettingsPage()
    screen.getByText("Login page, will redirect to /settings")
})

it("displays correct password information for user with password", async () => {
    renderSettingsPage({ currentUser: userWithPassword })

    screen.getByText("Your account has a password.")
    screen.getByRole("link", { name: "Change Password" })
})

it("displays correct password information for user without password", async () => {
    renderSettingsPage({ currentUser: userWithoutPassword })

    screen.getByText("Your account does not have a password.")
    screen.getByRole("link", { name: "Set Password" })
})

it("navigates user with password to reset password page when clicking change password button", async () => {
    renderSettingsPage({ currentUser: userWithPassword })

    fireEvent.click(screen.getByRole("link", { name: "Change Password" }))
    screen.getByText("Reset password page")
})

it("navigates user without password to reset password page when clicking set password button", async () => {
    renderSettingsPage({ currentUser: userWithoutPassword })

    fireEvent.click(screen.getByRole("link", { name: "Set Password" }))
    screen.getByText("Reset password page")
})

it("handles log out of all other sessions correctly", async () => {
    // Set initial token
    localStorage.setItem("token", "OLDTOKEN")

    // Render the settings page with an arbitrary user
    renderSettingsPage({ currentUser: userWithPassword })

    // Get Logout of All Other Sessions button
    const logoutButton = screen.getByRole("button", {
        name: "Log Out Of All Other Sessions",
    })

    // Click the button
    fireEvent.click(logoutButton)

    // Expect the button to be disabled
    expect(logoutButton).toBeDisabled()

    // Wait for the request to finish
    await waitFor(() =>
        screen.getByText("Successfully logged out of other sessions")
    )

    // Expect the button to be reenabled
    expect(logoutButton).toBeEnabled()

    // Expect the token to be updated
    expect(localStorage.getItem("token")).toBe("HEREISYOURNEWTOKEN")
})

afterAll(() => server.close())
