import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { Route, MemoryRouter } from "react-router-dom"
import EditProfile from "../EditProfile"

test("renders without crashing", () => {
    render(
        <MemoryRouter initialEntries={["/profiles/1/edit"]}>
            <Route path="/profiles/:id/edit">
                <EditProfile />
            </Route>
        </MemoryRouter>
    )
})
