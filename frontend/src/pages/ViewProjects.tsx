import * as React from "react"
import {
    Container,
    Grid,
    MenuItem,
    Select,
    Stack,
    ToggleButton,
} from "@mui/material"
import { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import { ArrowUpward, ArrowDownward } from "@mui/icons-material"
import { useHistory, useLocation } from "react-router-dom"
import { portalApiInstance } from "../api/portal-api"
import Project, { ProjectType, Term } from "../models/project"
import ProjectCard from "../components/ProjectCard"
import ClientOrgType from "../models/client-org-type"
import SearchBar from "../components/SearchBar"
import HelmetMetaData from "../components/HelmetMetaData"

// ESLint wants you to include functions in useEffect dependencies
// but it can cause infinite render loops
/* eslint-disable react-hooks/exhaustive-deps */

const ANY = "any"
type ClientTypeFilter = ClientOrgType | typeof ANY
type ProjectTypeFilter = ProjectType | typeof ANY
type TermFilter = Term | typeof ANY
type YearFilter = number | typeof ANY

export default function ViewProjects(): JSX.Element {
    const history = useHistory()
    const location = useLocation()

    // list of all projects loaded, including those currently filtered out
    const [allProjects, setAllProjects] = useState<Project[]>([])
    // list of projects to render
    const [projects, setProjects] = useState<Project[]>(allProjects)
    // search string, empty string shows all projects
    const [searchString, setSearchString] = useState<string>("")
    // ANY doesn't filter
    const [clientType, setClientType] = useState<ClientTypeFilter>(ANY)
    const [projectType, setProjectType] = useState<ProjectTypeFilter>(ANY)
    const [projectTerm, setProjectTerm] = useState<TermFilter>(ANY)
    const [projectYear, setProjectYear] = useState<YearFilter>(ANY)
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
            params.delete("client")
        } else {
            params.set("client", clientType)
        }

        if (projectType === ANY) {
            params.delete("type")
        } else {
            params.set("type", projectType)
        }

        if (projectTerm === ANY) {
            params.delete("term")
        } else {
            params.set("term", projectTerm)
        }

        if (projectYear === ANY) {
            params.delete("year")
        } else {
            params.set("year", projectYear.toString())
        }

        params.sort()

        // update URL in browser without reloading the page
        history.replace({
            pathname: location.pathname,
            search: params.toString(),
        })
    }

    // set state of filters based on URL search params
    const parseSearchParams = (loadedProjects: Project[]): void => {
        const params = new URLSearchParams(location.search)

        const search = params.get("search")
        const client = params.get("client")
        const type = params.get("type")
        const term = params.get("term")
        const year = params.get("year")

        if (search !== null && search !== "") {
            setSearchString(search)
        }

        if (
            client !== null &&
            // check if client is a ClientOrgType
            Object.values(ClientOrgType)
                .map((t: ClientOrgType) => t.toString())
                .includes(client)
        ) {
            setClientType(client as ClientOrgType)
        }

        if (
            type !== null &&
            // check if type is a ProjectType
            Object.values(ProjectType)
                .map((t: ProjectType) => t.toString())
                .includes(type)
        ) {
            setProjectType(type as ProjectType)
        }

        if (
            term !== null &&
            Object.values(Term)
                .map((t: Term) => t.toString())
                .includes(term)
        ) {
            setProjectTerm(term as Term)
        }

        if (year !== null) {
            const yearNumber = Number.parseInt(year, 10)
            if (
                !Number.isNaN(yearNumber) &&
                loadedProjects
                    .map((project) => project.year)
                    .includes(yearNumber)
            ) {
                setProjectYear(yearNumber)
            }
        }
    }

    // return list of projects matching search query, type/term/year filters
    const getMatchingProjects = (): Project[] => {
        let matchingProjects = allProjects

        if (clientType !== ANY) {
            matchingProjects = matchingProjects?.filter(
                (project) => project.client_org.type === clientType
            )
        }
        if (projectType !== ANY) {
            matchingProjects = matchingProjects?.filter(
                (project) => project.type === projectType
            )
        }
        if (projectTerm !== ANY) {
            matchingProjects = matchingProjects?.filter(
                (project) => project.term === projectTerm
            )
        }
        if (projectYear !== ANY) {
            matchingProjects = matchingProjects?.filter(
                (project) => project.year === projectYear
            )
        }
        // full-text search
        // very primitive solution, just convert the project object to JSON
        // and check that all words in searchString are in it.
        // if we find that it's too slow with lots of projects we could try something like this:
        // https://github.com/nextapps-de/flexsearch
        const searchWords = searchString.trim().toLowerCase().split(" ")
        matchingProjects = matchingProjects?.filter((project) => {
            const projectString = JSON.stringify(project).toLowerCase()
            return searchWords.every((word) => projectString.indexOf(word) > -1)
        })

        // sort by most recent, ties broken by name
        const termOrder = [Term.Spring, Term.Summer, Term.Fall, Term.Winter]
        matchingProjects?.sort((a, b) => {
            let compareValue = b.year - a.year
            if (compareValue === 0) {
                compareValue =
                    termOrder.indexOf(b.term) - termOrder.indexOf(a.term)
                if (compareValue === 0) {
                    compareValue = a.name.localeCompare(b.name)
                }
            }
            if (reverseSort) {
                compareValue *= -1
            }
            return compareValue
        })

        return matchingProjects
    }

    // parse search params and load projects from the API on page load
    useEffect(() => {
        portalApiInstance.getProjects().then((data: Project[]) => {
            setAllProjects(data)
            // the reason this takes the list of projects is to check if the year param matches any projects
            // can't use allProjects since the above setAllProjects runs asynchronously
            parseSearchParams(data)
        })
    }, [])

    // whenever filters change, update search params and the list of projects to render
    useEffect(() => {
        setSearchParams()
        setProjects(getMatchingProjects())
    }, [
        allProjects,
        searchString,
        clientType,
        projectType,
        projectTerm,
        projectYear,
        reverseSort,
    ])

    return (
        <>
            <HelmetMetaData
                title="Browse Projects | CMPUT 401 Projects Portal"
                noindex
            />
            <Container sx={{ my: 4 }} maxWidth="md">
                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    gutterBottom
                >
                    CMPUT 401 Projects
                </Typography>
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
                        >
                            <MenuItem value={ANY}>
                                <em>Client</em>
                            </MenuItem>
                            {Object.values(ClientOrgType).map((value) => (
                                <MenuItem key={value} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    {/* Project type select */}
                    <Grid item xs="auto">
                        <Select
                            value={projectType}
                            onChange={(event) =>
                                setProjectType(
                                    event.target.value as ProjectTypeFilter
                                )
                            }
                            sx={{ backgroundColor: "#ffffff" }}
                            autoWidth
                        >
                            <MenuItem value={ANY}>
                                <em>Type</em>
                            </MenuItem>
                            {Object.values(ProjectType).map((value) => (
                                <MenuItem key={value} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    {/* Project term select */}
                    <Grid item xs="auto">
                        <Select
                            value={projectTerm}
                            onChange={(event) =>
                                setProjectTerm(event.target.value as TermFilter)
                            }
                            sx={{ backgroundColor: "#ffffff" }}
                            autoWidth
                        >
                            <MenuItem value={ANY}>
                                <em>Term</em>
                            </MenuItem>
                            {Object.values(Term).map((value) => (
                                <MenuItem key={value} value={value}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    {/* Project year select */}
                    <Grid item xs="auto">
                        <Select
                            value={projectYear}
                            onChange={(event) =>
                                setProjectYear(event.target.value as YearFilter)
                            }
                            sx={{ backgroundColor: "#ffffff" }}
                            autoWidth
                        >
                            <MenuItem value={ANY}>
                                <em>Year</em>
                            </MenuItem>
                            {allProjects
                                ?.map((project) => project.year)
                                // remove duplicates
                                .filter(
                                    (value, index, array) =>
                                        array.indexOf(value) === index
                                )
                                // sort descending
                                .sort((a, b) => b - a)
                                .map((year) => (
                                    <MenuItem key={year} value={year}>
                                        {year}
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
                            sx={{ backgroundColor: "#ffffff", height: "100%" }}
                        >
                            {reverseSort ? <ArrowUpward /> : <ArrowDownward />}
                        </ToggleButton>
                    </Grid>
                </Grid>
                {/* X matching projects */}
                <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
                    {projects?.length === undefined
                        ? "Error retrieving projects"
                        : `${projects.length} matching ${
                              projects.length === 1 ? "project" : "projects"
                          }`}
                </Typography>
                {/* Project list */}
                <Stack direction="column" spacing={1}>
                    {projects?.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </Stack>
            </Container>
        </>
    )
}
