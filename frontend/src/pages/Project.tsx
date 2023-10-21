import * as React from "react"
import {
    CardContent,
    Container,
    Paper,
    Box,
    Stack,
    Grid,
    IconButton,
    Button,
    useTheme,
    Link,
} from "@mui/material"
import {
    FacebookShareButton,
    FacebookIcon,
    LinkedinShareButton,
    LinkedinIcon,
    TwitterShareButton,
    TwitterIcon,
} from "react-share"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Carousel } from "react-responsive-carousel"
import PublicIcon from "@mui/icons-material/Public"
import GitHubIcon from "@mui/icons-material/GitHub"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import Typography from "@mui/material/Typography"
import { CSSProperties, SyntheticEvent, useEffect, useState } from "react"
import { Redirect, useParams, Link as RouterLink } from "react-router-dom"
import { portalApiInstance } from "../api/portal-api"
import Project from "../models/project"
import ProjectMember from "../components/ProjectMember"
import EditButton from "../components/EditButton"
import HelmetMetaData from "../components/HelmetMetaData"
import ProjectChipRow from "../components/ProjectChipRow"
import { canEditProject } from "../models/current-user-info"
import { useCurrentUser } from "../hooks"

const FALLBACK_IMAGE_URL = "/placeholder.png"

const getEmbedLink = (link: string) => {
    // code from https://stackoverflow.com/a/28735569

    const linkRegExp = new RegExp(
        "^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|" +
            "watch\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*"
    )

    if (link !== undefined && link !== null && link !== "") {
        const match = link.match(linkRegExp)

        // if the link is a valid YouTube link
        if (match && match[2].length === 11) {
            const watchURL = match[2]
            return `https://www.youtube.com/embed/${watchURL}`
        }
    }

    return ""
}

const getYouTubeVideoId = (link: string) => {
    // code from https://stackoverflow.com/a/28735569

    const linkRegExp = new RegExp(
        "^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|" +
            "watch\\?v=|\\&v=|\\?v=)([^#\\&\\?]*).*"
    )

    if (link !== undefined && link !== null && link !== "") {
        const match = link.match(linkRegExp)

        // if the link is a valid YouTube link
        if (match && match[2].length === 11) {
            const watchURL = match[2]
            return watchURL
        }
    }

    return ""
}

function CarouselTitle(titleObj: { title: string }): JSX.Element {
    const { title } = titleObj

    return (
        <div
            style={{
                alignSelf: "flex-start",
                marginBottom: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
            }}
        >
            {title}
        </div>
    )
}

