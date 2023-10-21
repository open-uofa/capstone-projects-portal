import * as React from "react"
import { Button, Typography, useTheme } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"

export default function EditButton(editURLObj: {
    editURL: string
}): JSX.Element {
    const theme = useTheme()
    const { editURL } = editURLObj

    return (
        <RouterLink to={editURL} style={{ textDecoration: "none" }}>
            <Button
                color="secondary"
                variant="outlined"
                disableElevation
                sx={{
                    padding: "3px 20px",
                    borderColor: `${theme.palette.primary.main}`,
                    ":hover": {
                        transition: "0.2s",
                        borderColor: `${theme.palette.primary.main}`,
                        backgroundColor: `rgba(0, 124, 65, 0.1)`,
                    },
                    [theme.breakpoints.down("sm")]: {
                        mt: 1,
                    },
                }}
            >
                <Typography
                    color={theme.palette.primary.main}
                    className="loginText"
                    fontFamily="Din Medium"
                    fontSize="16px"
                    sx={{
                        textTransform: "capitalize",
                    }}
                >
                    Edit
                </Typography>
            </Button>
        </RouterLink>
    )
}
