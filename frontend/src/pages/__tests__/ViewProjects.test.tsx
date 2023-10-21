/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { Route, MemoryRouter, useParams } from "react-router-dom"
import { setupServer } from "msw/node"
import { ResponseComposition, rest } from "msw"
import Project, { ProjectType, Term } from "../../models/project"
import ClientOrgType from "../../models/client-org-type"
import ClientOrgShort from "../../models/client-org-short"
import GlobalStateProvider from "../../global-state/provider"
import ViewProjects from "../ViewProjects"
import requestConfig from "../../api/config"

const MockViewProjectPage = (): JSX.Element => {
    const { id } = useParams<{ id: string }>()
    return <div>Viewing project with id {id}</div>
}

const mockClient: ClientOrgShort = {
    id: "1",
    name: "UofA",
    type: ClientOrgType.Academic,
    image: "",
}

const allProjects: Project[] = [
    {
        name: "A Cool Project",
        term: Term.Fall,
        type: ProjectType.Web,
        year: 2021,
        tags: [{ value: "React" }],
    },
    {
        name: "Random Project",
        term: Term.Winter,
        type: ProjectType.Mobile,
        year: 2020,
        tags: [{ value: "React" }, { value: "Java" }],
    },
    {
        name: "Project Sandwiches",
        term: Term.Fall,
        type: ProjectType.Web,
        year: 2019,
        tags: [],
    },
    {
        name: "Coolest Project",
        term: Term.Winter,
        type: ProjectType.Other,
        year: 2018,
        tags: [],
    },
    {
        name: "Threat Level Midnight",
        term: Term.Winter,
        type: ProjectType.Web,
        year: 2018,
        tags: [{ value: "HTML" }, { value: "Java" }],
    },
].map(
    (partialProject, index): Project => ({
        id: `${index}`,
        client_org: mockClient,
        students: [],
        ta: null,
        client_rep: null,
        summary: "",
        video: "",
        tagline: "this is the tagline",
        is_published: true,
        screenshot: "",
        presentation: "",
        review: "",
        website_url: "",
        source_code_url: "",
        logo_url: "",
        storyboard: "",
        ...partialProject,
    })
)

/**
 * Returns an array of the the project cards on the page.
 * @param container `HTMLElement` to search for project cards
 * @returns an array of project card elements
 */
const getReturnedProjectCards = (
    container: HTMLElement
): NodeListOf<HTMLElement> => container.querySelectorAll(".project-card")

/**
 * Returns an array of the IDs of the project cards on the page.
 * @param container `HTMLElement` to search for project cards
 * @returns an array of strings `"project-card-ID"` where ID is the ID for each project in the project cards
 */
const getReturnedProjectIds = (container: HTMLElement): string[] =>
    Array.from(getReturnedProjectCards(container)).map((c) => c.id)

/**
 * @param projects an array of `Project`s
 * @returns an array of strings `"project-card-ID"` where ID is the ID for each project in `project`
 */
const toProjectCardIdList = (projects: Project[]): string[] =>
    projects.map((project) => `project-card-${project.id}`)

/**
 * Renders the `ViewProjects` page inside of a mock router with a `GlobalStateProvider`.
 * @returns the return value of the render function
 */
const renderViewProjectsPage = (): ReturnType<typeof render> =>
    render(
        <GlobalStateProvider>
            <MemoryRouter initialEntries={["/projects"]}>
                <Route path="/projects" exact>
                    <ViewProjects />
                </Route>
                <Route
                    path="/projects/:id"
                    exact
                    component={MockViewProjectPage}
                />
            </MemoryRouter>
        </GlobalStateProvider>
    )

/**
 * Waits for the projects on the page to be finished loading.
 */
const waitForProjectsToFinishLoading = async (): Promise<void> =>
    waitFor(() => {
        screen.getByText(`${allProjects.length} matching projects`)
    })

const getSearchControls = () => {
    const searchInput = screen.getByPlaceholderText("Search")
    const typeSelectButton = screen.getByRole("button", { name: "Type" })
    const termSelectButton = screen.getByRole("button", { name: "Term" })
    const yearSelectButton = screen.getByRole("button", { name: "Year" })
    return { searchInput, typeSelectButton, termSelectButton, yearSelectButton }
}

