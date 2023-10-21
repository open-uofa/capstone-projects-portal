/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { useState, useEffect } from "react"
import {
    Button,
    Box,
    Paper,
    Container,
    useTheme,
    TextField,
    Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import ImageNotSupported from "@mui/icons-material/ImageNotSupported"
import Avatar from "@mui/material/Avatar"
import { Redirect, useHistory, useParams } from "react-router-dom"
import { SubmitHandler, useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { portalApiInstance } from "../api/portal-api"
import IFormInputs from "../models/client-form"
import PageTitle from "../components/PageTitle"
import HelmetMetaData from "../components/HelmetMetaData"
import RequireLoggedIn from "../components/RequireLoggedIn"
import ClientOrg from "../models/client-org"
import { canEditClientOrg } from "../models/current-user-info"

// schema that defines the types of values that the form should have
const schema = yup.object().shape({
    name: yup.string().required("Client Organization name is required"),
    about: yup.string(),
    website_link: yup.string().url(),

    testimonial: yup
        .string()
        .test(
            "empty-check",
            "Your testimonial must be more than 20 characters",
            (testimonial) =>
                !testimonial ||
                testimonial.length === 0 ||
                testimonial.length >= 20
        ),
})

export default function EditClient(): JSX.Element {
    // redirect away from the EditProfile page with useHistory
    const history = useHistory()

    // access the theme styles with useTheme
    const theme = useTheme()

    // get the page's id and store it in a variable called pageId
    const { id: clientId }: { id: string } = useParams()

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
            about: "",
            website_link: "",
            testimonial: "",
        },
    })

    // create a variable to store the loaded user data from the backend
    const [client, setClient] = useState<IFormInputs>()

    // store the unedited client data as it was retrieved from the backend
    const [uneditedClientData, setUneditedClientData] = useState<
        ClientOrg | undefined
    >(undefined)

    // create a variable to store the loaded clients's logo image
    const [logoImage, setLogoImage] = useState<string | null | BlobPart>(null)

    const [clientNotFound, setClientNotFound] = useState(false)

    // load the client data from the backend
    useEffect(() => {
        portalApiInstance
            .getClientOrg(clientId)
            .then((clientData) => {
                // set the unedited client data
                setUneditedClientData(clientData)

                // get the client data
                const clientDataObject: IFormInputs = {
                    name: clientData.name,
                    about: clientData.about,
                    image: clientData.image,
                    website_link: clientData.website_link,
                    testimonial: clientData.testimonial,
                }

                // nullify the image if the image link is broken
                portalApiInstance
                    .getImage(clientData.image as BlobPart)
                    .then((result: Response) => {
                        if (result.status === 404) {
                            setLogoImage(null)
                            setClient({ ...clientDataObject, image: null })
                        } else {
                            setClient({ ...clientDataObject })
                        }
                    })

                // only set the profile image if the image is valid
                if (client?.image !== null && client?.image !== undefined) {
                    setLogoImage(client.image)
                }
            })
            .catch((error) => {
                if (error?.response?.status === 404) {
                    setClientNotFound(true)
                }
            })
    }, [clientId, client?.image])

    useEffect(() => {
        reset(client)
    }, [reset, client])

    const submitHandler: SubmitHandler<IFormInputs> = (data) => {
        // get the data that the user entered into the form
        const formData = new FormData()

        // Add logo to patch request if updated
        if (logoImage !== client?.image) {
            formData.append(
                "image",
                logoImage !== null ? (logoImage as Blob) : new File([], "")
            )
        }
        formData.append("name", data.name)
        formData.append("about", data.about as string)
        formData.append("website_link", data.website_link as string)
        formData.append("testimonial", data.testimonial as string)

        /* send the updated form data to the backend
           and redirect the user to the profile page */
        portalApiInstance.editClient(clientId, formData).then(() => {
            history.push(`/clients/${clientId}`)
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
            name: "about",
            label: "Tell us about your organization",
            type: "multi_line",
        },
        {
            name: "website_link",
            label: "Website Link",
        },
        {
            name: "testimonial",
            label: "Testimonial you have for us",
            type: "multi_line",
        },
    ]

    // create Material UI Field for each form field
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

    if (clientNotFound) return <Redirect to="/error/404" />

    return (
        <RequireLoggedIn
            validate={(currentUser) =>
                !uneditedClientData ||
                canEditClientOrg(currentUser, uneditedClientData)
            }
        >
            <HelmetMetaData
                title="Edit Organization | CMPUT 401 Projects Portal"
                noindex
            />
            <Container maxWidth="md">
                <Paper elevation={2} sx={{ padding: "20px 60px", my: 5 }}>
                    <Box sx={{ my: 4 }}>
                        <PageTitle title="Edit Organization Profile" />
                        <form onSubmit={handleSubmit(submitHandler)}>
                            <Box display="flex" justifyContent="center">
                                {logoImage ? (
                                    <Box
                                        height="150px"
                                        width="150px"
                                        sx={{ position: "relative" }}
                                    >
                                        <Box
                                            component="img"
                                            src={
                                                logoImage instanceof File
                                                    ? URL.createObjectURL(
                                                          logoImage
                                                      )
                                                    : logoImage.toString()
                                            }
                                            alt="client logo"
                                            height="100%"
                                            width="100%"
                                            sx={{
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
                                                setLogoImage(null)
                                            }}
                                        />
                                    </Box>
                                ) : (
                                    <Avatar
                                        sx={{ width: 150, height: 150 }}
                                        variant="square"
                                    >
                                        <ImageNotSupported
                                            sx={{ width: 80, height: 80 }}
                                        />
                                    </Avatar>
                                )}
                            </Box>
                            <Box
                                display="flex"
                                justifyContent="center"
                                sx={{ mb: 1 }}
                            >
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
                                                setLogoImage(
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
                    </Box>
                </Paper>
            </Container>
        </RequireLoggedIn>
    )
}
