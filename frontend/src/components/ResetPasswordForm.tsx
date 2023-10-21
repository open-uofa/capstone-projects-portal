/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { LoadingButton } from "@mui/lab"
import { Alert, useTheme, TextField } from "@mui/material"
import {
    Controller,
    SubmitHandler,
    useForm,
    useFormState,
} from "react-hook-form"

export interface ResetPasswordFormInputs {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export default function ResetPasswordForm(props: {
    onSubmit: SubmitHandler<ResetPasswordFormInputs>
    buttonText: string
    errorReason: string
    requireCurrentPassword?: boolean
}): JSX.Element {
    const { onSubmit, buttonText, errorReason, requireCurrentPassword } = props

    const schema = yup.object().shape({
        ...{
            newPassword: yup.string().required("New password is required"),
            confirmPassword: yup
                .string()
                .oneOf([yup.ref("newPassword"), null], "Passwords must match")
                .required("Confirm new password is required"),
        },
        ...(requireCurrentPassword
            ? {
                  currentPassword: yup
                      .string()
                      .required("Current password is required"),
              }
            : {}),
    })

    const defaultFormValues = {
        ...{
            newPassword: "",
            confirmPassword: "",
        },
        ...(requireCurrentPassword ? { currentPassword: "" } : {}),
    }

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormInputs>({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues,
    })

    const { isSubmitting } = useFormState({ control })

    const theme = useTheme()

    return (
        <>
            {errorReason ? <Alert severity="error">{errorReason}</Alert> : null}
            <form onSubmit={handleSubmit(onSubmit)}>
                {requireCurrentPassword ? (
                    <Controller
                        name="currentPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id="currentPassword"
                                type="password"
                                label="Current password"
                                variant="outlined"
                                error={!!errors.currentPassword}
                                helperText={
                                    errors.currentPassword?.message ?? ""
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
                ) : null}
                <Controller
                    name="newPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            id="newPassword"
                            type="password"
                            label="New password"
                            variant="outlined"
                            error={!!errors.newPassword}
                            helperText={errors.newPassword?.message ?? ""}
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
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            id="confirmPassword"
                            type="password"
                            label="Confirm new password"
                            variant="outlined"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message ?? ""}
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
                    {buttonText}
                </LoadingButton>
            </form>
        </>
    )
}

ResetPasswordForm.defaultProps = {
    requireCurrentPassword: false,
}
