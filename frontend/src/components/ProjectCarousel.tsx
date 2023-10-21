import * as React from "react"
import { Box } from "@mui/material"
import Carousel, { ResponsiveType } from "react-multi-carousel"
import ProjectShort from "../models/project-short"
import ProjectShortCard from "./ProjectShortCard"

const responsive: ResponsiveType = {
    desktop: {
        breakpoint: { max: 3000, min: 1400 },
        partialVisibilityGutter: 24,
        items: 3,
    },
    tablet: {
        breakpoint: { max: 1400, min: 800 },
        partialVisibilityGutter: 24,
        items: 2,
    },
    mobile: {
        breakpoint: { max: 800, min: 0 },
        partialVisibilityGutter: 60,
        items: 1,
    },
}

export default function ProjectCarousel(props: {
    projects: ProjectShort[]
}): JSX.Element {
    const { projects } = props
    return (
        <Carousel responsive={responsive} partialVisible>
            {projects.map((project) => (
                <Box key={project.id} sx={{ height: "100%", py: 2 }}>
                    <ProjectShortCard project={project} />
                </Box>
            ))}
        </Carousel>
    )
}
