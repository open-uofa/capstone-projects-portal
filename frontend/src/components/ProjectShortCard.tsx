/* eslint-disable react/require-default-props */
import {
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Stack,
    useMediaQuery,
    useTheme,
    CardTypeMap,
} from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { SyntheticEvent, useState, useEffect } from "react"
import ProjectShort from "../models/project-short"
import Project from "../models/project"
import { portalApiInstance } from "../api/portal-api"

const FALLBACK_IMAGE_URL = "/placeholder.png"

export default function ProjectShortCard({
    project,
    cardStyle = {},
}: {
    project: ProjectShort
    cardStyle?: CardTypeMap["props"]["sx"]
}): JSX.Element {
    // Get the current project
    const [currentProject, getProject] = useState<Project | undefined>(
        undefined
    )

    useEffect(() => {
        portalApiInstance
            .getProject(project.id)
            .then((data) => getProject({ ...data }))
    }, [project.id])

    let logoURL = project.logo_url

    if (currentProject?.client_org.image && logoURL.trim().length === 0) {
        logoURL = currentProject.client_org.image
    }
    if (logoURL.trim().length === 0) {
        logoURL = FALLBACK_IMAGE_URL
    }

    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"))

    return (
        <Card sx={{ height: "100%", m: 0.5, ...cardStyle }}>
            <CardActionArea
                component={RouterLink}
                to={`/projects/${project.id}`}
                sx={{ height: "100%" }}
            >
                <CardContent>
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="flex-start"
                    >
                        <CardMedia
                            component="img"
                            image={logoURL}
                            alt={`${project.name} logo`}
                            sx={{
                                backgroundColor: "#FFF",
                                color: "transparent",
                                width: isSmallScreen ? "75px" : "125px",
                                height: isSmallScreen ? "75px" : "125px",
                                borderRadius: "5px",
                                objectFit: "contain",
                            }}
                            onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                const element = e.target as HTMLImageElement
                                if (element.src !== FALLBACK_IMAGE_URL)
                                    element.src = FALLBACK_IMAGE_URL
                            }}
                        />
                        <Stack
                            direction="column"
                            justifyContent="flex-start"
                            sx={{
                                ml: 2,
                                mr: 2,
                                padding: 0,
                                flexGrow: 1,
                            }}
                        >
                            <Typography variant="h5">
                                <b>{project.name}</b>
                            </Typography>
                            <Typography variant="h6">
                                {project.tagline}
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}
