import { render } from "@testing-library/react"
import { http } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter, Route } from "react-router-dom"
import { axiosConfig } from "../../api/config"
import type User from "../../models/user"
import EditProfile from "../EditProfile"

const mockUser: User = {
    id: "1",
    name: "Tester",
    email: "tester@example.com",
    bio: "I am merely a tester",
    image: "https://example.com/image.jpg",
}

const server = setupServer(
    http.get(`${axiosConfig.baseURL}/users/1`, () => Response.json(mockUser))
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test("renders without crashing", () => {
    render(
        <MemoryRouter initialEntries={["/profiles/1/edit"]}>
            <Route path="/profiles/:id/edit">
                <EditProfile />
            </Route>
        </MemoryRouter>
    )
})
