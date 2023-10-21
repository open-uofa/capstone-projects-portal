import * as React from "react"
import { Button, Typography, useTheme } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"

export default function LoginButton(): JSX.Element {
    const theme = useTheme()

    return (
        <RouterLink to="/login" style={{ textDecoration: "none" }}>
            <Button
                id="login-button"
                color="secondary"
                variant="contained"
                disableElevation
                sx={{
                    padding: "8px 20px",
                    ":hover": {
                        transition: "0.2s",
                        filter: "brightness(98%)",
                        backgroundColor: `${theme.palette.secondary.main}`,
                        "& .loginText": {
                            color: `${theme.palette.text.secondary}`,
                            transition: "0.1s",
                        },
                    },
                }}
            >
                <Typography
                    color={theme.palette.primary.dark}
                    className="loginText"
                    fontFamily="Din Medium"
                    fontSize="16px"
                    sx={{
                        textTransform: "capitalize",
                    }}
                >
                    Login
                </Typography>
            </Button>
        </RouterLink>
    )
}
