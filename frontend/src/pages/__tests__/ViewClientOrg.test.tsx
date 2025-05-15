import { render } from "@testing-library/react"
import { http } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter, Route } from "react-router-dom"
import { axiosConfig } from "../../api/config"
import type ClientOrg from "../../models/client-org"
import ClientOrgType from "../../models/client-org-type"
import { ProjectType, Term } from "../../models/project"
import type ProjectShort from "../../models/project-short"
import ViewClientOrg from "../ViewClientOrg"

const mockProject: ProjectShort = {
    id: "1000",
    logo_url: "https://example.com/image.jpg",
    name: "Project 1",
    tagline: "Tagline 1",
    tags: [],
    year: 2023,
    term: Term.Fall,
    type: ProjectType.Other,
}

const mockClientOrg: ClientOrg = {
    id: "1",
    name: "Client 1",
    type: ClientOrgType.Academic,
    image: undefined,
    about: "We are Client 1.",
    website_link: "https://client1.example.com",
    reps: [{ id: "100", name: "John Doe" }],
    projects: [mockProject],
    testimonial: "They are just great",
}

const server = setupServer(
    http.get(`${axiosConfig.baseURL}/orgs/1`, () =>
        Response.json(mockClientOrg)
    )
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it("renders without crashing", () => {
    render(
        <MemoryRouter initialEntries={["/clients/1"]}>
            <Route path="/clients/:id">
                <ViewClientOrg />
            </Route>
        </MemoryRouter>
    )
})
