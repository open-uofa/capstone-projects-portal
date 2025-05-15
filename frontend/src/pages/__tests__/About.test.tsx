import { render } from "@testing-library/react"
import { http } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter, Route } from "react-router-dom"
import { axiosConfig } from "../../api/config"
import About from "../About"

const server = setupServer(
    http.get(`${axiosConfig.baseURL}/orgs`, () => Response.json([]))
)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test("renders without crashing", async () => {
    render(
        <MemoryRouter initialEntries={["/about"]}>
            <Route path="/about">
                <About />
            </Route>
        </MemoryRouter>
    )
})
