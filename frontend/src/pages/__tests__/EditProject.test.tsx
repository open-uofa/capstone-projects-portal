import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Route, MemoryRouter, useParams } from "react-router-dom"
// import API mocking utilities from Mock Service Worker
import { ResponseComposition, rest, RestRequest } from "msw"
import { setupServer } from "msw/node"
// add custom jest matchers from jest-dom
import "@testing-library/jest-dom/extend-expect"
import Project, { Term, ProjectType } from "../../models/project"
import ClientOrgShort from "../../models/client-org-short"
import ClientOrgType from "../../models/client-org-type"
import EditProject from "../EditProject"
import GlobalStateProvider from "../../global-state/provider"
import requestConfig from "../../api/config"
import CurrentUserInfo from "../../models/current-user-info"
import State from "../../global-state/state"

const client: ClientOrgShort = {
    id: "23",
    name: "Tester Client",
    image: "https://example.com/image.jpg",
    type: ClientOrgType.CSL,
}

const projectTest: Project = {
    id: "1",
    client_org: client,
    students: [],
    ta: null,
    client_rep: null,
    tags: [
        {
            value: "Xcode",
        },
        {
            value: "Python",
        },
        {
            value: "Sugar",
        },
    ],
    name: "Project Test",
    summary: "This is the project that I was talking about. Did you not know?",
    video: "",
    type: ProjectType.Mobile,
    tagline: "This is the tagline",
    is_published: true,
    year: 2023,
    term: Term.Fall,
    screenshot: "https://example.com/image.jpg",
    presentation: "",
    review: "This is a test project",
    website_url: "",
    source_code_url: "",
    logo_url: "",
    storyboard: "",
}
const userWithPassword: CurrentUserInfo = {
    logged_in: true,
    is_superuser: true,
    has_password: true,
    id: "1fc66da3-5f63-4dd8-aaac-425a18804cdc",
    name: "Guy User",
    image: "https://example.com/image.jpg",
}

const MockViewProjectPage = (): JSX.Element => {
    const { id } = useParams<{ id: string }>()
    return <div>Viewing project with id {id}</div>
}

const renderPage = (initialState?: State) =>
    render(
        <GlobalStateProvider initialState={initialState}>
            <MemoryRouter initialEntries={["/projects/1/edit"]}>
                <Route
                    path="/projects/:id/edit"
                    exact
                    component={EditProject}
                />
                <Route
                    path="/projects/:id"
                    exact
                    component={MockViewProjectPage}
                />
            </MemoryRouter>
        </GlobalStateProvider>
    )

const server = setupServer(
    rest.get(
        `${requestConfig.baseURL}/projects/${projectTest.id}/`,
        (req, res: ResponseComposition<Project>, ctx) =>
            res(ctx.json(projectTest))
    ),
    rest.patch(
        `${requestConfig.baseURL}/projects/${projectTest.id}/`,
        (req: RestRequest<FormData>, res, ctx) =>
            res(
                ctx.json({
                    success: true,
                })
            )
    ),
    rest.get("https://example.com/image.jpg", (req, res, ctx) =>
        res(ctx.text(""))
    )
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
/**
 * @returns form controls for the edit field
 */
const getFormControl = () => {
    const nameInput = screen.getByLabelText("Name")
    const taglineInput = screen.getByLabelText("Tagline")
    const summaryInput = screen.getByLabelText("Summary")
    const screenCastInput = screen.getByLabelText("Screencast Link")
    const presentationInput = screen.getByLabelText("Presentation Link")
    const reviewInput = screen.getByLabelText("Client Review")
    const websiteInput = screen.getByLabelText("Website Link")
    const sourceCodeInput = screen.getByLabelText("Source Code Link")
    const logoLinkInput = screen.getByLabelText("Logo Link")
    const submitButton = screen.getByRole("button", {
        name: "Submit",
    })
    return {
        nameInput,
        taglineInput,
        summaryInput,
        screenCastInput,
        presentationInput,
        reviewInput,
        websiteInput,
        sourceCodeInput,
        logoLinkInput,
        submitButton,
    }
}

test("Renders page without crashing", async () => {
    renderPage({ currentUser: userWithPassword })
    await waitFor(() => {
        screen.getByText("Edit Project Page")
    })
})

test("Check if forms fields have default values set", async () => {
    const { container } = renderPage({ currentUser: userWithPassword })
    await waitFor(() => {
        const {
            nameInput,
            taglineInput,
            summaryInput,
            screenCastInput,
            presentationInput,
            reviewInput,
            websiteInput,
            sourceCodeInput,
            logoLinkInput,
        } = getFormControl()
        expect(nameInput).toHaveValue(projectTest.name)
        expect(taglineInput).toHaveValue(projectTest.tagline)
        expect(summaryInput).toHaveValue(projectTest.summary)
        expect(screenCastInput).toHaveValue(projectTest.video)
        expect(presentationInput).toHaveValue(projectTest.presentation)
        expect(reviewInput).toHaveValue(projectTest.review)
        expect(websiteInput).toHaveValue(projectTest.website_url)
        expect(sourceCodeInput).toHaveValue(projectTest.source_code_url)
        expect(logoLinkInput).toHaveValue(projectTest.logo_url)

        expect(container.querySelector("#screenshot-image")).toHaveAttribute(
            "src",
            projectTest.screenshot
        )
    })
})

test("Inputing works for the forms fields", async () => {
    renderPage({ currentUser: userWithPassword })
    await waitFor(() => {
        screen.getByText("Edit Project Page")
        const { websiteInput, sourceCodeInput, logoLinkInput } =
            getFormControl()
        expect(websiteInput).toHaveValue("")
        fireEvent.change(websiteInput, {
            target: { value: "some website url" },
        })
        expect(websiteInput).toHaveValue("some website url")
        fireEvent.change(sourceCodeInput, {
            target: { value: "source code url" },
        })
        fireEvent.change(logoLinkInput, { target: { value: "logo link url" } })
    })
})

test("Check for upload button", async () => {
    renderPage({ currentUser: userWithPassword })
    await waitFor(() => {
        screen.getByText("Screenshot")
        expect(screen.getByRole("button", { name: "Upload" }))
    })
})

test("Check for Tags", async () => {
    renderPage({ currentUser: userWithPassword })
    await waitFor(() => {
        screen.getByText("Tags")
        screen.getByText("Xcode")
        screen.getByText("Sugar")
        screen.getByText("Python")

        // find the input field for adding tags
        screen.getByPlaceholderText("Press enter to add new tag")
    })
})

test("Redirects to Viewing Page after submitting", async () => {
    renderPage({ currentUser: userWithPassword })
    await waitFor(() => {
        const { nameInput } = getFormControl()
        expect(nameInput).toHaveValue("Project Test")
    })
    const { submitButton } = getFormControl()
    fireEvent.click(submitButton)
    await waitFor(() => {
        screen.getByText("Viewing project with id 1")
    })
})

afterAll(() => server.close())
