import * as React from "react"
import { Box, Container, IconButton, Avatar } from "@mui/material"
import PublicIcon from "@mui/icons-material/Public"
import GitHubIcon from "@mui/icons-material/GitHub"
import LinkedInIcon from "@mui/icons-material/LinkedIn"
import PersonIcon from "@mui/icons-material/Person"
import Typography from "@mui/material/Typography"
import { Redirect, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { portalApiInstance } from "../api/portal-api"
import User from "../models/user"
import ProjectShortCard from "../components/ProjectShortCard"
import EditButton from "../components/EditButton"
import HelmetMetaData from "../components/HelmetMetaData"
import { useCurrentUser } from "../hooks"
import { canEditUser } from "../models/current-user-info"

export default function Profile(): JSX.Element {
    const currentlyLoggedInUser = useCurrentUser()

    const { id }: { id: string } = useParams()
    const [user, setUser] = useState<User | undefined>(undefined)

    const [userNotFound, setUserNotFound] = useState(false)

    useEffect(() => {
        portalApiInstance
            .getUser(id)
            .then((data) => setUser(data))
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setUserNotFound(true)
                }
            })
    }, [id])

    if (userNotFound) return <Redirect to="/error/404" />

    // Can the currently logged in user edit the viewed user?
    const canEdit = canEditUser(currentlyLoggedInUser, id)

    if (user !== undefined) {
        let { image: profileImage } = user
        if (!profileImage && user.github_user_id) {
            profileImage = `https://avatars.githubusercontent.com/u/${user.github_user_id}`
        }
        return (
            <>
                <HelmetMetaData
                    title={
                        user?.name
                            ? `${user?.name} | CMPUT 401 Projects Portal`
                            : undefined
                    }
                />
                <Container maxWidth="md">
                    <Box sx={{ my: 6 }}>
                        <Box display="flex" justifyContent="center">
                            {profileImage ? (
                                <Box height="100px" width="100px">
                                    <Box
                                        component="img"
                                        src={profileImage}
                                        alt="user image"
                                        height="100%"
                                        width="100%"
                                        style={{
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Avatar sx={{ width: 100, height: 100 }}>
                                    <PersonIcon
                                        sx={{ width: 80, height: 80 }}
                                    />
                                </Avatar>
                            )}
                        </Box>
                        <Typography variant="h4" align="center">
                            {user.name}
                        </Typography>
                        <Typography variant="h6" align="center">
                            {user.bio}
                        </Typography>
                        <Box textAlign="center" pb={4}>
                            {user.website_link ? (
                                <IconButton
                                    onClick={() =>
                                        window.open(
                                            `${user.website_link}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    <PublicIcon />
                                </IconButton>
                            ) : null}
                            {user.github_username ? (
                                <IconButton
                                    onClick={() =>
                                        window.open(
                                            `https://www.github.com/${user.github_username}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    <GitHubIcon />
                                </IconButton>
                            ) : null}
                            {user.linkedin_link ? (
                                <IconButton
                                    onClick={() =>
                                        window.open(
                                            `${user.linkedin_link}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    <LinkedInIcon />
                                </IconButton>
                            ) : null}
                            <div style={{ marginTop: "5px" }}>
                                {canEdit ? (
                                    <EditButton
                                        editURL={`/profiles/${id}/edit`}
                                    />
                                ) : null}
                            </div>
                        </Box>

                        {user?.student_projects?.length !== 0 ? (
                            <>
                                <Typography variant="h6">
                                    STUDENT PROJECTS
                                </Typography>
                                {user?.student_projects?.map((project) => (
                                    <ProjectShortCard
                                        project={project}
                                        key={project.id}
                                    />
                                ))}
                            </>
                        ) : null}

                        {user?.ta_projects?.length !== 0 ? (
                            <>
                                <Typography variant="h6">
                                    TA PROJECTS
                                </Typography>
                                {user?.ta_projects?.map((project) => (
                                    <ProjectShortCard
                                        project={project}
                                        key={project.id}
                                    />
                                ))}
                            </>
                        ) : null}

                        {user?.client_rep_projects?.length !== 0 ? (
                            <>
                                <Typography variant="h6">
                                    CLIENT REPRESENTATIVE PROJECTS
                                </Typography>
                                {user?.client_rep_projects?.map((project) => (
                                    <ProjectShortCard
                                        project={project}
                                        key={project.id}
                                    />
                                ))}
                            </>
                        ) : null}

                        {user?.student_projects?.length === 0 &&
                        user?.ta_projects?.length === 0 &&
                        user?.client_rep_projects?.length === 0 ? (
                            <Typography variant="h6">No projects.</Typography>
                        ) : null}
                    </Box>
                </Container>
            </>
        )
    }
    return <Container />
}
