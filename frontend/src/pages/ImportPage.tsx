/* eslint-disable no-nested-ternary */
import * as React from "react"
import { useState } from "react"
import Box from "@mui/material/Box"
import { Button, Container, Stack } from "@mui/material"
import ErrorIcon from "@mui/icons-material/Error"
import WarningIcon from "@mui/icons-material/Warning"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import { Tab, Tabs, TabList, TabPanel } from "react-tabs"
import Typography from "@mui/material/Typography"
import { portalApiInstance } from "../api/portal-api"
import User from "../models/user"
import ClientOrg from "../models/client-org"
import Project from "../models/project"
import ImportCsvResponse from "../models/import"
import SnackbarAlert from "../components/SnackbarAlert"
import HelmetMetaData from "../components/HelmetMetaData"
import "react-tabs/style/react-tabs.css"
import ProjectShort from "../models/project-short"
import RequireLoggedIn from "../components/RequireLoggedIn"

function toLogUser(user: User, isNew: boolean) {
    return {
        ...user,
        is_new: isNew,
    }
}

function toLogClientOrg(clientOrg: ClientOrg, isNew: boolean) {
    return {
        ...clientOrg,
        is_new: isNew,
    }
}

function toLogProject(project: Project, isNew: boolean) {
    return {
        ...project,
        is_new: isNew,
    }
}

interface UserData extends User {
    is_new: boolean
}

interface ClientOrgData extends ClientOrg {
    is_new: boolean
}

interface ProjectData extends Project {
    is_new: boolean
}

const getUsersTable = (userRows: UserData[]) => (
    <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell align="right">id</TableCell>
                    <TableCell align="right">email</TableCell>
                    <TableCell align="right">name</TableCell>
                    <TableCell align="right">github_username</TableCell>
                    <TableCell align="right">student_projects</TableCell>
                    <TableCell align="right">ta_projects</TableCell>
                    <TableCell align="right">client_rep_projects</TableCell>
                    <TableCell align="right">is_new</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {userRows.map((row) => (
                    <TableRow
                        key={row.id}
                        sx={{
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                        }}
                    >
                        <TableCell component="th" scope="row">
                            {row.id}
                        </TableCell>
                        <TableCell align="right">{row.email}</TableCell>
                        <TableCell align="right">{row.name}</TableCell>
                        <TableCell align="right">
                            {row.github_username}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(
                                row?.student_projects?.map(
                                    (project: ProjectShort) => `${project.id}`
                                )
                            )}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(
                                row?.ta_projects?.map(
                                    (project: ProjectShort) => `${project.id}`
                                )
                            )}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(
                                row?.client_rep_projects?.map(
                                    (project: ProjectShort) => `${project.id}`
                                )
                            )}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(row.is_new)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)

