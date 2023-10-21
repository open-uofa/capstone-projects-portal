import * as React from "react"
import { useContext, useState } from "react"
import { Box, Container, Paper, Typography } from "@mui/material"
import { SubmitHandler } from "react-hook-form"
import { useHistory, useParams, useLocation, Redirect } from "react-router-dom"
import PageTitle from "../components/PageTitle"
import { portalApiInstance } from "../api/portal-api"
import GlobalContext from "../global-state/context"
import ResetPasswordForm, {
    ResetPasswordFormInputs,
} from "../components/ResetPasswordForm"

export default function ResetPassword(): JSX.Element {
    const { globalState, dispatch } = useContext(GlobalContext)

    const history = useHistory()
    const { key }: { key: string } = useParams()
    const location = useLocation()

    const [errorReason, setErrorReason] = useState<string>("")

    // If reset key is not present and the user is not logged in, require the user to be logged in
    if (!key && !globalState.currentUser.logged_in) {
        return <Redirect to={`/login?next=${location.pathname}`} />
    }

    const userHasPassword =
        globalState.currentUser.logged_in &&
        globalState.currentUser.has_password
    const requireCurrentPassword = !key && userHasPassword

    const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) =>
        portalApiInstance
            .resetPassword(
                {
                    ...(key ? { resetKey: key } : {}),
                    ...(requireCurrentPassword
                        ? { currentPassword: data.currentPassword }
                        : {}),
                    newPassword: data.newPassword,
                },
                dispatch
            )
            .then((response) => {
                if (response.success === true) {
                    // If the user is resetting with a key, redirect to the home page
                    // Otherwise, redirect to the settings page
                    const nextUrl = key ? "/" : "/settings"
                    history.replace(nextUrl)
                } else {
                    setErrorReason(response.error)
                }
            })

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, my: 5 }}>
                <Box>
                    <PageTitle title="Change Password" />
                    <Box sx={{ my: 1 }}>
                        <Typography>
                            {requireCurrentPassword
                                ? "Enter your current password and a new password."
                                : "Enter a new password."}
                        </Typography>

                        <Typography>
                            You will be logged out of all other browsers after
                            changing your password.
                        </Typography>
                    </Box>

                    <ResetPasswordForm
                        onSubmit={onSubmit}
                        buttonText="Change Password"
                        errorReason={errorReason}
                        requireCurrentPassword={requireCurrentPassword}
                    />
                </Box>
            </Paper>
        </Container>
    )
}
