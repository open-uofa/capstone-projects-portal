import * as React from "react"
import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Typography,
} from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { Redirect, useLocation } from "react-router-dom"
import { portalApiInstance } from "../api/portal-api"
import GlobalContext from "../global-state/context"
import { LoginResult, OAuth2Provider } from "../models/login"
import { OAuth2State } from "./Login"

export default function LoginCallback(): JSX.Element {
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const oAuth2StateString = localStorage.getItem("OAUTH2_STATE")
    const oAuth2State: OAuth2State | undefined = oAuth2StateString
        ? JSON.parse(oAuth2StateString)
        : undefined

    const [loginResult, setLoginResult] = useState<LoginResult | undefined>(
        undefined
    )

    const { dispatch } = useContext(GlobalContext)

    const returnedNonce = params.get("state")
    const provider = params.get("provider")
    const code = params.get("code")

    useEffect(() => {
        if (provider !== null && code !== null) {
            portalApiInstance
                .loginWithOAuth2Provider(
                    { provider: provider as OAuth2Provider, code },
                    dispatch
                )
                .then((result) => {
                    setLoginResult(result)
                })
        }
    }, [code, dispatch, provider])

    if (!returnedNonce || !provider || !code)
        return (
            <Redirect
                to={{
                    pathname: "/login",
                    state: { error: "Invalid request" },
                }}
            />
        )

    if (oAuth2State === undefined)
        return (
            <Redirect
                to={{ pathname: "/login", state: { error: "State not set" } }}
            />
        )

    if (returnedNonce !== oAuth2State.nonce)
        return (
            <Redirect
                to={{
                    pathname: "/login",
                    state: { error: "State does not match" },
                }}
            />
        )

    if (loginResult === undefined)
        return (
            <Container maxWidth="sm">
                <Box sx={{ my: 4 }}>
                    <Paper sx={{ p: 2 }}>
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Grid item>
                                <CircularProgress id="loading-indicator" />
                            </Grid>
                            <Grid item>
                                <Typography align="center">
                                    Logging in with{" "}
                                    {provider ?? "external service"}…
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            </Container>
        )

    if (loginResult.success === true)
        return <Redirect to={oAuth2State.nextUrl ?? "/"} />

    return (
        <Redirect
            to={{ pathname: "/login", state: { error: loginResult.error } }}
        />
    )
}
