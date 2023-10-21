import * as React from "react"
import { Button } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"

export default function ViewAllButton(props: { to: string }): JSX.Element {
    const { to } = props
    return (
        <Button
            variant="text"
            component={RouterLink}
            to={to}
            sx={{
                textAlign: "center",
            }}
        >
            View all
        </Button>
    )
}
