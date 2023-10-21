import * as React from "react"
import { useEffect, useState } from "react"
import {
    Box,
    Button,
    Container,
    Grid,
    MenuItem,
    Select,
    ToggleButton,
} from "@mui/material"
import Typography from "@mui/material/Typography"
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom"
import { ArrowDownward, ArrowUpward } from "@mui/icons-material"
import PageTitle from "../components/PageTitle"
import { portalApiInstance } from "../api/portal-api"
import ClientOrg from "../models/client-org"
import ClientCard from "../components/ClientCard"
import ClientOrgType from "../models/client-org-type"
import SearchBar from "../components/SearchBar"
import HelmetMetaData from "../components/HelmetMetaData"

// ESLint wants you to include functions in useEffect dependencies
// but it can cause infinite render loops
/* eslint-disable react-hooks/exhaustive-deps */

const ANY = "any"
type ClientTypeFilter = ClientOrgType | typeof ANY

export default function ViewClients(): JSX.Element {
    const history = useHistory()
    const location = useLocation()

    // list of all orgs loaded, including those currently filtered out
    const [allClientOrgs, setAllClientOrgs] = useState<ClientOrg[]>([])
    // list of orgs to render
    const [clientOrgs, setClientOrgs] = useState<ClientOrg[]>(allClientOrgs)
    // search string, empty string shows all
    const [searchString, setSearchString] = useState<string>("")
    // ANY doesn't filter
    const [clientType, setClientType] = useState<ClientTypeFilter>(ANY)
    const [reverseSort, setReverseSort] = useState<boolean>(false)

    // set URL search parameters based on current state of filters
    const setSearchParams = (): void => {
        const params = new URLSearchParams(location.search)

        if (searchString === "") {
            params.delete("search")
        } else {
            params.set("search", searchString)
        }

        if (clientType === ANY) {
            params.delete("type")
        } else {
            params.set("type", clientType)
        }

        params.sort()

        // update URL in browser without reloading the page
        history.replace({
            pathname: location.pathname,
            search: params.toString(),
        })
    }

    // set state of filters based on URL search params
    const parseSearchParams = (): void => {
        const params = new URLSearchParams(location.search)

        const search = params.get("search")
        const type = params.get("type")

        if (search !== null && search !== "") {
            setSearchString(search)
        }

        if (
            type !== null &&
            // check if client is a ClientOrgType
            Object.values(ClientOrgType)
                .map((t: ClientOrgType) => t.toString())
                .includes(type)
        ) {
            setClientType(type as ClientOrgType)
        }
    }

    /**
     * Returns a list of `ClientOrg`s that match the search query and client type.
     * A client matches the search query if their name matches every word in the search query,
     * their about text matches every word in the search query,
     * or any of their `Project`'s names match every word in the search query.
     * @returns A list of matching `ClientOrg`s in the order they should be displayed.
     */
    const getMatchingClientOrgs = (): ClientOrg[] => {
        let matchingClientOrgs = allClientOrgs

        if (clientType !== ANY) {
            matchingClientOrgs = matchingClientOrgs.filter(
                (clientOrg) => clientOrg.type === clientType
            )
        }

        const searchWords = searchString.trim().toLowerCase().split(" ")
        matchingClientOrgs = matchingClientOrgs.filter((clientOrg) =>
            searchWords.every(
                (word) =>
                    clientOrg.name.toLowerCase().includes(word) ||
                    clientOrg.about.toLowerCase().includes(word) ||
                    clientOrg.projects.filter((project) =>
                        project.name.toLowerCase().includes(word)
                    ).length > 0
            )
        )

        // Sort in alphabetical order, possibly reversed
        matchingClientOrgs.sort((a, b) => {
            let compareValue = a.name.localeCompare(b.name)
            if (reverseSort) {
                compareValue *= -1
            }
            return compareValue
        })

        return matchingClientOrgs
    }

    // parse search params and load clients from the API on page load
    useEffect(() => {
        portalApiInstance.getClientOrgs().then((data: ClientOrg[]) => {
            setAllClientOrgs(data)
            parseSearchParams()
        })
    }, [])

    // whenever filters change, update search params and the list of clients to render
    useEffect(() => {
        setSearchParams()
        setClientOrgs(getMatchingClientOrgs())
    }, [allClientOrgs, searchString, clientType, reverseSort])

    return (
        <>
            <HelmetMetaData
                title="Browse Clients | CMPUT 401 Projects Portal"
                noindex
            />
            <Container maxWidth="sm">
                <Box sx={{ my: 4 }}>
                    <PageTitle title="CMPUT 401 Clients" />
                    <Grid container spacing={1}>
                        <Grid item xs={12} md>
                            <SearchBar
                                value={searchString}
                                onChange={(event) =>
                                    setSearchString(event.target.value)
                                }
                            />
                        </Grid>
                        {/* Client type select */}
                        <Grid item xs="auto">
                            <Select
                                value={clientType}
                                onChange={(event) =>
                                    setClientType(
                                        event.target.value as ClientTypeFilter
                                    )
                                }
                                sx={{ backgroundColor: "#ffffff" }}
                                autoWidth
                                aria-label="Type"
                            >
                                <MenuItem value={ANY}>
                                    <em>Type</em>
                                </MenuItem>
                                {Object.values(ClientOrgType).map((value) => (
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        {/* Reverse sort order button */}
                        <Grid item xs="auto">
                            <ToggleButton
                                value="reverseSort"
                                color="primary"
                                selected={reverseSort}
                                onChange={() => {
                                    setReverseSort(!reverseSort)
                                }}
                                sx={{
                                    backgroundColor: "#ffffff",
                                    height: "100%",
                                }}
                                role="switch"
                                aria-label="Sort in Ascending Order"
                                aria-checked={reverseSort}
                            >
                                {reverseSort ? (
                                    <ArrowUpward />
                                ) : (
                                    <ArrowDownward />
                                )}
                            </ToggleButton>
                        </Grid>
                    </Grid>
                    {/* X matching clients */}
                    <Typography
                        variant="subtitle1"
                        align="center"
                        sx={{ mb: 1 }}
                    >
                        {clientOrgs?.length === undefined
                            ? "Error retrieving clients"
                            : `${clientOrgs.length} matching ${
                                  clientOrgs.length === 1 ? "client" : "clients"
                              }`}
                    </Typography>

                    <Grid
                        container
                        spacing={{ xs: 2, md: 3 }}
                        columns={{ xs: 4, sm: 8, md: 12 }}
                    >
                        {clientOrgs?.map((client) => (
                            <Grid item xs={2} sm={4} md={4} key={client.id}>
                                <ClientCard client={client} />
                            </Grid>
                        ))}
                    </Grid>

                    <Box textAlign="center" sx={{ my: 4 }}>
                        <Button
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            to="/proposal"
                        >
                            Submit a Proposal
                        </Button>
                    </Box>
                </Box>
            </Container>
        </>
    )
}
