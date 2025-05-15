import { Box, Container, Paper, Typography } from "@mui/material"
import { useContext, useState } from "react"
import type { SubmitHandler } from "react-hook-form"
import { useParams } from "react-router-dom"
import { portalApiInstance } from "../api/portal-api"
import HelmetMetaData from "../components/HelmetMetaData"
import PageTitle from "../components/PageTitle"
import RequireNotLoggedIn from "../components/RequireNotLoggedIn"
import ResetPasswordForm, {
    type ResetPasswordFormInputs,
} from "../components/ResetPasswordForm"
import GlobalContext from "../global-state/context"

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
                title="Activate | Capstone Projects Portal"
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
