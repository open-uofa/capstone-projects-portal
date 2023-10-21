import * as React from "react"
import { Container, Stack, Button, Grid, Box } from "@mui/material"
import { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import { Link as RouterLink } from "react-router-dom"
import "react-multi-carousel/lib/styles.css"
import { portalApiInstance } from "../api/portal-api"
import Project from "../models/project"
import ProjectGrid from "../components/ProjectGrid"
import HelmetMetaData from "../components/HelmetMetaData"
import ViewAllButton from "../components/ViewAllButton"
import ProjectCarousel from "../components/ProjectCarousel"

export default function Home(): JSX.Element {
    const [allProjects, setAllProjects] = useState<Project[]>([])
    useEffect(() => {
        portalApiInstance.getProjects(true).then((data: Project[]) => {
            setAllProjects(data)
        })
    }, [])

    return (
        <>
            <HelmetMetaData title="Home | CMPUT 401 Projects Portal" />
            <Container sx={{ my: 4 }}>
                <Grid container paddingBottom={1} spacing={4}>
                    <Grid item md width="100%">
                        <ProjectGrid
                            title="Projects made with Albertan non-profits"
                            clientType="Non-profit"
                            projects={allProjects
                                .filter(
                                    (project) =>
                                        project.client_org.type === "Non-profit"
                                )
                                .slice(0, 3)}
                        />
                    </Grid>
                    <Grid item md width="100%">
                        <ProjectGrid
                            title="Projects made with Albertan early stage startups"
                            clientType="Startup"
                            projects={allProjects
                                .filter(
                                    (project) =>
                                        project.client_org.type === "Startup"
                                )
                                .slice(0, 3)}
                        />
                    </Grid>
                </Grid>
                <Box
                    style={{ border: "4px #ffdb05", borderStyle: "solid none" }}
                    marginTop={2}
                >
                    <Grid
                        container
                        paddingTop={2}
                        paddingBottom={2}
                        columnSpacing={4}
                        rowSpacing={2}
                    >
                        <Grid item xs={12} sm={8}>
                            <Stack
                                direction="column"
                                justifyContent="flex-start"
                            >
                                <Typography variant="h5">
                                    <b> Contributing to our community </b>
                                </Typography>
                                <Typography variant="h6">
                                    We love to collaborate with Albertan
                                    nonprofits and early stage startups to build
                                    and to enhance projects that will make our
                                    community better!
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs>
                            <Stack
                                direction="column"
                                justifyContent="flex-end"
                                spacing={1}
                            >
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    to="/about"
                                >
                                    Learn more about our work
                                </Button>
                                <Button
                                    variant="contained"
                                    component={RouterLink}
                                    to="/proposal"
                                >
                                    Got an idea for a project?
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    paddingTop={2}
                >
                    <Typography variant="h5">
                        <b> Mobile App Projects </b>
                    </Typography>
                    <ViewAllButton to="/projects?type=Mobile+App" />
                </Stack>
                <ProjectCarousel
                    projects={allProjects
                        .filter((project) => project.type === "Mobile App")
                        .slice(0, 9)}
                />
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    paddingTop={2}
                >
                    <Typography variant="h5">
                        <b> Web App Projects </b>
                    </Typography>
                    <ViewAllButton to="/projects?type=Web+App" />
                </Stack>
                <ProjectCarousel
                    projects={allProjects
                        .filter((project) => project.type === "Web App")
                        .slice(0, 9)}
                />
            </Container>
        </>
    )
}
