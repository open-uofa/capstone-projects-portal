import * as React from "react"
import { Typography } from "@mui/material"

export default function PageTitle(titleObj: { title: string }): JSX.Element {
    const { title } = titleObj

    return (
        <Typography variant="h4" component="h1" align="center" gutterBottom>
            {title}
        </Typography>
    )
}
