import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { Route, MemoryRouter } from "react-router-dom"
import Home from "../Home"

test("renders without crashing", async () => {
    render(
        <MemoryRouter initialEntries={["/home"]}>
            <Route path="/home">
                <Home />
            </Route>
        </MemoryRouter>
    )
})
