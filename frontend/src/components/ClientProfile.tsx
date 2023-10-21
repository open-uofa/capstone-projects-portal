import { IconButton, Box } from "@mui/material"
import PublicIcon from "@mui/icons-material/Public"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { SyntheticEvent } from "react"
import ClientOrg from "../models/client-org"
import ProjectShortCard from "./ProjectShortCard"
import EditButton from "./EditButton"
import { useCurrentUser } from "../hooks"
import { canEditClientOrg } from "../models/current-user-info"

// 1x1 transparent image
const FALLBACK_IMAGE_URL =
    "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="

export default function ClientProfile(props: {
    client: ClientOrg
}): JSX.Element {
    const { client } = props

    // Edit button only visible if Admin or a Client Rep
    const canEdit = canEditClientOrg(useCurrentUser(), client)

    return (
        <Box sx={{ height: "100%" }}>
            <Box textAlign="center">
                <img
                    src={client.image || FALLBACK_IMAGE_URL}
                    alt={`${client.name} logo`}
                    height="150"
                    onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        const element = e.target as HTMLImageElement
                        if (element.src !== FALLBACK_IMAGE_URL)
                            element.src = FALLBACK_IMAGE_URL
                    }}
                />
            </Box>
            <Typography variant="h3" align="center">
                {client.name}
            </Typography>
            <Typography variant="h6" align="center">
                {client.type}
            </Typography>
            <Box textAlign="center" pb={4}>
                {client.website_link ? (
                    <IconButton
                        onClick={() =>
                            window.open(`${client.website_link}`, "_blank")
                        }
                    >
                        <PublicIcon />
                    </IconButton>
                ) : null}
                <div style={{ marginTop: "5px" }}>
                    {canEdit ? (
                        <EditButton editURL={`/clients/${client.id}/edit`} />
                    ) : null}
                </div>
            </Box>
            <Typography
                variant="h5"
                align="left"
                gutterBottom
                style={{ fontWeight: 600 }}
            >
                ABOUT US
            </Typography>
            <Typography variant="h5" align="left" paragraph>
                {client.about}
            </Typography>
            <Typography
                variant="h5"
                align="left"
                gutterBottom
                style={{ fontWeight: 600 }}
            >
                PROJECTS
            </Typography>

            {client.projects.length > 0 ? (
                client.projects.map((project) => (
                    <ProjectShortCard project={project} key={project.id} />
                ))
            ) : (
                <Typography variant="h5" align="left" paragraph>
                    No projects yet.
                </Typography>
            )}
        </Box>
    )
}
export {}
