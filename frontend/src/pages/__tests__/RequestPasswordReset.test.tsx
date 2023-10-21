import React from "react"
import "@testing-library/jest-dom"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route } from "react-router-dom"
import { rest, RestRequest } from "msw"
import { setupServer } from "msw/node"
import GlobalStateProvider from "../../global-state/provider"
import State from "../../global-state/state"
import RequestPasswordReset from "../RequestPasswordReset"
import requestConfig from "../../api/config"
import { RequestPasswordResetRequest } from "../../models/login"

const renderRequestPasswordResetPage = (initialState?: State) =>
    render(
        <GlobalStateProvider initialState={initialState}>
            <MemoryRouter initialEntries={["/request-password-reset"]}>
                <Route
                    path="/request-password-reset"
                    exact
                    component={RequestPasswordReset}
                />
            </MemoryRouter>
        </GlobalStateProvider>
    )

const getFormControls = () => ({
    emailInput: screen.getByLabelText("Email address"),
    submitButton: screen.getByRole("button", {
        name: "Request Password Reset",
    }),
})

let lastReceivedRequestEmail: string | undefined

const server = setupServer(
    rest.post(
        `${requestConfig.baseURL}/request-password-reset/`,
        (req: RestRequest<RequestPasswordResetRequest>, res, ctx) => {
            lastReceivedRequestEmail = req.body.email
            return res(ctx.json({ success: true }))
        }
    )
)

beforeAll(() => server.listen())
afterEach(() => {
    server.resetHandlers()
    lastReceivedRequestEmail = undefined
})

it("submits a request to reset the password", async () => {
    renderRequestPasswordResetPage()
    const { emailInput, submitButton } = getFormControls()

    const emailAddress = "testuser@example.com"

    // Enter email address
    fireEvent.change(emailInput, { target: { value: emailAddress } })

    // Submit form
    fireEvent.click(submitButton)

    // Assert that the form controls are gone
    await waitFor(() => {
        expect(emailInput).not.toBeInTheDocument()
        expect(submitButton).not.toBeInTheDocument()
    })

    // Check that the confirmation message is shown
    await waitFor(() => screen.getByText("Success"))

    // Check that the request was received on the server
    await waitFor(() => expect(lastReceivedRequestEmail).toBe(emailAddress))
})

it("displays error on empty or invalid email address", async () => {
    renderRequestPasswordResetPage()
    const { emailInput, submitButton } = getFormControls()

    // Try to submit empty form
    fireEvent.click(submitButton)

    // Check that an error message is shown on the email input
    await waitFor(() => {
        expect(emailInput).toBeInvalid()
        expect(emailInput).toHaveAccessibleDescription(
            "Email address is required"
        )
    })

    // Enter invalid email address
    fireEvent.change(emailInput, { target: { value: "invalid" } })

    // Try to submit invalid form
    fireEvent.click(submitButton)

    // Check that an error message is shown on the email input
    await waitFor(() => {
        expect(emailInput).toBeInvalid()
        expect(emailInput).toHaveAccessibleDescription("Invalid email address")
    })
})

afterAll(() => server.close())
