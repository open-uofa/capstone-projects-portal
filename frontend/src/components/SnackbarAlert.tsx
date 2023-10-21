import * as React from "react"
import { Alert, AlertColor, Snackbar } from "@mui/material"

export default function SnackbarAlert(props: {
    open: boolean
    onClose: (event?: React.SyntheticEvent, reason?: string) => void
    severity: AlertColor
    message: string
}): JSX.Element {
    const { open, onClose, severity, message } = props
    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
            <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
                {message}
            </Alert>
        </Snackbar>
    )
}
