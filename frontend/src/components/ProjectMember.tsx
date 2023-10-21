import * as React from "react"
import { Stack, Avatar, Box, useTheme } from "@mui/material"
import Link from "@mui/material/Link"
import { Link as RouterLink } from "react-router-dom"
import Typography from "@mui/material/Typography"
import PersonIcon from "@mui/icons-material/Person"
import UserShort from "../models/user-short"
import ClientOrgShort from "../models/client-org-short"

export default function ProjectMember(props: {
    isClient: boolean
    user: UserShort | ClientOrgShort
}): JSX.Element {
    const { user, isClient } = props
    const theme = useTheme()

    let { image: iconImage } = user
    if ("github_user_id" in user && !iconImage && user.github_user_id) {
        iconImage = `https://avatars.githubusercontent.com/u/${user.github_user_id}`
    }

    return (
        <Stack
            key={user.id}
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
            flexWrap="wrap"
        >
            <div style={{ width: "100%" }}>
                <Link
                    component={RouterLink}
                    to={
                        isClient
                            ? `/clients/${user.id}`
                            : `/profiles/${user.id}`
                    }
                    underline="none"
                >
                    <Box
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            paddingBottom: "3px",
                        }}
                        sx={{
                            ":hover": {
                                "& .nameText": {
                                    color: `#222`,
                                    transition: "0.1s",
                                },
                            },
                        }}
                    >
                        {iconImage ? (
                            <Box
                                height="42px"
                                width="42px"
                                sx={{ marginRight: "10px" }}
                            >
                                <Box
                                    component="img"
                                    src={iconImage}
                                    alt="user image"
                                    height="100%"
                                    width="100%"
                                    style={{ borderRadius: "50%" }}
                                    sx={{
                                        objectFit: "cover",
                                    }}
                                />
                            </Box>
                        ) : (
                            <Avatar
                                sx={{
                                    width: 42,
                                    height: 42,
                                    marginRight: "10px",
                                    border: 1,
                                    borderColor: `${theme.palette.primary.main}`,
                                    backgroundColor: "transparent",
                                }}
                            >
                                <PersonIcon
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        color: `${theme.palette.primary.main}`,
                                    }}
                                />
                            </Avatar>
                        )}

                        <Typography className="nameText" sx={{ color: `#555` }}>
                            {user.name}
                        </Typography>
                    </Box>
                </Link>
            </div>
        </Stack>
    )
}
