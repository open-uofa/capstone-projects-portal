import {
    Card,
    CardActionArea,
    CardMedia,
    Stack,
    useMediaQuery,
    useTheme,
} from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { SyntheticEvent } from "react"
import Project from "../models/project"
import ProjectChipRow from "./ProjectChipRow"

const FALLBACK_IMAGE_URL = "/placeholder.png"

// can't take a ProjectShort right now since it uses client info
export default function ProjectCard(props: { project: Project }): JSX.Element {
    const { project } = props
    const theme = useTheme()
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"))

    let logoURL = project.logo_url
    if (project.client_org.image && logoURL.trim().length === 0) {
        logoURL = project.client_org.image
    }
    if (logoURL.trim().length === 0) {
        logoURL = FALLBACK_IMAGE_URL
    }

    return (
        <Card className="project-card" id={`project-card-${project.id}`}>
            <CardActionArea
                component={RouterLink}
                to={`/projects/${project.id}`}
            >
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
                            m: 1,
                            backgroundColor: "#FFF",
                            color: "transparent",
                            width: isSmallScreen ? "75px" : "125px",
                            height: isSmallScreen ? "75px" : "125px",
                            borderRadius: "5px",
                            alignSelf: "center",
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
                            mt: 2,
                            mb: 2,
                            ml: 1,
                            mr: 2,
                            padding: 0,
                            flexGrow: 1,
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                        >
                            <Typography variant="h5">{project.name}</Typography>
                            <Typography variant="subtitle1">{`${project.term} ${project.year}`}</Typography>
                        </Stack>
                        <Typography variant="subtitle2">
                            {project.client_org.name}
                        </Typography>
                        <Typography gutterBottom variant="body1">
                            {project.tagline}
                        </Typography>
                        <ProjectChipRow project={project} />
                    </Stack>
                </Stack>
            </CardActionArea>
        </Card>
    )
}
