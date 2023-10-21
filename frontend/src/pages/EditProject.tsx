/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { WithContext as ReactTags } from "react-tag-input"
import { Button, useTheme, TextField, Box, Typography } from "@mui/material"
import { Redirect, useHistory, useParams } from "react-router-dom"
import { SubmitHandler, useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported"
import DeleteIcon from "@mui/icons-material/Delete"
import { portalApiInstance } from "../api/portal-api"
import IFormInputs from "../models/project-form"
import PageTitle from "../components/PageTitle"
import MediumContainer from "../components/MediumContainer"
import Project from "../models/project"
import HelmetMetaData from "../components/HelmetMetaData"
import RequireLoggedIn from "../components/RequireLoggedIn"
import { canEditProject } from "../models/current-user-info"
import { useCurrentUser } from "../hooks"

// schema that defines the types of values that the form should have
const schema = yup.object().shape({
    name: yup.string().required("Your project name is required"),
    summary: yup.string(),
    video: yup.string(),
    tagline: yup.string(),
    presentation: yup.string(),
    review: yup.string(),
    website_url: yup.string(),
    source_code_url: yup.string(),
    logo_url: yup.string(),
    tags: yup.array().of(
        yup.object().shape({
            value: yup.string(),
        })
    ),
})

export default function EditProject(): JSX.Element {
    // eslint-disable-next-line
    const tagsVar: any[] = useMemo(() => [], [])

    // redirect away from the EditProject page with useHistory
    const history = useHistory()

    // access the theme styles with useTheme
    const theme = useTheme()

    // get the page's id and store it in a variable called pageId
    const { id: pageId }: { id: string } = useParams()

    // Get the current project
    const [project, setProject] = useState<Project | undefined>(undefined)

    const currentUser = useCurrentUser()

    const [projectNotFound, setProjectNotFound] = useState(false)

    // cannot edit the review if they are the projects' student and are not an admin
    const cannotEditReview =
        currentUser.logged_in &&
        !currentUser.is_superuser &&
        project?.students.map((a) => a.id).includes(currentUser.id)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<IFormInputs>({
        /* use the yup resolver to validate that the form
           data that users enter fits the pre-defined schema */
        resolver: yupResolver(schema),

        /* set the default form values to empty strings so that
           the form placeholders don't overlap the project data
           when the project data is loaded from the backend */
        defaultValues: {
            name: "",
            summary: "",
            video: "",
            tagline: "",
            presentation: "",
            review: "",
            website_url: "",
            source_code_url: "",
            logo_url: "",
            tags: [],
        },
    })

    // create a variable to store the loaded projects's screenshot
    const [screenshotImage, setScreenshotImage] = useState<
        string | null | BlobPart
    >(null)

    useEffect(() => {
        portalApiInstance
            .getProject(pageId)
            .then((projectResult) => {
                setProject(projectResult)
                // Set the initial project form values to the project data
                reset(projectResult)

                // Set the tags to the project's tags
                tagsVar.length = 0
                for (let i = 0; i < projectResult.tags.length; i += 1) {
                    tagsVar.push({
                        id: `${projectResult.tags[i].value}`,
                        text: projectResult.tags[i].value,
                    })
                }

                // Set the screenshot image to the project's screenshot
                setScreenshotImage(projectResult.screenshot)
            })
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setProjectNotFound(true)
                }
            })
    }, [pageId, reset, tagsVar])

    const [tags, setTags] = useState(tagsVar)

    const handleDelete = (deleteIndex: number) => {
        setTags(tags.filter((tag, index) => index !== deleteIndex))
    }

    // eslint-disable-next-line
    const handleAddition = (tag: any) => {
        setTags([...tags, tag])
    }

    // eslint-disable-next-line
    const handleDrag = (tag: any, currPos: number, newPos: number) => {
        const newTags = [...tags].slice()

        newTags.splice(currPos, 1)
        newTags.splice(newPos, 0, tag)

        setTags(newTags)
    }

    const handleTagClick = (index: number) => {
        console.log(`The tag at index ${index} was clicked`)
    }

    // handle form submission (after the form data has been validated)
    const submitHandler: SubmitHandler<IFormInputs> = (data) => {
        // get the data that the user entered into the form
        const formData = new FormData()

        // If the screenshot was updated, add the new screenshot
        if (screenshotImage !== project?.screenshot) {
            formData.append(
                "screenshot",
                screenshotImage !== null
                    ? (screenshotImage as Blob)
                    : new File([], "")
            )
        }

        const formTags = tags.map((tag) => ({ value: tag.text }))
        formData.append("name", data.name)
        formData.append("summary", data.summary as string)
        formData.append("video", data.video as string)
        formData.append("tagline", data.tagline as string)
        formData.append("presentation", data.presentation as string)
        formData.append("review", data.review as string)
        formData.append("website_url", data.website_url as string)
        formData.append("source_code_url", data.source_code_url as string)
        formData.append("logo_url", data.logo_url as string)
        formData.append("tags", JSON.stringify(formTags))

        /* send the updated form data to the backend
           and redirect the user to the project page */
        portalApiInstance.editProject(pageId, formData).then(() => {
            history.push(`/projects/${pageId}`)
        })
    }

    // each form field should have a name, a label, and a type (optionally)
    interface FormFieldType {
        name: keyof IFormInputs // name = IFormInputs field
        label: string
        type?: string
    }

    // array of the form fields that the form will have
    let formFieldObjects: FormFieldType[] = [
        {
            name: "name",
            label: "Name",
        },
        {
            name: "tagline",
            label: "Tagline",
        },
        {
            name: "summary",
            label: "Summary",
            type: "multi_line",
        },
        {
            name: "video",
            label: "Screencast Link",
        },
        {
            name: "presentation",
            label: "Presentation Link",
        },
        {
            name: "review",
            label: "Client Review",
        },
        {
            name: "website_url",
            label: "Website Link",
        },
        {
            name: "source_code_url",
            label: "Source Code Link",
        },
        {
            name: "logo_url",
            label: "Logo Link",
        },
    ]

    // remove client review field if user editing is a student
    if (cannotEditReview) {
        formFieldObjects = formFieldObjects.filter(
            ({ name }) => name !== "review"
        )
    }

    // create Material UI Fields for each form field
    const getFormFields = () =>
        formFieldObjects.map(({ name, label, type }) => (
            <Controller
                key={name}
                name={name}
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label={label}
                        id={name}
                        error={!!errors[name]}
                        multiline={type === "multi_line"}
                        rows={7}
                        fullWidth
                        margin="dense"
                        sx={{
                            label: {
                                color: `${theme.palette.primary.dark}`,
                            },
                        }}
                    />
                )}
            />
        ))

    if (projectNotFound) return <Redirect to="/error/404" />

    return (
        <RequireLoggedIn
            validate={(user) => !project || canEditProject(user, project)}
        >
            <HelmetMetaData
                title="Edit Project | CMPUT 401 Projects Portal"
                noindex
            />
            {project && (
                <MediumContainer>
                    <PageTitle title="Edit Project Page" />
                    <form onSubmit={handleSubmit(submitHandler)}>
                        {getFormFields()}
                        <Box
                            display="flex"
                            justifyContent="left"
                            sx={{ mb: 1 }}
                            marginTop="8px"
                        >
                            <Typography
                                color={theme.palette.primary.dark}
                                className="screenshotText"
                                margin="dense"
                                padding="10px 15px"
                                sx={{
                                    textTransform: "capitalize",
                                }}
                            >
                                Screenshot
                            </Typography>
                            <label htmlFor="contained-button-file">
                                <input
                                    accept="image/*"
                                    id="contained-button-file"
                                    multiple
                                    type="file"
                                    style={{ display: "none" }}
                                    onChange={(event) => {
                                        if (
                                            event.target.files !== null &&
                                            event.target.files.length > 0
                                        ) {
                                            setScreenshotImage(
                                                event.target.files[0]
                                            )
                                        }
                                    }}
                                />
                                <Button
                                    component="span"
                                    color="secondary"
                                    variant="outlined"
                                    disableElevation
                                    sx={{
                                        padding: "3px 20px",
                                        borderColor: `${theme.palette.primary.main}`,
                                        mt: 1,
                                        width: "max-content",
                                        ":hover": {
                                            transition: "0.2s",
                                            borderColor: `${theme.palette.primary.main}`,
                                            backgroundColor: `rgba(0, 124, 65, 0.1)`,
                                        },
                                        [theme.breakpoints.down("sm")]: {
                                            mt: 1,
                                        },
                                    }}
                                >
                                    <Typography
                                        color={theme.palette.primary.main}
                                        className="loginText"
                                        fontFamily="Din Medium"
                                        fontSize="16px"
                                        sx={{
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        Upload
                                    </Typography>
                                </Button>
                            </label>
                            {screenshotImage ? (
                                <Box
                                    padding="5px 15px"
                                    height="auto"
                                    width="100px"
                                    sx={{ position: "relative" }}
                                >
                                    <Box
                                        component="img"
                                        id="screenshot-image"
                                        src={
                                            screenshotImage instanceof File
                                                ? URL.createObjectURL(
                                                      screenshotImage
                                                  )
                                                : screenshotImage.toString()
                                        }
                                        alt="screenshot"
                                        height="auto"
                                        width="100%"
                                    />
                                    <DeleteIcon
                                        sx={{
                                            position: "absolute",
                                            top: "0",
                                            right: "1px",
                                            color: `${theme.palette.primary.main}`,
                                            cursor: "pointer",
                                            ":hover": {
                                                color: `${theme.palette.primary.dark}`,
                                            },
                                        }}
                                        onClick={() => {
                                            setScreenshotImage(null)
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box
                                    padding="12px 15px"
                                    sx={{ position: "relative" }}
                                >
                                    <ImageNotSupportedIcon />
                                </Box>
                            )}
                        </Box>

                        <Typography
                            color={theme.palette.primary.dark}
                            sx={{
                                textTransform: "capitalize",
                            }}
                        >
                            Tags
                        </Typography>
                        <ReactTags
                            handleDelete={handleDelete}
                            handleAddition={handleAddition}
                            handleDrag={handleDrag}
                            handleTagClick={handleTagClick}
                            minQueryLength={2}
                            maxLength={25}
                            autofocus={false}
                            allowDeleteFromEmptyInput
                            autocomplete
                            allowUnique
                            allowDragDrop
                            inline
                            allowAdditionFromPaste
                            tags={tags}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{ my: 2, padding: "13px 0px" }}
                        >
                            Submit
                        </Button>
                    </form>
                </MediumContainer>
            )}
        </RequireLoggedIn>
    )
}
