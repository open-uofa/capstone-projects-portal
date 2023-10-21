/* eslint-disable react/jsx-props-no-spreading */

import * as React from "react"
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Divider,
    useTheme,
    Link,
} from "@mui/material"
import { LoadingButton } from "@mui/lab"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import {
    Controller,
    SubmitHandler,
    useForm,
    useFormState,
} from "react-hook-form"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { useContext, useState } from "react"
import { GitHub as GitHubIcon } from "@mui/icons-material"
import PageTitle from "../components/PageTitle"
import { portalApiInstance } from "../api/portal-api"
import { LoginResult, OAuth2Provider } from "../models/login"
import GlobalContext from "../global-state/context"
import HelmetMetaData from "../components/HelmetMetaData"
import RequireNotLoggedIn from "../components/RequireNotLoggedIn"
import { githubAuthorizeUrl } from "../api/config"

function randomNonce(): string {
    const array = new Uint8Array(8)
    crypto.getRandomValues(array)
    return Buffer.from(array).toString("hex")
}

interface LoginFormInputs {
    email: string
    password: string
}

const schema = yup.object().shape({
    email: yup.string().email().required("Email is required"),
    password: yup.string().required("Password is required"),
})

export type LocationState = { error: string } | undefined

export interface OAuth2State {
    provider: OAuth2Provider
    nextUrl: string | undefined
    nonce: string
}

export default function Login(): JSX.Element {
    const { dispatch } = useContext(GlobalContext)

    const location = useLocation<LocationState>()

    const theme = useTheme()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const { isSubmitting } = useFormState({ control })

    const [loginResult, setLoginResult] = useState<LoginResult | undefined>(
        location.state?.error !== undefined
            ? { success: false, error: location.state.error }
            : undefined
    )

    const nextUrl = new URLSearchParams(location.search).get("next") ?? "/"

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        setLoginResult(undefined)
        return portalApiInstance
            .loginWithEmailAndPassword(data, dispatch)
            .then((result) => {
                if (result.success !== true) setLoginResult(result)
            })
    }

    const doOAuth2Login = (provider: OAuth2Provider, authUrl: URL) => {
        const nonce = randomNonce()
        const state: OAuth2State = {
            provider,
            nextUrl,
            nonce,
        }
        localStorage.setItem("OAUTH2_STATE", JSON.stringify(state))
        authUrl.searchParams.append(
            "redirect_uri",
            `${window.location.origin}/login/callback?provider=${provider}`
        )
        authUrl.searchParams.append("state", nonce)
        window.location.href = authUrl.toString()
    }

    const onClickGitHubLogin = () => {
        const githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID
        doOAuth2Login(
            "GitHub",
            new URL(
                `${githubAuthorizeUrl}?client_id=${githubClientId}&scope=read:user%20user:email&allow_signup=false`
            )
        )
    }

    return (
        <RequireNotLoggedIn redirectTo={nextUrl}>
            <HelmetMetaData title="Login | CMPUT 401 Projects Portal" noindex />
            <Container maxWidth="sm">
                <Box sx={{ my: 4 }}>
                    <Paper sx={{ p: 2 }}>
                        <PageTitle title="Log in" />
                        <Button
                            id="continue-with-github-button"
                            onClick={onClickGitHubLogin}
                            variant="outlined"
                            size="large"
                            startIcon={<GitHubIcon />}
                            fullWidth
                        >
                            Continue with GitHub
                        </Button>
                        <Divider sx={{ my: 2 }}>or</Divider>
                        {loginResult?.success === false ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <AlertTitle>Failed to log in</AlertTitle>
                                <p id="login-error-message">
                                    {loginResult.error}
                                </p>
                            </Alert>
                        ) : null}
                        <form onSubmit={handleSubmit(onSubmit)} method="post">
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="email"
                                        label="Email"
                                        error={!!errors.email}
                                        id="email"
                                        helperText={errors.email?.message ?? ""}
                                        fullWidth
                                        margin="dense"
                                        autoFocus
                                        sx={{
                                            label: {
                                                color: `${theme.palette.primary.dark}`,
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="password"
                                        label="Password"
                                        variant="outlined"
                                        id="password"
                                        error={!!errors.password}
                                        helperText={
                                            errors.password?.message ?? ""
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
                                Log in
                            </LoadingButton>
                        </form>
                        <Link
                            component={RouterLink}
                            to="/request-password-reset"
                            fontSize="small"
                        >
                            Reset password
                        </Link>
                    </Paper>
                </Box>
            </Container>
        </RequireNotLoggedIn>
    )
}
