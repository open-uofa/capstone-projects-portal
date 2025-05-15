import { render } from "@testing-library/react"
import { http } from "msw"
import { setupServer } from "msw/node"
import App from "../App"
import { axiosConfig } from "../api/config"

const server = setupServer(
    http.get(`${axiosConfig.baseURL}/projects`, () => Response.json([]))
)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test("renders without crashing", () => {
    render(<App />)
})
