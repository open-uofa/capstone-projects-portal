/* eslint-disable react/jsx-props-no-spreading */

import { Box, Container, Paper } from "@mui/material"
import type * as React from "react"

export default function MediumContainer(
    props: React.PropsWithChildren
): JSX.Element {
    const { children } = props
    return (
        <Container maxWidth="md">
            <Paper elevation={2} sx={{ padding: "20px 60px", my: 5 }}>
                <Box sx={{ my: 4 }}>{children}</Box>
            </Paper>
        </Container>
    )
}
