import * as React from "react"
import { Stack } from "@mui/material"
import Typography from "@mui/material/Typography"
import Project from "../models/project"
import ProjectShort from "./ProjectShortCard"
import ViewAllButton from "./ViewAllButton"

export default function ProjectGrid(props: {
    title: string
    clientType: string
    projects: Project[]
}): JSX.Element {
    const { title, clientType, projects } = props
    return (
        <>
            <Stack
                direction="row"
                justifyContent="space-between"
                paddingTop={2}
            >
                <Typography variant="h5">
                    <b>{title}</b>
                </Typography>
                <ViewAllButton to={`/projects?client=${clientType}`} />
            </Stack>
            <Stack justifyContent="flex-start" height={480}>
                {projects.map((project) => (
                    <ProjectShort
                        key={project.id}
                        project={project}
                        cardStyle={{ height: undefined }}
                    />
                ))}
            </Stack>
        </>
    )
}
