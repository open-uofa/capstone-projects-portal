/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { Box, Paper, Container } from "@mui/material"

export default function MediumContainer(
    props: React.PropsWithChildren<React.ReactNode>
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