const getCarouselSlides = (
    videoURL: string,
    screenshotURL: string,
    storyboard: string
) => {
    const slides = []
    if (videoURL && videoURL !== "") {
        slides.push(
            <div
                key={`${screenshotURL}container2`}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CarouselTitle title="Screencast" />
                <div
                    key={`${screenshotURL}container1`}
                    style={{
                        position: "relative",
                        width: "90%",
                        height: "0",
                        paddingBottom: "56.25%",
                    }}
                >
                    <iframe
                        // width="100%"
                        height="100%"
                        src={videoURL}
                        key={videoURL}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer;
                    autoplay; clipboard-write;
                    encrypted-media; gyroscope;
                    picture-in-picture"
                        allowFullScreen
                        style={{
                            position: "absolute",
                            top: "0",
                            right: "-40px",
                            width: "100%",
                            height: "100%",
                        }}
                    />
                </div>
            </div>
        )
    }
    if (screenshotURL && screenshotURL !== "") {
        slides.push(
            <div
                key={`${screenshotURL}container2`}
                style={{
                    height: "100%",
                    maxHeight: "530px",
                    objectFit: "contain",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    key={`${screenshotURL}container1`}
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <CarouselTitle title="Screenshot" />
                    <img
                        src={screenshotURL}
                        key={screenshotURL}
                        alt="project screenshot"
                        style={{
                            height: "100%",
                            maxWidth: "875px",
                            objectFit: "contain",
                        }}
                    />
                </div>
            </div>
        )
    }
    if (storyboard && storyboard !== "") {
        slides.push(
            <div
                key={`${screenshotURL}container2`}
                style={{
                    height: "100%",
                    maxHeight: "530px",
                    objectFit: "contain",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    key={`${screenshotURL}container1`}
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <CarouselTitle title="Storyboard" />
                    <img
                        src={storyboard}
                        key={screenshotURL}
                        alt="project storyboard"
                        style={{
                            height: "100%",
                            maxWidth: "875px",
                            objectFit: "contain",
                        }}
                    />
                </div>
            </div>
        )
    }
    return slides
}

const getCarouselThumbs = (children: React.ReactChild[]) => {
    const thumbs = children.map((element) =>
        // eslint-disable-next-line
        (element as any)?.props?.children[1]?.props?.children?.type ===
        "iframe" ? (
            <div
                key={`${element.toString()}container1`}
                style={{
                    height: "53px",
                    maxHeight: "53px",
                    objectFit: "contain",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <img
                    key={element.toString()}
                    src={`https://img.youtube.com/vi/${getYouTubeVideoId(
                        // eslint-disable-next-line
                        (element as any)?.props?.children[1]?.props?.children
                            ?.props?.src
                    )}/default.jpg`}
                    alt="project img"
                    style={{
                        objectFit: "contain",
                    }}
                />
            </div>
        ) : (
            <div
                key={`${
                    // eslint-disable-next-line
                    (element as any).toString()
                }container1`}
                style={{
                    height: "53px",
                    maxHeight: "53px",
                    objectFit: "contain",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* eslint-disable-next-line  */}
                {(element as any)?.props?.children?.props?.children[1]}
            </div>
        )
    )
    return thumbs
}

const arrowStyles: CSSProperties = {
    position: "absolute",
    zIndex: 2,
    top: "calc(50% - 15px)",
    width: 30,
    height: 30,
    border: "1px solid grey",
}

export default function ViewProject(): JSX.Element {
    const { id }: { id: string } = useParams()
    const [project, setProject] = useState<Project | undefined>(undefined)
    const theme = useTheme()
    const shareURL = `cmput401.ca/projects/${id}`

    // get the page's id and store it in a variable called pageId
    const { id: pageId }: { id: string } = useParams()

    const currentUser = useCurrentUser()

    const [projectNotFound, setProjectNotFound] = useState(false)

    useEffect(() => {
        portalApiInstance
            .getProject(id)
            .then((data) =>
                setProject({ ...data, video: getEmbedLink(data?.video) })
            )
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setProjectNotFound(true)
                }
            })
    }, [id])

    if (projectNotFound) return <Redirect to="/error/404" />

    if (project !== undefined) {
        // check if current user has edit access
        // Only logged in users who are admins or a project's TA, rep, student can edit
        const canEdit = canEditProject(currentUser, project)

        let logoURL = project.logo_url
        if (project.client_org.image && logoURL.trim().length === 0) {
            logoURL = project.client_org.image
        }
        if (logoURL.trim().length === 0) {
            logoURL = FALLBACK_IMAGE_URL
        }

        return (
            <>
                <HelmetMetaData
                    title={
                        project?.name
                            ? `${project?.name} | CMPUT 401 Projects Portal`
                            : undefined
                    }
                />
                <Container sx={{ my: 4 }}>
                    <Grid container item xs={12} md={9}>
                        <Stack
                            sx={{
                                mb: 3,
                                width: "100%",
                                display: "flex",
                                alignItems: "flex-start",
                                flexDirection: "row",
                                [theme.breakpoints.down("sm")]: {
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    mb: 2,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    height: "105px",
                                    width: "105px",
                                    [theme.breakpoints.down("sm")]: {
                                        ml: 2,
                                    },
                                }}
                            >
                                <img
                                    src={logoURL}
                                    alt={`${project?.name} logo`}
                                    height="100%"
                                    width="100%"
                                    onError={(
                                        e: SyntheticEvent<HTMLImageElement>
                                    ) => {
                                        const element =
                                            e.target as HTMLImageElement
                                        if (element.src !== FALLBACK_IMAGE_URL)
                                            element.src = FALLBACK_IMAGE_URL
                                    }}
                                    style={{
                                        backgroundColor: "#FFF",
                                        color: "transparent", // hide alt-text when there is no logo
                                        objectFit: "contain",
                                        border: "1px solid #EEE",
                                        borderRadius: "5px",
                                        padding: "5px",
                                        minHeight: "105px",
                                        minWidth: "105px",
                                    }}
                                />
                            </Box>
                            <Stack
                                sx={{
                                    ml: 2,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    flexDirection: "column",
                                    height: "100%",
                                    flexGrow: 1,
                                    [theme.breakpoints.down("sm")]: {
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    },
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        flexDirection: "row",
                                        [theme.breakpoints.down("sm")]: {
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            [theme.breakpoints.down("sm")]: {
                                                mt: 1,
                                            },
                                        }}
                                    >
                                        <b> {project?.name} </b>
                                    </Typography>
                                    {canEdit ? (
                                        <EditButton
                                            editURL={`/projects/${pageId}/edit`}
                                        />
                                    ) : null}
                                </Stack>

                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        lineHeight: "1.3",
                                        [theme.breakpoints.down("sm")]: {
                                            mt: 1,
                                            textAlign: "center",
                                        },
                                    }}
                                >
                                    {project?.tagline}
                                </Typography>

                                <Stack
                                    direction="row"
                                    alignItems="flex-end"
                                    justifyContent="space-between"
                                    sx={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        justifyContent: "space-between",
                                        flexDirection: "row",
                                        [theme.breakpoints.down("sm")]: {
                                            mt: 1,
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        },
                                    }}
                                >
                                    <ProjectChipRow
                                        project={project}
                                        clickable
                                    />
                                    <Link
                                        component={RouterLink}
                                        to={`/projects/?term=${project.term}&year=${project.year}`}
                                        variant="subtitle2"
                                        sx={{
                                            mb: 1,
                                            [theme.breakpoints.down("sm")]: {
                                                mt: 1,
                                            },
                                        }}
                                    >
                                        {`${project?.term} ${project?.year}`}
                                    </Link>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Grid>

                    <Grid container>
                        <Grid item xs={12} md={9}>
                            <Paper sx={{ mb: 4, pt: 1 }} elevation={1}>
                                <CardContent>
                                    {(project.video || project.screenshot) && (
                                        <Carousel
                                            showStatus={false}
                                            showIndicators={false}
                                            renderThumbs={getCarouselThumbs}
                                            renderArrowNext={(
                                                onClickHandler,
                                                hasNext
                                            ) => (
                                                // hasNext &&
                                                <IconButton
                                                    onClick={onClickHandler}
                                                    disableFocusRipple={
                                                        !hasNext
                                                    }
                                                    disableRipple={!hasNext}
                                                    style={{
                                                        ...arrowStyles,
                                                        right: 0,
                                                        backgroundColor: "#FFF",
                                                        border: `${
                                                            hasNext
                                                                ? `1px solid ${theme.palette.primary.main}`
                                                                : "1px solid #CCC"
                                                        }`,
                                                        cursor: `${
                                                            hasNext
                                                                ? "pointer"
                                                                : "default"
                                                        }`,
                                                    }}
                                                    sx={{
                                                        ":hover": {
                                                            transition: "0.2s",
                                                            filter: `${
                                                                hasNext
                                                                    ? "brightness(97%)"
                                                                    : "brightness(100%)"
                                                            }`,
                                                        },
                                                    }}
                                                >
                                                    <ArrowForwardIosIcon
                                                        sx={{
                                                            paddingLeft: "3px",
                                                            height: "19px",
                                                            width: "19px",
                                                            fill: `${
                                                                hasNext
                                                                    ? theme
                                                                          .palette
                                                                          .primary
                                                                          .main
                                                                    : "#CCC"
                                                            }`,
                                                        }}
                                                    />
                                                </IconButton>
                                            )}
                                            renderArrowPrev={(
                                                onClickHandler,
                                                hasPrev
                                            ) => (
                                                // hasPrev &&
                                                <IconButton
                                                    onClick={onClickHandler}
                                                    disableFocusRipple={
                                                        !hasPrev
                                                    }
                                                    disableRipple={!hasPrev}
                                                    style={{
                                                        ...arrowStyles,
                                                        left: 0,
                                                        backgroundColor: "#FFF",
                                                        border: `${
                                                            hasPrev
                                                                ? `1px solid ${theme.palette.primary.main}`
                                                                : "1px solid #CCC"
                                                        }`,
                                                        cursor: `${
                                                            hasPrev
                                                                ? "pointer"
                                                                : "default"
                                                        }`,
                                                    }}
                                                    sx={{
                                                        ":hover": {
                                                            transition: "0.2s",
                                                            filter: `${
                                                                hasPrev
                                                                    ? "brightness(97%)"
                                                                    : "brightness(100%)"
                                                            }`,
                                                        },
                                                    }}
                                                >
                                                    <ArrowBackIosNewIcon
                                                        sx={{
                                                            paddingRight: "3px",
                                                            height: "19px",
                                                            width: "19px",
                                                            fill: `${
                                                                hasPrev
                                                                    ? theme
                                                                          .palette
                                                                          .primary
                                                                          .main
                                                                    : "#CCC"
                                                            }`,
                                                        }}
                                                    />
                                                </IconButton>
                                            )}
                                        >
                                            {getCarouselSlides(
                                                project.video,
                                                project.screenshot,
                                                project.storyboard
                                            )}
                                        </Carousel>
                                    )}

                                    {project?.summary ? (
                                        <>
                                            <Typography sx={{ mt: 3, mb: 1 }}>
                                                <b> PROJECT SUMMARY </b> <br />
                                            </Typography>
                                            <Typography sx={{ mb: 3 }}>
                                                {project?.summary}
                                            </Typography>
                                        </>
                                    ) : null}
                                    {project.review ? (
                                        <>
                                            <Typography sx={{ mt: 2, mb: 1 }}>
                                                <b> CLIENT REVIEW </b> <br />
                                            </Typography>
                                            <Typography
                                                sx={{ mb: 3 }}
                                                style={{
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {project?.review}
                                            </Typography>
                                        </>
                                    ) : null}
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Stack
                                justifyContent="flex-start"
                                spacing={0.5}
                                flexWrap="wrap"
                                sx={{
                                    padding: 0,
                                    flexGrow: 1,
                                    [theme.breakpoints.up("md")]: {
                                        ml: 4,
                                    },
                                }}
                            >
                                {project?.website_url ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<PublicIcon />}
                                        onClick={() =>
                                            window.open(
                                                `${project?.website_url}`,
                                                "_blank"
                                            )
                                        }
                                        sx={{ marginBottom: "5px" }}
                                    >
                                        Website
                                    </Button>
                                ) : null}
                                {project?.source_code_url ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<GitHubIcon />}
                                        onClick={() =>
                                            window.open(
                                                `${project?.source_code_url}`,
                                                "_blank"
                                            )
                                        }
                                    >
                                        Source Code
                                    </Button>
                                ) : null}
                                {project?.presentation ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<PublicIcon />}
                                        onClick={() =>
                                            window.open(
                                                `${project?.presentation}`,
                                                "_blank"
                                            )
                                        }
                                    >
                                        Presentation
                                    </Button>
                                ) : null}

                                <Typography>
                                    <br /> <b> CLIENT </b>
                                </Typography>
                                <ProjectMember
                                    user={project?.client_org}
                                    key={project?.client_org.id}
                                    isClient
                                />
                                <Typography>
                                    <br /> <b> TEAM </b>
                                </Typography>
                                {project?.students?.map((student) => (
                                    <ProjectMember
                                        user={student}
                                        key={student.id}
                                        isClient={false}
                                    />
                                ))}
                                <Typography>
                                    <br /> <b> TA </b>
                                </Typography>
                                {project?.ta ? (
                                    <ProjectMember
                                        user={project.ta}
                                        key={project.ta.id}
                                        isClient={false}
                                    />
                                ) : null}
                                <Typography>
                                    <br /> <b> SHARE </b>
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{ paddingTop: "5px" }}
                                >
                                    <LinkedinShareButton url={shareURL}>
                                        <LinkedinIcon size={25} />
                                    </LinkedinShareButton>
                                    <FacebookShareButton url={shareURL}>
                                        <FacebookIcon size={25} />
                                    </FacebookShareButton>
                                    <TwitterShareButton url={shareURL}>
                                        <TwitterIcon size={25} />
                                    </TwitterShareButton>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </>
        )
    }
    return <Container />
}
