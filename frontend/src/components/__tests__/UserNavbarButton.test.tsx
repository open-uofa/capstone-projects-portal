/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import { MemoryRouter, Route } from "react-router-dom"
import GlobalStateProvider from "../../global-state/provider"
import State from "../../global-state/state"
import UserNavbarButton from "../UserNavbarButton"
import CurrentUserInfo from "../../models/current-user-info"
import { LoginStatus, MockProfilePage } from "../../test-utils"

/**
 * Renders the UserNavbarButton with a GlobalStateProvider and router.
 * @param initialState initial state to set for the GlobalStateProvider. If undefined, the state will be the default.
 * @returns the return value of the render function
 */
const renderUserNavbarButton = (
    initialState: State & { currentUser: { logged_in: true } }
) =>
    render(
        <GlobalStateProvider initialState={initialState}>
            <MemoryRouter initialEntries={["/"]}>
                <Route path="/" exact>
                    <UserNavbarButton />
                    <LoginStatus />
                </Route>
                <Route path="/profiles/:id" exact component={MockProfilePage} />
                <Route path="/settings" exact>
                    Settings page
                </Route>
                <Route path="/import" exact>
                    Import page
                </Route>
            </MemoryRouter>
        </GlobalStateProvider>
    )

const queryMenuButtons = () => {
    const profileButton = screen.queryByRole("menuitem", { name: "Profile" })
    const adminButton = screen.queryByRole("menuitem", { name: "Admin" })
    const importButton = screen.queryByRole("menuitem", { name: "Import data" })
    const settingsButton = screen.queryByRole("menuitem", { name: "Settings" })
    const logOutButton = screen.queryByRole("menuitem", { name: "Log out" })
    return {
        profileButton,
        adminButton,
        importButton,
        settingsButton,
        logOutButton,
    }
}

const regularUser: CurrentUserInfo = {
    logged_in: true,
    is_superuser: false,
    has_password: true,
    id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
    name: "Guy User",
    image: "https://example.com/image.jpg",
}

const superUser: CurrentUserInfo = {
    logged_in: true,
    is_superuser: true,
    has_password: true,
    id: "1fc66da3-5f63-4dd8-aaac-425a18804cde",
    name: "Super User",
    image: "https://example.com/image.jpg",
}

it("matches snapshot for regular user", async () => {
    const { container } = renderUserNavbarButton({ currentUser: regularUser })
    expect(container).toMatchSnapshot()
})

it("matches snapshot for superuser", async () => {
    const { container } = renderUserNavbarButton({ currentUser: superUser })
    expect(container).toMatchSnapshot()
})

it("matches snapshot for user without image", async () => {
    const { container } = renderUserNavbarButton({
        currentUser: {
            logged_in: true,
            is_superuser: false,
            has_password: true,
            id: "1fc66da3-5f63-4dd8-aaac-425a18804cdf",
            name: "Jeff User",
            image: undefined,
        },
    })
    expect(container).toMatchSnapshot()
})

it("has working profile button in menu", async () => {
    renderUserNavbarButton({ currentUser: regularUser })

    // Click UserNavbarButton
    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Assert that profile button is present
    const { profileButton } = queryMenuButtons()
    expect(profileButton).not.toBeNull()

    // Click profile button
    fireEvent.click(profileButton!)

    // Assert that profile page for current user is rendered
    screen.getByText(`Profile page for ${regularUser.id}`)
})

it("has working settings button in menu", async () => {
    renderUserNavbarButton({ currentUser: regularUser })

    // Click UserNavbarButton
    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Assert that settings button is present
    const { settingsButton } = queryMenuButtons()
    expect(settingsButton).not.toBeNull()

    // Click settings button
    fireEvent.click(settingsButton!)

    // Assert that settings page is rendered
    screen.getByText("Settings page")
})

it("has working log out button in menu", async () => {
    localStorage.setItem("token", "OLDTOKEN")
    renderUserNavbarButton({ currentUser: regularUser })

    // Click UserNavbarButton
    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Assert that log out button is present
    const { logOutButton } = queryMenuButtons()
    expect(logOutButton).not.toBeNull()

    // Click log out button
    fireEvent.click(logOutButton!)

    // Assert that the user is logged out
    screen.getByText("Not logged in")

    // Assert that the token is removed from local storage
    expect(localStorage.getItem("token")).toBeNull()
})

it("has working admin button for superusers", async () => {
    renderUserNavbarButton({ currentUser: superUser })

    // Click UserNavbarButton
    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Assert that admin button is present
    const { adminButton } = queryMenuButtons()
    expect(adminButton).not.toBeNull()

    // Assert that admin button leads to the admin page
    expect(adminButton!).toHaveAttribute(
        "href",
        process.env.REACT_APP_ADMIN_URL ?? "/admin/"
    )
})

it("has working import data button for superusers", async () => {
    renderUserNavbarButton({ currentUser: superUser })

    // Click UserNavbarButton
    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Assert that import data button is present
    const { importButton } = queryMenuButtons()
    expect(importButton).not.toBeNull()

    // Click import data button
    fireEvent.click(importButton!)

    // Assert that import data page is rendered
    screen.getByText("Import page")
})

it("does not have an import data button for regular users", async () => {
    renderUserNavbarButton({ currentUser: regularUser })

    // Click UserNavbarButton
    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Assert that import data button is not present
    const { importButton } = queryMenuButtons()
    expect(importButton).toBeNull()
})

it("does not have an admin button for regular users", async () => {
    renderUserNavbarButton({ currentUser: regularUser })

    // Click UserNavbarButton
    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Assert that admin button is not present
    const { adminButton } = queryMenuButtons()
    expect(adminButton).toBeNull()
})
