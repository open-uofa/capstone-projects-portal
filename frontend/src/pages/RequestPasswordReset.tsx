/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import * as yup from "yup"
import {
    Box,
    Paper,
    Container,
    Typography,
    useTheme,
    TextField,
    Alert,
    AlertTitle,
} from "@mui/material"
import {
    Controller,
    SubmitHandler,
    useForm,
    useFormState,
} from "react-hook-form"
import { LoadingButton } from "@mui/lab"
import { useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { portalApiInstance } from "../api/portal-api"
import PageTitle from "../components/PageTitle"

interface RequestPasswordResetFormInputs {
    email: string
}

const schema = yup.object().shape({
    email: yup
        .string()
        .email("Invalid email address")
        .required("Email address is required"),
})

export default function ResetPasswordRequest(): JSX.Element {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RequestPasswordResetFormInputs>({
        resolver: yupResolver(schema),
        defaultValues: { email: "" },
    })

    const { isSubmitting } = useFormState({ control })

    const theme = useTheme()

    const [didRequest, setDidRequest] = useState(false)

    const onSubmit: SubmitHandler<RequestPasswordResetFormInputs> = (data) =>
        portalApiInstance
            .requestPasswordReset({ email: data.email })
            .then(() => {
                setDidRequest(true)
            })

    return (
        <Container maxWidth="sm">
            <Paper sx={{ p: 4, my: 5 }}>
                <Box>
                    <PageTitle title="Reset Password" />
                    <Box sx={{ my: 1 }}>
                        {didRequest ? (
                            <Alert severity="success">
                                <AlertTitle>Success</AlertTitle>
                                <p>
                                    If an account with that email address
                                    exists, it has been sent an email with
                                    instructions on how to reset your password.
                                </p>
                                <p>You can close this page now.</p>
                            </Alert>
                        ) : (
                            <>
                                <Typography>
                                    To reset your account password, enter the
                                    email address of your account. An email will
                                    be sent there with instructions on how to
                                    reset your password.
                                </Typography>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                id="email"
                                                type="email"
                                                autoFocus
                                                label="Email address"
                                                variant="outlined"
                                                error={!!errors.email}
                                                helperText={
                                                    errors.email?.message ?? ""
                                                }
                                                fullWidth
                                                margin="dense"
                                                sx={{
                                                    label: {
                                                        color: `${theme.palette.primary.dark}`,
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                    <LoadingButton
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                        fullWidth
                                        sx={{ mt: 1, mb: 2 }}
                                    >
                                        Request Password Reset
                                    </LoadingButton>
                                </form>
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    )
}
