import * as React from "react"
import { useContext, useState } from "react"
import { Box, Button, Container, Paper, Typography } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import PageTitle from "../components/PageTitle"
import { portalApiInstance } from "../api/portal-api"
import GlobalContext from "../global-state/context"
import { LoginResult } from "../models/login"
import SnackbarAlert from "../components/SnackbarAlert"
import RequireLoggedIn from "../components/RequireLoggedIn"

function SettingsCategory({
    title,
    children,
    depth = 0,
}: {
    title: string
    children: React.ReactNode
    depth?: number
}): JSX.Element {
    // Calculate the variant of header based on depth of this node
    const headerVariant = `h${Math.max(1, Math.min(6, 4 + depth))}` as
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6"

    // Add depth property to children
    const childrenWithDepth = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { depth: depth + 1 })
        }
        return child
    })

    return (
        <Box sx={{ mb: depth === 0 ? 2 : 1 }}>
            <Typography variant={headerVariant}>{title}</Typography>
            {childrenWithDepth}
        </Box>
    )
}
SettingsCategory.defaultProps = {
    depth: 0,
}

type InvalidateOtherSessionsState = LoginResult | undefined | "Pending"

export default function Settings(): JSX.Element {
    const { globalState, dispatch } = useContext(GlobalContext)

    const [invalidateOtherSessionsState, setInvalidateOtherSessionsState] =
        useState<InvalidateOtherSessionsState>(undefined)

    const userHasPassword =
        globalState.currentUser.logged_in &&
        globalState.currentUser.has_password

    return (
        <RequireLoggedIn>
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <PageTitle title="Settings" />
                    <Paper sx={{ p: 2 }}>
                        <SettingsCategory title="Account">
                            <SettingsCategory title="Password">
                                <Typography>
                                    {userHasPassword
                                        ? "Your account has a password."
                                        : "Your account does not have a password."}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={RouterLink}
                                    to="/reset-password"
                                >
                                    {userHasPassword
                                        ? "Change Password"
                                        : "Set Password"}
                                </Button>
                            </SettingsCategory>
                            <SettingsCategory title="Current Sessions">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mr: 1 }}
                                    disabled={
                                        invalidateOtherSessionsState ===
                                        "Pending"
                                    }
                                    onClick={() => {
                                        setInvalidateOtherSessionsState(
                                            "Pending"
                                        )
                                        portalApiInstance
                                            .invalidateOtherSessions(dispatch)
                                            .then((result) =>
                                                setInvalidateOtherSessionsState(
                                                    result
                                                )
                                            )
                                            .catch(() =>
                                                setInvalidateOtherSessionsState(
                                                    undefined
                                                )
                                            )
                                    }}
                                >
                                    Log Out Of All Other Sessions
                                </Button>
                            </SettingsCategory>
                        </SettingsCategory>
                    </Paper>
                </Box>
            </Container>
            {invalidateOtherSessionsState &&
                invalidateOtherSessionsState !== "Pending" && (
                    <SnackbarAlert
                        open
                        message={
                            invalidateOtherSessionsState.success === true
                                ? "Successfully logged out of other sessions"
                                : `Failed to log out of other sessions: ${invalidateOtherSessionsState.error}`
                        }
                        severity={
                            invalidateOtherSessionsState.success === true
                                ? "success"
                                : "error"
                        }
                        onClose={() =>
                            setInvalidateOtherSessionsState(undefined)
                        }
                    />
                )}
        </RequireLoggedIn>
    )
}
