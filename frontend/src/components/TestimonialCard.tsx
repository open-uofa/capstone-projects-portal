import * as React from "react"
import {
    Card,
    Typography,
    CardMedia,
    CardActionArea,
    Box,
    Link,
} from "@mui/material"
import { SyntheticEvent } from "react"
import { Link as RouterLink } from "react-router-dom"
import ClientTestimonial from "../models/client-testimonial"
import ClientOrgType from "../models/client-org-type"

const FALLBACK_IMAGE_URL = "/placeholder.png"

export default function TestimonialCard(props: {
    client: ClientTestimonial
}): JSX.Element {
    const { client } = props

    const logoUrl = client.image || FALLBACK_IMAGE_URL
    const clientUrl = `/clients/${client.id}`

    return (
        <Card sx={{ height: "100%" }}>
            <Box sx={{ padding: 1 }}>
                <CardActionArea component={RouterLink} to={clientUrl}>
                    <CardMedia
                        component="img"
                        image={logoUrl}
                        alt={`${client.name} logo`}
                        sx={{
                            m: 1,
                            backgroundColor: "#FFF",
                            color: "transparent",
                            borderRadius: "5px",
                            alignSelf: "center",
                            objectFit: "contain",
                            width: "125px",
                            height: "125px",
                            float: "left",
                            marginRight: "1rem",
                        }}
                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                            const element = e.target as HTMLImageElement
                            if (element.src !== FALLBACK_IMAGE_URL)
                                element.src = FALLBACK_IMAGE_URL
                        }}
                    />
                </CardActionArea>
                <Link component={RouterLink} to={clientUrl} variant="h4">
                    {client.name}
                </Link>
                {client.type !== ClientOrgType.Other && (
                    <Typography fontSize="small">{client.type}</Typography>
                )}
                <Typography variant="subtitle1">
                    {client.testimonial}
                </Typography>
            </Box>
        </Card>
    )
}
