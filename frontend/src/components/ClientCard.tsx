import { Card, CardActionArea, CardContent, CardMedia } from "@mui/material"
import Typography from "@mui/material/Typography"
import type { SyntheticEvent } from "react"
import { Link as RouterLink } from "react-router-dom"
import type ClientOrg from "../models/client-org"
import type ClientOrgShort from "../models/client-org-short"

const FALLBACK_IMAGE_URL = "/placeholder.png"

export default function ClientCard(props: {
    client: ClientOrg | ClientOrgShort
}): JSX.Element {
    const { client } = props

    let logoURL = client?.image
    if (
        logoURL === null ||
        logoURL === undefined ||
        (logoURL && logoURL.trim().length === 0)
    ) {
        logoURL = FALLBACK_IMAGE_URL
    }

    return (
        <Card
            sx={{ height: "100%" }}
            className="client-card"
            id={`client-card-${client.id}`}
        >
            <CardActionArea
                component={RouterLink}
                to={`/clients/${client.id}`}
                sx={{ height: "100%" }}
            >
                <CardMedia
                    component="img"
                    image={logoURL}
                    onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        const element = e.target as HTMLImageElement
                        if (element.src !== FALLBACK_IMAGE_URL)
                            element.src = FALLBACK_IMAGE_URL
                    }}
                    alt={`${client.name} logo`}
                    sx={{
                        objectFit: "contain",
                        width: "100%",
                        aspectRatio: "1",
                    }}
                />
                <CardContent>
                    <Typography variant="h6" align="center">
                        {client.name}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}
