/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { Box, Container, Typography, Link, Grid } from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useState, useEffect } from "react"
import { ABOUT_TITLE, CLIENT_TEST } from "../constants/about-us"
import PageTitle from "../components/PageTitle"
import TestimonialCard from "../components/TestimonialCard"
import { portalApiInstance } from "../api/portal-api"
import ClientTestimonial from "../models/client-testimonial"
import HelmetMetaData from "../components/HelmetMetaData"

export default function About(): JSX.Element {
    // list of clients with testimonials
    const [clients, setClients] = useState<ClientTestimonial[]>([])

    useEffect(() => {
        portalApiInstance.getClientOrgs().then((clientsData) => {
            setClients(
                clientsData.filter((result) => result.testimonial).slice(0, 5)
            )
        })
    }, [])

    return (
        <>
            <HelmetMetaData title="About | CMPUT 401 Projects Portal" />
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <PageTitle title={ABOUT_TITLE} />
                    <Typography paragraph>
                        CMPUT 401 is a course at the University of Alberta that
                        focuses on software development. During the course, each
                        team of students is assigned to develop a software
                        project for a client, applying what they have learned
                        about software engineering.
                    </Typography>
                    <Typography paragraph>
                        The CMPUT 401 Projects Portal serves as a showcase of
                        the projects that the students have completed, and a
                        place to connect with potential clients who may be
                        interested in working with the students.
                    </Typography>
                    <Typography paragraph>
                        If you are a client interested in working with us,{" "}
                        <Link component={RouterLink} to="/proposal">
                            submit a proposal about your project
                        </Link>{" "}
                        and we&apos;ll get back to you soon!
                    </Typography>
                </Box>
                <Box sx={{ my: 6 }}>
                    {clients.length >= 3 ? (
                        <>
                            <Typography align="center" variant="h4" mb={2}>
                                {CLIENT_TEST}
                            </Typography>
                            <Grid container spacing={{ xs: 2, md: 3 }}>
                                {clients.map((client) => (
                                    <Grid
                                        item
                                        xs={12}
                                        style={{ display: "flex" }}
                                        key={client.id}
                                    >
                                        <TestimonialCard
                                            key={client.id}
                                            client={client}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </>
                    ) : null}
                </Box>
            </Container>
        </>
    )
}
