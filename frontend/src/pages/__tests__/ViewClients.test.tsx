/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from "react"
import {
    render,
    fireEvent,
    screen,
    within,
    waitFor,
} from "@testing-library/react"
import { MemoryRouter, Route, useParams } from "react-router-dom"
import { setupServer } from "msw/node"
import { ResponseComposition, rest } from "msw"
import GlobalStateProvider from "../../global-state/provider"
import ViewClientsPage from "../ViewClients"
import ClientOrg from "../../models/client-org"
import ClientOrgType from "../../models/client-org-type"
import ProjectShort from "../../models/project-short"
import { ProjectType, Term } from "../../models/project"
import { QueryParamsDisplay, waitForQueryParam } from "../../test-utils"
import requestConfig from "../../api/config"

const MockViewClientPage = (): JSX.Element => {
    const { id } = useParams<{ id: string }>()
    return <div>Viewing client with id {id}</div>
}

const projectAboutFood: ProjectShort = {
    id: "p1",
    tags: [{ value: "Yummy" }],
    name: "Cool Project About Food",
    tagline: "This is a cool project about food. Enjoy",
    year: 2021,
    term: Term.Fall,
    logo_url: "",
    type: ProjectType.Web,
}

const projectAboutRocks: ProjectShort = {
    id: "p2",
    tags: [{ value: "Rocky" }],
    name: "Cool Project About Rocks",
    tagline: "This is a cool project about rocks. Have fun",
    year: 2020,
    term: Term.Spring,
    logo_url: "",
    type: ProjectType.Web,
}

const projectAboutBeetles: ProjectShort = {
    id: "p3",
    tags: [{ value: "Beetle" }, { value: "Not at all yummy" }],
    name: "Cool Project About Beetles",
    tagline: "This is a cool project about beetles. Sound good?",
    year: 2019,
    term: Term.Winter,
    logo_url: "",
    type: ProjectType.Other,
}

const projectAboutSandpaper: ProjectShort = {
    id: "p4",
    tags: [{ value: "Sandpaper" }],
    name: "Cool Project About Sandpaper",
    tagline: "This is a cool project about sandpaper. It's a good idea",
    year: 2018,
    term: Term.Summer,
    logo_url: "",
    type: ProjectType.Other,
}

const allClients: ClientOrg[] = [
    {
        name: "Organization Number One",
        about: "we are the best organization",
        type: ClientOrgType.Startup,
    },
    {
        name: "Organization Number Two",
        about: "we are also all about sandwiches",
        projects: [projectAboutSandpaper],
        type: ClientOrgType.Academic,
    },
    {
        name: "Organization of Sandwiches",
        about: "we are all about sandwiches",
        projects: [projectAboutFood],
        type: ClientOrgType.CSL,
    },
    {
        name: "thebiggestclient",
        about: "we are by far the largest client",
        projects: [projectAboutBeetles, projectAboutRocks],
        type: ClientOrgType.Nonprofit,
    },
    {
        name: "A Big Client",
        about: "we are a large client",
        type: ClientOrgType.Other,
    },
    {
        name: "Small Place",
        about: "we are quite miniscule",
        type: ClientOrgType.Nonprofit,
    },
    {
        name: "Big Place",
        about: "we are not miniscule at all",
        type: ClientOrgType.Academic,
    },
].map(
    (partialClient, index): ClientOrg => ({
        id: `${index}`,
        image: `http://example.com/image${index}.png`,
        testimonial: "",
        projects: [],
        reps: [],
        website_link: "",
        ...partialClient,
    })
)

/**
 * Returns an array of the the client cards on the page.
 * @param container `HTMLElement` to search for client cards
 * @returns an array of client card elements
 */
const getReturnedClientCards = (
    container: HTMLElement
): NodeListOf<HTMLElement> => container.querySelectorAll(".client-card")

/**
 * Returns an array of the IDs of the client cards on the page.
 * @param container `HTMLElement` to search for client cards
 * @returns an array of strings `"client-card-ID"` where ID is the ID for each client in the client cards
 */
const getReturnedClientIds = (container: HTMLElement): string[] =>
    Array.from(getReturnedClientCards(container)).map((c) => c.id)

/**
 * @param clients an array of `ClientOrg`s
 * @returns an array of strings `"client-card-ID"` where ID is the ID for each client in `clients`
 */
const toClientCardIdList = (clients: ClientOrg[]): string[] =>
    clients.map((client) => `client-card-${client.id}`)

/**
 * Renders the `ViewClients` page inside of a mock router with a `GlobalStateProvider`.
 * @returns the return value of the render function
 */
const renderViewClientsPage = (): ReturnType<typeof render> =>
    render(
        <GlobalStateProvider>
            <MemoryRouter initialEntries={["/clients"]}>
                <Route path="/clients" exact>
                    <ViewClientsPage />
                    <QueryParamsDisplay />
                </Route>
                <Route
                    path="/clients/:id"
                    exact
                    component={MockViewClientPage}
                />
                <Route path="/proposal" exact>
                    Submit proposal page
                </Route>
            </MemoryRouter>
        </GlobalStateProvider>
    )

/**
 * Waits for the clients on the page to be finished loading.
 */
const waitForClientsToFinishLoading = async (): Promise<void> =>
    waitFor(() => {
        screen.getByText(`${allClients.length} matching clients`)
    })

