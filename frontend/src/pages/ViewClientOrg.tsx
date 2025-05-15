import { Box, Container } from "@mui/material"
import { useEffect, useState } from "react"
import { Redirect, useParams } from "react-router-dom"
import { portalApiInstance } from "../api/portal-api"
import ClientProfile from "../components/ClientProfile"
import HelmetMetaData from "../components/HelmetMetaData"
import type ClientOrg from "../models/client-org"

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
                        ? `${clientOrg?.name} | Capstone Projects Portal`
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
