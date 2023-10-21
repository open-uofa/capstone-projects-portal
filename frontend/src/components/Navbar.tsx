import * as React from "react"
import { useEffect, useState } from "react"
import {
    AppBar,
    IconButton,
    Drawer,
    Link,
    MenuItem,
    Toolbar,
    useTheme,
    useMediaQuery,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import Grid from "@mui/material/Grid"
import { Link as RouterLink } from "react-router-dom"
import PortalLogo from "./PortalLogo"
import UserNavbarButton from "./UserNavbarButton"
import LoginButton from "./LoginButton"
import { useCurrentUser } from "../hooks"

interface NavBarState {
    mobileView: boolean
    drawerOpen: boolean
}

const headersData = [
    {
        label: "Browse Projects",
        href: "/projects",
        type: "mid-link",
    },
    {
        label: "Browse Clients",
        href: "/clients",
        type: "mid-link",
    },
    {
        label: "About our Work",
        href: "/about",
        type: "mid-link",
    },
    {
        label: "Want us to build you a project?",
        href: "/proposal",
        type: "end-link",
    },
]

export default function Navbar(): JSX.Element {
    const currentUser = useCurrentUser()

    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))

    const [state, setState] = useState<NavBarState>({
        mobileView: false,
        drawerOpen: false,
    })

    const { mobileView, drawerOpen } = state

    useEffect(() => {
        const setResponsiveness = () =>
            window?.innerWidth < 1250
                ? setState((prevState) => ({
                      ...prevState,
                      mobileView: true,
                  }))
                : setState((prevState) => ({
                      ...prevState,
                      mobileView: false,
                  }))

        setResponsiveness()

        window?.addEventListener("resize", () => setResponsiveness())

        return () => {
            window?.removeEventListener("resize", () => setResponsiveness())
        }
    }, [])

    const getMidMenuGridItems = () =>
        headersData
            .filter((data) => data.type === "mid-link")
            .map(({ label, href }) => (
                <Grid item key={label}>
                    <Link
                        component={RouterLink}
                        to={href}
                        color={theme.palette.text.secondary}
                        variant="body1"
                        underline="none"
                    >
                        {label}
                    </Link>
                </Grid>
            ))

    const getRightMenuGridItems = () => (
        <>
            {isSmallScreen ? null : (
                <Grid item>
                    <Link
                        component={RouterLink}
                        to="/proposal"
                        color={theme.palette.text.secondary}
                        variant="body1"
                        underline="none"
                    >
                        Want us to build you a project?
                    </Link>
                </Grid>
            )}
            <Grid item>
                {currentUser.logged_in ? <UserNavbarButton /> : <LoginButton />}
            </Grid>
        </>
    )

    const getMobileMenuChoices = () => (
        <>
            <div style={{ padding: "0px 10px 15px" }}>
                <PortalLogo color={theme.palette.text.secondary} />
            </div>
            {headersData.map(({ label, href }) => (
                <Link
                    key={label}
                    component={RouterLink}
                    to={href}
                    color={theme.palette.text.secondary}
                    variant="body1"
                    underline="none"
                >
                    <MenuItem
                        sx={{
                            padding: "10px 10px",
                            ":hover": {
                                transition: "0.2s",
                                filter: "brightness(98%)",
                                backgroundColor: `${theme.palette.primary.main}`,
                            },
                        }}
                        onClick={() =>
                            setState((prevState) => ({
                                ...prevState,
                                drawerOpen: false,
                            }))
                        }
                    >
                        {label}
                    </MenuItem>
                </Link>
            ))}
        </>
    )

    const displayMobile = () => {
        const handleDrawerOpen = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: true }))
        const handleDrawerClose = () =>
            setState((prevState) => ({ ...prevState, drawerOpen: false }))

        return (
            <Toolbar sx={{ minHeight: "64px" }}>
                <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                >
                    <Grid
                        item
                        display="flex"
                        flexDirection="row"
                        xs={8}
                        sm={4}
                        gap={{ xs: 1 }}
                    >
                        <IconButton
                            {...{
                                edge: "start",
                                color: "inherit",
                                "aria-label": "menu",
                                "aria-haspopup": "true",
                                onClick: handleDrawerOpen,
                            }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Drawer
                            {...{
                                anchor: "left",
                                open: drawerOpen,
                                onClose: handleDrawerClose,
                            }}
                        >
                            <div
                                style={{
                                    padding: "20px 10px",
                                    height: "100%",
                                    backgroundColor: `${theme.palette.primary.dark}`,
                                    borderRight: `3px solid ${theme.palette.secondary.main}`,
                                }}
                            >
                                {getMobileMenuChoices()}
                            </div>
                        </Drawer>

                        <PortalLogo color={theme.palette.text.secondary} />
                    </Grid>
                    <Grid
                        item
                        xs={4}
                        sm={8}
                        display="flex"
                        flexDirection="row"
                        justifyContent="end"
                        alignItems="center"
                        justifySelf="end"
                        gap={{ sm: 3, xl: 5 }}
                    >
                        {getRightMenuGridItems()}
                    </Grid>
                </Grid>
            </Toolbar>
        )
    }

    const displayDesktop = () => (
        <Toolbar>
            <Grid
                container
                justifyContent="center"
                alignItems="center"
                width="100%"
            >
                <Grid item md={2} lg={3}>
                    <PortalLogo color={theme.palette.text.secondary} />
                </Grid>
                <Grid
                    container
                    md={6}
                    lg={6}
                    item
                    display="flex"
                    flexDirection="row"
                    justifyContent="center"
                    alignItems="center"
                    gap={{ xs: 2, sm: 0, md: 6, lg: 8, xl: 12 }}
                >
                    {getMidMenuGridItems()}
                </Grid>
                <Grid
                    item
                    md={4}
                    lg={3}
                    display="flex"
                    flexDirection="row"
                    justifyContent="end"
                    alignItems="center"
                    justifySelf="end"
                    gap={{ xs: 1, sm: 1, md: 3, lg: 3, xl: 5 }}
                >
                    {getRightMenuGridItems()}
                </Grid>
            </Grid>
        </Toolbar>
    )

    return (
        <nav>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    background: `${theme.palette.primary}`,
                    boxShadow: 1,
                    padding: "3px 0px",
                    borderBottom: `3px solid ${theme.palette.secondary.main}`,
                }}
            >
                {mobileView ? displayMobile() : displayDesktop()}
            </AppBar>
            <Toolbar sx={{ minHeight: "64px" }} />
        </nav>
    )
}
