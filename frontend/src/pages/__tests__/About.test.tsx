import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { Route, MemoryRouter } from "react-router-dom"
import About from "../About"

test("renders without crashing", async () => {
    render(
        <MemoryRouter initialEntries={["/about"]}>
            <Route path="/about">
                <About />
            </Route>
        </MemoryRouter>
    )
})
