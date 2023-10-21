import * as React from "react"
import { Logout } from "@mui/icons-material"
import {
    Box,
    Tooltip,
    ListItemIcon,
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Link,
} from "@mui/material"
import { useContext, useState, MouseEventHandler } from "react"
import { Link as RouterLink } from "react-router-dom"
import GlobalContext from "../global-state/context"
import UserAvatar from "./UserAvatar"
import { portalApiInstance } from "../api/portal-api"

export default function UserNavbarButton(): JSX.Element | null {
    const { globalState, dispatch } = useContext(GlobalContext)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const open = Boolean(anchorEl)
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }

    if (!globalState.currentUser.logged_in) return null

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    textAlign: "center",
                }}
            >
                <Tooltip
                    title={`Logged in as ${globalState.currentUser?.name}`}
                >
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                    >
                        <UserAvatar user={globalState.currentUser} />
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {/* General menu items */}
                <MenuItem
                    component={RouterLink}
                    to={`/profiles/${globalState.currentUser.id}`}
                >
                    Profile
                </MenuItem>
                <Divider />

                {/* Admin menu items */}
                {globalState.currentUser.is_superuser && [
                    <MenuItem
                        key="admin"
                        component={Link}
                        href={process.env.REACT_APP_ADMIN_URL ?? "/admin/"}
                    >
                        Admin
                    </MenuItem>,
                    <MenuItem key="import" component={RouterLink} to="/import">
                        Import data
                    </MenuItem>,
                    <Divider key="divider" />,
                ]}

                {/* Account menu items */}
                <MenuItem component={RouterLink} to="/settings">
                    Settings
                </MenuItem>
                <MenuItem onClick={() => portalApiInstance.logout(dispatch)}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Log out
                </MenuItem>
            </Menu>
        </>
    )
}
