import CheckIcon from "@mui/icons-material/Check"
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Container,
    Typography,
    useTheme,
} from "@mui/material"
import HelmetMetaData from "../components/HelmetMetaData"

export default function ThankYou(): JSX.Element {
    const theme = useTheme()
    return (
        <>
            <HelmetMetaData
                title="Thank You | Capstone Projects Portal"
                noindex
            />
            <Container maxWidth="md">
                <Card sx={{ my: 6 }}>
                    <CardContent>
                        <Box
                            sx={{
                                marginTop: 4,
                                marginBottom: 2,
                                justifyContent: "center",
                                display: "flex",
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: theme.palette.primary.main,
                                }}
                            >
                                <CheckIcon sx={{ fontSize: 80 }} />
                            </Avatar>
                        </Box>
                        <Typography variant="h4" align="center">
                            <b>Thank you.</b>
                        </Typography>
                        <Typography variant="h5" align="center">
                            Your proposal was received successfully.
                        </Typography>
                        <Typography
                            variant="h5"
                            color={theme.palette.primary.main}
                            align="center"
                            marginTop={4}
                        >
                            <b> Next steps </b>
                        </Typography>
                        <Typography
                            variant="h5"
                            align="center"
                            marginBottom={2}
                        >
                            Someone will be in touch with you shortly.
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </>
    )
}
