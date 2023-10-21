import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { Route, MemoryRouter } from "react-router-dom"
// import API mocking utilities from Mock Service Worker
import { rest } from "msw"
import { setupServer } from "msw/node"

import Proposal from "../Proposal"
import ThankYou from "../ThankYou"
import GlobalStateProvider from "../../global-state/provider"
import requestConfig from "../../api/config"

const server = setupServer(
    rest.post(`${requestConfig.baseURL}/proposals`, (req, res, ctx) =>
        res(ctx.json("Good job"))
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
/**
 * Render the proposal page component in a router with a GlobalStateProvider.
 * @param pageUrl the next url to navigate to after submitting a proposal. If undefined, it will be the default url.
 * @returns return value of the render function
 */
const renderPages = (nextUrl?: string) => {
    const url = `/proposal${nextUrl ? `?next=${nextUrl}` : ""}`
    render(
        <GlobalStateProvider>
            <MemoryRouter initialEntries={[url]}>
                <Route path="/proposal" exact component={Proposal} />
                <Route path="/thankyou" exact component={ThankYou} />
            </MemoryRouter>
        </GlobalStateProvider>
    )
}

/**
 * @returns the name, email, project description, and submit button
 */
const getProposalFormControls = () => {
    const nameInput = screen.getByLabelText("Name *")
    const emailInput = screen.getByLabelText("Email *")
    const projectInfoInput = screen.getByLabelText(
        "Tell us about your project *"
    )
    const submitProposalButton = screen.getByRole("button", { name: "Submit" })
    return { nameInput, emailInput, projectInfoInput, submitProposalButton }
}

test("Render proposal without crashing", async () => {
    renderPages()
    expect(
        screen.getByText("Want us to build you an app or web app?")
    ).toBeInTheDocument()
})

test("Entering information works in the input fields", async () => {
    renderPages()
    const { nameInput, emailInput, projectInfoInput } =
        getProposalFormControls()
    expect(nameInput).toHaveValue("")
    fireEvent.change(nameInput, { target: { value: "Student" } })
    expect(nameInput).toHaveValue("Student")
    expect(emailInput).toHaveValue("")
    fireEvent.change(emailInput, {
        target: { value: "some@email.com" },
    })
    expect(emailInput).toHaveValue("some@email.com")
    expect(projectInfoInput).toHaveValue("")
    fireEvent.change(projectInfoInput, {
        target: { value: "Some project information" },
    })
    expect(projectInfoInput).toHaveValue("Some project information")
})

test("Check if email field gives error for bad input", async () => {
    renderPages()
    const { emailInput, submitProposalButton } = getProposalFormControls()
    fireEvent.change(emailInput, {
        target: { value: "some@email" },
    })
    fireEvent.click(submitProposalButton)
    await waitFor(() => screen.getByText("email must be a valid email"))
    expect(emailInput).toHaveAttribute("aria-invalid", "true")
    expect(emailInput).toHaveAttribute("aria-describedby", "email-helper-text")
})
test("Check if project info box gives error for less information about a project", async () => {
    renderPages()
    const { projectInfoInput, submitProposalButton } = getProposalFormControls()
    fireEvent.change(projectInfoInput, {
        target: { value: "this information" },
    })
    fireEvent.click(submitProposalButton)
    await waitFor(() =>
        screen.getByText(
            "Please tell us more about your project (20 characters minimum)"
        )
    )
    expect(projectInfoInput).toHaveAttribute("aria-invalid", "true")
    expect(projectInfoInput).toHaveAttribute(
        "aria-describedby",
        "project_info-helper-text"
    )
})
test("Display errors on input fields when submit button is clicked without any input", async () => {
    renderPages()
    const { nameInput, emailInput, projectInfoInput, submitProposalButton } =
        getProposalFormControls()
    fireEvent.click(submitProposalButton)

    await waitFor(() => screen.getByText("Your name is required"))
    await waitFor(() => screen.getByText("Your email is required"))
    await waitFor(() =>
        screen.getByText(
            "Please tell us more about your project (20 characters minimum)"
        )
    )
    expect(nameInput).toHaveAttribute(
        "aria-describedby",
        "rep_name-helper-text"
    )
    expect(emailInput).toHaveAttribute("aria-describedby", "email-helper-text")
    expect(projectInfoInput).toHaveAttribute(
        "aria-describedby",
        "project_info-helper-text"
    )
})
test("Submitting proposal works with the correct information", async () => {
    renderPages("/thankyou")
    const { nameInput, emailInput, projectInfoInput, submitProposalButton } =
        getProposalFormControls()

    fireEvent.change(nameInput, { target: { value: "Test Jack" } })
    fireEvent.change(emailInput, {
        target: { value: "goodmemes@email.com" },
    })
    fireEvent.change(projectInfoInput, {
        target: {
            value: "Some information will be going in here to make sure that the test passes",
        },
    })
    fireEvent.click(submitProposalButton)
    await waitFor(() => screen.getByText("Thank you."))
})
afterAll(() => server.close())
