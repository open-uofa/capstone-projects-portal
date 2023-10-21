/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route } from "react-router-dom"
import { ResponseComposition, rest, RestRequest } from "msw"
import { setupServer } from "msw/node"
import GlobalStateProvider from "../../global-state/provider"
import State from "../../global-state/state"
import requestConfig from "../../api/config"
import ResetPasswordPage from "../ResetPassword"
import { ResetPasswordRequest, ResetPasswordResult } from "../../models/login"
import CurrentUserInfo from "../../models/current-user-info"
import { LoginStatus, MockLoginPage } from "../../test-utils"

const renderResetPasswordPage = ({
    initialState,
    key,
}: {
    initialState?: State
    key?: string
}) =>
    render(
        <GlobalStateProvider initialState={initialState}>
            <MemoryRouter initialEntries={[`/reset-password/${key ?? ""}`]}>
                <Route
                    path="/reset-password/:key?"
                    exact
                    component={ResetPasswordPage}
                />
                <Route path="/" exact>
                    Home page
                    <LoginStatus />
                </Route>
                <Route path="/settings" exact>
                    Settings page
                    <LoginStatus />
                </Route>
                <Route path="/login" exact component={MockLoginPage} />
            </MemoryRouter>
        </GlobalStateProvider>
    )

const getFormControls = () => ({
    currentPasswordInput: screen.queryByLabelText("Current password"),
    newPasswordInput: screen.getByLabelText("New password"),
    confirmNewPasswordInput: screen.getByLabelText("Confirm new password"),
    submitButton: screen.getByRole("button", { name: "Change Password" }),
})

const CORRECT_CURRENT_PASSWORD = "correctCurrentPassword"
const CORRECT_RESET_KEY = "correctResetKey"
const INVALID_NEW_PASSWORD = "invalid"

type LoggedInUserWithIndeterminatePassword = Omit<
    CurrentUserInfo & { logged_in: true },
    "has_password"
>
const CURRENT_USER_INFO: LoggedInUserWithIndeterminatePassword = {
    logged_in: true,
    is_superuser: false,
    id: "5e9f8f8f-e9b5-4f7f-b8e2-f9f8f8f8f8f8",
    name: "Test User",
}

const NEW_TOKEN = "newToken"
const INVALID_NEW_PASSWORD_ERROR_MESSAGE = "That is a bad password"

