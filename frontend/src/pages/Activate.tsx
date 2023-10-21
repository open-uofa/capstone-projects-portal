import * as React from "react"
import { useContext, useState } from "react"
import { Box, Container, Paper, Typography } from "@mui/material"
import { SubmitHandler } from "react-hook-form"
import { useParams } from "react-router-dom"
import PageTitle from "../components/PageTitle"
import { portalApiInstance } from "../api/portal-api"
import GlobalContext from "../global-state/context"
import ResetPasswordForm, {
    ResetPasswordFormInputs,
} from "../components/ResetPasswordForm"
import HelmetMetaData from "../components/HelmetMetaData"
import RequireNotLoggedIn from "../components/RequireNotLoggedIn"

export default function Activate(): JSX.Element {
    const { dispatch } = useContext(GlobalContext)

    const { key }: { key: string } = useParams()

    const [errorReason, setErrorReason] = useState<string>("")

    const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) =>
        portalApiInstance
            .activateAccount(
                {
                    activationKey: key ?? "",
                    newPassword: data.newPassword,
                },
                dispatch
            )
            .then((response) => {
                if (response.success !== true) {
                    setErrorReason(response.error)
                }
            })

    return (
        <RequireNotLoggedIn>
            <HelmetMetaData
                title="Activate | CMPUT 401 Projects Portal"
                noindex
            />
            <Container maxWidth="sm">
                <Paper sx={{ p: 4, my: 5 }}>
                    <Box>
                        <PageTitle title="Activate Your Account" />
                        <Box sx={{ my: 1 }}>
                            <Typography>
                                To activate your account, you must set a
                                password.
                            </Typography>
                        </Box>
                        <ResetPasswordForm
                            onSubmit={onSubmit}
                            buttonText="Activate"
                            errorReason={errorReason}
                        />
                    </Box>
                </Paper>
            </Container>
        </RequireNotLoggedIn>
    )
}