const getSearchControls = () => {
    const searchInput = screen.getByPlaceholderText("Search")
    const typeSelectButton = screen.getByRole("button", { name: "Type" })
    const reverseSortButton = screen.getByRole("switch", {
        name: "Sort in Ascending Order",
    })
    return { searchInput, typeSelectButton, reverseSortButton }
}

const server = setupServer(
    rest.get(
        `${requestConfig.baseURL}/orgs/`,
        (req, res: ResponseComposition<ClientOrg[]>, ctx) =>
            res(ctx.json(allClients))
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())

it("has working links to client pages", async () => {
    const { container } = renderViewClientsPage()
    await waitForClientsToFinishLoading()
    const firstClientCard = getReturnedClientCards(container)[0]
    const id = firstClientCard.id.split("-").pop()!
    const clientLink = firstClientCard.querySelector("a")
    expect(clientLink).not.toBeNull()
    fireEvent.click(clientLink!)
    await waitFor(() => screen.getByText(`Viewing client with id ${id}`))
})

it("changes search query parameter on search change", async () => {
    renderViewClientsPage()
    await waitForClientsToFinishLoading()
    const { searchInput } = getSearchControls()
    const searchValue = "test"
    fireEvent.change(searchInput, { target: { value: searchValue } })
    await waitForQueryParam("search", searchValue)
})

it("displays all clients in correct order", async () => {
    const { container } = renderViewClientsPage()
    await waitForClientsToFinishLoading()

    // Expect clients to appear in alphabetical order by name
    const clientIds = getReturnedClientIds(container)
    expect(clientIds).toMatchObject(
        toClientCardIdList(
            allClients.sort((a, b) => a.name.localeCompare(b.name))
        )
    )
})

it("can search client names", async () => {
    const { container } = renderViewClientsPage()
    await waitForClientsToFinishLoading()
    const { searchInput } = getSearchControls()
    const searchValue = "big"
    fireEvent.change(searchInput, { target: { value: searchValue } })

    // Expect only clients with "big" in their name to be displayed in alphabetical order
    const clientIds = getReturnedClientIds(container)
    expect(clientIds).toMatchObject(
        toClientCardIdList(
            allClients
                .filter((client) =>
                    client.name.toLowerCase().includes(searchValue)
                )
                .sort((a, b) => a.name.localeCompare(b.name))
        )
    )

    await waitForQueryParam("search", searchValue)
})

it("can search client about texts", async () => {
    const { container } = renderViewClientsPage()
    await waitForClientsToFinishLoading()
    const { searchInput } = getSearchControls()
    const searchValue = "about sandwich"
    fireEvent.change(searchInput, { target: { value: searchValue } })

    // Expect only clients with "about sandwich" in their about text to be displayed in alphabetical order
    const clientIds = getReturnedClientIds(container)
    expect(clientIds).toMatchObject(
        toClientCardIdList(
            allClients
                .filter((client) =>
                    client.about.toLowerCase().includes(searchValue)
                )
                .sort((a, b) => a.name.localeCompare(b.name))
        )
    )

    await waitForQueryParam("search", searchValue)
})

it("can search client project names", async () => {
    const { container } = renderViewClientsPage()
    await waitForClientsToFinishLoading()
    const { searchInput } = getSearchControls()
    const searchValue = "project about food"
    fireEvent.change(searchInput, { target: { value: searchValue } })

    // Expect only clients with "project about food" in at lesat one of their project names to be displayed in alphabetical order
    const clientIds = getReturnedClientIds(container)
    expect(clientIds).toMatchObject(
        toClientCardIdList(
            allClients
                .filter(
                    (client) =>
                        client.projects
                            .map((project) => project.name)
                            .filter((projectName) =>
                                projectName.toLowerCase().includes(searchValue)
                            ).length > 0
                )
                .sort((a, b) => a.name.localeCompare(b.name))
        )
    )

    await waitForQueryParam("search", searchValue)
})

it("can filter by client type", async () => {
    const { container } = renderViewClientsPage()
    await waitForClientsToFinishLoading()
    const { typeSelectButton } = getSearchControls()

    // Name of type for no filtering
    const noFilterTypeName = "Type"

    const testFilteringByType = async (type: ClientOrgType | null) => {
        // Open type filter menu
        fireEvent.mouseDown(typeSelectButton)
        const typeSelectMenu = within(screen.getByRole("listbox"))

        // Click the type option
        fireEvent.click(typeSelectMenu.getByText(type || noFilterTypeName))

        // Assert that the clients are filtered and displayed in alphabetical order
        const clientIds = getReturnedClientIds(container)
        expect(clientIds).toMatchObject(
            toClientCardIdList(
                allClients
                    .filter((client) => !type || client.type === type)
                    .sort((a, b) => a.name.localeCompare(b.name))
            )
        )

        // Assert that the query parameter for the client type is set
        await waitForQueryParam("type", type)
    }

    // Test filtering by each type, and null (no filtering)
    // This needs to run in a for-loop
    // If it runs in an async forEach function, the test will fail due to the
    // testFilteringByType function running in parallel

    // eslint-disable-next-line no-restricted-syntax
    for (const type of [...Object.values(ClientOrgType), null]) {
        // eslint-disable-next-line no-await-in-loop
        await testFilteringByType(type)
    }
})

it("has working submit proposal button", async () => {
    renderViewClientsPage()
    await waitForClientsToFinishLoading()
    const submitProposalButton = screen.getByRole("link", {
        name: "Submit a Proposal",
    })
    fireEvent.click(submitProposalButton)
    screen.getByText("Submit proposal page")
})

afterAll(() => server.close())