const server = setupServer(
    rest.get(
        `${requestConfig.baseURL}/projects/`,
        (req, res: ResponseComposition<Project[]>, ctx) =>
            res(ctx.json(allProjects))
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())

it("has working links to project pages", async () => {
    const { container } = renderViewProjectsPage()
    await waitForProjectsToFinishLoading()
    const aProjectCard = getReturnedProjectCards(container)[0]
    const id = aProjectCard.id.split("-").pop()!
    const projectLink = aProjectCard.querySelector("a")
    expect(projectLink).not.toBeNull()
    fireEvent.click(projectLink!)
    await waitFor(() => screen.getByText(`Viewing project with id ${id}`))
})

it("can search project names", async () => {
    const { container } = renderViewProjectsPage()
    await waitForProjectsToFinishLoading()
    const { searchInput } = getSearchControls()
    const searchValue = "cool"
    fireEvent.change(searchInput, { target: { value: searchValue } })

    // Expect only projects with "cool" in their name to be displayed in most recent order
    const projectIds = getReturnedProjectIds(container)
    expect(projectIds).toMatchObject(
        toProjectCardIdList(
            allProjects
                .filter((project) =>
                    project.name.toLowerCase().includes(searchValue)
                )
                .sort((a, b) => b.year - a.year)
        )
    )
})

it("can search project tags", async () => {
    const { container } = renderViewProjectsPage()
    await waitForProjectsToFinishLoading()
    const { searchInput } = getSearchControls()
    const searchValue = "react"
    fireEvent.change(searchInput, { target: { value: searchValue } })

    // Expect only projects with "react" in their tags to be displayed in most recent order
    const projectIds = getReturnedProjectIds(container)
    expect(projectIds).toMatchObject(
        toProjectCardIdList(
            allProjects
                .filter((project) =>
                    JSON.stringify(project.tags)
                        .toLowerCase()
                        .includes(searchValue)
                )
                .sort((a, b) => b.year - a.year)
        )
    )
})

it("can filter by project type", async () => {
    const { container } = renderViewProjectsPage()
    await waitForProjectsToFinishLoading()
    const { typeSelectButton } = getSearchControls()

    // Name of type for no filtering
    const noFilterTypeName = "Type"

    const testFilteringByType = async (type: ProjectType | null) => {
        // Open type filter menu
        fireEvent.mouseDown(typeSelectButton)
        const typeSelectMenu = within(screen.getByRole("listbox"))

        // Click the type option
        fireEvent.click(typeSelectMenu.getByText(type || noFilterTypeName))

        // Assert that the projects are filtered
        const projectIds = getReturnedProjectIds(container)
        expect(projectIds).toMatchObject(
            toProjectCardIdList(
                allProjects
                    .filter((project) => !type || project.type === type)
                    .sort((a, b) => b.year - a.year)
            )
        )

        // Assert that the query parameter for the project type is set
        waitFor(() => {
            const text = `type=${type}`
            if (type !== null) screen.getByText(text)
            else expect(screen.queryByText(text)).toBeNull()
        })
    }

    // Test filtering by each type, and null (no filtering)
    // This needs to run in a for-loop
    // If it runs in an async forEach function, the test will fail due to the
    // testFilteringByType function running in parallel

    // eslint-disable-next-line no-restricted-syntax
    for (const type of [...Object.values(ProjectType), null]) {
        // eslint-disable-next-line no-await-in-loop
        await testFilteringByType(type)
    }
})

it("can filter by project term", async () => {
    const { container } = renderViewProjectsPage()
    await waitForProjectsToFinishLoading()
    const { termSelectButton } = getSearchControls()

    // Name of type for no filtering
    const noFilterTermName = "Term"

    const testFilteringByType = async (term: Term | null) => {
        // Open type filter menu
        fireEvent.mouseDown(termSelectButton)
        const termSelectMenu = within(screen.getByRole("listbox"))

        // Click the term option
        fireEvent.click(termSelectMenu.getByText(term || noFilterTermName))

        // Assert that the projects are filtered
        const projectIds = getReturnedProjectIds(container)
        expect(projectIds).toMatchObject(
            toProjectCardIdList(
                allProjects
                    .filter((project) => !term || project.term === term)
                    .sort((a, b) => b.year - a.year)
            )
        )

        // Assert that the query parameter for the project term is set
        waitFor(() => {
            const text = `term=${term}`
            if (term !== null) screen.getByText(text)
            else expect(screen.queryByText(text)).toBeNull()
        })
    }

    // Test filtering by each term, and null (no filtering)
    // eslint-disable-next-line no-restricted-syntax
    for (const term of [...Object.values(Term), null]) {
        // eslint-disable-next-line no-await-in-loop
        await testFilteringByType(term)
    }
})

afterAll(() => server.close())
