import { createTheme } from "@mui/material/styles"

declare module "@mui/material/styles" {
    interface ThemeOptions {
        themeName?: string // optional
    }
}

const UAlbertaTheme = createTheme({
    palette: {
        primary: { main: "#007C41", dark: "#275D38" },
        secondary: { main: "#FFDB05" },
        error: { main: "#DC3545" },
        warning: { main: "#FFC107" },
        info: { main: "#0DCAF0" },
        success: { main: "#198754" },
        text: {
            primary: "#333",
            secondary: "#FFF",
            disabled: "#333",
        },
    },
    typography: {
        fontFamily: [
            "DIN Regular",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
        ].join(","),
    },
    themeName: "UAlberta Theme",
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                *, *::before, *::after {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                },
                body {
                    background: #fafbff;
                }
            `,
        },
        MuiLink: {
            variants: [
                {
                    props: { variant: "body1" },
                    style: {
                        textTransform: "none",
                        justifySelf: "center",
                        fontFamily: "Din Medium",
                        fontSize: "17px",
                        marginTop: "2px",
                        paddingBottom: "2px",
                        borderBottom: `2px solid #007C41`,
                        ":hover": {
                            borderBottom: `2px solid #FFDB05`,
                            marginTop: "2px",
                            transition: "0.2s",
                            cursor: "pointer",
                        },
                    },
                },
            ],
        },
    },
    breakpoints: {
        values: { xs: 0, sm: 650, md: 960, lg: 1390, xl: 1920 },
    },
})

export default UAlbertaTheme
