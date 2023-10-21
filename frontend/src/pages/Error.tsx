import * as React from "react"
import {
    Typography,
    Box,
    useTheme,
    Divider,
    ThemeProvider,
    Grid,
    Button,
    Container,
} from "@mui/material"
import { Link as RouterLink, useParams } from "react-router-dom"
import errors from "../constants/errors"

export default function PageNotFound(): JSX.Element {
    const theme = useTheme()

    const { code } = useParams<{ code: string }>()
    const { title, message } = errors[code] ?? {
        title: "Whoops!",
        message: "An unknown error occurred. Sorry!",
    }

    return (
        <Container>
            <Grid
                container
                justifyContent="center"
                alignItems="center"
                direction="column"
                style={{ minHeight: "100vh" }}
                spacing={2}
            >
                <Box sx={{ m: 1 }}>
                    <ThemeProvider theme={theme}>
                        <Typography
                            variant="h1"
                            component="h1"
                            align="center"
                            color={theme.palette.primary.dark}
                            gutterBottom
                        >
                            {title}
                        </Typography>
                        <Divider orientation="horizontal" variant="middle" />
                        <Typography
                            mt={2}
                            variant="h4"
                            component="h4"
                            align="center"
                            gutterBottom
                        >
                            {message}
                        </Typography>
                        <Box textAlign="center" sx={{ m: 4 }}>
                            <Button
                                color="success"
                                variant="outlined"
                                size="large"
                                component={RouterLink}
                                to="/"
                            >
                                Home Page
                            </Button>
                        </Box>
                    </ThemeProvider>
                </Box>
            </Grid>
        </Container>
    )
}
