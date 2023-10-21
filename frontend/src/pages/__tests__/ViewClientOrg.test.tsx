import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { Route, MemoryRouter } from "react-router-dom"
import ViewClientOrg from "../ViewClientOrg"

test("renders without crashing", () => {
    render(
        <MemoryRouter initialEntries={["/clients/1"]}>
            <Route path="/clients/:id">
                <ViewClientOrg />
            </Route>
        </MemoryRouter>
    )
})
