import * as React from "react"

// import API mocking utilities from Mock Service Worker
import { rest } from "msw"
import { setupServer } from "msw/node"

// import react-testing methods
import { render, fireEvent, waitFor, screen } from "@testing-library/react"

// add custom jest matchers from jest-dom
import "@testing-library/jest-dom"
// the component to test
import { MemoryRouter, Route } from "react-router-dom"
import LoginPage from "../Login"

import {
    LoginResult,
    LoginWithEmailAndPasswordRequest,
} from "../../models/login"
import GlobalStateProvider from "../../global-state/provider"
import State from "../../global-state/state"
import { LoginStatus, MockHomePage } from "../../test-utils"
import requestConfig from "../../api/config"

// Test user data
const userEmail = "user@example.com"
const userPassword = "correctpassword"

// Response returned from /api/login/email/ when the user fails to log in
const unsuccessfulEmailLoginResponse: LoginResult = {
    success: false,
    error: "Incorrect email or password",
}

// Response returned from /api/login/email/ when the user logs in successfully
const successfulEmailLoginResponse: LoginResult = {
    success: true,
    token: "THISISTHETOKEN",
    user: {
        logged_in: true,
        is_superuser: false,
        has_password: true,
        id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
        name: "Guy User",
        image: "https://example.com/image.jpg",
    },
}

// Mock request password reset page
const MockRequestPasswordResetPage = () => (
    <div>Request password reset page</div>
)

// Mock some other page for testing next URL redirection, shows login status
const MockSomeOtherPage = () => (
    <div>
        Some other page
        <LoginStatus />
    </div>
)

const server = setupServer(
    // Mock /api/login/email response
    rest.post(`${requestConfig.baseURL}/login/email/`, (req, res, ctx) => {
        const { email, password } = req.body as LoginWithEmailAndPasswordRequest
        if (email === userEmail && password === userPassword)
            return res(ctx.json(successfulEmailLoginResponse))
        return res(ctx.json(unsuccessfulEmailLoginResponse))
    })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())

/**
 * Render the login page component in a router with a GlobalStateProvider.
 * @param initialState the initial State of the global state. If undefined, it will be the default state.
 * @param nextUrl the next url to navigate to after logging in. If undefined, it will be the default url.
 * @returns return value of the render function
 */
const renderLoginPage = (initialState?: State, nextUrl?: string) => {
    // Render the login page component along with the MockHomePage
    // in a router with a GlobalStateProvider
    const url = `/login${nextUrl ? `?next=${nextUrl}` : ""}`
    const renderReturnValue = render(
        <GlobalStateProvider initialState={initialState}>
            <MemoryRouter initialEntries={[url]}>
                <Route path="/login" exact component={LoginPage} />
                <Route
                    path="/request-password-reset"
                    exact
                    component={MockRequestPasswordResetPage}
                />
                <Route
                    path="/some-other-page"
                    exact
                    component={MockSomeOtherPage}
                />
                <Route path="/" exact component={MockHomePage} />
            </MemoryRouter>
        </GlobalStateProvider>
    )

    return renderReturnValue
}

/**
 * @returns the email, password, and login button elements
 */
const getLoginFormControls = () => {
    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const loginButton = screen.getByRole("button", { name: "Log in" })

    return { emailInput, passwordInput, loginButton }
}

it("matches snapshot", async () => {
    const { container } = renderLoginPage()
    expect(container).toMatchSnapshot()
})

it("focuses email field on load", async () => {
    renderLoginPage()
    const { emailInput } = getLoginFormControls()

    // Check that the email input is focused
    expect(emailInput).toHaveFocus()
})

it("redirects to home page if already logged in and next URL is unspecified", async () => {
    renderLoginPage({
        currentUser: {
            logged_in: true,
            is_superuser: false,
            has_password: true,
            id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
            name: "Guy User",
            image: "https://example.com/image.jpg",
        },
    })

    // Wait for the redirect to the home page
    await waitFor(() => screen.getByText("Home page"))

    // Check that the user is logged in
    expect(screen.getByText("Logged in as Guy User")).toBeInTheDocument()
})

it("redirects to next URL if already logged in and it is specified", async () => {
    renderLoginPage(
        {
            currentUser: {
                logged_in: true,
                is_superuser: false,
                has_password: true,
                id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
                name: "Guy User",
                image: "https://example.com/image.jpg",
            },
        },
        "/some-other-page"
    )

    // Wait for the redirect to some other page
    await waitFor(() => screen.getByText("Some other page"))

    // Check that the user is logged in
    expect(screen.getByText("Logged in as Guy User")).toBeInTheDocument()
})