const server = setupServer(
    rest.post(
        `${requestConfig.baseURL}/reset-password/`,
        (
            req: RestRequest<ResetPasswordRequest>,
            res: ResponseComposition<ResetPasswordResult>,
            ctx
        ) => {
            if (req.body.newPassword === INVALID_NEW_PASSWORD) {
                return res(
                    ctx.status(400),
                    ctx.json({
                        success: false,
                        error: INVALID_NEW_PASSWORD_ERROR_MESSAGE,
                    })
                )
            }

            if ("resetKey" in req.body) {
                if (req.body.resetKey !== CORRECT_RESET_KEY) {
                    return res(
                        ctx.status(400),
                        ctx.json({
                            success: false,
                            error: "Invalid reset key",
                        })
                    )
                }
            } else if ("currentPassword" in req.body) {
                if (req.body.currentPassword !== CORRECT_CURRENT_PASSWORD) {
                    return res(
                        ctx.status(400),
                        ctx.json({
                            success: false,
                            error: "Incorrect current password",
                        })
                    )
                }
            }

            return res(
                ctx.json({
                    success: true,
                    token: NEW_TOKEN,
                    user: { ...CURRENT_USER_INFO, has_password: true },
                })
            )
        }
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())

it("resets the password for logged out user using correct reset key", async () => {
    renderResetPasswordPage({ key: CORRECT_RESET_KEY })
    const {
        currentPasswordInput,
        newPasswordInput,
        confirmNewPasswordInput,
        submitButton,
    } = getFormControls()

    // Assert that the current password input is not shown
    expect(currentPasswordInput).toBeNull()

    // Enter the new password
    fireEvent.change(newPasswordInput, { target: { value: "newPassword" } })
    fireEvent.change(confirmNewPasswordInput, {
        target: { value: "newPassword" },
    })

    // Submit the form
    fireEvent.click(submitButton)

    // Assert that the submit button is disabled
    expect(submitButton).toBeDisabled()

    // Wait to be redirected to the home page
    await waitFor(() =>
        expect(screen.getByText("Home page")).toBeInTheDocument()
    )

    // Assert that the user is logged in with the new token and current user info
    expect(screen.getByText("Logged in as Test User")).toBeInTheDocument()
    expect(localStorage.getItem("token")).toBe(NEW_TOKEN)
})

it("sets the password for logged in user without existing password", async () => {
    renderResetPasswordPage({
        initialState: {
            currentUser: { ...CURRENT_USER_INFO, has_password: false },
        },
    })
    const {
        currentPasswordInput,
        newPasswordInput,
        confirmNewPasswordInput,
        submitButton,
    } = getFormControls()

    // Assert that the current password input is not shown
    expect(currentPasswordInput).toBeNull()

    // Enter the new password
    fireEvent.change(newPasswordInput, { target: { value: "newPassword" } })
    fireEvent.change(confirmNewPasswordInput, {
        target: { value: "newPassword" },
    })

    // Submit the form
    fireEvent.click(submitButton)

    // Assert that the submit button is disabled
    expect(submitButton).toBeDisabled()

    // Wait to be redirected to the settings page
    await waitFor(() =>
        expect(screen.getByText("Settings page")).toBeInTheDocument()
    )

    // Assert that the user is logged in with the new token and current user info
    expect(screen.getByText("Logged in as Test User")).toBeInTheDocument()
    expect(localStorage.getItem("token")).toBe(NEW_TOKEN)
})

it("resets the password for logged in user using correct current password", async () => {
    renderResetPasswordPage({
        initialState: {
            currentUser: { ...CURRENT_USER_INFO, has_password: true },
        },
    })
    const {
        currentPasswordInput,
        newPasswordInput,
        confirmNewPasswordInput,
        submitButton,
    } = getFormControls()

    // Assert that the current password input is shown
    expect(currentPasswordInput).not.toBeNull()

    // Enter the current password
    fireEvent.change(currentPasswordInput!, {
        target: { value: CORRECT_CURRENT_PASSWORD },
    })

    // Enter the new password
    fireEvent.change(newPasswordInput, { target: { value: "newPassword" } })
    fireEvent.change(confirmNewPasswordInput, {
        target: { value: "newPassword" },
    })

    // Submit the form
    fireEvent.click(submitButton)

    // Assert that the submit button is disabled
    expect(submitButton).toBeDisabled()

    // Wait to be redirected to the settings page
    await waitFor(() =>
        expect(screen.getByText("Settings page")).toBeInTheDocument()
    )

    // Assert that the user is logged in with the new token and current user info
    expect(screen.getByText("Logged in as Test User")).toBeInTheDocument()
    expect(localStorage.getItem("token")).toBe(NEW_TOKEN)
})

it("displays error on missing current password", async () => {
    renderResetPasswordPage({
        initialState: {
            currentUser: { ...CURRENT_USER_INFO, has_password: true },
        },
    })
    const {
        currentPasswordInput,
        newPasswordInput,
        confirmNewPasswordInput,
        submitButton,
    } = getFormControls()

    // Enter the new password
    fireEvent.change(newPasswordInput, { target: { value: "newPassword" } })
    fireEvent.change(confirmNewPasswordInput, {
        target: { value: "newPassword" },
    })

    // Submit the form
    fireEvent.click(submitButton)

    // Assert that an error is displayed
    await waitFor(() => {
        expect(currentPasswordInput).toBeInvalid()
        expect(currentPasswordInput).toHaveAccessibleDescription(
            "Current password is required"
        )
    })
})

it("displays error on missing new password", async () => {
    renderResetPasswordPage({
        initialState: {
            currentUser: { ...CURRENT_USER_INFO, has_password: true },
        },
    })
    const {
        currentPasswordInput,
        newPasswordInput,
        confirmNewPasswordInput,
        submitButton,
    } = getFormControls()

    // Enter the current password
    fireEvent.change(currentPasswordInput!, {
        target: { value: CORRECT_CURRENT_PASSWORD },
    })

    // Submit the form
    fireEvent.click(submitButton)

    // Assert that an error is displayed
    await waitFor(() => {
        expect(newPasswordInput).toBeInvalid()
        expect(newPasswordInput).toHaveAccessibleDescription(
            "New password is required"
        )
        expect(confirmNewPasswordInput).toBeInvalid()
        expect(confirmNewPasswordInput).toHaveAccessibleDescription(
            "Confirm new password is required"
        )
    })
})

it("displays error on non-matching new passwords", async () => {
    renderResetPasswordPage({
        initialState: {
            currentUser: { ...CURRENT_USER_INFO, has_password: true },
        },
    })
    const {
        currentPasswordInput,
        newPasswordInput,
        confirmNewPasswordInput,
        submitButton,
    } = getFormControls()

    // Enter the current password
    fireEvent.change(currentPasswordInput!, {
        target: { value: CORRECT_CURRENT_PASSWORD },
    })

    // Enter non-matching new passwords
    fireEvent.change(newPasswordInput, { target: { value: "newPassword" } })
    fireEvent.change(confirmNewPasswordInput, {
        target: { value: "nonMatchingNewPassword" },
    })

    // Submit the form
    fireEvent.click(submitButton)

    // Assert that an error is displayed
    await waitFor(() => {
        expect(confirmNewPasswordInput).toBeInvalid()
        expect(confirmNewPasswordInput).toHaveAccessibleDescription(
            "Passwords must match"
        )
    })
})

it("displays error from server", async () => {
    renderResetPasswordPage({
        initialState: {
            currentUser: { ...CURRENT_USER_INFO, has_password: true },
        },
    })
    const {
        currentPasswordInput,
        newPasswordInput,
        confirmNewPasswordInput,
        submitButton,
    } = getFormControls()

    // Enter the current password
    fireEvent.change(currentPasswordInput!, {
        target: { value: CORRECT_CURRENT_PASSWORD },
    })

    // Enter an invalid new password
    fireEvent.change(newPasswordInput, {
        target: { value: INVALID_NEW_PASSWORD },
    })
    fireEvent.change(confirmNewPasswordInput, {
        target: { value: INVALID_NEW_PASSWORD },
    })

    // Submit the form
    fireEvent.click(submitButton)

    // Assert that an error from the server is displayed
    await waitFor(() => {
        screen.getByText(INVALID_NEW_PASSWORD_ERROR_MESSAGE)
    })
})

afterAll(() => server.close())
