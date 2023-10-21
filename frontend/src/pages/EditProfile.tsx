/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { useState, useEffect } from "react"
import {
    Button,
    useTheme,
    TextField,
    Typography,
    Box,
    Avatar,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import PersonIcon from "@mui/icons-material/Person"
import { Redirect, useHistory, useParams } from "react-router-dom"
import { SubmitHandler, useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { portalApiInstance } from "../api/portal-api"
import IFormInputs from "../models/user-form"
import PageTitle from "../components/PageTitle"
import MediumContainer from "../components/MediumContainer"
import HelmetMetaData from "../components/HelmetMetaData"
import RequireLoggedIn from "../components/RequireLoggedIn"
import { canEditUser } from "../models/current-user-info"

// schema that defines the types of values that the form should have
const schema = yup.object().shape({
    name: yup.string().required("Your name is required"),
    bio: yup.string(),
    website_link: yup.string().url(),
    linkedin_link: yup.string().url(),
})

export default function EditProfile(): JSX.Element {
    // redirect away from the EditProfile page with useHistory
    const history = useHistory()

    // access the theme styles with useTheme
    const theme = useTheme()

    // the ID of the user that is being edited
    const { id: userId }: { id: string } = useParams()

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
            bio: "",
            website_link: "",
            linkedin_link: "",
        },
    })

    // create a variable to store the loaded user data from the backend
    const [user, setUser] = useState<IFormInputs>()

    // create a variable to store the loaded user's profile image
    const [profileImage, setProfileImage] = useState<string | null | BlobPart>(
        null
    )

    const [userNotFound, setUserNotFound] = useState(false)

    // load the user data from the backend
    useEffect(() => {
        portalApiInstance
            .getUser(userId)
            .then((userData) => {
                // get the user data
                const userDataObject: IFormInputs = {
                    name: userData.name,
                    bio: userData.bio,
                    image: userData.image,
                    github_user_id: userData.github_user_id,
                    website_link: userData.website_link,
                    linkedin_link: userData.linkedin_link,
                }

                // nullify the image if the image link is broken
                portalApiInstance
                    .getImage(userData.image as BlobPart)
                    .then((result: Response) => {
                        if (result.status === 404) {
                            setProfileImage(null)
                            setUser({ ...userDataObject, image: null })
                        } else {
                            setUser({ ...userDataObject })
                        }
                    })

                // only set the profile image if the image is valid
                if (user?.image !== null && user?.image !== undefined) {
                    setProfileImage(user.image)
                }
            })
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setUserNotFound(true)
                }
            })
    }, [userId, user?.image])

    /* populate the form with the initial user data
       when the user data is loaded from the backend */
    useEffect(() => {
        reset(user)
    }, [reset, user])

    // handle form submission (after the form data has been validated)
    const submitHandler: SubmitHandler<IFormInputs> = (data) => {
        // get the data that the user entered into the form
        const formData = new FormData()

        // If user updated profile image, add the edited image
        if (user?.image !== profileImage) {
            formData.append(
                "image",
                profileImage !== null
                    ? (profileImage as Blob)
                    : new File([], "")
            )
        }
        formData.append("name", data.name)
        formData.append("bio", data.bio as string)
        formData.append("website_link", data.website_link as string)
        formData.append("linkedin_link", data.linkedin_link as string)

        /* send the updated form data to the backend
           and redirect the user to the profile page */
        portalApiInstance.editProfile(userId, formData).then(() => {
            history.push(`/profiles/${userId}`)
        })
    }

    // each form field should have a name, a label, and a type (optionally)
    interface FormFieldType {
        name: keyof IFormInputs // name = IFormInputs field
        label: string
        type?: string
    }

    // array of the form fields that the form will have
    const formFieldObjects: FormFieldType[] = [
        {
            name: "name",
            label: "Name *",
        },
        {
            name: "bio",
            label: "Tell us about yourself",
            type: "multi_line",
        },
        {
            name: "website_link",
            label: "Website Link",
        },
        {
            name: "linkedin_link",
            label: "LinkedIn Link",
        },
    ]

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
                        helperText={errors[name] ? errors[name]?.message : ""}
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

    let userImage = ""
    if (user && user.github_user_id) {
        userImage = `https://avatars.githubusercontent.com/u/${user.github_user_id}`
    }

    if (userNotFound) return <Redirect to="/error/404" />

    return (
        <RequireLoggedIn
            validate={(currentUser) => canEditUser(currentUser, userId)}
        >
            <HelmetMetaData
                title="Edit Profile | CMPUT 401 Projects Portal"
                noindex
            />
            <MediumContainer>
                <PageTitle title="Edit Your Profile" />
                <form onSubmit={handleSubmit(submitHandler)} method="post">
                    <Box display="flex" justifyContent="center">
                        {profileImage ? (
                            <Box
                                height="100px"
                                width="100px"
                                sx={{ position: "relative" }}
                            >
                                <Box
                                    component="img"
                                    src={
                                        profileImage instanceof File
                                            ? URL.createObjectURL(profileImage)
                                            : profileImage.toString()
                                    }
                                    alt="user image"
                                    height="100%"
                                    width="100%"
                                    style={{
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
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
                                        setProfileImage(null)
                                    }}
                                />
                            </Box>
                        ) : (
                            <Avatar sx={{ width: 100, height: 100 }}>
                                {userImage !== "" ? (
                                    <Box
                                        component="img"
                                        src={userImage.toString()}
                                        alt="user image"
                                        height="100%"
                                        width="100%"
                                        style={{ borderRadius: "50%" }}
                                    />
                                ) : (
                                    <PersonIcon
                                        sx={{ width: 80, height: 80 }}
                                    />
                                )}
                            </Avatar>
                        )}
                    </Box>
                    <Box display="flex" justifyContent="center" sx={{ mb: 1 }}>
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
                                        setProfileImage(event.target.files[0])
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
                    </Box>
                    {getFormFields()}
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
        </RequireLoggedIn>
    )
}