const getClientsTable = (clientRows: ClientOrgData[]) => (
    <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell align="right">id</TableCell>
                    <TableCell align="right">name</TableCell>
                    <TableCell align="right">projects</TableCell>
                    <TableCell align="right">reps</TableCell>
                    <TableCell align="right">is_new</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {clientRows.map((row) => (
                    <TableRow
                        key={row.id}
                        sx={{
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                        }}
                    >
                        <TableCell component="th" scope="row">
                            {row.id}
                        </TableCell>
                        <TableCell align="right">{row.name}</TableCell>
                        <TableCell align="right">
                            {JSON.stringify(
                                row.projects.map(
                                    (project: ProjectShort) => `${project.id}`
                                )
                            )}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(
                                row.reps.map((rep: User) => `${rep.id}`)
                            )}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(row.is_new)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)

const getProjectsTable = (projectRows: ProjectData[]) => (
    <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell align="right">id</TableCell>
                    <TableCell align="right">name</TableCell>
                    <TableCell align="right">client_org</TableCell>
                    <TableCell align="right">client_rep</TableCell>
                    <TableCell align="right">ta</TableCell>
                    <TableCell align="right">students</TableCell>
                    <TableCell align="right">is_new</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {projectRows.map((row) => (
                    <TableRow
                        key={row.id}
                        sx={{
                            "&:last-child td, &:last-child th": {
                                border: 0,
                            },
                        }}
                    >
                        <TableCell component="th" scope="row">
                            {row.id}
                        </TableCell>
                        <TableCell align="right">{row.name}</TableCell>
                        <TableCell align="right">
                            {row.client_org ? row.client_org.id : null}
                        </TableCell>
                        <TableCell align="right">
                            {row.client_rep ? row.client_rep.id : null}
                        </TableCell>
                        <TableCell align="right">
                            {row.ta ? row.ta.id : null}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(
                                row.students.map(
                                    (student: User) => `${student.id}`
                                )
                            )}
                        </TableCell>
                        <TableCell align="right">
                            {JSON.stringify(row.is_new)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)

export default function ImportPage(): JSX.Element | null {
    const [csvFile, setCsvFile] = useState<File | undefined>(undefined)

    // true (and highlights csv box) if a csv file is uploaded
    const [highlighted, setHighlighted] = React.useState(false)

    // import button only works when this is set to true
    const [validated, setValidated] = useState(false)

    // set to true to display alert
    const [successAlert, setSuccessAlert] = React.useState(false)
    const [warningAlert, setWarningAlert] = React.useState(false)
    const [errorAlert, setErrorAlert] = React.useState(false)

    const [warningMessages, setWarningMessages] = React.useState<
        string[] | null
    >(null)
    const [errorMessages, setErrorMessages] = React.useState<string[] | null>(
        null
    )

    // variables for printing out data
    const logUsers: UserData[] = []
    const logClientOrgs: ClientOrgData[] = []
    const logProjects: ProjectData[] = []

    const [loadedUsersData, setLoadedUsersData] = React.useState<
        UserData[] | null
    >(null)
    const [loadedClientOrgsData, setLoadedClientOrgsData] = React.useState<
        ClientOrgData[] | null
    >(null)
    const [loadedProjectsData, setLoadedProjectsData] = React.useState<
        ProjectData[] | null
    >(null)

    function logImportResponse(response: ImportCsvResponse): void {
        // add logging specific fields to User objects
        logUsers.push(
            ...response.users.new.map((user) => toLogUser(user, true))
        )
        logUsers.push(
            ...response.users.existing.map((user) => toLogUser(user, false))
        )
        setLoadedUsersData(logUsers)

        // add logging specific fields to ClientOrg objects
        logClientOrgs.push(
            ...response.orgs.new.map((clientOrg) =>
                toLogClientOrg(clientOrg, true)
            )
        )
        logClientOrgs.push(
            ...response.orgs.existing.map((clientOrg) =>
                toLogClientOrg(clientOrg, false)
            )
        )
        setLoadedClientOrgsData(logClientOrgs)

        // add logging specific fields to Project objects
        logProjects.push(
            ...response.projects.new.map((project) =>
                toLogProject(project, true)
            )
        )
        logProjects.push(
            ...response.projects.existing.map((project) =>
                toLogProject(project, false)
            )
        )
        setLoadedProjectsData(logProjects)

        console.clear()

        console.log("%c API Response:", "font-size: 20px; color: fuchsia")
        console.log(response)

        console.log("%c Users:", "font-size: 20px; color: cyan")
        console.table(logUsers, [
            "id",
            "email",
            "name",
            "github_username",
            "student_projects",
            "ta_projects",
            "client_rep_projects",
            "is_new",
        ])

        console.log("%c Clients:", "font-size: 20px; color: cyan")
        console.table(logClientOrgs, [
            "id",
            "name",
            "projects",
            "reps",
            "is_new",
        ])

        console.log("%c Projects:", "font-size: 20px; color: cyan")
        console.table(logProjects, [
            "id",
            "name",
            "client_org",
            "client_rep",
            "ta",
            "students",
            "is_new",
        ])

        console.log("%c Warnings:", "font-size: 20px; color: orange")
        console.table(response.warnings)
        setWarningMessages(response.warnings)

        console.log("%c Errors:", "font-size: 20px; color: red")
        console.table(response.errors)
        setErrorMessages(response.errors)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleAPIError(error: any): void {
        setErrorAlert(true)

        console.clear()
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("Response body:", error.response.data)
            console.log("Status code:", error.response.status)
            console.log("Response headers:", error.response.headers)
            setErrorMessages([
                `The request was made and there was a server error (status code ${error.response.status}).\n` +
                    `Please ensure that your data is properly formatted.`,
            ])
        } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request)
            setErrorMessages([
                `The following request was made but no response was received:\n` +
                    `Request: ${error.request}`,
            ])
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message)
            setErrorMessages([
                "Something happened in setting up the request that triggered an Error",
                error.message,
            ])
        }
    }

    return (
        <RequireLoggedIn validate={(currentUser) => currentUser.is_superuser}>
            <HelmetMetaData title="Import Data | CMPUT 401 Projects Portal" />
            <Container sx={{ my: 4 }} maxWidth="sm">
                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    gutterBottom
                >
                    Import Data
                </Typography>
                <Typography
                    variant="body1"
                    component="h1"
                    align="left"
                    gutterBottom
                >
                    <div style={{ fontWeight: 700, marginBottom: "10px" }}>
                        Import users, clients, and projects from a CSV file.
                    </div>
                    <ol style={{ paddingLeft: "17px" }}>
                        <li style={{ lineHeight: "22px", marginBottom: "8px" }}>
                            Upload a CSV file by clicking the &quot;upload CSV
                            file&quot; button or by dragging the CSV file into
                            rectangular dropzone.
                        </li>
                        <li style={{ lineHeight: "22px", marginBottom: "8px" }}>
                            Click &quot;validate&quot;, which will do a dry run
                            of the import without creating any data. The result
                            will be logged to the browser console for
                            inspection.
                        </li>
                        <li style={{ lineHeight: "22px", marginBottom: "8px" }}>
                            If there are no errors, and the response looks
                            correct to you, click &quot;import&quot; to create
                            the data.
                        </li>
                        <li style={{ lineHeight: "22px", marginBottom: "8px" }}>
                            Verify that the data was successfully created in the
                            Django admin page.
                        </li>
                    </ol>
                </Typography>
                {/* drag-n-drop code adapted from https://www.youtube.com/watch?v=SmIRn6uVVVI */}
                <Box
                    sx={{
                        p: 2,
                        my: 3,
                        background: `${
                            highlighted
                                ? "#C6FFC6"
                                : csvFile !== undefined
                                ? "#DDFFDD"
                                : "#FCFCFC"
                        }`,
                        border: `1px solid #007C41`,
                        borderRadius: "5px",
                    }}
                    onDragEnter={() => {
                        setHighlighted(true)
                    }}
                    onDragLeave={() => {
                        setHighlighted(false)
                    }}
                    onDragOver={(e) => {
                        e.preventDefault()
                    }}
                    onDrop={(e) => {
                        e.preventDefault()
                        setHighlighted(false)

                        Array.from(e.dataTransfer.files)
                            .filter((file) => file.type === "text/csv")
                            .forEach(async (file) => {
                                const text = await file.text()
                                console.log(text)
                                setCsvFile(file)
                                setValidated(false)
                            })
                    }}
                >
                    <div style={{ fontSize: "14px", pointerEvents: "none" }}>
                        Drop CSV file here or
                    </div>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label htmlFor="contained-button-file">
                        <input
                            accept=".csv"
                            id="contained-button-file"
                            type="file"
                            style={{ display: "none" }}
                            onChange={(event) => {
                                if (
                                    event.target.files !== null &&
                                    event.target.files.length > 0
                                ) {
                                    setCsvFile(event.target.files[0])
                                    setValidated(false)
                                }
                            }}
                        />
                        <Button
                            variant="outlined"
                            component="span"
                            sx={{ my: 0.5, mr: 1 }}
                        >
                            Upload CSV file
                        </Button>
                        {csvFile !== undefined ? (
                            <span style={{ fontSize: "14px" }}>
                                {csvFile.name}
                            </span>
                        ) : null}
                    </label>
                </Box>
                <Stack
                    sx={{
                        my: 2,
                        paddingRight: "0px",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                    }}
                >
                    <Button
                        variant="contained"
                        disabled={csvFile === undefined}
                        onClick={() => {
                            if (csvFile !== undefined) {
                                setValidated(false)
                                portalApiInstance
                                    .validateCsv(csvFile)
                                    .then((response) => {
                                        logImportResponse(response)

                                        const numWarnings =
                                            response.warnings.length
                                        const numErrors = response.errors.length

                                        // we still allow importing if there are warnings
                                        setValidated(numErrors === 0)

                                        if (
                                            numWarnings === 0 &&
                                            numErrors === 0
                                        ) {
                                            setSuccessAlert(true)
                                        } else if (
                                            numWarnings > 0 &&
                                            numErrors === 0
                                        ) {
                                            setWarningAlert(true)
                                        } else {
                                            setErrorAlert(true)
                                        }
                                    })
                                    .catch((error) => handleAPIError(error))
                            }
                        }}
                    >
                        Validate
                    </Button>
                    <Button
                        sx={{ ml: 1 }}
                        variant="contained"
                        disabled={!validated}
                        onClick={() => {
                            if (csvFile !== undefined) {
                                portalApiInstance
                                    .importCsv(csvFile)
                                    .then((response) => {
                                        logImportResponse(response)

                                        const numWarnings =
                                            response.warnings.length
                                        const numErrors = response.errors.length

                                        if (
                                            numWarnings === 0 &&
                                            numErrors === 0
                                        ) {
                                            setSuccessAlert(true)
                                        } else if (
                                            numWarnings > 0 &&
                                            numErrors === 0
                                        ) {
                                            setWarningAlert(true)
                                        } else {
                                            setErrorAlert(true)
                                        }
                                    })
                                    .catch((error) => handleAPIError(error))
                            }
                        }}
                    >
                        Import
                    </Button>
                </Stack>
                <SnackbarAlert
                    open={successAlert}
                    onClose={(
                        event?: React.SyntheticEvent,
                        reason?: string
                    ) => {
                        if (reason === "clickaway") {
                            return
                        }
                        setSuccessAlert(false)
                    }}
                    severity="success"
                    message="Success! See browser console for more information."
                />
                <SnackbarAlert
                    open={warningAlert}
                    onClose={(
                        event?: React.SyntheticEvent,
                        reason?: string
                    ) => {
                        if (reason === "clickaway") {
                            return
                        }
                        setWarningAlert(false)
                    }}
                    severity="warning"
                    message="Warning! See browser console for more information."
                />
                <SnackbarAlert
                    open={errorAlert}
                    onClose={(
                        event?: React.SyntheticEvent,
                        reason?: string
                    ) => {
                        if (reason === "clickaway") {
                            return
                        }
                        setErrorAlert(false)
                    }}
                    severity="error"
                    message="Error! See browser console for more information."
                />
            </Container>
            {errorMessages === null ? null : (
                <Container maxWidth="sm" sx={{ mb: 4 }}>
                    {errorMessages.map((message) => (
                        <Box
                            key={message}
                            sx={{
                                backgroundColor: "#FCEEF0",
                                border: "1px solid #FCEEF0",
                                borderRadius: "4px",
                                color: "#5A252A",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <ErrorIcon sx={{ marginRight: "16px" }} />
                            <div
                                style={{ fontSize: "14px", lineHeight: "18px" }}
                            >
                                {message}
                            </div>
                        </Box>
                    ))}
                </Container>
            )}
            {warningMessages === null ? null : (
                <Container maxWidth="sm" sx={{ mb: 4 }}>
                    {warningMessages.map((message) => (
                        <Box
                            key={message}
                            sx={{
                                backgroundColor: "rgb(255, 250, 235)",
                                border: "1px solid rgb(255, 250, 235)",
                                borderRadius: "4px",
                                color: "rgb(102, 82, 22)",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <WarningIcon sx={{ marginRight: "16px" }} />
                            <div
                                style={{ fontSize: "14px", lineHeight: "18px" }}
                            >
                                {message}
                            </div>
                        </Box>
                    ))}
                </Container>
            )}
            {(loadedUsersData === null &&
                loadedClientOrgsData === null &&
                loadedProjectsData === null) ||
            (errorMessages && errorMessages.length > 0) ? null : (
                <Container maxWidth="lg" sx={{ mb: 4 }}>
                    <Tabs>
                        <TabList>
                            {loadedUsersData === null ? null : (
                                <Tab
                                    style={{
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    Users
                                </Tab>
                            )}
                            {loadedClientOrgsData === null ? null : (
                                <Tab
                                    style={{
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    Client Orgs
                                </Tab>
                            )}
                            {loadedProjectsData === null ? null : (
                                <Tab
                                    style={{
                                        backgroundColor: "transparent",
                                    }}
                                >
                                    Projects
                                </Tab>
                            )}
                        </TabList>

                        <TabPanel>
                            {loadedUsersData === null
                                ? null
                                : getUsersTable(loadedUsersData)}
                        </TabPanel>
                        <TabPanel>
                            {loadedClientOrgsData === null
                                ? null
                                : getClientsTable(loadedClientOrgsData)}
                        </TabPanel>
                        <TabPanel>
                            {loadedProjectsData === null
                                ? null
                                : getProjectsTable(loadedProjectsData)}
                        </TabPanel>
                    </Tabs>
                </Container>
            )}
        </RequireLoggedIn>
    )
}