it("handles successful login with correct email and password and redirects to home page when next URL is unspecified", async () => {
    renderLoginPage()
    const { emailInput, passwordInput, loginButton } = getLoginFormControls()

    // Fill in the email and password fields
    fireEvent.change(emailInput, { target: { value: userEmail } })
    fireEvent.change(passwordInput, { target: { value: userPassword } })

    // Click the login button
    fireEvent.click(loginButton)

    // Assert that the login button is disabled
    expect(loginButton).toBeDisabled()

    // Assert that the home page is shown
    await waitFor(() => screen.getByText("Home page"))

    // Assert that the user is logged in
    expect(screen.getByText("Logged in as Guy User")).toBeInTheDocument()
})

it("handles successful login with correct email and password and redirects to next URL when it is specified", async () => {
    renderLoginPage(undefined, "/some-other-page")
    const { emailInput, passwordInput, loginButton } = getLoginFormControls()

    // Fill in the email and password fields
    fireEvent.change(emailInput, { target: { value: userEmail } })
    fireEvent.change(passwordInput, { target: { value: userPassword } })

    // Click the login button
    fireEvent.click(loginButton)

    // Assert that the login button is disabled
    expect(loginButton).toBeDisabled()

    // Assert that some other page is shown
    await waitFor(() => screen.getByText("Some other page"))

    // Assert that the user is logged in
    expect(screen.getByText("Logged in as Guy User")).toBeInTheDocument()
})

it("handles failed login with incorrect email and password", async () => {
    renderLoginPage()
    const { emailInput, passwordInput, loginButton } = getLoginFormControls()

    // Fill in the email and password fields
    fireEvent.change(emailInput, { target: { value: "wrong@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })

    // Click the login button
    fireEvent.click(loginButton)

    // Assert that the login button is disabled
    expect(loginButton).toBeDisabled()

    // Assert that an error is shown
    await waitFor(() => screen.getByText("Incorrect email or password"))

    // Assert that the login button is reenabled
    expect(loginButton).toBeEnabled()
})

it("displays error when email field is empty", async () => {
    renderLoginPage()
    const { emailInput, passwordInput, loginButton } = getLoginFormControls()

    // Fill in the password field
    fireEvent.change(passwordInput, { target: { value: userPassword } })

    // Click the login button
    fireEvent.click(loginButton)

    // Assert that an error is displayed on the email field
    await waitFor(() => screen.getByText("Email is required"))

    // Assert that the field is marked with aria-invalid and aria-describedby
    expect(emailInput).toHaveAttribute("aria-invalid", "true")
    expect(emailInput).toHaveAttribute("aria-describedby", "email-helper-text")

    // Assert that the login button is still enabled
    expect(loginButton).toBeEnabled()
})

it("displays error when password field is empty", async () => {
    renderLoginPage()
    const { emailInput, passwordInput, loginButton } = getLoginFormControls()

    // Fill in the email field
    fireEvent.change(emailInput, { target: { value: userEmail } })

    // Click the login button
    fireEvent.click(loginButton)

    // Assert that an error is displayed on the password field
    await waitFor(() => screen.getByText("Password is required"))

    // Assert that the field is marked with aria-invalid and aria-describedby
    expect(passwordInput).toHaveAttribute("aria-invalid", "true")
    expect(passwordInput).toHaveAttribute(
        "aria-describedby",
        "password-helper-text"
    )

    // Assert that the login button is still enabled
    expect(loginButton).toBeEnabled()
})

it("displays error when both email and password fields are empty", async () => {
    renderLoginPage()
    const { emailInput, passwordInput, loginButton } = getLoginFormControls()

    // Click the login button
    fireEvent.click(loginButton)

    // Assert that an error is displayed on both fields
    await waitFor(() => screen.getByText("Email is required"))
    await waitFor(() => screen.getByText("Password is required"))

    // Assert that the fields are marked with aria-invalid and aria-describedby
    expect(emailInput).toHaveAttribute("aria-invalid", "true")
    expect(emailInput).toHaveAttribute("aria-describedby", "email-helper-text")
    expect(passwordInput).toHaveAttribute("aria-invalid", "true")
    expect(passwordInput).toHaveAttribute(
        "aria-describedby",
        "password-helper-text"
    )

    // Assert that the login button is still enabled
    expect(loginButton).toBeEnabled()
})

it("redirects to request password reset page when clicking reset password link", async () => {
    renderLoginPage()

    // Click the reset password link
    fireEvent.click(screen.getByRole("link", { name: "Reset password" }))

    // Assert that the request password reset page is shown
    await waitFor(() => screen.getByText("Request password reset page"))
})

afterAll(() => server.close())
