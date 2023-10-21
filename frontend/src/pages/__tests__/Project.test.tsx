import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { Route, MemoryRouter, useParams } from "react-router-dom"
import { setupServer } from "msw/node"
import { ResponseComposition, rest } from "msw"
import ProjectPage from "../Project"
import Project, { ProjectType, Term } from "../../models/project"
import ClientOrgType from "../../models/client-org-type"
import ClientOrgShort from "../../models/client-org-short"
import GlobalStateProvider from "../../global-state/provider"
import requestConfig from "../../api/config"

const MockViewClientPage = (): JSX.Element => {
    const { id } = useParams<{ id: string }>()
    return <div>Viewing client with id {id}</div>
}

const MockViewProfilePage = (): JSX.Element => {
    const { id } = useParams<{ id: string }>()
    return <div>Viewing user with id {id}</div>
}

const mockClient: ClientOrgShort = {
    id: "1",
    name: "UofA",
    type: ClientOrgType.Academic,
    image: "",
}
const mockProject: Project = {
    id: "123",
    client_org: mockClient,
    students: [{ id: "abc", name: "Luna Lovegood", image: "" }],
    ta: null,
    client_rep: null,
    tags: [{ value: "React" }],
    name: "A Cool Project",
    summary: "",
    video: "",
    type: ProjectType.Web,
    tagline: "this is the tagline",
    is_published: true,
    year: 2021,
    term: Term.Fall,
    screenshot: "",
    presentation: "",
    review: "",
    website_url: "https://www.google.com/",
    source_code_url: "https://github.com",
    logo_url: "",
    storyboard: "",
}

const renderProjectsPage = (): ReturnType<typeof render> =>
    render(
        <GlobalStateProvider>
            <MemoryRouter initialEntries={["/projects/123"]}>
                <Route path="/projects/123" exact>
                    <ProjectPage />
                </Route>
                <Route
                    path="/clients/:id"
                    exact
                    component={MockViewClientPage}
                />
                <Route
                    path="/profiles/:id"
                    exact
                    component={MockViewProfilePage}
                />
            </MemoryRouter>
        </GlobalStateProvider>
    )

const server = setupServer(
    rest.get(
        `${requestConfig.baseURL}/projects/:id`,
        (req, res: ResponseComposition<Project>, ctx) =>
            res(ctx.json(mockProject))
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())

it("has a working link to project website", async () => {
    renderProjectsPage()

    const websiteButton = await screen.findByRole("button", { name: "Website" })
    window.open = jest.fn()
    fireEvent.click(websiteButton)
    expect(window.open).toBeCalledWith(`https://www.google.com/`, "_blank")
})

it("has a working link to project source code page", async () => {
    renderProjectsPage()

    const sourceCodeButton = await screen.findByRole("button", {
        name: "Source Code",
    })
    window.open = jest.fn()
    fireEvent.click(sourceCodeButton)
    expect(window.open).toBeCalledWith(`https://github.com`, "_blank")
})

it("has a working link to the client page", async () => {
    renderProjectsPage()

    const clientLink = await screen.findByText("UofA")
    fireEvent.click(clientLink)
    await waitFor(() => screen.getByText(`Viewing client with id 1`))
})

it("has working links to student/ta profile pages", async () => {
    renderProjectsPage()

    const studentLink = await screen.findByText("Luna Lovegood")
    fireEvent.click(studentLink)
    await waitFor(() => screen.getByText(`Viewing user with id abc`))
})

afterAll(() => server.close())
