/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import { useTheme, TextField } from "@mui/material"
import Typography from "@mui/material/Typography"
import { useHistory } from "react-router-dom"
import {
    SubmitHandler,
    useForm,
    Controller,
    useFormState,
} from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { LoadingButton } from "@mui/lab"
import PageTitle from "../components/PageTitle"
import { portalApiInstance } from "../api/portal-api"
import IFormInputs from "../models/proposal-form"
import MediumContainer from "../components/MediumContainer"
import HelmetMetaData from "../components/HelmetMetaData"

// schema that defines the types of values that the form should have
const schema = yup.object().shape({
    rep_name: yup
        .string()
        .max(50, "Please enter only the first parts of your name")
        .required("Your name is required"),
    email: yup.string().email().required("Your email is required"),
    project_info: yup
        .string()
        .min(
            20,
            "Please tell us more about your project (20 characters minimum)"
        )
        .required("Some information about your project is required"),
})

export default function SubmitProposal(): JSX.Element {
    // redirect away from the EditProfile page with useHistory
    const history = useHistory()

    // access the theme styles with useTheme
    const theme = useTheme()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<IFormInputs>({
        /* use the yup resolver to validate that the form
           data that users enter fits the pre-defined schema */
        resolver: yupResolver(schema),

        /* set the default form values to empty strings
           so that form input values are never null */
        defaultValues: {
            rep_name: "",
            email: "",
            project_info: "",
        },
    })

    const { isSubmitting } = useFormState({ control })

    // set the date for the proposal to the current date
    const proposalDate = new Date().toISOString().slice(0, 10)

    // handle form submission (after the form data has been validated)
    const submitHandler: SubmitHandler<IFormInputs> = async (data) => {
        // get the data that the user entered into the form
        const proposalData: IFormInputs = {
            rep_name: data.rep_name,
            email: data.email,
            project_info: data.project_info,
            date: proposalDate,
        }

        /* send the updated form data to the backend
           and redirect the user to the previous page */
        return portalApiInstance
            .createProposal(proposalData)
            .then(() => history.push(`/thankyou`))
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
            name: "rep_name",
            label: "Name *",
        },
        {
            name: "email",
            label: "Email *",
        },
        {
            name: "project_info",
            label: "Tell us about your project *",
            type: "multi_line",
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
                        error={!!errors[name]}
                        multiline={type === "multi_line"}
                        id={name}
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

    return (
        <>
            <HelmetMetaData title="Project Proposal | CMPUT 401 Projects Portal" />
            <MediumContainer>
                <PageTitle title="Want us to build you an app or web app?" />
                <Typography
                    variant="h6"
                    component="h1"
                    align="center"
                    gutterBottom
                    sx={{ fontSize: "17px" }}
                >
                    We love to collaborate with Albertan nonprofits and early
                    stage startups <br /> to build and to enhance projects that
                    will make our community better!
                    <br />
                    Fill out the form below and we&apos;ll get in touch with
                    you.
                </Typography>
                <form onSubmit={handleSubmit(submitHandler)} method="post">
                    {getFormFields()}
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ my: 2, padding: "13px 0px" }}
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    >
                        Submit
                    </LoadingButton>
                </form>
            </MediumContainer>
        </>
    )
}
