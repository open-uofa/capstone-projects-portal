import * as React from "react"
import { render, waitFor, screen, fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom"
import { MemoryRouter, Route } from "react-router-dom"
import { ResponseComposition, rest, RestRequest } from "msw"
import { setupServer } from "msw/node"
import GlobalStateProvider from "../../global-state/provider"
import ActivatePage from "../Activate"
import State from "../../global-state/state"
import { MockHomePage } from "../../test-utils"
import { ActivateRequest, LoginResult } from "../../models/login"
import requestConfig from "../../api/config"

/**
 * Renders the Activate page in a router with a GlobalStateProvider.
 * @param key key to activate with
 * @param initialState initial state to set for the GlobalStateProvider. If undefined, the state will be the default.
 * @returns the return value of the render function
 */
const renderActivatePage = (key: string, initialState?: State) => {
    const url = `/activate/${key}`
    return render(
        <GlobalStateProvider initialState={initialState}>
            <MemoryRouter initialEntries={[url]}>
                <Route path="/activate/:key" exact component={ActivatePage} />
                <Route path="/" exact component={MockHomePage} />
            </MemoryRouter>
        </GlobalStateProvider>
    )
}

/**
 * @returns the password, confirm password, and submit button of the Activate page
 */
const getActivateFormControls = () => {
    const passwordInput = screen.getByLabelText("New password")
    const confirmPasswordInput = screen.getByLabelText("Confirm new password")
    const activateButton = screen.getByRole("button", { name: "Activate" })
    return { passwordInput, confirmPasswordInput, activateButton }
}

const VALID_KEY = "12345"
const INVALID_PASSWORD = "1"
const TOKEN = "HEREISYOURTOKEN"

const successResponse: LoginResult = {
    success: true,
    token: TOKEN,
    user: {
        logged_in: true,
        is_superuser: false,
        has_password: true,
        id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
        name: "Guy User",
        image: "https://example.com/image.jpg",
    },
}
const invalidActivationKeyResponse: LoginResult = {
    success: false,
    error: "Invalid activation key",
}
const invalidNewPasswordResponse: LoginResult = {
    success: false,
    error: "Invalid new password",
}

const server = setupServer(
    // Mock /api/activate endpoint
    rest.post(
        `${requestConfig.baseURL}/activate/`,
        (
            req: RestRequest<ActivateRequest>,
            res: ResponseComposition<LoginResult>,
            ctx
        ) => {
            const { activationKey, newPassword } = req.body as ActivateRequest
            if (activationKey !== VALID_KEY)
                return res(
                    ctx.status(400),
                    ctx.json(invalidActivationKeyResponse)
                )
            if (newPassword === INVALID_PASSWORD)
                return res(
                    ctx.status(400),
                    ctx.json(invalidNewPasswordResponse)
                )
            return res(ctx.json(successResponse))
        }
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())

it("matches snapshot", async () => {
    const { container } = renderActivatePage(VALID_KEY)
    expect(container).toMatchSnapshot()
})

it("redirects to home page if logged in", async () => {
    renderActivatePage(VALID_KEY, {
        currentUser: {
            logged_in: true,
            is_superuser: false,
            has_password: true,
            id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
            name: "Guy User",
            image: "https://example.com/image.jpg",
        },
    })

    // Assert that the user is redirected to the home page
    screen.getByText("Home page")
})

it("redirects to home page and logs the user in on successful activation", async () => {
    renderActivatePage(VALID_KEY)
    const { passwordInput, confirmPasswordInput, activateButton } =
        getActivateFormControls()

    // Fill in the form
    fireEvent.change(passwordInput, {
        target: { value: "thisismynewpassword" },
    })
    fireEvent.change(confirmPasswordInput, {
        target: { value: "thisismynewpassword" },
    })

    // Submit the form
    fireEvent.click(activateButton)

    // Assert that the activate button is disabled
    expect(activateButton).toBeDisabled()

    // Wait for the user to be redirected to the home page
    await waitFor(() => screen.getByText("Home page"))
})

it("shows an error if the activation key is invalid", async () => {
    renderActivatePage("invalidkey")
    const { passwordInput, confirmPasswordInput, activateButton } =
        getActivateFormControls()

    // Fill in the form
    fireEvent.change(passwordInput, {
        target: { value: "thisismynewpassword" },
    })
    fireEvent.change(confirmPasswordInput, {
        target: { value: "thisismynewpassword" },
    })

    // Submit the form
    fireEvent.click(activateButton)

    // Assert that the activate button is disabled
    expect(activateButton).toBeDisabled()

    // Wait for the error to be displayed
    await waitFor(() => screen.getByText("Invalid activation key"))

    // Assert that the activate button is reenabled
    expect(activateButton).toBeEnabled()
})

it("shows an error if the new password is invalid", async () => {
    renderActivatePage(VALID_KEY)
    const { passwordInput, confirmPasswordInput, activateButton } =
        getActivateFormControls()

    // Fill in the form
    fireEvent.change(passwordInput, { target: { value: INVALID_PASSWORD } })
    fireEvent.change(confirmPasswordInput, {
        target: { value: INVALID_PASSWORD },
    })

    // Submit the form
    fireEvent.click(activateButton)

    // Assert that the activate button is disabled
    expect(activateButton).toBeDisabled()

    // Wait for the error to be displayed
    await waitFor(() => screen.getByText("Invalid new password"))

    // Assert that the activate button is reenabled
    expect(activateButton).toBeEnabled()
})

it("shows an error if the new password and confirm password do not match", async () => {
    renderActivatePage(VALID_KEY)
    const { passwordInput, confirmPasswordInput, activateButton } =
        getActivateFormControls()

    // Fill in the form
    fireEvent.change(passwordInput, {
        target: { value: "thisismynewpassword" },
    })
    fireEvent.change(confirmPasswordInput, {
        target: { value: "thisisnotmynewpassword" },
    })

    // Submit the form
    fireEvent.click(activateButton)

    // Wait for the error to be displayed
    await waitFor(() => screen.getByText("Passwords must match"))

    // Assert that the confirm password input is marked as invalid and has an error message
    expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true")
    expect(confirmPasswordInput).toHaveAttribute(
        "aria-describedby",
        "confirmPassword-helper-text"
    )
})

it("shows an error if the password inputs empty", async () => {
    renderActivatePage(VALID_KEY)
    const { passwordInput, confirmPasswordInput, activateButton } =
        getActivateFormControls()

    // Submit the form
    fireEvent.click(activateButton)

    // Wait for the error to be displayed on the password input
    await waitFor(() => screen.getByText("New password is required"))

    // Assert that the confirm password input error is displayed as well
    screen.getByText("Confirm new password is required")

    // Assert that the password input is marked as invalid and has thane error message
    expect(passwordInput).toHaveAttribute("aria-invalid", "true")
    expect(passwordInput).toHaveAttribute(
        "aria-describedby",
        "newPassword-helper-text"
    )

    // Assert that the confirm password input is marked as invalid and has an error message
    expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true")
    expect(confirmPasswordInput).toHaveAttribute(
        "aria-describedby",
        "confirmPassword-helper-text"
    )
})

afterAll(() => server.close())
