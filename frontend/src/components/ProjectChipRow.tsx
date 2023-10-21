import * as React from "react"
import { Stack } from "@mui/material"
import { useHistory } from "react-router-dom"
import Project from "../models/project"
import ProjectChip from "./ProjectChip"

export default function ProjectChipRow(props: {
    project: Project
    clickable?: boolean
}): JSX.Element {
    const { project, clickable } = props

    const ifClickable = (
        x: React.MouseEventHandler<HTMLDivElement> | undefined
    ): React.MouseEventHandler<HTMLDivElement> | undefined =>
        clickable ? x : undefined

    const history = useHistory()

    // Display the project type, client organization type, tags, and published status as chips
    return (
        <Stack
            direction="row"
            justifyContent="flex-start"
            spacing={0.5}
            flexWrap="wrap"
        >
            {!project.is_published && (
                <ProjectChip color="error" value="Unpublished" />
            )}
            {project.type !== "Other" && (
                <ProjectChip
                    color="primary"
                    value={project.type}
                    onClick={ifClickable(() =>
                        history.push(`/projects/?type=${project.type}`)
                    )}
                />
            )}
            {project.client_org.type !== "Other" && (
                <ProjectChip
                    color="secondary"
                    value={project.client_org.type}
                    onClick={ifClickable(() =>
                        history.push(
                            `/projects/?client=${project.client_org.type}`
                        )
                    )}
                />
            )}
            {project.tags.map((tag) => (
                <ProjectChip
                    key={tag.value}
                    color="default"
                    value={tag.value}
                    onClick={ifClickable(() =>
                        history.push(`/projects/?search=${tag.value}`)
                    )}
                />
            ))}
        </Stack>
    )
}
ProjectChipRow.defaultProps = {
    clickable: false,
}
