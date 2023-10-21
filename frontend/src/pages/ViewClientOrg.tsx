import * as React from "react"
import { Redirect, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Box, Container } from "@mui/material"
import { portalApiInstance } from "../api/portal-api"
import ClientOrg from "../models/client-org"
import ClientProfile from "../components/ClientProfile"
import HelmetMetaData from "../components/HelmetMetaData"

export default function ViewClientOrg(): JSX.Element {
    const { id }: { id: string } = useParams()
    const [clientOrg, setClientOrg] = useState<ClientOrg | undefined>(undefined)

    const [clientNotFound, setClientNotFound] = useState(false)

    useEffect(() => {
        portalApiInstance
            .getClientOrg(id)
            .then((data) => setClientOrg(data))
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setClientNotFound(true)
                }
            })
    }, [id])

    if (clientNotFound) return <Redirect to="/error/404" />

    return (
        <>
            <HelmetMetaData
                title={
                    clientOrg?.name
                        ? `${clientOrg?.name} | CMPUT 401 Projects Portal`
                        : undefined
                }
            />
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    {clientOrg !== undefined ? (
                        <ClientProfile client={clientOrg} />
                    ) : null}
                </Box>
            </Container>
        </>
    )
}
